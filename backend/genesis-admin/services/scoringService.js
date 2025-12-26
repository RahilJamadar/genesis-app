const mongoose = require('mongoose');
const Team = require('../models/Team');
const Event = require('../models/Event');
const Score = require('../models/Score');

/**
 * Core Service to finalize scores for an event round.
 * Implements tie-breaking, normalization (100/50/10), and participation penalty (-5).
 */
async function finalizeScores(eventId, round) {
  try {
    // 1. Validate the event and check if it's a Trophy Event
    const event = await Event.findById(eventId);
    if (!event) throw new Error(`Event not found for ID: ${eventId}`);

    // If it's an "Open Event" (Hackathon/Football), we don't normalize for the trophy
    if (!event.isTrophyEvent) {
      console.log(`ℹ️ Skipping normalization for Open Event: ${event.name}`);
      return { message: "Open Event scores finalized locally, not added to Trophy Board." };
    }

    // 2. Fetch all teams assigned to this specific event
    const allAssignedTeams = await Team.find({ 'members.events': event.name });

    // 3. Aggregate finalized scores from judges for this round
    const aggregated = await Score.aggregate([
      { $match: { event: new mongoose.Types.ObjectId(eventId), round: Number(round), finalized: true } },
      {
        $group: {
          _id: '$team',
          totalScore: { $sum: '$totalPoints' },
          c1Sum: { $sum: { $arrayElemAt: ['$criteriaScores', 0] } },
          c2Sum: { $sum: { $arrayElemAt: ['$criteriaScores', 1] } },
          c3Sum: { $sum: { $arrayElemAt: ['$criteriaScores', 2] } }
        }
      }
    ]);

    // 4. Tie-Breaker Logic (C1 > C2 > C3)
    const rankedTeams = aggregated.sort((a, b) => {
      if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
      if (b.c1Sum !== a.c1Sum) return b.c1Sum - a.c1Sum;
      if (b.c2Sum !== a.c2Sum) return b.c2Sum - a.c2Sum;
      return b.c3Sum - a.c3Sum;
    });

    const rankedIds = rankedTeams.map(t => t._id.toString());

    // 5. Update every team in the database for the Trophy Leaderboard
    const allTeams = await Team.find(); 
    
    for (const team of allTeams) {
      const teamIdStr = team._id.toString();
      const isAssigned = allAssignedTeams.some(t => t._id.equals(team._id));
      const hasScores = rankedIds.includes(teamIdStr);

      let pointsToAward = 0;

      if (hasScores) {
        // Team participated and was scored
        const rank = rankedIds.indexOf(teamIdStr);
        if (rank === 0) pointsToAward = 100;      // Winner
        else if (rank === 1) pointsToAward = 50;  // Runner-up
        else pointsToAward = 10;                  // Participated
      } else if (isAssigned) {
        // Team was supposed to participate but didn't show up
        pointsToAward = -5;
      } else {
        // Team wasn't registered for this event, no points/penalty
        continue; 
      }

      // Save to Team's map (Key must be a string for Mongoose Maps)
      team.finalPoints.set(eventId.toString(), pointsToAward);
      
      // The Team model pre-save hook will automatically update totalTrophyPoints
      await team.save();
    }

    console.log(`✅ Trophy points normalized for ${event.name} (Round ${round})`);
    return { success: true, rankedTeams };
  } catch (err) {
    console.error(`❌ Scoring Service Error:`, err);
    throw err;
  }
}

module.exports = { finalizeScores };