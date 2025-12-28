const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const Event = require('../models/Event'); // Added missing model
const Score = require('../models/Score'); // 🚀 CRITICAL FIX: Added missing model import
const verifyAdmin = require('../middleware/verifyAdmin');
const mongoose = require('mongoose');

// ==========================================
// 🔐 PROTECTED ANALYTICS ROUTES (Admin Only)
// ==========================================

/**
 * @route   POST /api/admin/teams/reset-all-scores
 * @desc    Wipe all scores from teams and delete score records
 */
router.post('/reset-all-scores', verifyAdmin, async (req, res) => {
  try {
    // 1. Wipe individual points map and reset total points for every team
    await Team.updateMany(
      {}, 
      { $set: { finalPoints: {}, totalTrophyPoints: 0 } }
    );
    
    // 2. Wipe the Scores collection entirely to remove judge records
    // This was failing because Score wasn't required at the top
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

    res.json({
      success: true,
      summary: totals,
      breakdown: collegeBreakdown
    });
  } catch (err) {
    console.error('Catering Report Crash:', err);
    res.status(500).json({ error: 'Logistics calculation failed' });
  }
});

/**
 * @route   GET /api/admin/teams/leaderboard/overall
 */
router.get('/leaderboard/overall', verifyAdmin, async (req, res) => {
  try {
    const teams = await Team.find().sort({ totalTrophyPoints: -1 });
    const result = teams.map(t => ({
      id: t._id,
      college: t.college,
      teamName: t.teamName || '',
      leader: t.leader,
      score: t.totalTrophyPoints || 0
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Overall leaderboard sync failed' });
  }
});

/**
 * @route   GET /api/admin/teams/leaderboard/event/:eventId
 */
router.get('/leaderboard/event/:eventId', verifyAdmin, async (req, res) => {
  try {
    const { eventId } = req.params;
    const teams = await Team.find({ registeredEvents: eventId });
    
    const leaderboard = teams.map(team => ({
      id: team._id,
      college: team.college,
      teamName: team.teamName || '',
      leader: team.leader,
      score: team.finalPoints instanceof Map 
              ? (team.finalPoints.get(eventId) || 0) 
              : (team.finalPoints[eventId] || 0)
    })).sort((a, b) => b.score - a.score);

    res.json(leaderboard);
  } catch (err) {
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
        res.status(201).json({ 
            success: true, 
            message: 'Registration data uplinked successfully', 
            team: newTeam 
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid ID format' });
        }
        const team = await Team.findById(req.params.id)
            .populate('registeredEvents', 'name category isTrophyEvent');
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