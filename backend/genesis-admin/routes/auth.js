const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Faculty = require('../models/faculty'); // Added Faculty model for Judge login

/**
 * @route   POST /api/auth/login
 * @desc    Login for Admin
 */
router.post('/login', async (req, res) => {
  try {
    const { name, password } = req.body;
    const admin = await Admin.findOne({ name });

    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect password' });
    }

    // 🔥 Added 'role' to the payload so middleware can verify permissions
    const token = jwt.sign(
      { id: admin._id, role: admin.role || 'admin' }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Admin login successful',
      token,
      user: { id: admin._id, name: admin.name, role: admin.role || 'admin' }
    });
  } catch (err) {
    console.error('Admin Login Error:', err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

/**
 * @route   POST /api/auth/faculty-login
 * @desc    Login for Faculty / Judges
 */
router.post('/faculty-login', async (req, res) => {
  try {
    const { number, password } = req.body; // Using phone number as login ID for Judges
    const faculty = await Faculty.findOne({ number });

    if (!faculty) {
      return res.status(401).json({ success: false, message: 'Judge account not found' });
    }

    // Use the comparePassword method we added to the Faculty model
    const isMatch = await bcrypt.compare(password, faculty.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect password' });
    }

    // Generate token with 'faculty' role
    const token = jwt.sign(
      { id: faculty._id, role: 'faculty' }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Judge login successful',
      token,
      user: { id: faculty._id, name: faculty.name, role: 'faculty' }
    });
  } catch (err) {
    console.error('Faculty Login Error:', err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

/**
 * @route   POST /api/auth/register
 * @desc    Admin Registration (Initial setup)
 */
router.post('/register', async (req, res) => {
  try {
    const { name, password, role } = req.body;
    const existing = await Admin.findOne({ name });

    if (existing) {
      return res.status(409).json({ success: false, message: 'Admin name already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({ 
        name, 
        password: hashed, 
        role: role || 'admin' 
    });
    
    await newAdmin.save();

    res.status(201).json({ success: true, message: 'Admin registered successfully' });
  } catch (err) {
    console.error('Registration Error:', err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

module.exports = router;