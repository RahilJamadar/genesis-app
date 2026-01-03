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
    enum: [1, 2, 3] 
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
        // Only require scores if it's NOT a direct win record
        if (this.directWinners) return true;
        
        /**
         * 🚀 UPDATE FOR POWER PAIR:
         * Standard events use 3 criteria.
         * Power Pair (Mr & Mrs) uses 6 criteria (3 for Male + 3 for Female).
         */
        return Array.isArray(v) && (v.length === 3 || v.length === 6);
      },
      message: 'Provide exactly 3 criteria scores (Standard) or 6 criteria scores (Power Pair).'
    },
    default: [0, 0, 0]
  },
  totalPoints: {
    type: Number,
    required: true,
    min: 0,
    /**
     * 🚀 UPDATE: Max is 600 now to support 6 criteria (100 each).
     * This will not affect 3-criteria events as they naturally cap at 300.
     */
    max: 600, 
    default: 0
  },
  // 🥇 For Direct Win Events
  directWinners: {
    firstPlace: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    secondPlace: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' }
  },
  // 🚀 Tracks if this team qualified for the next round
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

/**
 * 🧠 DYNAMIC CALCULATION LOGIC
 * This hook automatically detects if it's a 3-score or 6-score event
 * and calculates the totalPoints correctly before saving.
 */
ScoreSchema.pre('save', function(next) {
  if (this.criteriaScores && !this.directWinners) {
    // Works for both 3 and 6 criteria lengths
    this.totalPoints = this.criteriaScores.reduce((acc, curr) => acc + (Number(curr) || 0), 0);
  }
  next();
});

// Compound index to ensure a judge only submits one score per team per round
ScoreSchema.index(
    { team: 1, event: 1, round: 1, judge: 1 }, 
    { unique: true, partialFilterExpression: { team: { $exists: true } } }
);

module.exports = mongoose.models.Score || mongoose.model('Score', ScoreSchema);