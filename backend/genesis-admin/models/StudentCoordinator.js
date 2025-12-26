const mongoose = require('mongoose');

const studentCoordinatorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true, // Prevents duplicate registrations
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    unique: true, // Crucial for identifying the student uniquely
    trim: true
  },
  // Added: To easily fetch which events this student is managing
  assignedEvents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  }]
}, { timestamps: true });

module.exports = mongoose.model('StudentCoordinator', studentCoordinatorSchema);