const mongoose = require('mongoose');
const Event = require('../models/Event');     // Adjust path if needed
const Faculty = require('../models/Faculty'); // Adjust path if needed

// Replace with your actual Atlas connection string
const MONGO_URI = 'mongodb+srv://rahiljamadar:rahiljamadar123@cluster0.hyrcvut.mongodb.net/genesis2025?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

async function assignJudgeToEvent(eventName, facultyName) {
  try {
    const faculty = await Faculty.findOne({ name: facultyName });
    if (!faculty) {
      console.log(`❌ Faculty "${facultyName}" not found`);
      return;
    }

    const event = await Event.findOne({ name: eventName });
    if (!event) {
      console.log(`❌ Event "${eventName}" not found`);
      return;
    }

    const alreadyAssigned = event.judges.some(j => j.equals(faculty._id));
    if (alreadyAssigned) {
      console.log(`ℹ️ Faculty "${faculty.name}" is already assigned to "${event.name}"`);
    } else {
      event.judges.push(faculty._id);
      await event.save();
      console.log(`✅ Assigned "${faculty.name}" as judge to "${event.name}"`);
    }
  } catch (err) {
    console.error('❌ Error assigning judge:', err);
  } finally {
    mongoose.disconnect();
  }
}

// Replace with actual values
assignJudgeToEvent('Hackathon', 'Rahil Jamadar');