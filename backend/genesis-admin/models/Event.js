const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: String,

  faculties: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' }], // existing

  studentCoordinators: [String],
  rules: String,

  rounds: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },

  // ✅ New field: judges assigned to score this event
  judges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' }]
});

module.exports = mongoose.model('Event', EventSchema);