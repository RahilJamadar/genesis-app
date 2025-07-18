const express = require('express');
const router = express.Router();
const Faculty = require('../models/faculty');

// POST /faculty — Add new faculty
router.post('/', async (req, res) => {
  try {
    const newFaculty = new Faculty(req.body);
    const saved = await newFaculty.save();
    res.json(saved);
  } catch (err) {
    console.error('Faculty create error:', err);
    res.status(500).json({ error: 'Failed to save faculty' });
  }
});

// GET /faculty — Get all faculty names
router.get('/', async (req, res) => {
  try {
    const list = await Faculty.find({}, 'name number'); // ✅ Returns both name and number // only send names
    res.json(list);
  } catch (err) {
    console.error('Faculty list error:', err);
    res.status(500).json({ error: 'Unable to fetch faculty list' });
  }
});

// DELETE /faculty/:id — Remove faculty
router.delete('/:id', async (req, res) => {
  try {
    await Faculty.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error('Faculty delete error:', err);
    res.status(500).json({ error: 'Failed to delete faculty' });
  }
});

// PUT /faculty/:id — Update faculty
router.put('/:id', async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.password) {
      const bcrypt = require('bcrypt');
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updates.password, salt);
    } else {
      delete updates.password;
    }

    const updated = await Faculty.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json(updated);
  } catch (err) {
    console.error('Faculty update error:', err);
    res.status(500).json({ error: 'Failed to update faculty' });
  }
});

module.exports = router;