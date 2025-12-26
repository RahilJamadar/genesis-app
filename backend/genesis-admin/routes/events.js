const express = require('express');
const router = express.Router();
const verifyAdmin = require('../middleware/verifyAdmin');
const Event = require('../models/Event');
const Team = require('../models/Team');
const Faculty = require('../models/faculty');
const StudentCoordinator = require('../models/StudentCoordinator');

/**
 * @route   GET /api/admin/events/public
 * @desc    🚀 Public route for Landing Page & Registration (No Auth Required)
 * Fetches essential event data including team size limits and coordinators.
 */
router.get('/public', async (req, res) => {
  try {
    const events = await Event.find()
      .populate('studentCoordinators', 'name phone')
      .select('name category isTrophyEvent rules minParticipants maxParticipants rounds studentCoordinators')
      .lean();
    res.json(events);
  } catch (err) {
    console.error('Public fetch failed:', err);
    res.status(500).json({ error: 'Failed to synchronize events database' });
  }
});

/**
 * @route   GET /api/admin/events
 * @desc    Get all events with administrative details (Protected)
 */
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const events = await Event.find()
      .populate('judges', 'name number')
      .populate('studentCoordinators', 'name phone');
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching admin event list' });
  }
});

/**
 * @route   POST /api/admin/events
 * @desc    Create new event with strict validation logic
 */
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const { 
      name, category, isTrophyEvent, isDirectWin, 
      judges, studentCoordinators, rules, rounds, 
      judgingCriteria, minParticipants, maxParticipants 
    } = req.body;

    const event = new Event({
      name, category, isTrophyEvent, isDirectWin,
      judges, studentCoordinators, rules, rounds,
      judgingCriteria, minParticipants, maxParticipants
    });

    const savedEvent = await event.save();

    // Sync: Add Event reference to Faculty and Coordinators
    await Promise.all([
      Faculty.updateMany(
        { _id: { $in: judges } },
        { $addToSet: { assignedEvents: savedEvent._id } }
      ),
      StudentCoordinator.updateMany(
        { _id: { $in: studentCoordinators } },
        { $addToSet: { assignedEvents: savedEvent._id } }
      )
    ]);

    res.status(201).json({ success: true, event: savedEvent });
  } catch (err) {
    console.error('Event creation failed:', err);
    res.status(400).json({ error: err.message });
  }
});

/**
 * @route   PUT /api/admin/events/:id
 * @desc    Update event and re-sync all staff assignments
 */
router.put('/:id', verifyAdmin, async (req, res) => {
  try {
    const eventId = req.params.id;
    
    // context: 'query' ensures that 'this' in custom validators refers to the update
    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      req.body,
      { new: true, runValidators: true, context: 'query' }
    );

    if (!updatedEvent) return res.status(404).json({ error: 'Event not found' });

    // Wipe old assignments and sync new ones
    await Promise.all([
      Faculty.updateMany({}, { $pull: { assignedEvents: eventId } }),
      StudentCoordinator.updateMany({}, { $pull: { assignedEvents: eventId } })
    ]);

    await Promise.all([
      Faculty.updateMany(
        { _id: { $in: updatedEvent.judges } },
        { $addToSet: { assignedEvents: eventId } }
      ),
      StudentCoordinator.updateMany(
        { _id: { $in: updatedEvent.studentCoordinators } },
        { $addToSet: { assignedEvents: eventId } }
      )
    ]);

    res.json({ success: true, event: updatedEvent });
  } catch (err) {
    res.status(400).json({ error: 'Update failed: ' + err.message });
  }
});

/**
 * @route   GET /api/admin/events/:eventName/participants
 * @desc    Get detailed list of teams and members registered for an event
 */
router.get('/:eventName/participants', verifyAdmin, async (req, res) => {
  try {
    const { eventName } = req.params;
    const teams = await Team.find({ 'members.events': eventName });

    const result = teams.map(team => ({
      college: team.college,
      teamId: team._id,
      leader: team.leader,
      contact: team.contact,
      status: team.status, // Included status for registration tracking
      participants: team.members.filter(m => m.events.includes(eventName))
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch participants' });
  }
});

/**
 * @route   DELETE /api/admin/events/:id
 */
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const eventId = req.params.id;
    await Event.findByIdAndDelete(eventId);
    
    // Cleanup assignments
    await Promise.all([
      Faculty.updateMany({}, { $pull: { assignedEvents: eventId } }),
      StudentCoordinator.updateMany({}, { $pull: { assignedEvents: eventId } })
    ]);
    
    res.json({ message: 'Event deleted and assignments synchronized' });
  } catch (err) {
    res.status(400).json({ error: 'Deletion failed' });
  }
});

/**
 * @route   GET /api/admin/events/:id
 */
router.get('/:id', verifyAdmin, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('judges', 'name number')
      .populate('studentCoordinators', 'name phone');

    if (!event) return res.status(404).json({ error: 'Event not found' });

    const eventData = event.toObject();
    eventData.faculties = eventData.judges; 

    res.json(eventData);
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching event details' });
  }
});

module.exports = router;