import mongoose from 'mongoose';



const MemberSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  contact: { type: String, trim: true },
  diet: { type: String, enum: ['veg', 'non-veg'], required: true, default: 'veg' },
  events: [{ type: String, trim: true }]
});

const TeamSchema = new mongoose.Schema({
  // 🚀 NEW FIELD: teamName
  // Set to default empty string so existing records stay compatible
  teamName: { type: String, default: '', trim: true },
  
  college: { type: String, required: true, trim: true },
  faculty: { type: String, required: true, trim: true },
  leader: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  contact: { type: String, required: true, unique: true, trim: true },
  members: [MemberSchema],
  paymentStatus: { type: String, enum: ['pending', 'paid', 'verified', 'failed'], default: 'pending' },
  transactionId: { type: String, default: '', trim: true },
  vegCount: { type: Number, default: 0 },
  nonVegCount: { type: Number, default: 0 },
  registeredEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
  finalPoints: {
    type: Map,
    of: Number,
    default: () => new Map() // Use a function to ensure a fresh Map
  },
  totalTrophyPoints: { type: Number, default: 0 },
  isOutstation: { type: Boolean, default: false }
}, { timestamps: true });

TeamSchema.pre('save', function (next) {
  // 1. Update Food Counts
  if (this.members) {
    this.vegCount = this.members.filter(m => m.diet === 'veg').length;
    this.nonVegCount = this.members.filter(m => m.diet === 'non-veg').length;
  }
  
  // 2. Update Total Trophy Points (Sum of finalPoints Map)
  let total = 0;
  if (this.finalPoints instanceof Map) {
    for (let [eventId, value] of this.finalPoints) {
      total += (Number(value) || 0);
    }
  }
  
  this.totalTrophyPoints = total;
  next();
});



const Team = mongoose.models.Team || mongoose.model('Team', TeamSchema);
export default Team;