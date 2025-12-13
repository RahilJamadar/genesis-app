const express = require('express');
const router = express.Router();
const Schedule = require('../models/Schedule');
const Event = require('../models/Event'); // assuming you have an Event model

// 📅 Create Schedule
router.post('/', async (req, res) => {
  try {
    const { eventId, date, time, room } = req.body;

    // Validate event exists
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const newSchedule = new Schedule({
      eventId,
      date,
      time,
      room
    });

    const saved = await newSchedule.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('Create error:', err);
    res.status(500).json({ error: 'Could not create schedule' });
  }
});

// 📋 Get All Schedules (with event info)
router.get('/', async (req, res) => {
  try {
    const schedules = await Schedule.find()
      .sort({ date: 1, time: 1 })
      .populate('eventId', 'name category');
    res.json(schedules);
  } catch (err) {
    console.error('Fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch schedules' });
  }
});

// ✏️ Update Schedule
router.put('/:id', async (req, res) => {
  try {
    const updated = await Schedule.findByIdAndUpdate(req.params.id, req.body, {
      new: true
    });
    res.json(updated);
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: 'Could not update schedule' });
  }
});

// ❌ Delete Schedule
router.delete('/:id', async (req, res) => {
  try {
    await Schedule.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Could not delete schedule' });
  }
});

module.exports = router;