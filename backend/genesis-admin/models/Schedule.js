const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  // Added: To specify if this is for Round 1 or Round 2
  round: {
    type: Number,
    required: true,
    enum: [1, 2], 
    default: 1
  },
  // Changed to Date type for better sorting/filtering
  date: {
    type: Date, 
    required: true
  },
  // Storing time as a string is okay for display, 
  // but using a clear format like "HH:mm" is best
  time: {
    type: String,
    required: true
  },
  room: {
    type: String,
    required: true,
    trim: true
  }
}, { timestamps: true });

// Prevent double-booking: Ensure an event doesn't have two schedules for the same round
scheduleSchema.index({ eventId: 1, round: 1 }, { unique: true });

module.exports = mongoose.model('Schedule', scheduleSchema);