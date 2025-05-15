const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Products' },
      quantity: Number
    }
  ],
  totalAmount: Number,
  shippingAddress: String,
  orderStatus: { type: String, default: "Placed" }, // Placed, Shipped, Delivered, Cancelled
  paymentStatus: { type: String, default: "Pending" }, // Paid, Pending
  orderDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
