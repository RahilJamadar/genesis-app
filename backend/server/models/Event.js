import mongoose from 'mongoose';


const EventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true 
  },
  category: {
    type: String,
    required: true,
    enum: ['Tech', 'Cultural', 'Gaming', 'Sports', 'Pre-events']
  },
  isTrophyEvent: {
    type: Boolean,
    default: true 
  },
  isDirectWin: {
    type: Boolean,
    default: false
  },
  rules: {
    type: String,
    required: true
  },
  rounds: {
    type: Number,
    required: true,
    min: 1,
    max: 3,
    default: 1
  },
  minParticipants: {
    type: Number,
    required: true,
    default: 1,
    min: 1
  },
  maxParticipants: {
    type: Number,
    required: true,
    default: 1,
    validate: {
      validator: function(v) {
        const update = this.getUpdate ? (this.getUpdate().$set || this.getUpdate()) : null;
        const min = (update && update.minParticipants !== undefined) 
                    ? update.minParticipants 
                    : (this.minParticipants || 0);

        return Number(v) >= Number(min);
      },
      message: 'Maximum participants ({VALUE}) cannot be less than minimum participants.'
    }
  },
  judges: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Faculty',
    required: true
  }],
  studentCoordinators: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'StudentCoordinator',
    required: true
  }],
  judgingCriteria: {
    type: [String],
    validate: {
      validator: function(v) {
        // Handle context for findByIdAndUpdate (Query) vs save() (Document)
        const update = this.getUpdate ? (this.getUpdate().$set || this.getUpdate()) : null;
        
        // 1. Determine isDirectWin status
        let isDirect;
        if (update && update.isDirectWin !== undefined) {
          isDirect = update.isDirectWin;
        } else {
          isDirect = this.isDirectWin;
        }

        // 2. Determine isTrophyEvent status
        let isTrophy;
        if (update && update.isTrophyEvent !== undefined) {
          isTrophy = update.isTrophyEvent;
        } else {
          isTrophy = this.isTrophyEvent;
        }

        /**
         * 🚀 LOGIC UPDATE:
         * We skip the 'Exactly 3' requirement if:
         * a) It's a Direct Win event (No criteria needed)
         * b) It's NOT a Trophy Event (Open events usually have custom scoring/no overall impact)
         */
        if (isDirect === true || isTrophy === false) {
          return true; 
        }
        
        return Array.isArray(v) && v.length === 3;
      },
      message: 'Standard Trophy events must provide exactly 3 judging criteria.'
    },
    default: []
  }
}, { timestamps: true });


// Check if model already exists to prevent overwrite error
const Event = mongoose.models.Event || mongoose.model('Event', EventSchema);
export default Event;