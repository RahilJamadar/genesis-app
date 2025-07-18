import mongoose from 'mongoose';

const MemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  events: [{ type: String }]
});

const TeamSchema = new mongoose.Schema({
  college: { type: String, required: true },
  faculty: { type: String, required: true },
  leader: { type: String, required: true },
  contact: { type: String, required: true },
  members: [MemberSchema]
});

export default mongoose.model('Team', TeamSchema);