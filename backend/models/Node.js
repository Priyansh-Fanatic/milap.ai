const mongoose = require('mongoose');
const NodeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  location: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }
});
module.exports = mongoose.model('Node', NodeSchema); 