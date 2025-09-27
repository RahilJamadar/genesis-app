const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const verifyFaculty = require('../middleware/verifyFaculty');

// GET /faculty/events
router.get('/events', verifyFaculty, async (req, res) => {
  try {
    const facultyId = req.user.id;
    const events = await Event.find({ judges: facultyId }).populate('judges', 'name'); res.json(events);
  } catch (err) {
    console.error('Faculty event fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

router.get('/event/:id/details', verifyFaculty, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('faculties', 'name');
    if (!event.judges.some(j => j.equals(req.user.id))) {
      return res.status(403).json({ error: 'Not authorized for this event' });
    }
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch event details' });
  }
});

// GET /event/:eventId/judges — Return list of judges for the event
router.get('/event/:eventId/judges', verifyFaculty, async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId).populate('judges', 'name');
    if (!event) return res.status(404).json({ error: 'Event not found' });

    // Optional: restrict access to assigned judges only
    if (!event.judges.some(j => j.equals(req.user.id))) {
      return res.status(403).json({ error: 'Not authorized for this event' });
    }

    res.json(event.judges);
  } catch (err) {
    console.error('Judge fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch judges' });
  }
});

module.exports = router;