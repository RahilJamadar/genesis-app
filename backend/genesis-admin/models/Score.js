const mongoose = require('mongoose');

const ScoreSchema = new mongoose.Schema({
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  round: {
    type: String,
    required: true
  },
  judge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
    required: true
  },
  points: {
    type: Number,
    required: true
  },
  participant: {
    type: String // optional: for individual scoring
  },
  comment: {
    type: String
  },
  finalized: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

ScoreSchema.index({ team: 1, event: 1, judge: 1 }, { unique: true });

module.exports = mongoose.model('Score', ScoreSchema);