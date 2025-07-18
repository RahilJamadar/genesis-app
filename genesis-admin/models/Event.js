const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: String,
  faculties: [String], // Faculty in-charges by name
  studentCoordinators: [String], // Coordinator names
  rules: String // Markdown or plain text rules
});

module.exports = mongoose.model('Event', EventSchema);