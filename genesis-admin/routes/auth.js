const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// 🔐 Admin Login
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

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      id: admin._id
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// 🆕 Admin Registration
router.post('/register', async (req, res) => {
  try {
    const { name, password } = req.body;
    const existing = await Admin.findOne({ name });

    if (existing) {
      return res.status(409).json({ success: false, message: 'Admin name already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({ name, password: hashed });
    await newAdmin.save();

    res.status(201).json({ success: true, message: 'Admin registered successfully' });
  } catch (err) {
    console.error('Registration Error:', err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

module.exports = router;