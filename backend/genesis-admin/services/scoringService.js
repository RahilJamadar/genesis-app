const mongoose = require('mongoose');
const Team = require('../models/Team');
const Event = require('../models/Event');
const Score = require('../models/Score');

/**
 * Core Service to finalize scores for an event round.
 * Implements tie-breaking and normalization (100/50/10).
 * Handles both Standard Evaluation and Direct Win (Winner-takes-all).
 */
async function finalizeScores(eventId, round) {
  try {
    // 1. Validate the event
    const event = await Event.findById(eventId);
    if (!event) throw new Error(`Event not found for ID: ${eventId}`);

    // Skip normalization for non-trophy events (Open Events)
    if (!event.isTrophyEvent) {
      console.log(`ℹ️ Skipping normalization for Open Event: ${event.name}`);
      return { message: "Open Event scores finalized locally, not added to Trophy Board." };
    }

    // 2. Aggregate finalized scores from all judges for this round
    const aggregated = await Score.aggregate([
      { 
        $match: { 
          event: new mongoose.Types.ObjectId(eventId), 
          round: Number(round), 
          finalized: true 
        } 
      },
      {
        $group: {
          _id: '$team',
          totalScore: { $sum: '$totalPoints' },
          c1Sum: { $sum: { $arrayElemAt: ['$criteriaScores', 0] } },
          c2Sum: { $sum: { $arrayElemAt: ['$criteriaScores', 1] } },
          c3Sum: { $sum: { $arrayElemAt: ['$criteriaScores', 2] } },
          // Capture direct win data if applicable
          directFirst: { $first: '$directWinners.firstPlace' }
        }
      }
    ]);

    let rankedIds = [];

    // 3. Sorting / Ranking Logic
    if (event.isDirectWin) {
      // 🥇 DIRECT WIN LOGIC: Only the team selected as firstPlace by judges gets 100
      // We take the winner from the first finalized score found
      const winnerId = aggregated.find(a => a.directFirst)?.directFirst;
      if (winnerId) rankedIds = [winnerId.toString()];
    } else {
      // 📊 STANDARD EVALUATION LOGIC: Sort by points
      const rankedTeams = aggregated.sort((a, b) => {
        // Primary: Total Points (Fergusson 236 vs IIT 217 -> Fergusson first)
        if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
        // Secondary Tie-breaker: Criteria 1
        if (b.c1Sum !== a.c1Sum) return b.c1Sum - a.c1Sum;
        // Tertiary Tie-breaker: Criteria 2
        if (b.c2Sum !== a.c2Sum) return b.c2Sum - a.c2Sum;
        // Final Tie-breaker: Criteria 3
        return b.c3Sum - a.c3Sum;
      });
      rankedIds = rankedTeams.map(t => t._id.toString());
    }

    // 4. Fetch all teams registered for this event to apply participation points (10 pts)
    // This ensures teams who participated but didn't come 1st/2nd still get points.
    const participatingTeams = await Team.find({ registeredEvents: eventId });

    for (const team of participatingTeams) {
      const teamIdStr = team._id.toString();
      const rankIndex = rankedIds.indexOf(teamIdStr);

      let pointsToAward = 10; // Default participation points for everyone in the event

      if (rankIndex === 0) {
        pointsToAward = 100; // 1st Place
      } else if (rankIndex === 1 && !event.isDirectWin) {
        pointsToAward = 50;  // 2nd Place (Only for non-direct win events)
      } else if (rankIndex === -1 && !event.isDirectWin) {
        // If the team has NO score from ANY judge, they get 0 (DNP)
        // Check if any judge scored this team
        const wasScored = aggregated.some(a => a._id.toString() === teamIdStr);
        if (!wasScored) pointsToAward = 0;
      }

      // Update the Map
      team.finalPoints.set(eventId.toString(), pointsToAward);
      
      // Mongoose doesn't track Map updates automatically
      team.markModified('finalPoints');
      
      const identifier = team.teamName || team.college;
      console.log(`🏆 [${event.name}] Awarded ${pointsToAward} pts to ${identifier}`);
      
      await team.save();
    }

    console.log(`✅ Normalization complete for ${event.name} (Round ${round})`);
    return { success: true, rankedIds };
  } catch (err) {
    console.error(`❌ Scoring Service Error:`, err);
    throw err;
  }
}

module.exports = { finalizeScores };