const mongoose = require('mongoose');

const ScoreSchema = new mongoose.Schema({
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    // Required for Standard events, but might be null for 
    // a single Direct Win record that covers the whole event.
    required: function() { return !this.directWinners; }
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  round: {
    type: Number, 
    required: true,
    enum: [1, 2, 3] // Expanded to support 3 rounds for eliminations
  },
  judge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
    required: true
  },
  // 📊 For Standard Criteria Events
  criteriaScores: {
    type: [Number],
    validate: {
      validator: function(v) {
        // Only require 3 scores if it's NOT a direct win record
        if (this.directWinners) return true;
        return Array.isArray(v) && v.length === 3;
      },
      message: 'Scores for exactly 3 criteria must be provided.'
    },
    default: [0, 0, 0]
  },
  totalPoints: {
    type: Number,
    required: true,
    min: 0,
    max: 300, // Adjusted for 3 criteria (0-100 each)
    default: 0
  },
  // 🥇 For Direct Win Events
  directWinners: {
    firstPlace: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    secondPlace: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' }
  },
  // 🚀 NEW: Tracks if this team qualified for the next round
  promotedNextRound: {
    type: Boolean,
    default: false
  },
  comment: {
    type: String,
    trim: true
  },
  finalized: {
    type: Boolean,
    default: false 
  }
}, { timestamps: true });

// Auto-calculate total points before saving for standard events
ScoreSchema.pre('save', function(next) {
  if (this.criteriaScores && this.criteriaScores.length === 3 && !this.directWinners) {
    this.totalPoints = this.criteriaScores.reduce((acc, curr) => acc + (Number(curr) || 0), 0);
  }
  next();
});

// Compound index to ensure a judge only submits one score per team per round
// Note: For Direct Win, we'll use a specific logic where team might be null 
// so we allow sparse/flexible indexing if needed, but for now this remains strict.
ScoreSchema.index({ team: 1, event: 1, round: 1, judge: 1 }, { unique: true, partialFilterExpression: { team: { $exists: true } } });

module.exports = mongoose.models.Score || mongoose.model('Score', ScoreSchema);