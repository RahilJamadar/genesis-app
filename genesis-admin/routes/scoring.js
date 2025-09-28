const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const verifyAdmin = require('../middleware/verifyAdmin');
const verifyFaculty = require('../middleware/verifyFaculty');
const Event = require('../models/Event');
const Team = require('../models/Team');
const Score = require('../models/Score');

// 🧠 Normalize final scores after all scoring is complete
async function normalizeFinalScores(eventId) {
  const event = await Event.findById(eventId);
  if (!event) return;

  const teams = await Team.find();
  const scores = await Score.find({ event: eventId });

  const allFinalized = scores.every(s => s.finalized);
  if (!allFinalized) return;

  const teamTotals = {};
  for (const score of scores) {
    const teamId = score.team.toString();
    teamTotals[teamId] = (teamTotals[teamId] || 0) + score.points;
  }

  const ranked = Object.entries(teamTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([teamId], index) => ({ teamId, rank: index + 1 }));

  for (const team of teams) {
    const teamId = team._id.toString();
    const participated = scores.some(s => s.team.toString() === teamId);

    let final = -10;
    if (participated) {
      const rank = ranked.find(r => r.teamId === teamId)?.rank;
      if (rank === 1) final = 100;
      else if (rank === 2) final = 50;
      else final = 10;
    }
    team.finalPoints = team.finalPoints || {};
    team.finalPoints[eventId] = final;
    await team.save();
  }

  console.log(`✅ Final points normalized for event ${event.name}`);
}

// 🔍 Admin: View Scores for Team/Round
router.get('/admin/event/:eventId/scores/:teamId', verifyAdmin, async (req, res) => {
  const { eventId, teamId } = req.params;
  const { round } = req.query;

  try {
    const scores = await Score.find({ event: eventId, team: teamId, round })
      .populate('judge', 'name')
      .populate('event', 'name category');
    res.json(scores);
  } catch (err) {
    console.error('Admin score fetch failed:', err);
    res.status(500).json({ error: 'Failed to fetch scores for round' });
  }
});

// 📝 Faculty: Submit Score
router.post('/event/:eventId/score', verifyFaculty, async (req, res) => {
  const { teamId, round, points, participant, comment, finalized } = req.body;
  const { eventId } = req.params;

  try {
    const event = await Event.findById(eventId);
    if (!event || !event.judges.some(j => j.equals(req.user.id))) {
      return res.status(403).json({ error: 'You are not assigned to this event' });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(400).json({ error: 'Team not found' });
    }

    const existing = await Score.findOne({
      team: teamId,
      event: eventId,
      round,
      judge: req.user.id,
      participant: participant || null
    });

    if (existing) {
      if (existing.finalized) {
        return res.status(403).json({ error: 'Score already finalized. No further edits allowed.' });
      }

      existing.points = points;
      existing.comment = comment || '';
      if (finalized) existing.finalized = true;
      await existing.save();

      if (finalized) await normalizeFinalScores(eventId);
      return res.json({ success: true, message: 'Score updated', score: existing });
    }

    const score = new Score({
      team: teamId,
      event: eventId,
      round,
      judge: req.user.id,
      points,
      participant: participant || undefined,
      comment: comment || '',
      finalized: !!finalized
    });

    await score.save();
    if (finalized) await normalizeFinalScores(eventId);

    console.log('🔔 Incoming score payload:', req.body);
    console.log('👤 Logged-in faculty:', req.user);
    res.status(201).json({ success: true, message: 'Score submitted', score });
  } catch (err) {
    console.error('Faculty score submit failed:', err);
    res.status(500).json({ error: 'Score submission failed' });
  }
});

// 📄 Faculty: View Scores for Team/Round
router.get('/event/:eventId/scores/:teamId', verifyFaculty, async (req, res) => {
  const { eventId, teamId } = req.params;
  const { round } = req.query;

  try {
    const scores = await Score.find({ event: eventId, team: teamId, round })
      .populate('judge', 'name');
    res.json(scores);
  } catch (err) {
    console.error('Faculty score fetch failed:', err);
    res.status(500).json({ error: 'Failed to fetch scores for round' });
  }
});

// 🏆 Admin: Leaderboard (uses finalPoints)
router.get('/leaderboard', verifyAdmin, async (req, res) => {
  const { eventId } = req.query;

  try {
    const teams = await Team.find().lean();

    const leaderboard = teams.map(team => {
      let finalPoints;

      if (eventId) {
        // 🎯 Specific event
        finalPoints = team.finalPoints?.[eventId] ?? -10;
      } else {
        // 🌐 Overall: sum of all normalized scores
        const allPoints = Object.values(team.finalPoints || {});
        finalPoints = allPoints.length > 0 ? allPoints.reduce((a, b) => a + b, 0) : -10;
      }

      return {
        teamName: team.leader,
        college: team.college,
        finalPoints
      };
    });

    leaderboard.sort((a, b) => b.finalPoints - a.finalPoints);
    res.json(leaderboard);
  } catch (err) {
    console.error('Leaderboard fetch failed:', err);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// 👥 Faculty: Fetch Teams for Assigned Event
router.get('/event/:id/teams', verifyFaculty, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event || !event.judges.some(j => j.equals(req.user.id))) {
      return res.status(403).json({ error: 'You are not assigned to this event' });
    }

    const teams = await Team.find({ 'members.events': event.name });
    res.json(teams);
  } catch (err) {
    console.error('Team fetch failed:', err);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

// 🧑‍⚖️ Faculty: Fetch Judges for Assigned Event
router.get('/event/:eventId/judges', verifyFaculty, async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId).populate('judges', 'name');
    if (!event) return res.status(404).json({ error: 'Event not found' });

    if (!event.judges.some(j => j.equals(req.user.id))) {
      return res.status(403).json({ error: 'You are not assigned to this event' });
    }

    res.json(event.judges);
  } catch (err) {
    console.error('Judge fetch failed:', err);
    res.status(500).json({ error: 'Failed to fetch judges' });
  }
});

module.exports = router;