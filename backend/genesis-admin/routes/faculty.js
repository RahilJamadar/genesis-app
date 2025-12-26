const express = require('express');
const router = express.Router();
const Faculty = require('../models/faculty');
const verifyAdmin = require('../middleware/verifyAdmin');

// Apply admin protection to all faculty management routes
router.use(verifyAdmin);

/**
 * @route   POST /api/faculty
 */
router.post('/', async (req, res) => {
  try {
    const { name, number, password } = req.body;
    
    const exists = await Faculty.findOne({ number });
    if (exists) {
      return res.status(400).json({ error: 'A judge with this phone number already exists.' });
    }

    const newFaculty = new Faculty({ name, number, password });
    const saved = await newFaculty.save();
    
    res.status(201).json({ 
      success: true, 
      message: 'Judge created successfully', 
      faculty: { id: saved._id, name: saved.name } 
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save faculty' });
  }
});

/**
 * @route   GET /api/faculty
 * @desc    FIXED: Now returns both name AND number
 */
router.get('/', async (req, res) => {
  try {
    // We fetch 'name' and 'number'. We exclude 'password' automatically 
    // by only listing the fields we WANT.
    const list = await Faculty.find({}, 'name number assignedEvents'); 
    res.json(list);
  } catch (err) {
    console.error('Faculty list error:', err);
    res.status(500).json({ error: 'Unable to fetch faculty list' });
  }
});

/**
 * @route   PUT /api/faculty/:id
 */
router.put('/:id', async (req, res) => {
  try {
    const updates = { ...req.body };
    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) return res.status(404).json({ error: 'Faculty not found' });

    if (updates.name) faculty.name = updates.name;
    if (updates.number) faculty.number = updates.number;
    if (updates.password && updates.password.trim() !== "") {
        faculty.password = updates.password; 
    }

    const updated = await faculty.save();
    res.json({ success: true, message: 'Faculty updated successfully', name: updated.name });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update faculty' });
  }
});

/**
 * @route   DELETE /api/faculty/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    await Faculty.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Faculty removed successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete faculty' });
  }
});

module.exports = router;