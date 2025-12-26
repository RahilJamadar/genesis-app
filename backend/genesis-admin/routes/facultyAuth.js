const express = require('express');
const router = express.Router();
const Faculty = require('../models/faculty'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * @route   POST /api/faculty/auth/login  <-- (Modified to match index.js mounting)
 * @desc    Login for Faculty/Judges using phone number
 */
router.post('/login', async (req, res) => {
  const { number, password } = req.body;

  try {
    // 1. Find faculty by mobile number
    // Explicitly select password because it might be hidden in the model schema
    const faculty = await Faculty.findOne({ number }).select('+password'); 
    
    if (!faculty) {
      return res.status(404).json({ 
        success: false, 
        error: 'Judge account not found with this number.' 
      });
    }

    // 2. Compare hashed password
    const isMatch = await bcrypt.compare(password, faculty.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid password. Please try again.' 
      });
    }

    // 3. Generate JWT with the 'faculty' role
    const token = jwt.sign(
      { 
        id: faculty._id, 
        role: 'faculty',
        name: faculty.name 
      },
      process.env.JWT_SECRET,
      { expiresIn: '12h' }
    );

    // 4. Return user data
    res.json({
      success: true,
      token,
      user: {
        id: faculty._id,
        name: faculty.name,
        role: 'faculty'
      }
    });
  } catch (err) {
    console.error('Faculty login error:', err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

module.exports = router;