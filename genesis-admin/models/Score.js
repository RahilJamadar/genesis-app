const mongoose = require('mongoose');

const ScoreSchema = new mongoose.Schema({
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  points: { type: Number, default: 0 }
}, { timestamps: true });

ScoreSchema.index({ team: 1, event: 1 }, { unique: true });

module.exports = mongoose.model('Score', ScoreSchema);