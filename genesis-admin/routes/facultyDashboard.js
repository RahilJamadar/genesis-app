const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const verifyFaculty = require('../middleware/verifyFaculty');

// GET /faculty/events
router.get('/events', verifyFaculty, async (req, res) => {
  try {
    const facultyId = req.user.id;
    const events = await Event.find({ faculties: facultyId }).populate('faculties', 'name'); // ✅ populated
    res.json(events);
  } catch (err) {
    console.error('Faculty event fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

router.get('/event/:id/details', verifyFaculty, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('faculties', 'name');
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch event details' });
  }
});

module.exports = router;