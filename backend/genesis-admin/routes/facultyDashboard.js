const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const verifyFaculty = require('../middleware/verifyFaculty');

/**
 * @route   GET /api/faculty/dashboard/events
 * @desc    Get all events assigned to the logged-in judge
 */
router.get('/events', verifyFaculty, async (req, res) => {
  try {
    const facultyId = req.user.id;
    
    // Find events where this faculty member is in the judges array
    const events = await Event.find({ judges: facultyId })
      .select('name category rounds isTrophyEvent description registeredTeams') 
      .sort({ createdAt: -1 });

    res.json(events);
  } catch (err) {
    console.error('❌ Faculty event fetch error:', err.message);
    res.status(500).json({ error: 'Failed to fetch assigned events' });
  }
});

/**
 * @route   GET /api/faculty/dashboard/event/:id/details
 * @desc    Get full details for scoring
 */
// backend/routes/facultyDashboard.js

router.get('/event/:id/details', verifyFaculty, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('judges', 'name') // Judges are the faculty members
      .populate('studentCoordinators', 'name contact'); // Populate coordinators instead

    if (!event) return res.status(404).json({ error: 'Event not found' });

    // SAFE SECURITY CHECK
    const judgeId = req.user.id;
    const isAssigned = event.judges.some(j => {
      const idToCheck = j._id ? j._id.toString() : j.toString();
      return idToCheck === judgeId;
    });

    if (!isAssigned) {
      return res.status(403).json({ error: 'Access Denied: You are not assigned to this event' });
    }

    res.json(event);
  } catch (err) {
    console.error('❌ Server Error:', err.message);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

/**
 * @route   GET /api/faculty/dashboard/event/:eventId/judges
 * @desc    Get all judges for the coordination table
 */
router.get('/event/:eventId/judges', verifyFaculty, async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId).populate('judges', 'name');
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const judgeId = req.user.id;
    const isAssigned = event.judges.some(j => {
        const idToCheck = j._id ? j._id.toString() : j.toString();
        return idToCheck === judgeId;
    });

    if (!isAssigned) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    res.json(event.judges);
  } catch (err) {
    console.error('❌ Judge list fetch error:', err.message);
    res.status(500).json({ error: 'Failed to fetch judge list' });
  }
});

module.exports = router;