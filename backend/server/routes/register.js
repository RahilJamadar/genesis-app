import express from 'express';
import Team from '../models/Team.js';
import Event from '../models/Event.js';
import mongoose from 'mongoose';

const router = express.Router();

/**
 * @route   GET /api/register/events
 * @desc    Fetch all events for the registration wizard selection
 */
router.get('/events', async (req, res) => {
  try {
    // Fetch events sorted by name
    const events = await Event.find({}, 'name category minParticipants maxParticipants')
      .sort({ name: 1 });
    res.json(events);
  } catch (err) {
    console.error("❌ Error fetching events:", err.message);
    res.status(500).json({ error: "Could not load events." });
  }
});

/**
 * @route   POST /api/register/teams
 * @desc    Handles complex multi-event team registration
 */
router.post('/teams', async (req, res) => {
  try {
    const { college, faculty, leader, email, contact, eventParticipants } = req.body;

    // 1. Basic Validation
    if (!college || !faculty || !leader || !email || !contact || !eventParticipants) {
      return res.status(400).json({ error: "Missing required registration fields." });
    }

    // 2. Check for existing Team (Leader level)
    const existingTeam = await Team.findOne({ 
      $or: [{ email: email.toLowerCase() }, { contact: contact }] 
    });
    
    if (existingTeam) {
      return res.status(400).json({ error: "A team with this leader email or contact already exists." });
    }

    // 3. Process the eventParticipants object
    const members = [];
    const registeredEventIds = Object.keys(eventParticipants);

    // Validate that Event IDs are valid MongoDB IDs
    const isValidIds = registeredEventIds.every(id => mongoose.Types.ObjectId.isValid(id));
    if (!isValidIds) {
      return res.status(400).json({ error: "Invalid Event selection detected." });
    }

    for (const eventId of registeredEventIds) {
      const participantList = eventParticipants[eventId];
      
      participantList.forEach(p => {
        // Find if this specific member (by phone) is already in our temp array
        const existingMember = members.find(m => m.contact === p.phone);
        
        if (existingMember) {
          // If they exist, just link this new event ID to them
          if (!existingMember.events.includes(eventId)) {
            existingMember.events.push(eventId);
          }
        } else {
          // New member entry
          members.push({
            name: p.name,
            contact: p.phone,
            diet: p.diet || 'veg',
            teamLeader: leader,
            events: [eventId] 
          });
        }
      });
    }

    // 4. Global Participant Check (Prevent same student registering for different colleges)
    const participantPhones = members.map(m => m.contact);
    const alreadyRegistered = await Team.findOne({ "members.contact": { $in: participantPhones } });
    
    if (alreadyRegistered) {
      return res.status(400).json({ 
        error: `One or more members are already registered under college: ${alreadyRegistered.college}` 
      });
    }

    // 5. Create and Save Team
    const newTeam = new Team({
      college,
      faculty,
      leader,
      email: email.toLowerCase(),
      contact,
      members, 
      // Convert string keys to proper ObjectIds
      registeredEvents: registeredEventIds.map(id => new mongoose.Types.ObjectId(id)), 
      finalPoints: {} 
    });

    await newTeam.save();

    res.status(201).json({ 
      success: true, 
      message: "Registration successful! Good luck for Genesis.", 
      teamId: newTeam._id 
    });

  } catch (err) {
    console.error("❌ Registration Error:", err);
    res.status(500).json({ error: "Internal Server Error. Please try again later." });
  }
});

export default router;