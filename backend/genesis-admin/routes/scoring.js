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
        if (b.total !== a.total) return b.total - a.total;
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

async function normalizeFinalScores(eventId) {
    try {
        const eventIdStr = eventId.toString();
        const event = await Event.findById(eventIdStr);
        if (!event || !event.isTrophyEvent) return;

        const participatingTeams = await Team.find({ registeredEvents: eventIdStr });
        const finalizedScores = await Score.find({ event: eventIdStr, finalized: true });

        if (event.isDirectWin) {
            const result = finalizedScores[0]; 
            if (!result || !result.directWinners) return;

            const firstPlaceId = result.directWinners.firstPlace?.toString();
            const secondPlaceId = result.directWinners.secondPlace?.toString();

            for (const team of participatingTeams) {
                const tId = team._id.toString();
                let points = 10; 
                if (tId === firstPlaceId) points = 100;
                else if (tId === secondPlaceId) points = 50;

                if (!team.finalPoints) team.finalPoints = new Map();
                team.finalPoints.set(eventIdStr, points);
                team.markModified('finalPoints');
                await team.save();
            }
        } 
        else {
            if (finalizedScores.length === 0) return;

            const teamMetrics = {};
            finalizedScores.forEach(s => {
                if (!s.team) return;
                const tId = s.team.toString();
                if (!teamMetrics[tId]) {
                    teamMetrics[tId] = { total: 0, c1: 0, c2: 0, c3: 0 };
                }
                teamMetrics[tId].total += (s.totalPoints || 0);
                if (s.criteriaScores && s.criteriaScores.length === 3) {
                    teamMetrics[tId].c1 += (s.criteriaScores[0] || 0);
                    teamMetrics[tId].c2 += (s.criteriaScores[1] || 0);
                    teamMetrics[tId].c3 += (s.criteriaScores[2] || 0);
                }
            });

            const ranked = calculateStandings(teamMetrics);

            for (const team of participatingTeams) {
                const tId = team._id.toString();
                let pointsAwarded = 10; 

                const rankIndex = ranked.findIndex(([id]) => id === tId);
                if (rankIndex === 0) pointsAwarded = 100; 
                else if (rankIndex === 1) pointsAwarded = 50;  

                if (!team.finalPoints) team.finalPoints = new Map();
                team.finalPoints.set(eventIdStr, pointsAwarded);
                team.markModified('finalPoints');
                await team.save();
            }
        }
        console.log(`✅ Normalized standings for: ${event.name}`);
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
            // 🚀 UPDATE: Added teamName to populate
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
        res.json({ success: true, message: 'Score finalized.' });
    } catch (err) {
        res.status(500).json({ error: 'Finalization failed' });
    }
});

// ==========================================
// 🧑‍⚖️ FACULTY / JUDGE ROUTES
// ==========================================

/**
 * @route   GET /api/faculty/scoring/event/:id/teams
 */
router.get('/event/:id/teams', verifyFaculty, async (req, res) => {
    try {
        const eventId = req.params.id;
        const roundNum = parseInt(req.query.round) || 1;

        if (roundNum === 1) {
            // Round 1
            const teams = await Team.find({ registeredEvents: eventId })
                // 🚀 UPDATE: Included teamName in the selection
                .select('college leader teamName') 
                .sort({ college: 1 });
            return res.json(teams);
        }

        // Round 2/3
        const promotedScores = await Score.find({
            event: eventId,
            round: roundNum - 1,
            promotedNextRound: true
        }).populate('team', 'college leader teamName'); // 🚀 UPDATE: Added teamName to populate

        const promotedTeams = promotedScores.map(s => s.team).filter(t => t != null);
        res.json(promotedTeams);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch participating teams' });
    }
});

/**
 * @route   POST /api/faculty/scoring/event/:eventId/promote
 */
router.post('/event/:eventId/promote', verifyFaculty, async (req, res) => {
    try {
        const { eventId } = req.params;
        const { round, count } = req.body; 

        const scores = await Score.find({ event: eventId, round, finalized: true })
            .sort({ totalPoints: -1 });

        if (scores.length === 0) {
            return res.status(400).json({ error: "No finalized scores found. Finalize scores before promoting." });
        }

        await Score.updateMany({ event: eventId, round }, { promotedNextRound: false });

        const promotedTeams = scores.slice(0, count).map(s => s._id);
        await Score.updateMany(
            { _id: { $in: promotedTeams } },
            { promotedNextRound: true }
        );

        res.json({ success: true, message: `${count} teams promoted to next round.` });
    } catch (err) {
        res.status(500).json({ error: 'Promotion logic failed' });
    }
});

router.get('/event/:eventId/scores/:teamId', verifyFaculty, async (req, res) => {
    try {
        const roundNum = parseRound(req.query.round);
        const query = { event: req.params.eventId, round: roundNum };
        
        if (req.params.teamId !== 'null') {
            query.team = req.params.teamId;
        }

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
        const totalPoints = criteriaScores.reduce((a, b) => a + b, 0);

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