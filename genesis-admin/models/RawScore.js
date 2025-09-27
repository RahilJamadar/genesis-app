const mongoose = require('mongoose');

const RawScoreSchema = new mongoose.Schema({
  teamId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Team' },
  teamName: { type: String, required: true },
  college: { type: String, required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Event' },
  points: { type: Number, required: true },
  judge: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' },
  round: { type: String, required: true },
  participant: { type: String }, // ✅ NEW
  comment: String
}, { timestamps: true });

RawScoreSchema.index({ teamId: 1, eventId: 1, round: 1 }, { unique: true });

module.exports = mongoose.model('RawScore', RawScoreSchema);