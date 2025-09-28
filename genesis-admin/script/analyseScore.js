const mongoose = require('mongoose');
const Team = require('../models/Team');
const Event = require('../models/Event');
const Score = require('../models/Score');

mongoose.connect('mongodb+srv://rahiljamadar:rahiljamadar123@cluster0.hyrcvut.mongodb.net/genesis2025?retryWrites=true&w=majority');

async function analyzeScores() {
  try {
    const scores = await Score.find()
      .populate('team', 'college leader')
      .populate('event', 'name category')
      .lean();

    const teams = await Team.find().lean();
    const summary = {};

    for (const score of scores) {
      if (!score.team || !score.event) continue;

      const teamId = score.team._id.toString();
      const eventId = score.event._id.toString();

      if (!summary[teamId]) {
        summary[teamId] = {
          team: `${score.team.leader.trim()} (${score.team.college})`,
          finalPoints: {},
          events: {}
        };
      }

      if (!summary[teamId].events[eventId]) {
        summary[teamId].events[eventId] = {
          event: `${score.event.name} (${score.event.category})`,
          totalPoints: 0,
          rounds: {}
        };
      }

      summary[teamId].events[eventId].totalPoints += score.points;
      summary[teamId].events[eventId].rounds[score.round] =
        (summary[teamId].events[eventId].rounds[score.round] || 0) + score.points;
    }

    for (const team of teams) {
      const teamId = team._id.toString();
      if (summary[teamId]) {
        const finalPoints = team.finalPoints || {};
        for (const eventId in summary[teamId].events) {
          summary[teamId].finalPoints[eventId] = finalPoints[eventId];
        }
      }
    }

    console.log('\n📊 Score Summary:\n');
    for (const teamId in summary) {
      const teamData = summary[teamId];
      console.log(`🧑‍🤝‍🧑 Team: ${teamData.team}`);
      const sortedEvents = Object.entries(teamData.events).sort((a, b) =>
        a[1].event.localeCompare(b[1].event)
      );
      for (const [eventId, eventData] of sortedEvents) {
        console.log(`  🎯 Event: ${eventData.event}`);
        console.log(`    🔢 Total Raw Points: ${eventData.totalPoints}`);
        for (const round in eventData.rounds) {
          console.log(`    🌀 ${round}: ${eventData.rounds[round]} pts`);
        }
        const final = teamData.finalPoints?.[eventId];
        console.log(
          `    🏁 Final Normalized: ${
            typeof final === 'number' ? `${final} pts` : '— pts'
          }`
        );
      }
      console.log('');
    }

    mongoose.disconnect();
  } catch (err) {
    console.error('❌ Failed to analyze scores:', err);
    mongoose.disconnect();
  }
}

analyzeScores();