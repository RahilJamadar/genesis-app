const mongoose = require('mongoose');
const Score = require('../models/Score');
const Team = require('../models/Team');
const Event = require('../models/Event');

const MONGO_URI = 'mongodb+srv://rahiljamadar:rahiljamadar123@cluster0.hyrcvut.mongodb.net/genesis2025?retryWrites=true&w=majority';
const EVENT_ID = '68d7afd1fc12db5e21cf1fe6'; // replace with actual event ID

async function runAudit() {
  try {
    await mongoose.connect(MONGO_URI);

    const event = await Event.findById(EVENT_ID);
    if (!event) throw new Error('Event not found');

    const scores = await Score.find({ event: EVENT_ID }).populate('team', 'leader college');
    const teams = await Team.find();

    const allFinalized = scores.every(s => s.finalized);
    console.log(allFinalized ? '✅ All scores finalized.' : '⏳ Some scores are still pending finalization.');

    // Calculate total raw points per team
    const teamTotals = {};
    for (const score of scores) {
      const teamId = score.team._id.toString();
      teamTotals[teamId] = (teamTotals[teamId] || 0) + score.points;
    }

    console.log('\n📊 Raw Totals per Team:');
    for (const [teamId, total] of Object.entries(teamTotals)) {
      const team = teams.find(t => t._id.toString() === teamId);
      console.log(`🧑‍🤝‍🧑 ${team?.leader?.trim()} (${team?.college}) → ${total} pts`);
    }

    // Rank teams
    const ranked = Object.entries(teamTotals)
      .sort((a, b) => b[1] - a[1])
      .map(([teamId], index) => ({ teamId, rank: index + 1 }));

    console.log('\n🏁 Expected Final Normalized Scores:');
    for (const team of teams) {
      const teamId = team._id.toString();
      const participated = teamTotals.hasOwnProperty(teamId);

      let final = -10;
      if (participated) {
        const rank = ranked.find(r => r.teamId === teamId)?.rank;
        if (rank === 1) final = 100;
        else if (rank === 2) final = 50;
        else final = 10;
      }

      const actual = team.finalPoints?.[EVENT_ID];
      const status = actual === final ? '✅' : '⚠️';

      console.log(`${status} ${team.leader?.trim()} (${team.college}) → Final: ${actual ?? '—'} | Expected: ${final}`);
    }

    mongoose.disconnect();
  } catch (err) {
    console.error('❌ Audit failed:', err);
  }
}

runAudit();