const express = require('express');
const router = express.Router();
const verifyAdmin = require('../middleware/verifyAdmin');
const Event = require('../models/Event');
const Team = require('../models/team');

// Get all events
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching events' });
  }
});

// Get participants by college
router.get('/college/:collegeName/participants', verifyAdmin, async (req, res) => {
  try {
    const collegeQuery = req.params.collegeName;
    const teams = await Team.find({ college: collegeQuery });

    const results = [];

    teams.forEach(team => {
      team.members.forEach(member => {
        results.push({
          name: member.name,
          events: member.events,
          teamLeader: team.leader,
          contact: team.contact
        });
      });
    });

    res.json(results);
  } catch (err) {
    console.error('College filter error:', err);
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});

// Get participants for specific event
router.get('/:eventName/participants', verifyAdmin, async (req, res) => {
  try {
    const eventName = req.params.eventName;
    const teams = await Team.find();

    const result = [];

    teams.forEach(team => {
      const matchingMembers = team.members.filter(m => m.events.includes(eventName));
      if (matchingMembers.length > 0) {
        result.push({
          college: team.college,
          members: matchingMembers.map(m => ({
            name: m.name,
            teamLeader: team.leader,
            contact: team.contact
          }))
        });
      }
    });

    res.json(result);
  } catch (err) {
    console.error('Participation fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch participants' });
  }
});

// Public route to fetch all events (no visibility filter)
router.get('/public-events', async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (err) {
    console.error('Public event fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Get event by ID
router.get('/:id', verifyAdmin, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create event
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const { name, category } = req.body;
    if (!name || !category) {
      return res.status(400).json({ error: 'Name and category are required' });
    }

    const event = new Event(req.body);
    await event.save();
    res.json({ success: true, event });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update event
router.put('/:id', verifyAdmin, async (req, res) => {
  try {
    const updated = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: 'Event updated', event: updated });
  } catch (err) {
    res.status(400).json({ error: 'Failed to update event' });
  }
});

// Delete event
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete event' });
  }
});

module.exports = router;