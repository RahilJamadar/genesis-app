const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const verifyAdmin = require('../middleware/verifyAdmin');

// ==========================================
// 🌐 PUBLIC ROUTES (No Token Required)
// ==========================================

/**
 * @route   POST /api/admin/teams
 * @desc    Public Registration: Create team and member profiles
 * This is the endpoint called by your frontend Register.jsx component.
 */
router.post('/', async (req, res) => {
    try {
        // req.body contains college, faculty, leader, email, contact, eventParticipants
        const newTeam = new Team(req.body);
        
        // Save triggers the pre-save hook in your Team model 
        // to calculate veg/non-veg counts and status defaults.
        await newTeam.save(); 
        
        res.status(201).json({ 
            success: true, 
            message: 'Registration data uplinked successfully', 
            team: newTeam 
        });
    } catch (err) {
        console.error('Registration POST Error:', err);
        res.status(400).json({ success: false, message: err.message });
    }
});

/**
 * @route   GET /api/admin/teams/:id
 * @desc    Public Check: Get single team profile by ID (Used by Payment Page)
 */
router.get('/:id', async (req, res) => {
    try {
        const team = await Team.findById(req.params.id)
            .populate('registeredEvents', 'name category isTrophyEvent');
            
        if (!team) return res.status(404).json({ success: false, message: 'ID not found in Genesis network' });
        res.status(200).json(team);
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error fetching profile' });
    }
});

// ==========================================
// 🔐 PROTECTED ROUTES (Admin Only)
// ==========================================

// Apply admin protection to all routes below this line
router.use(verifyAdmin);

/**
 * @route   GET /api/admin/teams/leaderboard/overall
 */
router.get('/leaderboard/overall', async (req, res) => {
  try {
    const teams = await Team.find().sort({ totalTrophyPoints: -1 });
    const result = teams.map(t => ({
      id: t._id,
      college: t.college,
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
router.get('/leaderboard/event/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    const teams = await Team.find({ registeredEvents: eventId });
    
    const leaderboard = teams.map(team => ({
      id: team._id,
      college: team.college,
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

/**
 * @route   GET /api/admin/teams/catering-report
 * @desc    Safely calculate dietary analytics
 */
router.get('/catering-report', async (req, res) => {
  try {
    const teams = await Team.find();
    
    const collegeBreakdown = teams.map(t => {
      // Use fallback to 0 if fields are missing
      const veg = Number(t.vegCount) || 0;
      const nonVeg = Number(t.nonVegCount) || 0;
      
      return {
        college: t.college || 'Unknown Institution',
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
    res.status(500).json({ 
      error: 'Logistics calculation failed', 
      details: err.message 
    });
  }
});

/**
 * @route   GET /api/admin/teams
 */
router.get('/', async (req, res) => {
  try {
    const teams = await Team.find()
      .populate('registeredEvents', 'name category')
      .sort({ college: 1 });
    res.status(200).json(teams);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch teams' });
  }
});

/**
 * @route   PUT /api/admin/teams/:id
 */
router.put('/:id', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });

    Object.assign(team, req.body);
    await team.save();

    res.status(200).json({ 
      success: true, 
      message: 'Team updated and logistics recalculated', 
      team 
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * @route   DELETE /api/admin/teams/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Team.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Team not found' });
    res.status(200).json({ success: true, message: 'Team deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error deleting team' });
  }
});

module.exports = router;