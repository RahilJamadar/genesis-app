const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
// 🔥 Use the centralized middleware we perfected earlier
const verifyAdmin = require('../middleware/verifyAdmin');

// Apply admin verification to all routes in this file
router.use(verifyAdmin);

/**
 * @route   GET /api/admin
 * @desc    Get all admins (excluding passwords)
 */
router.get('/', async (req, res) => {
  try {
    const admins = await Admin.find({}, '-password');
    res.json(admins);
  } catch (err) {
    console.error('Admin fetch failed:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch admins' });
  }
});

/**
 * @route   POST /api/admin
 * @desc    Create a new admin
 */
router.post('/', async (req, res) => {
  try {
    const { name, password, role } = req.body;

    // Check if admin already exists
    const exists = await Admin.findOne({ name });
    if (exists) {
      return res.status(409).json({ success: false, message: 'Admin with this name already exists' });
    }

    // Password hashing (using bcrypt as per your model logic)
    const hashed = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({ 
      name, 
      password: hashed,
      role: role || 'admin' // Default to admin if role not specified
    });

    await newAdmin.save();
    res.status(201).json({ success: true, message: 'Admin created successfully' });
  } catch (err) {
    console.error('Admin creation failed:', err);
    res.status(500).json({ success: false, message: 'Failed to create admin' });
  }
});

/**
 * @route   PUT /api/admin/:id
 * @desc    Edit admin details
 */
router.put('/:id', async (req, res) => {
  try {
    const { name, password, role } = req.body;
    const updateData = {};
    
    if (name) updateData.name = name;
    if (role) updateData.role = role;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedAdmin = await Admin.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true, runValidators: true }
    );

    if (!updatedAdmin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    res.json({ success: true, message: 'Admin updated successfully' });
  } catch (err) {
    console.error('Admin update failed:', err);
    res.status(500).json({ success: false, message: 'Failed to update admin' });
  }
});

/**
 * @route   DELETE /api/admin/:id
 * @desc    Delete admin (prevents self-deletion)
 */
router.delete('/:id', async (req, res) => {
  try {
    // req.user.id comes from the verifyAdmin middleware we imported
    if (req.params.id === req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Security protocol: You cannot delete the account you are currently logged into.' 
      });
    }

    const deletedAdmin = await Admin.findByIdAndDelete(req.params.id);
    if (!deletedAdmin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    res.json({ success: true, message: 'Admin deleted successfully' });
  } catch (err) {
    console.error('Admin deletion failed:', err);
    res.status(500).json({ success: false, message: 'Failed to delete admin' });
  }
});

module.exports = router;