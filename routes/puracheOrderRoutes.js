const express = require('express');
const mongoose = require('mongoose');
const config = require('config');
const PurchaseOrder = require('../models/purchaseOrderSchema');
const HistoricalPerformance = require('../models/historicalPerformanceSchema');

// Create a router instance
const router = express.Router();

const calculateFulfillmentRate = async (vendorId) => {
    const allPOs = await PurchaseOrder.find({ vendor: vendorId });
    if (allPOs.length === 0) return 0;
    const fulfilledPOs = allPOs.filter(po => po.status === 'completed');
    const fulfillmentRate = (fulfilledPOs.length / allPOs.length) * 100;
    await HistoricalPerformance.updateOne(
      { vendor: vendorId },
      { fulfillmentRate },
      { upsert: true }
    );
  };

  
  const calculateAverageResponseTime = async (vendorId) => {
    const acknowledgedPOs = await PurchaseOrder.find({ vendor: vendorId, acknowledgmentDate: { $ne: null } });
  
    if (acknowledgedPOs.length === 0) return 0;
    const totalResponseTime = acknowledgedPOs.reduce((sum, po) => {
      const responseTime = (new Date(po.acknowledgmentDate) - new Date(po.issueDate)) / (1000 * 60 * 60);  // Time in hours
      return sum + responseTime;
    }, 0);
    const averageResponseTime = totalResponseTime / acknowledgedPOs.length;
    await HistoricalPerformance.updateOne(
      { vendor: vendorId },
      { averageResponseTime },
      { upsert: true }
    );
  };

  
  const calculateQualityRatingAvg = async (vendorId) => {
    // Find all completed POs with a quality rating for the vendor
    const ratedPOs = await PurchaseOrder.find({ vendor: vendorId, status: 'completed', qualityRating: { $ne: null } });
  
    if (ratedPOs.length === 0) return 0;
  
    // Calculate the average quality rating
    const totalQualityRating = ratedPOs.reduce((sum, po) => sum + po.qualityRating, 0);
    const qualityRatingAvg = totalQualityRating / ratedPOs.length;
  
    // Update the HistoricalPerformance model
    await HistoricalPerformance.updateOne(
      { vendor: vendorId },
      { qualityRatingAvg },
      { upsert: true }
    );
  };

  
const calculateOnTimeDeliveryRate = async (vendorId) => {
  // Find all completed POs for the vendor
  console.log('=vendorId', vendorId);
  const completedPOs = await PurchaseOrder.find({ vendor: vendorId, status: 'completed' });
console.log('=completedPOs', completedPOs);
  if (completedPOs.length === 0) return 0;

  // Count the POs that were delivered on or before the expected delivery date
  const onTimePOs = completedPOs.filter(po => po.deliveryDate <= po.orderDate);

  // Calculate the on-time delivery rate
  const onTimeDeliveryRate = (onTimePOs.length / completedPOs.length) * 100;

  // Update the HistoricalPerformance model
  await HistoricalPerformance.updateOne(
    { vendor: vendorId },
    { onTimeDeliveryRate },
    { upsert: true }  // Insert if it doesn't exist
  );
};


router.get('/purchase-orders', async (req, res) => {
  try {
    const users = await PurchaseOrder.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch vendors' });
  }
});

router.get('/purchase-orders/:poId', async (req, res) => {
  try {
    const Vendor = await PurchaseOrder.findById(req.params.poId);
    if (!Vendor) return res.status(404).json({ error: 'Vendor not found' });
    res.status(200).json(Vendor);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch Vendor' });
  }
});

router.post('/purchase-orders', async (req, res) => {
  try {
    const newUser = new PurchaseOrder(req.body);
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create Vendor', details: err.message });
  }
});

router.put('/purchase-orders/:poId', async (req, res) => {
    const { poId } = req.params;
    const updatedData = req.body;
    try {
      const updatedPO = await PurchaseOrder.findByIdAndUpdate(poId, updatedData, { new: true });
      if (!updatedPO) {
        return res.status(404).json({ message: 'Purchase order not found.' });
      }

      if (updatedData.status === 'completed') {
        await calculateOnTimeDeliveryRate(updatedPO.vendor);
        await calculateQualityRatingAvg(updatedPO.vendor);
        await calculateFulfillmentRate(updatedPO.vendor);
      }
  
      if (updatedData.acknowledgmentDate) {
        await calculateAverageResponseTime(updatedPO.vendor);
      }
  
      res.status(200).json(updatedPO);
    } catch (error) {
      console.error('Error updating purchase order:', error);
      res.status(500).json({ message: 'Server error.' });
    }
  });

router.delete('/purchase-orders/:poId', async (req, res) => {
  try {
    const deletedUser = await PurchaseOrder.findByIdAndDelete(req.params.poId);
    if (!deletedUser) return res.status(404).json({ error: 'Vendor not found' });
    res.status(200).json({ message: 'Vendor deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete Vendor' });
  }
});

router.post('/purchase-orders/:poId/acknowledge', async (req, res) => {
    const { poId } = req.params;
    const acknowledgmentDate = new Date(); // Set the current date as acknowledgment date
  
    try {
      const updatedPO = await PurchaseOrder.findByIdAndUpdate(
        poId,
        { acknowledgmentDate },
        { new: true }
      );
  
      if (!updatedPO) {
        return res.status(404).json({ message: 'Purchase order not found.' });
      }
  
      await calculateAverageResponseTime(updatedPO.vendor);
      res.status(200).json({
        message: 'Purchase order acknowledged successfully.',
        updatedPurchaseOrder: updatedPO
      });
    } catch (error) {
      console.error('Error acknowledging purchase order:', error);
      res.status(500).json({ message: 'Server error.' });
    }
  });
  
  async function calculateAverageResponseTime(vendorId) {
    try {
      // Find all purchase orders for the vendor
      const purchaseOrders = await PurchaseOrder.find({ vendor: vendorId, acknowledgmentDate: { $exists: true } });
  
      // Calculate the average response time
      const responseTimes = purchaseOrders.map(po => {
        return (new Date(po.acknowledgmentDate) - new Date(po.issueDate)) / (1000 * 60 * 60 * 24); // in days
      });
  
      if (responseTimes.length === 0) {
        return; // No response times to average
      }
  
      const averageResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
  
      // Update the vendor's performance metrics
      await HistoricalPerformance.findOneAndUpdate(
        { vendor: vendorId },
        { averageResponseTime },
        { new: true, upsert: true }
      );
    } catch (error) {
      console.error('Error calculating average response time:', error);
    }
  }
  

module.exports = router;
