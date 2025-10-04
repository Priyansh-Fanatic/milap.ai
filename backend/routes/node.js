const express = require('express');
const router = express.Router();
const Node = require('../models/Node');
const adminAuth = require('../middlewares/adminAuth');

// Create node (super admin)
router.post('/', adminAuth(['super_admin']), async (req, res) => {
  const { name, location } = req.body;
  const node = new Node({ name, location, createdBy: req.admin._id });
  await node.save();
  res.status(201).json({ node });
});

// Remove node (super admin)
router.delete('/:id', adminAuth(['super_admin']), async (req, res) => {
  await Node.findByIdAndDelete(req.params.id);
  res.json({ message: 'Node removed' });
});

// List nodes (all admins)
router.get('/', adminAuth(), async (req, res) => {
  const nodes = await Node.find();
  res.json({ nodes });
});

// List nodes (public - for registration)
router.get('/public', async (req, res) => {
  try {
    const nodes = await Node.find().select('name location _id');
    res.json({ nodes });
  } catch (error) {
    console.error('Error fetching nodes:', error);
    res.status(500).json({ error: 'Failed to fetch nodes' });
  }
});

module.exports = router; 