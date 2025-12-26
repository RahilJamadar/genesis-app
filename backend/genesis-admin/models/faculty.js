const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const FacultySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true 
  },
  // Using email or phone for login is usually safer than just name
  number: { 
    type: String, 
    required: true,
    unique: true // Prevents duplicate judge accounts
  },
  password: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    default: 'faculty',
    enum: ['faculty', 'judge'] // Can distinguish between general faculty and specific judges
  },
  // Added: Reference to events this faculty is assigned to judge
  assignedEvents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  }]
}, { timestamps: true });

// Hash password before saving
FacultySchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Added: Helper method to compare passwords during login
FacultySchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.models.Faculty || mongoose.model('Faculty', FacultySchema);