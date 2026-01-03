const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const Event = require('../models/Event'); 
const Score = require('../models/Score'); 
const verifyAdmin = require('../middleware/verifyAdmin');
const mongoose = require('mongoose');

// ==========================================
// 🔐 PROTECTED ANALYTICS ROUTES (Admin Only)
// ==========================================

/**
 * @route   POST /api/admin/teams/reset-all-scores
 */
router.post('/reset-all-scores', verifyAdmin, async (req, res) => {
  try {
    await Team.updateMany(
      {}, 
      { $set: { finalPoints: {}, totalTrophyPoints: 0 } }
    );
    await Score.deleteMany({}); 
    res.json({ success: true, message: "Database scores purged successfully." });
  } catch (err) {
    console.error('Reset Error:', err);
    res.status(500).json({ error: "Failed to reset database." });
  }
});

/**
 * @route   GET /api/admin/teams/catering-report
 */
router.get('/catering-report', verifyAdmin, async (req, res) => {
  try {
    const teams = await Team.find();
    const collegeBreakdown = teams.map(t => {
      const veg = Number(t.vegCount) || 0;
      const nonVeg = Number(t.nonVegCount) || 0;
      return {
        college: t.college || 'Unknown Institution',
        teamName: t.teamName || '',
        veg: veg,
        nonVeg: nonVeg,
        total: veg + nonVeg
      };
    });

    const totals = teams.reduce((acc, team) => {
      acc.veg += Number(team.vegCount) || 0;
      acc.nonVeg += Number(team.nonVegCount) || 0;
      return acc;
    }, { veg: 0, nonVeg: 0 });

    res.json({ success: true, summary: totals, breakdown: collegeBreakdown });
  } catch (err) {
    res.status(500).json({ error: 'Logistics calculation failed' });
  }
});



/**
 * @route   GET /api/admin/teams/leaderboard/overall
 * @desc    Calculates overall score correctly handling Mongoose Maps
 */
router.get('/leaderboard/overall', verifyAdmin, async (req, res) => {
  try {
    const teams = await Team.find(); 
    const result = teams.map(t => {
      let liveScore = 0;
      if (t.finalPoints && t.finalPoints instanceof Map) {
        t.finalPoints.forEach((val) => {
          liveScore += (Number(val) || 0);
        });
      }
      return {
        id: t._id,
        college: t.college,
        teamName: t.teamName || '',
        leader: t.leader,
        score: liveScore 
      };
    }).sort((a, b) => b.score - a.score);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Overall leaderboard sync failed' });
  }
});

/**
 * @route   GET /api/admin/teams/leaderboard/event/:eventId
 * @desc    NEW: Fetches event-specific scores AND calculates Gender Splits for Power Pair
 */
router.get('/leaderboard/event/:eventId', verifyAdmin, async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId);
    const isPowerPair = event?.name?.toLowerCase().includes("power pair");

    // Fetch teams registered for this event
    const teams = await Team.find({ registeredEvents: eventId });
    
    // Fetch all finalized scores for this event to calculate splits
    const scores = await Score.find({ event: eventId, finalized: true });

    const leaderboard = teams.map(team => {
      const tId = team._id.toString();
      
      // Get trophy points (100, 50, 10, etc.)
      const trophyPoints = team.finalPoints instanceof Map 
        ? team.finalPoints.get(eventId) 
        : (team.finalPoints ? team.finalPoints[eventId] : 0);

      // 🚀 POWER PAIR SPLIT CALCULATION
      let mTotal = 0;
      let fTotal = 0;

      if (isPowerPair) {
        // Find judge scores for this team and sum M/F criteria
        const teamScores = scores.filter(s => s.team?.toString() === tId);
        teamScores.forEach(s => {
          if (s.criteriaScores && s.criteriaScores.length === 6) {
            // Indices 0,1,2 are Male | 3,4,5 are Female
            mTotal += (Number(s.criteriaScores[0]) + Number(s.criteriaScores[1]) + Number(s.criteriaScores[2]));
            fTotal += (Number(s.criteriaScores[3]) + Number(s.criteriaScores[4]) + Number(s.criteriaScores[5]));
          }
        });
      }

      return {
        id: team._id,
        college: team.college,
        teamName: team.teamName || '',
        leader: team.leader,
        score: Number(trophyPoints) || 0,
        mTotal: mTotal, 
        fTotal: fTotal
      };
    }).sort((a, b) => b.score - a.score);

    res.json(leaderboard);
  } catch (err) {
    console.error("Event Leaderboard Error:", err);
    res.status(500).json({ error: 'Event ranking calculation failed' });
  }
});

// ==========================================
// 🌐 PUBLIC ROUTES
// ==========================================

router.post('/', async (req, res) => {
    try {
        const newTeam = new Team(req.body);
        await newTeam.save(); 
        res.status(201).json({ success: true, team: newTeam });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid ID format' });
        }
        const team = await Team.findById(req.params.id).populate('registeredEvents', 'name category');
        if (!team) return res.status(404).json({ success: false, message: 'ID not found' });
        res.status(200).json(team);
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error fetching profile' });
    }
});

// ==========================================
// 🔐 PROTECTED CRUD ROUTES (Admin Only)
// ==========================================

router.get('/', verifyAdmin, async (req, res) => {
  try {
    const teams = await Team.find()
      .populate('registeredEvents', 'name category')
      .sort({ college: 1 });
    res.status(200).json(teams);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch teams' });
  }
});

router.put('/:id', verifyAdmin, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });
    Object.assign(team, req.body);
    await team.save();
    res.status(200).json({ success: true, message: 'Team updated', team });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const deleted = await Team.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Team not found' });
    res.status(200).json({ success: true, message: 'Team deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error deleting team' });
  }
});

module.exports = router;