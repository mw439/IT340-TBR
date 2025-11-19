const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String },
  isbn: { type: String },
  coverUrl: { type: String },
  price: { type: Number, required: true },
  quantity: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('CartItem', cartItemSchema);
