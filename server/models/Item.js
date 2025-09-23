const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String },
  imagePath: { type: String },
  sequence: { type: Number, required: true, index: true }
});

module.exports = mongoose.model('Item', ItemSchema);
