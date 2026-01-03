const express = require('express');
const router = express.Router();
const verifyAdmin = require('../middleware/verifyAdmin');
const verifyFaculty = require('../middleware/verifyFaculty');
const Event = require('../models/Event');
const Team = require('../models/Team');
const Score = require('../models/Score');

// ==========================================
// 🧠 INTERNAL HELPER LOGIC (Normalization)
// ==========================================

const calculateStandings = (teamMetrics) => {
    return Object.entries(teamMetrics).sort(([, a], [, b]) => {
        // Primary: Total points in the round
        if (b.total !== a.total) return b.total - a.total;
        // Tie-breakers: Criteria 1 > 2 > 3
        if (b.c1 !== a.c1) return b.c1 - a.c1;
        if (b.c2 !== a.c2) return b.c2 - a.c2;
        return b.c3 - a.c3;
    });
};

const parseRound = (roundVal) => {
    if (typeof roundVal === 'number') return roundVal;
    if (typeof roundVal === 'string') {
        const match = roundVal.match(/\d+/);
        return match ? parseInt(match[0]) : null;
    }
    return null;
};

/**
 * 🚀 POWER-BOOSTED NORMALIZATION ENGINE
 * Handles standard 100/50/10 logic AND the 100/200/10 Power Pair logic.
 * Ensures the 'finalPoints' Map is updated and 'totalTrophyPoints' is recalculated.
 */
