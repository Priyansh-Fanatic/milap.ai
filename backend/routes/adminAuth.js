const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const Node = require('../models/Node');
const jwt = require('jsonwebtoken');
const adminAuth = require('../middlewares/adminAuth');
const JWT_SECRET = process.env.JWT_SECRET;

// Open registration for all (no middleware)
router.post('/register', async (req, res) => {
  const { name, email, password, role, node } = req.body;
  if (!name || !email || !password || !role || (role !== 'super_admin' && !node)) {
    return res.status(400).json({ message: 'All fields are required.' });
  }
  const existing = await Admin.findOne({ email });
  if (existing) return res.status(409).json({ message: 'Admin with this email already exists.' });
  const admin = new Admin({ name, email, password, role, node: node || null, status: 'pending' });
  await admin.save();
  res.status(201).json({ message: 'Admin application submitted. Awaiting approval.', admin });
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email });
  if (!admin) return res.status(401).json({ message: 'No admin' });
  const valid = await admin.correctPassword(password, admin.password);
  if (!valid) return res.status(401).json({ message: 'Invalid credentials' });
  if (admin.status !== 'approved') return res.status(403).json({ message: 'Not approved' });
  const token = jwt.sign({ id: admin._id, role: admin.role, node: admin.node }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, admin });
});

// Get all pending admins (super_admin sees all, node_admin sees their node's supervisors)
router.get('/pending', adminAuth(['super_admin', 'node_admin']), async (req, res) => {
  let filter = { status: 'pending' };
  if (req.admin.role === 'node_admin') {
    filter = { ...filter, role: 'supervisor', node: req.admin.node };
  }
  const pendingAdmins = await Admin.find(filter);
  res.json({ pendingAdmins });
});

// Approve or decline an admin
router.post('/approve/:id', adminAuth(['super_admin', 'node_admin']), async (req, res) => {
  const { action } = req.body; // 'approve' or 'decline'
  const admin = await Admin.findById(req.params.id);
  if (!admin) return res.status(404).json({ message: 'Admin not found' });
  // Only allow node_admin to approve supervisors of their node
  if (req.admin.role === 'node_admin' && (admin.role !== 'supervisor' || String(admin.node) !== String(req.admin.node))) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  admin.status = action === 'approve' ? 'approved' : 'declined';
  await admin.save();
  res.json({ message: `Admin ${action}d.`, admin });
});

// Deactivate admin (super admin only)
router.patch('/deactivate/:id', adminAuth(['super_admin']), async (req, res) => {
  try {
    const admin = await Admin.findByIdAndUpdate(
      req.params.id,
      { status: 'inactive' },
      { new: true }
    ).select('-password');
    
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.json({ 
      success: true,
      message: 'Admin deactivated successfully', 
      admin 
    });
  } catch (error) {
    console.error('Error deactivating admin:', error);
    res.status(500).json({ message: 'Failed to deactivate admin' });
  }
});

// Activate admin (super admin only)
router.patch('/activate/:id', adminAuth(['super_admin']), async (req, res) => {
  try {
    const admin = await Admin.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' }, // Use 'approved' instead of 'active'
      { new: true }
    ).select('-password');
    
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.json({ 
      success: true,
      message: 'Admin activated successfully', 
      admin 
    });
  } catch (error) {
    console.error('Error activating admin:', error);
    res.status(500).json({ message: 'Failed to activate admin' });
  }
});

// Get current admin
router.get('/me', adminAuth(), (req, res) => {
  res.json({ admin: req.admin });
});

// Dashboard statistics endpoint
router.get('/dashboard/stats', adminAuth(), async (req, res) => {
  try {
    const Case = require('../models/Case');
    const User = require('../models/Users');
    const Admin = require('../models/Admin');
    const Node = require('../models/Node');
    
    // Get total statistics
    const totalCases = await Case.countDocuments();
    const pendingCases = await Case.countDocuments({ status: 'pending' });
    const approvedCases = await Case.countDocuments({ status: 'approved' });
    const resolvedCases = await Case.countDocuments({ status: 'resolved' });
    const totalUsers = await User.countDocuments();
    const totalAdmins = await Admin.countDocuments();
    const totalNodes = await Node.countDocuments();
    
    // Get recent cases (last 7 days) - return actual case data, not just count
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentCasesData = await Case.find({
      createdAt: { $gte: sevenDaysAgo }
    })
    .populate('reportedBy', 'name email')
    .sort({ createdAt: -1 })
    .limit(10)
    .select('-image -firReport'); // Exclude large data
    
    // Calculate statistics
    const stats = {
      totalCases,
      pendingCases,
      approvedCases,
      resolvedCases,
      totalUsers,
      totalAdmins,
      totalNodes,
      recentCases: recentCasesData, // This is now an array of case objects
      recentCasesCount: recentCasesData.length,
      successRate: totalCases > 0 ? Math.round((resolvedCases / totalCases) * 100) : 0
    };
    
    console.log('📊 Dashboard stats:', {
      totalCases,
      pendingCases,
      recentCasesCount: recentCasesData.length,
      recentCases: recentCasesData.map(c => ({ id: c._id, name: c.name, status: c.status }))
    });
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all admins (for ManageAdmins component)
router.get('/all', adminAuth(['super_admin']), async (req, res) => {
  try {
    const admins = await Admin.find({})
      .populate('node', 'name') // Populate node information
      .select('-password') // Exclude password from response
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      admins
    });
  } catch (error) {
    console.error('Error fetching all admins:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching admins' 
    });
  }
});

module.exports = router; 