const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    unique: true, // Prevent duplicate admin names
    trim: true 
  },
  // In a production app, this string will store the BCRYPT HASH, not the plain text
  password: { 
    type: String, 
    required: true 
  },
  role: {
    type: String,
    default: 'admin',
    enum: ['admin', 'super-admin'] // Useful for future scalability
  },
  lastLogin: {
    type: Date
  }
}, { timestamps: true }); // Automatically adds createdAt and updatedAt

module.exports = mongoose.model('Admin', AdminSchema);