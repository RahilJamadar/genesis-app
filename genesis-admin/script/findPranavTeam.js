const mongoose = require('mongoose');
const Team = require('../models/Team');

const MONGO_URI = 'mongodb+srv://rahiljamadar:rahiljamadar123@cluster0.hyrcvut.mongodb.net/genesis2025?retryWrites=true&w=majority';

async function findPranavTeam() {
  try {
    await mongoose.connect(MONGO_URI);

    const teams = await Team.find({ leader: { $regex: /Pranav/i } }).lean();

    if (teams.length === 0) {
      console.log('❌ No teams found with leader matching "Pranav".');
    } else {
      console.log(`✅ Found ${teams.length} team(s):\n`);
      teams.forEach(team => {
        console.log('🧑‍🤝‍🧑 Team ID:', team._id);
        console.log('🏫 College:', team.college);
        console.log('👤 Leader:', team.leader.trim());
        console.log('📞 Contact:', team.contact);
        console.log('🧑‍🏫 Faculty:', team.faculty);
        console.log('👥 Members:', team.members?.length || 0);
        console.log('🎯 Final Points:', team.finalPoints || {});
        console.log('---');
      });
    }

    mongoose.disconnect();
  } catch (err) {
    console.error('❌ Query failed:', err);
    mongoose.disconnect();
  }
}

findPranavTeam();