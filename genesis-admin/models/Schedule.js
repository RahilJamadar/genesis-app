const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  eventName: { type: String, required: true },
  eventId: { type: String }, // optionally link to Event model
  date: { type: String, required: true },
  time: { type: String, required: true },
  room: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Schedule', scheduleSchema);