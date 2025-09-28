const mongoose = require('mongoose');
const Score = require('../models/Score');
const Event = require('../models/Event');

const MONGO_URI = 'mongodb+srv://rahiljamadar:rahiljamadar123@cluster0.hyrcvut.mongodb.net/genesis2025?retryWrites=true&w=majority';

async function deleteDanceScores() {
  try {
    await mongoose.connect(MONGO_URI);

    const danceEvent = await Event.findOne({ name: 'Dance' });
    if (!danceEvent) {
      console.log('❌ Dance event not found.');
      return;
    }

    const result = await Score.deleteMany({ event: danceEvent._id });
    console.log(`🗑️ Deleted ${result.deletedCount} scores for Dance event.`);

    mongoose.disconnect();
  } catch (err) {
    console.error('❌ Deletion failed:', err);
  }
}

deleteDanceScores();