const mongoose = require('mongoose');
const Team = require('../models/Team');

const MONGO_URI = 'mongodb+srv://rahiljamadar:rahiljamadar123@cluster0.hyrcvut.mongodb.net/genesis2025?retryWrites=true&w=majority';
const TEAM_ID = '68d7b775506d45f04ddbde7c';
const DANCE_EVENT_ID = '68d7afd1fc12db5e21cf1fe6';

async function forcePlainFinalPoints() {
  try {
    await mongoose.connect(MONGO_URI);

    const team = await Team.findById(TEAM_ID);
    if (!team) {
      console.log('❌ Team not found.');
      return;
    }

    // Convert Map to plain object if needed
    const raw = team.finalPoints instanceof Map
      ? Object.fromEntries(team.finalPoints)
      : { ...team.finalPoints };

    raw[String(DANCE_EVENT_ID)] = 100; // ✅ Add Dance score

    team.finalPoints = raw;
    team.markModified('finalPoints');
    await team.save();

    console.log(`✅ FinalPoints saved as plain object for ${team.leader.trim()}`);
    console.log('🧠 FinalPoints now:', team.finalPoints);

    mongoose.disconnect();
  } catch (err) {
    console.error('❌ Save failed:', err);
    mongoose.disconnect();
  }
}

forcePlainFinalPoints();