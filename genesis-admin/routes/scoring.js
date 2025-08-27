const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const verifyAdmin = require('../middleware/verifyAdmin');
const verifyFaculty = require('../middleware/verifyFaculty');
const Event = require('../models/Event');
const Team = require('../models/team');
const RawScore = require('../models/RawScore');
const FinalScore = require('../models/FinalScore');
const { finalizeScores } = require('../services/scoringService');

// ✅ Admin-only Raw Score Assignment
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const score = new RawScore(req.body);
    await score.save();
    res.json({ success: true, score });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 🏆 Admin Leaderboard
router.get('/leaderboard', verifyAdmin, async (req, res) => {
  try {
    const scores = await FinalScore.aggregate([
      {
        $group: {
          _id: '$team',
          total: { $sum: '$points' }
        }
      },
      {
        $lookup: {
          from: 'teams',
          localField: '_id',
          foreignField: '_id',
          as: 'teamInfo'
        }
      },
      { $unwind: '$teamInfo' },
      {
        $project: {
          teamName: '$teamInfo.name',
          college: '$teamInfo.college',
          total: 1
        }
      },
      { $sort: { total: -1 } }
    ]);
    res.json(scores);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// 📊 Admin View Raw Scores by Team
router.get('/team/:id', verifyAdmin, async (req, res) => {
  try {
    const teamId = req.params.id;
    const scores = await RawScore.find({ teamId }).populate('eventId', 'name category');
    const formatted = scores.map(s => ({
      _id: s._id,
      points: s.points,
      round: s.round,
      judge: s.judge,
      comment: s.comment,
      event: {
        name: s.eventId.name,
        category: s.eventId.category
      }
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch scores for team' });
  }
});

// 👨‍🏫 Faculty: Submit Raw Score
router.post('/event/:eventId/score', verifyFaculty, async (req, res) => {
  const { teamId, round, points, comment } = req.body;
  const { eventId } = req.params;

  try {
    const existing = await RawScore.findOne({
      teamId,
      eventId,
      round,
      judge: req.user.id
    });

    if (existing) {
      existing.points = points;
      existing.comment = comment;
      await existing.save();
      return res.json({ success: true, message: 'Score updated', score: existing });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(400).json({ error: 'Team not found — scoring aborted' });
    }

    const derivedName = team.name || team.members?.[0]?.name || 'Unnamed Team';

    const score = new RawScore({
      teamId,
      teamName: derivedName,
      college: team.college,
      eventId,
      points,
      round,
      comment,
      judge: req.user.id
    });

    await score.save();
    res.status(201).json({ success: true, message: 'Score submitted', score });
  } catch (err) {
    console.error('Faculty score submit failed:', err);
    res.status(500).json({ error: 'Score submission failed' });
  }
});

// 👨‍🏫 Faculty: Delete Their Raw Score
router.delete('/event/:eventId/score/:teamId', verifyFaculty, async (req, res) => {
  const { eventId, teamId } = req.params;
  const { round } = req.query;

  try {
    const removed = await RawScore.deleteOne({
      teamId,
      eventId,
      round,
      judge: req.user.id
    });

    if (removed.deletedCount > 0) {
      res.json({ success: true, message: 'Score deleted' });
    } else {
      res.status(404).json({ error: 'Score not found or already removed' });
    }
  } catch (err) {
    console.error('Score deletion failed:', err);
    res.status(500).json({ error: 'Failed to delete score' });
  }
});

// 👨‍🏫 Faculty: View Raw Score for Team/Round
router.get('/event/:eventId/scores/:teamId', verifyFaculty, async (req, res) => {
  const { eventId, teamId } = req.params;
  const { round } = req.query;

  try {
    const scores = await RawScore.find({ eventId, teamId, round }).populate('judge', 'name');
    res.json(scores);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch scores for round' });
  }
});

// 👨‍🏫 Faculty: Fetch Teams for Event
router.get('/event/:id/teams', verifyFaculty, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const teams = await Team.find({ 'members.events': event.name });
    res.json(teams);
  } catch (err) {
    console.error('Team fetch failed:', err);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

// 🧠 Admin: Finalize Scores for Round
router.post('/finalize/:eventId/:round', verifyAdmin, async (req, res) => {
  try {
    const finalScores = await finalizeScores(req.params.eventId, req.params.round);
    res.json({ success: true, message: 'Final scores assigned', finalScores });
  } catch (err) {
    console.error('Final scoring failed:', err);
    res.status(500).json({ error: 'Failed to finalize scores' });
  }
});

module.exports = router;