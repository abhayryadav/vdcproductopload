const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  availableQuantity: {
    type: Number,
    required: true,
  },
  imageLink: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true
  },
});

const itemModel = mongoose.model('Item', itemSchema);
module.exports = itemModel;
