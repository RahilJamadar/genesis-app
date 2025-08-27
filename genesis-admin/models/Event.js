const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: String,
  faculties: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' }], // ✅ updated
  studentCoordinators: [String],
  rules: String
});

module.exports = mongoose.model('Event', EventSchema);