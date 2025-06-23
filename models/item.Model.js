// const mongoose = require('mongoose');

// const itemSchema = new mongoose.Schema({
//   productName: {
//     type: String,
//     required: true,
//   },
//   description: {
//     type: String,
//     required: true,
//   },
//   price: {
//     type: Number,
//     required: true,
//   },
//   availableQuantity: {
//     type: Number,
//     required: true,
//   },
//   imageLink: {
//     type: String,
//     required: true,
//   },
//   category: {
//     type: String,
//     required: true
//   },
// });

// const itemModel = mongoose.model('Item', itemSchema);
// module.exports = itemModel;




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
    required: true, // Cover image
  },
  images: [{
    type: String, // Array of additional image URLs
    required: false,
  }],
  category: {
    type: String,
    required: true,
  },
});

const itemModel = mongoose.model('Item', itemSchema);
module.exports = itemModel;