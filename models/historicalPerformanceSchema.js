const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const historicalPerformanceSchema = new Schema({
  vendor: {
    type: Schema.Types.ObjectId,
    ref: 'Vendor',  // Reference to Vendor model
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  onTimeDeliveryRate: {
    type: Number,
    required: true,
    min: 0,
    max: 100  // Assuming the rate is a percentage
  },
  qualityRatingAvg: {
    type: Number,
    required: true,
    min: 1,
    max: 5  // Assuming the quality rating average is on a 1-5 scale
  },
  averageResponseTime: {
    type: Number,
    required: true,  // Assuming this is in hours or minutes
    min: 0
  },
  fulfillmentRate: {
    type: Number,
    required: true,
    min: 0,
    max: 100  // Assuming the rate is a percentage
  }
}, {
  timestamps: true  // Automatically adds createdAt and updatedAt fields
});

const HistoricalPerformance = mongoose.model('HistoricalPerformance', historicalPerformanceSchema);

module.exports = HistoricalPerformance;
