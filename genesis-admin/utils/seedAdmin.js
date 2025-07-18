require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    const existing = await Admin.findOne({ username: 'admin' });
    if (existing) {
      console.log('Admin already exists. Skipping creation.');
      return;
    }

    const hashed = await bcrypt.hash('admin123', 10); // you can change password
    const newAdmin = new Admin({
      username: 'admin',
      password: hashed
    });

    await newAdmin.save();
    console.log('✅ Admin user created: username = admin, password = admin123');
    mongoose.disconnect();
  } catch (err) {
    console.error('❌ Error creating admin:', err);
  }
}

createAdmin();