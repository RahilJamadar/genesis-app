const express = require('express');
const router = express.Router();
const Schedule = require('../models/Schedule');
const Event = require('../models/Event');
const verifyAdmin = require('../middleware/verifyAdmin');

/**
 * @route   POST /api/admin/schedules
 * @desc    Create a schedule for a specific round of an event
 */
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const { eventId, round, date, time, room } = req.body;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    // Genesis Logic: Max rounds validation
    if (round > event.rounds) {
      return res.status(400).json({ 
        error: `This event only has ${event.rounds} round(s). Cannot schedule Round ${round}.` 
      });
    }

    const newSchedule = new Schedule({
      eventId,
      round: round || 1,
      date,
      time,
      room
    });

    const saved = await newSchedule.save();
    res.status(201).json(saved);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Schedule already exists for this round of the event.' });
    }
    res.status(500).json({ error: 'Could not create schedule' });
  }
});

/**
 * @route   GET /api/admin/schedules
 * @desc    Get All Schedules populated with Event details
 */
router.get('/', async (req, res) => {
  try {
    const schedules = await Schedule.find()
      .populate('eventId', 'name category rounds isTrophyEvent')
      .sort({ date: 1, time: 1 });
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch schedules' });
  }
});

/**
 * @route   PUT /api/admin/schedules/:id
 */
router.put('/:id', verifyAdmin, async (req, res) => {
  try {
    const updated = await Schedule.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    
    if (!updated) return res.status(404).json({ error: 'Schedule not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Could not update schedule' });
  }
});

/**
 * @route   DELETE /api/admin/schedules/:id
 */
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const deleted = await Schedule.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Schedule entry not found' });
    res.json({ message: 'Schedule entry deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Could not delete schedule' });
  }
});

module.exports = router;