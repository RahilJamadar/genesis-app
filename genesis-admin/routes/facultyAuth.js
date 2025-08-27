const express = require('express');
const router = express.Router();
const Faculty = require('../models/Faculty');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// POST /faculty/login
router.post('/login', async (req, res) => {
  const { name, password } = req.body;

  try {
    const faculty = await Faculty.findOne({ name });
    if (!faculty) return res.status(404).json({ error: 'Faculty not found' });

    const isMatch = await bcrypt.compare(password, faculty.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: faculty._id, role: 'faculty' },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({ token });
  } catch (err) {
    console.error('Faculty login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;