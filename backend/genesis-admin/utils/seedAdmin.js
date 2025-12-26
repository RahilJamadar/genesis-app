require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

/**
 * Seed Utility: Creates the initial Super Admin account for the Genesis system.
 * Run this once after setting up your .env file.
 */
async function createAdmin() {
  try {
    // 1. Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('📡 Connected to MongoDB for seeding...');

    // 2. Check if a Super Admin already exists
    const existing = await Admin.findOne({ name: 'admin' });
    if (existing) {
      console.log('⚠️ Admin already exists. Skipping creation to prevent duplicates.');
      await mongoose.disconnect();
      return;
    }

    // 3. Hash the default password
    // Using 10 rounds as per our standard across the project
    const defaultPassword = 'admin123';
    const hashed = await bcrypt.hash(defaultPassword, 10);

    // 4. Create the Super Admin with the 'super-admin' role
    const newAdmin = new Admin({
      name: 'admin',
      password: hashed,
      role: 'super-admin' // Granting highest privilege for the seed user
    });

    await newAdmin.save();

    console.log('--- SEED SUCCESSFUL ---');
    console.log(`✅ Username: admin`);
    console.log(`✅ Password: ${defaultPassword}`);
    console.log(`✅ Role: super-admin`);
    console.log('-----------------------');

  } catch (err) {
    console.error('❌ Error creating admin:', err);
  } finally {
    // 5. Always close the connection
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
  }
}

createAdmin();