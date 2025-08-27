const RawScore = require('../models/RawScore');
const FinalScore = require('../models/FinalScore');
const Team = require('../models/Team');
const Event = require('../models/Event');

async function finalizeScores(eventId, round) {
  const event = await Event.findById(eventId);
  const allTeams = await Team.find({ 'members.events': event.name });

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

  for (let i = 0; i < aggregated.length; i++) {
    let points = 10;
    if (i === 0) points = 100;
    else if (i === 1) points = 50;

    finalScores.push({ team: aggregated[i]._id, event: eventId, points });
  }

  for (const team of allTeams) {
    if (!rankedTeamIds.includes(team._id.toString())) {
      finalScores.push({ team: team._id, event: eventId, points: -10 });
    }
  }

  for (const entry of finalScores) {
    await FinalScore.findOneAndUpdate(
      { team: entry.team, event: entry.event },
      { $set: { points: entry.points } },
      { upsert: true }
    );
  }

  return finalScores;
}

module.exports = { finalizeScores };