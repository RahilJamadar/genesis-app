const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const Event = require('../models/Event'); 
const Score = require('../models/Score'); 
const verifyAdmin = require('../middleware/verifyAdmin');
const mongoose = require('mongoose');

// ==========================================
// 🌐 PUBLIC / REGISTRATION UTILITY ROUTES
// ==========================================

/**
 * @route   GET /api/admin/teams/check-limit
 * @desc    Strict validation for Event 3-team cap per college
 */
router.get('/check-limit', async (req, res) => {
  try {
    const { college, event } = req.query;

    if (!college || !event) {
      return res.status(400).json({ message: "College and Event name are required." });
    }

    // 1. Find the actual Event document to get its ObjectId
    const eventDoc = await Event.findOne({ name: { $regex: new RegExp(`^${event}$`, 'i') } });
    
    if (!eventDoc) {
      // If event doesn't exist, count is obviously 0
      return res.json({ count: 0 });
    }

    // 2. Count teams from this college that have this Event ID in their registeredEvents array
    const count = await Team.countDocuments({
      college: { $regex: new RegExp(`^${college.trim()}$`, 'i') },
      registeredEvents: eventDoc._id // Matches the ObjectId reference
    });

    res.json({ count });
  } catch (err) {
    console.error("Limit Check Error:", err);
    res.status(500).json({ error: "Internal server error during validation." });
  }
});

/**
 * @route   GET /api/admin/teams/public/registration-counts
 * @desc    Get counts for public registration limits (No Auth Required)
 */
router.get('/public/registration-counts', async (req, res) => {
  try {
    const teams = await Team.find().populate('registeredEvents', 'name');

    const counts = { main: 0, football: 0, valorant: 0, hackathon: 0 };

    teams.forEach(team => {
      if (!team.registeredEvents || team.registeredEvents.length === 0) return;

      // Logic for College Team (Main Trophy)
      if (team.registeredEvents.length > 1) counts.main++;

      // Logic for specific Open Events using strict name matching
      const eventNames = team.registeredEvents.map(e => e.name.toLowerCase());
      
      if (eventNames.includes('football')) counts.football++;
      if (eventNames.includes('valorant')) counts.valorant++;
      if (eventNames.includes('hackathon')) counts.hackathon++;
    });

    res.json({ success: true, counts });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * @route   POST /api/admin/teams
 */
router.post('/', async (req, res) => {
    try {
        const newTeam = new Team(req.body);
        await newTeam.save(); 
        res.status(201).json({ success: true, team: newTeam });
    } catch (err) {
        // Handle unique email/contact errors nicely
        const message = err.code === 11000 
            ? "Email or Contact Number already registered." 
            : err.message;
        res.status(400).json({ success: false, message });
    }
});

// ==========================================
// 🔐 PROTECTED ANALYTICS ROUTES (Admin Only)
// ==========================================

router.post('/reset-all-scores', verifyAdmin, async (req, res) => {
  try {
    await Team.updateMany({}, { $set: { finalPoints: {}, totalTrophyPoints: 0 } });
    await Score.deleteMany({}); 
    res.json({ success: true, message: "Database purged." });
  } catch (err) {
    res.status(500).json({ error: "Reset failed." });
  }
});

router.get('/catering-report', verifyAdmin, async (req, res) => {
  try {
    const teams = await Team.find();
    const collegeBreakdown = teams.map(t => ({
        college: t.college || 'Unknown',
        veg: Number(t.vegCount) || 0,
        nonVeg: Number(t.nonVegCount) || 0,
        total: (Number(t.vegCount) || 0) + (Number(t.nonVegCount) || 0)
    }));
    const totals = teams.reduce((acc, team) => {
      acc.veg += Number(team.vegCount) || 0;
      acc.nonVeg += Number(team.nonVegCount) || 0;
      return acc;
    }, { veg: 0, nonVeg: 0 });
    res.json({ success: true, summary: totals, breakdown: collegeBreakdown });
  } catch (err) {
    res.status(500).json({ error: 'Catering fetch failed' });
  }
});

router.get('/leaderboard/overall', verifyAdmin, async (req, res) => {
  try {
    const teams = await Team.find(); 
    const result = teams.map(t => {
      let liveScore = 0;
      if (t.finalPoints instanceof Map) {
        t.finalPoints.forEach((val) => { liveScore += (Number(val) || 0); });
      }
      return { id: t._id, college: t.college, teamName: t.teamName || '', score: liveScore };
    }).sort((a, b) => b.score - a.score);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Leaderboard sync failed' });
  }
});

router.get('/leaderboard/event/:eventId', verifyAdmin, async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId);
    const isPowerPair = event?.name?.toLowerCase().includes("power pair");
    const teams = await Team.find({ registeredEvents: eventId });
    const scores = await Score.find({ event: eventId, finalized: true });

    const leaderboard = teams.map(team => {
      const trophyPoints = team.finalPoints instanceof Map ? team.finalPoints.get(eventId) : 0;
      let mTotal = 0, fTotal = 0;
      if (isPowerPair) {
        const teamScores = scores.filter(s => s.team?.toString() === team._id.toString());
        teamScores.forEach(s => {
          if (s.criteriaScores?.length === 6) {
            mTotal += (Number(s.criteriaScores[0]) + Number(s.criteriaScores[1]) + Number(s.criteriaScores[2]));
            fTotal += (Number(s.criteriaScores[3]) + Number(s.criteriaScores[4]) + Number(s.criteriaScores[5]));
          }
        });
      }
      return { id: team._id, college: team.college, score: Number(trophyPoints) || 0, mTotal, fTotal };
    }).sort((a, b) => b.score - a.score);
    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ error: 'Event ranking failed' });
  }
});

// ==========================================
// 🔐 PROTECTED CRUD ROUTES (Admin Only)
// ==========================================

router.get('/', verifyAdmin, async (req, res) => {
  try {
    const teams = await Team.find().populate('registeredEvents', 'name category').sort({ college: 1 });
    res.status(200).json(teams);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Fetch failed' });
  }
});

/**
 * GENERIC ID ROUTE - KEEP AT BOTTOM
 */
router.get('/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid ID' });
        }
        const team = await Team.findById(req.params.id).populate('registeredEvents', 'name category');
        if (!team) return res.status(404).json({ success: false, message: 'Not found' });
        res.status(200).json(team);
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

router.put('/:id', verifyAdmin, async (req, res) => {
  try {
    const team = await Team.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, team });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    await Team.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Purged' });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

module.exports = router;