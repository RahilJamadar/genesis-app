const mongoose = require('mongoose');

const MemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  events: [{ type: String }]
});

const TeamSchema = new mongoose.Schema({
  college: { type: String, required: true },
  faculty: { type: String, required: true },
  leader: { type: String, required: true },
  contact: { type: String, required: true },
  members: [MemberSchema],

  // 🏆 Final normalized points per event
  finalPoints: {
    type: Map,
    of: Number,
    default: {}
  }
});

// ✅ Prevent OverwriteModelError during hot reload
module.exports = mongoose.models.Team || mongoose.model('Team', TeamSchema);