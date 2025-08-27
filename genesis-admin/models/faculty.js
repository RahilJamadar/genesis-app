const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const FacultySchema = new mongoose.Schema({
  name: { type: String, required: true },
  number: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, default: 'faculty' }

});

// Hash password before saving
FacultySchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.models.Faculty || mongoose.model('Faculty', FacultySchema);