async function normalizeFinalScores(eventId) {
    try {
        const eventIdStr = eventId.toString();
        const event = await Event.findById(eventIdStr);
        
        // 1. Basic Validation
        if (!event || !event.isTrophyEvent) {
            console.log(`ℹ️ Skipping normalization: ${event?.name || 'Unknown'} is not a Trophy Event.`);
            return;
        }

        // 2. Fetch Finalized Scores for the latest round
        const allFinalizedScores = await Score.find({ event: eventIdStr, finalized: true });
        if (allFinalizedScores.length === 0) {
            console.log(`ℹ️ No finalized scores found for ${event.name}.`);
            return;
        }

        const maxRound = Math.max(...allFinalizedScores.map(s => s.round));
        const finalRoundScores = allFinalizedScores.filter(s => s.round === maxRound);
        const participatingTeams = await Team.find({ registeredEvents: eventIdStr });

        const isPowerPair = event.name.toLowerCase().includes("power pair");

        // --- CASE A: DIRECT WIN LOGIC (Standalone selection) ---
        if (event.isDirectWin) {
            const result = finalRoundScores[0]; 
            if (!result || !result.directWinners) return;

            const firstPlaceId = result.directWinners.firstPlace?.toString();
            const secondPlaceId = result.directWinners.secondPlace?.toString();

            for (const team of participatingTeams) {
                const tId = team._id.toString();
                let points = 10; // Participation default
                
                if (tId === firstPlaceId) points = 100;
                else if (tId === secondPlaceId) points = 50;

                team.finalPoints.set(eventIdStr, points);
                team.markModified('finalPoints');
                await team.save(); // save hook in Team.js will update totalTrophyPoints
            }
        } 
        // --- CASE B: EVALUATION BASED LOGIC (Criteria Summing) ---
        else {
            const teamMetrics = {};

            // Aggregate judge scores for the current final round
            finalRoundScores.forEach(s => {
                if (!s.team) return;
                const tId = s.team.toString();
                
                if (!teamMetrics[tId]) {
                    teamMetrics[tId] = { total: 0, c1: 0, c2: 0, c3: 0, mTotal: 0, fTotal: 0 };
                }

                if (isPowerPair && s.criteriaScores.length === 6) {
                    // Split Scoring: Indices 0,1,2 = Male | 3,4,5 = Female
                    const mSum = Number(s.criteriaScores[0] || 0) + Number(s.criteriaScores[1] || 0) + Number(s.criteriaScores[2] || 0);
                    const fSum = Number(s.criteriaScores[3] || 0) + Number(s.criteriaScores[4] || 0) + Number(s.criteriaScores[5] || 0);
                    
                    teamMetrics[tId].mTotal += mSum;
                    teamMetrics[tId].fTotal += fSum;
                    teamMetrics[tId].total += (mSum + fSum);
                } else {
                    // Standard Scoring (3 Criteria)
                    teamMetrics[tId].total += (Number(s.totalPoints) || 0);
                    if (s.criteriaScores && s.criteriaScores.length >= 3) {
                        teamMetrics[tId].c1 += Number(s.criteriaScores[0] || 0);
                        teamMetrics[tId].c2 += Number(s.criteriaScores[1] || 0);
                        teamMetrics[tId].c3 += Number(s.criteriaScores[2] || 0);
                    }
                }
            });

            // Handle Power Pair Result Assignment (Mr & Mrs Genesis)
            if (isPowerPair) {
                const mrWinnerEntry = Object.entries(teamMetrics).sort(([, a], [, b]) => b.mTotal - a.mTotal)[0];
                const mrsWinnerEntry = Object.entries(teamMetrics).sort(([, a], [, b]) => b.fTotal - a.fTotal)[0];

                const mrWinnerId = mrWinnerEntry ? mrWinnerEntry[0] : null;
                const mrsWinnerId = mrsWinnerEntry ? mrsWinnerEntry[0] : null;

                for (const team of participatingTeams) {
                    const tId = team._id.toString();
                    let pointsAwarded = 10; 

                    const wonMale = tId === mrWinnerId;
                    const wonFemale = tId === mrsWinnerId;

                    // Scoring: 100 for one title, 200 for both
                    if (wonMale && wonFemale) pointsAwarded = 200; 
                    else if (wonMale || wonFemale) pointsAwarded = 100; 

                    team.finalPoints.set(eventIdStr, pointsAwarded);
                    team.markModified('finalPoints');
                    await team.save();
                }
            } 
            // Handle Standard Result Assignment (1st, 2nd)
            else {
                const ranked = calculateStandings(teamMetrics);
                
                for (const team of participatingTeams) {
                    const tId = team._id.toString();
                    let pointsAwarded = 10;
                    const rankIndex = ranked.findIndex(([id]) => id === tId);
                    
                    if (rankIndex === 0) pointsAwarded = 100; 
                    else if (rankIndex === 1) pointsAwarded = 50; 

                    team.finalPoints.set(eventIdStr, pointsAwarded);
                    team.markModified('finalPoints');
                    await team.save();
                }
            }
        }
        console.log(`✅ Standings and Trophy Points synchronized for: ${event.name}`);
    } catch (err) {
        console.error("❌ Normalization Error:", err);
    }
}

// ==========================================
// 🛡️ ADMIN ROUTES
// ==========================================

router.get('/admin/event/:eventId/scores', verifyAdmin, async (req, res) => {
    try {
        const { eventId } = req.params;
        const roundNum = parseRound(req.query.round);
        const query = { event: eventId };
        if (roundNum !== null) query.round = roundNum;

        const scores = await Score.find(query)
            .populate('team', 'college leader teamName') 
            .populate('judge', 'name')
            .lean();
            
        res.json(scores || []);
    } catch (err) {
        res.status(500).json({ error: 'Audit fetch failed' });
    }
});

router.patch('/finalize/:scoreId', verifyAdmin, async (req, res) => {
    try {
        const score = await Score.findByIdAndUpdate(req.params.scoreId, { finalized: true }, { new: true });
        if (!score) return res.status(404).json({ error: 'Score not found' });
        await normalizeFinalScores(score.event);
        res.json({ success: true, message: 'Score finalized and leaderboard synced.' });
    } catch (err) {
        res.status(500).json({ error: 'Finalization failed' });
    }
});

// ==========================================
// 🧑‍⚖️ FACULTY / JUDGE ROUTES
// ==========================================

