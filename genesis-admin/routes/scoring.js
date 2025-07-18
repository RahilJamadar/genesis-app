const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const verifyAdmin = require('../middleware/verifyAdmin');

// 🔢 Score Model
const ScoreSchema = new mongoose.Schema({
  teamId: { type: mongoose.Schema.Types.ObjectId, required: true },
  teamName: { type: String, required: true },
  college: { type: String, required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Event' },
  points: { type: Number, required: true }
});

const Score = mongoose.model('Score', ScoreSchema);

// ✅ Assign Score
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const score = new Score(req.body);
    await score.save();
    res.json({ success: true, score });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 🏆 Leaderboard
router.get('/leaderboard', verifyAdmin, async (req, res) => {
  try {
    const scores = await Score.aggregate([
      {
        $group: {
          _id: '$teamId',
          teamName: { $first: '$teamName' },
          college: { $first: '$college' },
          total: { $sum: '$points' }
        }
      },
      { $sort: { total: -1 } }
    ]);
    res.json(scores);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// 📊 View Scores by Team
router.get('/team/:id', verifyAdmin, async (req, res) => {
  try {
    const teamId = req.params.id;
    const scores = await Score.find({ teamId }).populate('eventId', 'name category');
    const formatted = scores.map(s => ({
      _id: s._id,
      points: s.points,
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

module.exports = router;