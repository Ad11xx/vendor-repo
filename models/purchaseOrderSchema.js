const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const purchaseOrderSchema = new Schema({
  poNumber: {
    type: String,
    required: true,
    unique: true
  },
  vendor: {
    type: Schema.Types.ObjectId,
    ref: 'Vendor',  // Reference to Vendor model
    required: true
  },
  orderDate: {
    type: Date,
    required: true
  },
  deliveryDate: {
    type: Date,
    required: true
  },
  items: {
    type: JSON,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'canceled'],  // Ensuring status is one of these values
    required: true
  },
  qualityRating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  issueDate: {
    type: Date,
    required: true
  },
  acknowledgmentDate: {
    type: Date,
    default: null
  }
}, {
  timestamps: true  // Automatically adds createdAt and updatedAt fields
});

const PurchaseOrder = mongoose.model('PurchaseOrder', purchaseOrderSchema);

module.exports = PurchaseOrder;