router.get('/event/:id/teams', verifyFaculty, async (req, res) => {
    try {
        const eventId = req.params.id;
        const roundNum = parseInt(req.query.round) || 1;

        if (roundNum === 1) {
            const teams = await Team.find({ registeredEvents: eventId })
                .select('college leader teamName') 
                .sort({ college: 1 });
            return res.json(teams);
        }

        const promotedScores = await Score.find({
            event: eventId,
            round: roundNum - 1,
            promotedNextRound: true
        }).populate('team', 'college leader teamName');

        const promotedTeams = promotedScores.map(s => s.team).filter(t => t != null);
        res.json(promotedTeams);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch participating teams' });
    }
});

router.post('/event/:eventId/promote', verifyFaculty, async (req, res) => {
    try {
        const { eventId } = req.params;
        const { round, count } = req.body; 
        const promotionCount = parseInt(count);

        const allScores = await Score.find({ 
            event: eventId, 
            round: round, 
            finalized: true 
        });

        if (allScores.length === 0) {
            return res.status(400).json({ error: "Scores must be finalized before promotion." });
        }

        const teamTotals = {};
        allScores.forEach(s => {
            const tId = s.team.toString();
            if (!teamTotals[tId]) {
                teamTotals[tId] = { id: s.team, totalPoints: 0 };
            }
            teamTotals[tId].totalPoints += s.totalPoints;
        });

        const sortedTeams = Object.values(teamTotals).sort((a, b) => b.totalPoints - a.totalPoints);
        const topTeamIds = sortedTeams.slice(0, promotionCount).map(t => t.id);

        await Score.updateMany({ event: eventId, round: round }, { promotedNextRound: false });
        await Score.updateMany(
            { event: eventId, round: round, team: { $in: topTeamIds } },
            { promotedNextRound: true }
        );

        res.json({ success: true, message: `Top ${topTeamIds.length} unique teams promoted.` });
    } catch (err) {
        res.status(500).json({ error: 'Promotion logic failed' });
    }
});

router.get('/event/:eventId/scores/:teamId', verifyFaculty, async (req, res) => {
    try {
        const roundNum = parseRound(req.query.round);
        const query = { event: req.params.eventId, round: roundNum };
        if (req.params.teamId !== 'null') query.team = req.params.teamId;
        const scores = await Score.find(query).populate('judge', 'name');
        res.json(scores);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch current scores' });
    }
});

router.post('/event/:eventId/direct-win', verifyFaculty, async (req, res) => {
    try {
        const { firstPlaceTeamId, secondPlaceTeamId, finalized } = req.body;
        const { eventId } = req.params;
        const updatedScore = await Score.findOneAndUpdate(
            { event: eventId, judge: req.user.id, round: 1 },
            { 
                directWinners: { firstPlace: firstPlaceTeamId, secondPlace: secondPlaceTeamId },
                finalized: !!finalized,
                totalPoints: 0,
                criteriaScores: [0, 0, 0]
            },
            { upsert: true, new: true }
        );
        if (finalized) await normalizeFinalScores(eventId);
        res.json({ success: true, score: updatedScore });
    } catch (err) {
        res.status(500).json({ error: 'Direct win submission failed' });
    }
});

router.post('/event/:eventId/score', verifyFaculty, async (req, res) => {
    try {
        const { teamId, round, criteriaScores, comment, finalized } = req.body;
        const { eventId } = req.params;
        const roundNum = parseRound(round);
        const totalPoints = criteriaScores.reduce((a, b) => Number(a) + Number(b), 0);

        const updatedScore = await Score.findOneAndUpdate(
            { team: teamId, event: eventId, round: roundNum, judge: req.user.id },
            { criteriaScores, totalPoints, comment, finalized: !!finalized },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        if (finalized) await normalizeFinalScores(eventId);
        res.json({ success: true, score: updatedScore });
    } catch (err) {
        res.status(500).json({ error: 'Score submission failed' });
    }
});

module.exports = router;