const express = require('express');
const router = express.Router();
const Schedule = require('../models/Schedule');
const Event = require('../models/Event');
const verifyAdmin = require('../middleware/verifyAdmin');


/**
 * @route   POST /api/admin/schedules
 * @desc    Create a schedule entry (Technical Event Round or General Activity)
 */
router.post('/', verifyAdmin, async (req, res) => {
  try {
    
    const { 
      type, 
      eventId, 
      round, 
      activityTitle, 
      date, 
      startTime, 
      duration, 
      room, 
      details 
    } = req.body;

    // 1. Validation for Technical Events
    if (type === 'event') {
      if (!eventId) return res.status(400).json({ error: 'Event ID is required for type: event' });
      
      const event = await Event.findById(eventId);
      if (!event) return res.status(404).json({ error: 'Event not found' });

      // Check if Round exists for this event
      if (round > event.rounds) {
        return res.status(400).json({ 
          error: `This event only has ${event.rounds} round(s). Cannot schedule Round ${round}.` 
        });
      }

      // Check for existing schedule for this specific event and round
      const existing = await Schedule.findOne({ eventId, round });
      if (existing) {
        return res.status(400).json({ error: `Round ${round} for this event is already scheduled.` });
      }
    }

    // 2. Validation for General Activities (Lunch, etc.)
    if (type === 'activity' && !activityTitle) {
      return res.status(400).json({ error: 'Activity Title is required for type: activity' });
    }

    const newSchedule = new Schedule({
      type: type || 'event',
      eventId: type === 'event' ? eventId : undefined,
      round: type === 'event' ? (round || 1) : undefined,
      activityTitle: type === 'activity' ? activityTitle : undefined,
      date,
      startTime,
      duration,
      room,
      details
    });

    const saved = await newSchedule.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("Schedule Create Error:", err);
    res.status(500).json({ error: err.message || 'Could not create schedule' });
  }
});

/**
 * @route   GET /api/admin/schedules
 * @desc    Get All Schedules (Sorted Chronologically)
 */
router.get('/', async (req, res) => {
  try {
        const schedules = await Schedule.find()
      .populate('eventId', 'name category rounds isTrophyEvent')
      .sort({ date: 1, startTime: 1 }); // Natural chronological order
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
    const { type, eventId, round } = req.body;

    // Check unique constraint manually on update if it's an event
    if (type === 'event') {
      const existing = await Schedule.findOne({ 
        eventId, 
        round, 
        _id: { $ne: req.params.id } 
      });
      if (existing) {
        return res.status(400).json({ error: 'Another schedule already exists for this event round.' });
      }
    }

    const updated = await Schedule.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    
    if (!updated) return res.status(404).json({ error: 'Schedule entry not found' });
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