const express = require('express');
const mongoose = require('mongoose');
const config = require('config');
const Vendor = require('../models/vendorSchema');
const HistoricalPerformance = require('../models/historicalPerformanceSchema');

// Create a router instance
const router = express.Router();

mongoose.connect(config.mongoUrl, {
}).then(() => console.log('MongoDB connected')).catch(err => console.error(err));

router.get('/vendors', async (req, res) => {
  try {
    const users = await Vendor.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch vendors' });
  }
});

router.get('/vendors/:vendorId', async (req, res) => {
  try {
    const Vendor = await Vendor.findById(req.params.vendorId);
    if (!Vendor) return res.status(404).json({ error: 'Vendor not found' });
    res.status(200).json(Vendor);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch Vendor' });
  }
});

router.post('/vendors', async (req, res) => {
  try {
    const newUser = new Vendor(req.body);
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create Vendor', details: err.message });
  }
});

router.put('/vendors/:id', async (req, res) => {
  try {
    const updatedUser = await Vendor.findByIdAndUpdate(req.params.id, req.body);
    if (!updatedUser) return res.status(404).json({ error: 'Vendor not found' });
    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update Vendor', details: err.message });
  }
});

router.delete('/vendors/:id', async (req, res) => {
  try {
    const deletedUser = await Vendor.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ error: 'Vendor not found' });
    res.status(200).json({ message: 'Vendor deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete Vendor' });
  }
});

router.get('/vendors/:vendorId/performance', async (req, res) => {
    const { vendorId } = req.params;
    try {
      const performanceMetrics = await HistoricalPerformance.findOne({ vendor: vendorId });
  
      if (!performanceMetrics) {
        return res.status(404).json({ message: 'Performance metrics not found for this vendor.' });
      }
  
      res.status(200).json({
        vendorId,
        performanceMetrics: {
          onTimeDeliveryRate: performanceMetrics.onTimeDeliveryRate,
          qualityRatingAvg: performanceMetrics.qualityRatingAvg,
          averageResponseTime: performanceMetrics.averageResponseTime,
          fulfillmentRate: performanceMetrics.fulfillmentRate
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error.' });
    }
  });

module.exports = router;
