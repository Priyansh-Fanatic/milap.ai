const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const JWT_SECRET = process.env.JWT_SECRET;

const adminAuth = (roles = []) => {
  return async (req, res, next) => {
    try {
      console.log('🔐 AdminAuth middleware triggered');
      console.log('Headers:', req.headers.authorization);
      
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        console.log('❌ No token provided');
        return res.status(401).json({ message: 'No token provided' });
      }
      
      console.log('🔑 Token found, verifying...');
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log('✅ Token decoded:', { id: decoded.id, email: decoded.email });
      
      const admin = await Admin.findById(decoded.id);
      console.log('👤 Admin lookup result:', admin ? { id: admin._id, email: admin.email, role: admin.role } : 'Not found');
      
      if (!admin) {
        console.log('❌ Admin not found in database');
        return res.status(403).json({ message: 'Admin not found' });
      }
      
      if (roles.length && !roles.includes(admin.role)) {
        console.log('❌ Role check failed. Required:', roles, 'Has:', admin.role);
        return res.status(403).json({ message: `Access denied. Required roles: ${roles.join(', ')}` });
      }
      
      // Set both req.admin and req.user for compatibility
      req.admin = admin;
      req.user = admin;
      
      console.log('✅ Admin auth successful');
      next();
    } catch (err) {
      console.error('❌ Admin auth error:', err.message);
      res.status(401).json({ message: 'Invalid token', error: err.message });
    }
  };
};

module.exports = adminAuth; 