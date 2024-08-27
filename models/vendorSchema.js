const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  contactDetails: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  vendorCode: {
    type: String,
    required: true
  },
  onTimeDeliveryRate: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  qualityRatingAvg: {
    type: Number,
    required: true,
    min: 0,
    max: 5
  },
  averageResponseTime: {
    type: Number,
    required: true,
    min: 0
  },
  fulfillmentRate: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Create the Vendor model
const Vendor = mongoose.model('Vendor', vendorSchema);

module.exports = Vendor;
