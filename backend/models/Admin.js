const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const AdminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['super_admin', 'node_admin', 'supervisor'], required: true },
  node: { type: mongoose.Schema.Types.ObjectId, ref: 'Node' }, // Only for node_admin/supervisor
  status: { type: String, enum: ['pending', 'approved', 'declined', 'inactive'], default: 'pending' }
}, {
  timestamps: true // This will add createdAt and updatedAt fields
});

AdminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

AdminSchema.methods.correctPassword = async function(candidate, hash) {
  return bcrypt.compare(candidate, hash);
};

module.exports = mongoose.model('Admin', AdminSchema); 