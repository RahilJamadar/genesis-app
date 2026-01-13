const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  // TYPE: Is it a technical event or a general activity?
  type: {
    type: String,
    required: true,
    enum: ['event', 'activity'], // 'event' for technical/gaming, 'activity' for lunch/refreshment/inauguration
    default: 'event'
  },
  // If type is 'event', this is required. If type is 'activity', this remains null.
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: function() { return this.type === 'event'; }
  },
  // Only applicable for type: 'event'
  round: {
    type: Number,
    enum: [1, 2, 3], // Allowed for up to 3 rounds
    required: function() { return this.type === 'event'; }
  },
  // Custom title for activities (e.g., "Grand Inauguration" or "Networking Lunch")
  activityTitle: {
    type: String,
    trim: true,
    required: function() { return this.type === 'activity'; }
  },
  date: {
    type: Date, 
    required: true
  },
  startTime: {
    type: String, // Format: "HH:mm" (24hr)
    required: true
  },
  duration: {
    type: Number, // In minutes (e.g., 60 for 1 hour)
    required: true
  },
  room: {
    type: String,
    required: true,
    trim: true,
    default: 'TBD' // e.g., Seminar Hall, Lab 1, Stage
  },
  details: {
    type: String,
    trim: true // Any extra instructions
  }
}, { timestamps: true });

// Sorting logic: Sort by date then by start time automatically
scheduleSchema.index(
  { eventId: 1, round: 1 }, 
  { 
    unique: true, 
    partialFilterExpression: { eventId: { $exists: true } } 
  }
);

module.exports = mongoose.model('Schedule', scheduleSchema);