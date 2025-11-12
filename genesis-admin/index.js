require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const ip = require('ip');

const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const teamRoutes = require('./routes/teams');
const facultyRoutes = require('./routes/faculty');
const adminManageRoutes = require('./routes/admin'); // handles CRUD for admins
const studentCoordinatorsRoutes = require('./routes/studentCoordinators');
const scheduleRoutes = require('./routes/scheduleRoutes');
const facultyAuth = require('./routes/facultyAuth');
const facultyDashboard = require('./routes/facultyDashboard');
const scoringRoutes = require('./routes/scoring');

const app = express();
const localIP = ip.address(); // Dynamically detect your LAN IP
const PORT = process.env.PORT || 5001;

// ✅ CORS Setup: Allow all origins dynamically (for dev/mobile access)
const corsOptions = {
  origin: (origin, callback) => {
    callback(null, true); // Allow all origins
  },
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// ✅ Route Mounting
app.use('/api/admin/auth', authRoutes);           // 🔐 Login & Register
app.use('/api/admin/manage', adminManageRoutes);  // ⚙️ Admin Management
app.use('/api/admin/events', eventRoutes);
app.use('/api/admin/teams', teamRoutes);
app.use('/api/admin/scoring', scoringRoutes);
app.use('/api/admin/faculty', facultyRoutes);
app.use('/api/admin/student-coordinators', studentCoordinatorsRoutes);
app.use('/api/schedules', scheduleRoutes);

app.use('/api/faculty', facultyAuth);
app.use('/api/faculty', facultyDashboard);
app.use('/api/faculty', scoringRoutes);

// ✅ Health Check
app.get('/', (req, res) => {
  res.send('Genesis Admin Backend is running ✅');
});

// ✅ Server Start
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running at:`);
  console.log(`🔹 Localhost: http://localhost:${PORT}`);
  console.log(`🔹 LAN Access: http://${localIP}:${PORT}`);
});