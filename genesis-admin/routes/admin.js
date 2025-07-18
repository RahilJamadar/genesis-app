const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// 🔐 JWT Middleware
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(403).json({ success: false, message: 'No token provided' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.adminId = decoded.id;
    next();
  } catch (err) {
    console.error('JWT verification failed:', err);
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

router.use(verifyToken);

// 📃 Get all admins (password excluded)
router.get('/', async (req, res) => {
  try {
    const admins = await Admin.find({}, '-password');
    res.json(admins);
  } catch (err) {
    console.error('Admin fetch failed:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch admins' });
  }
});

// ➕ Create new admin
router.post('/', async (req, res) => {
  try {
    const { name, password } = req.body;
    const exists = await Admin.findOne({ name });
    if (exists) return res.status(409).json({ success: false, message: 'Admin already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({ name, password: hashed });
    await newAdmin.save();

    res.status(201).json({ success: true, message: 'Admin created successfully' });
  } catch (err) {
    console.error('Admin creation failed:', err);
    res.status(500).json({ success: false, message: 'Failed to create admin' });
  }
});

// ✏️ Edit admin details
router.put('/:id', async (req, res) => {
  try {
    const { name, password } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (password) updateData.password = await bcrypt.hash(password, 10);

    await Admin.findByIdAndUpdate(req.params.id, updateData);
    res.json({ success: true, message: 'Admin updated successfully' });
  } catch (err) {
    console.error('Admin update failed:', err);
    res.status(500).json({ success: false, message: 'Failed to update admin' });
  }
});

// 🗑️ Delete admin (prevent self-delete)
router.delete('/:id', async (req, res) => {
  try {
    if (req.params.id === req.adminId) {
      return res.status(403).json({ success: false, message: 'You cannot delete your own account' });
    }

    await Admin.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Admin deleted successfully' });
  } catch (err) {
    console.error('Admin deletion failed:', err);
    res.status(500).json({ success: false, message: 'Failed to delete admin' });
  }
});

module.exports = router;