const mongoose = require('mongoose');
const Team = require('../models/Team');
const Event = require('../models/Event');
const Score = require('../models/Score');

/**
 * Core Service to finalize scores for an event round.
 * Implements tie-breaking and normalization (100/50/10).
 * Updated to handle Assigned Team Names.
 */
async function finalizeScores(eventId, round) {
  try {
    // 1. Validate the event
    const event = await Event.findById(eventId);
    if (!event) throw new Error(`Event not found for ID: ${eventId}`);

    if (!event.isTrophyEvent) {
      console.log(`ℹ️ Skipping normalization for Open Event: ${event.name}`);
      return { message: "Open Event scores finalized locally, not added to Trophy Board." };
    }

    // 2. Fetch teams assigned to this event (Including their assigned names)
    const allAssignedTeams = await Team.find({ 'members.events': event.name });

    // 3. Aggregate finalized scores from judges
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

    // 5. Update Trophy Leaderboard
    const allTeams = await Team.find(); 
    
    for (const team of allTeams) {
      const teamIdStr = team._id.toString();
      const hasScores = rankedIds.includes(teamIdStr);

      if (hasScores) {
        const rank = rankedIds.indexOf(teamIdStr);
        let pointsToAward = 10; // Participation base
        if (rank === 0) pointsToAward = 100;      // 1st Place
        else if (rank === 1) pointsToAward = 50;  // 2nd Place

        // Map updates
        team.finalPoints.set(eventId.toString(), pointsToAward);
        
        // Log using assigned name for clarity in terminal
        const identifier = team.teamName || team.college;
        console.log(`🏆 Awarding ${pointsToAward} pts to ${identifier} for ${event.name}`);
        
        await team.save();
      }
    }

    console.log(`✅ Normalization complete for ${event.name} (Round ${round})`);
    return { success: true, rankedTeams };
  } catch (err) {
    console.error(`❌ Scoring Service Error:`, err);
    throw err;
  }
}

module.exports = { finalizeScores };