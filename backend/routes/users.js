const express = require('express');
const router = express.Router();
const User = require('../models/Users');
const adminAuth = require('../middlewares/adminAuth');

// Get all users (admin only)
router.get('/all', adminAuth(['super_admin', 'node_admin']), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({
      success: true,
      users
    });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
});

// Deactivate user (admin only)
router.patch('/deactivate/:id', adminAuth(['super_admin', 'node_admin']), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'inactive' },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deactivated successfully',
      user
    });
  } catch (err) {
    console.error('Error deactivating user:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to deactivate user'
    });
  }
});

// Activate user (admin only)
router.patch('/activate/:id', adminAuth(['super_admin', 'node_admin']), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'active' },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User activated successfully',
      user
    });
  } catch (err) {
    console.error('Error activating user:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to activate user'
    });
  }
});

// Delete user (admin only)
router.delete('/:id', adminAuth(['super_admin']), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
});

module.exports = router;
