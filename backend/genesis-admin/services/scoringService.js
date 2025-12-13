const mongoose = require('mongoose');
const RawScore = require('../models/RawScore');
const FinalScore = require('../models/FinalScore');
const Team = require('../models/Team');
const Event = require('../models/Event');

async function finalizeScores(eventId, round) {
  try {
    // 🔍 Validate event
    const event = await Event.findById(eventId);
    if (!event) {
      throw new Error(`Event not found for ID: ${eventId}`);
    }

    // 🔍 Get all teams linked to this event
    const allTeams = await Team.find({ 'members.events': event.name });
    if (!allTeams.length) {
      console.warn(`No teams found for event: ${event.name}`);
    }

    // 📊 Aggregate raw scores
    const aggregated = await RawScore.aggregate([
      { $match: { eventId: new mongoose.Types.ObjectId(eventId), round } },
      {
        $group: {
          _id: '$teamId',
          teamName: { $first: '$teamName' },
          college: { $first: '$college' },
          totalScore: { $sum: '$points' }
        }
      },
      { $sort: { totalScore: -1 } }
    ]);

    const finalScores = [];
    const rankedTeamIds = aggregated.map(t => t._id.toString());

    // 🥇 Assign final points based on rank
    for (let i = 0; i < aggregated.length; i++) {
      let points = 10;
      if (i === 0) points = 100;
      else if (i === 1) points = 50;

      finalScores.push({
        team: aggregated[i]._id,
        event: eventId,
        points
      });
    }

    // ❌ Penalize teams that didn’t score
    for (const team of allTeams) {
      if (!rankedTeamIds.includes(team._id.toString())) {
        finalScores.push({
          team: team._id,
          event: eventId,
          points: -10
        });
      }
    }

    // 💾 Save final scores
    for (const entry of finalScores) {
      await FinalScore.findOneAndUpdate(
        { team: entry.team, event: entry.event },
        { $set: { points: entry.points } },
        { upsert: true }
      );
    }

    console.log(`✅ Finalized scores for ${event.name} (${round})`);
    return finalScores;
  } catch (err) {
    console.error(`❌ Error finalizing scores for eventId=${eventId}, round=${round}:`, err);
    throw err;
  }
}

module.exports = { finalizeScores };