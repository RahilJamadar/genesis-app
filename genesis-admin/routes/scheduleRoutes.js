const express = require('express');
const router = express.Router();
const Schedule = require('../models/Schedule');

// Create Schedule
router.post('/', async (req, res) => {
  try {
    const newSchedule = new Schedule(req.body);
    const saved = await newSchedule.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: 'Could not create schedule' });
  }
});

// Get All
router.get('/', async (req, res) => {
  try {
    const schedules = await Schedule.find().sort({ date: 1, time: 1 });
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch schedules' });
  }
});

// Update
router.put('/:id', async (req, res) => {
  try {
    const updated = await Schedule.findByIdAndUpdate(req.params.id, req.body, {
      new: true
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Could not update schedule' });
  }
});

// Delete
router.delete('/:id', async (req, res) => {
  try {
    await Schedule.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Could not delete schedule' });
  }
});

module.exports = router;