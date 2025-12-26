const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// 📂 Import Routes
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const teamRoutes = require('./routes/teams');
const facultyRoutes = require('./routes/faculty');
const adminManageRoutes = require('./routes/admin');
const studentCoordinatorsRoutes = require('./routes/studentCoordinators');
const scheduleRoutes = require('./routes/scheduleRoutes');
const facultyAuth = require('./routes/facultyAuth');
const facultyDashboard = require('./routes/facultyDashboard');
const scoringRoutes = require('./routes/scoring');

const app = express();

// 🛠️ Global Middleware
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000', 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));
app.use(express.json());

// 🔌 Database Connection
if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('🚀 Genesis Database Connected'))
    .catch(err => console.error('❌ DB Connection Error:', err));
} else {
  console.error('⚠️ MONGO_URI is not defined in .env file');
}

// 🌐 PUBLIC DATA ACCESS (No Auth Required for Landing Page)
// This ensures the landing page can fetch events without a token
app.use('/api/admin/events', eventRoutes); 
app.use('/api/public/schedules', scheduleRoutes);

// 🔐 Admin Management Routes
app.use('/api/admin/auth', authRoutes);
app.use('/api/admin/manage', adminManageRoutes);
app.use('/api/admin/teams', teamRoutes);
app.use('/api/admin/faculty', facultyRoutes);
app.use('/api/admin/student-coordinators', studentCoordinatorsRoutes);
app.use('/api/admin/schedules', scheduleRoutes); 

// 📊 Scoring Logic
app.use('/api/admin/scoring', scoringRoutes); 
app.use('/api/faculty/scoring', scoringRoutes);

// 🧑‍⚖️ Faculty Dashboard & Auth
app.use('/api/faculty/auth', facultyAuth);
app.use('/api/faculty/dashboard', facultyDashboard);

// 🧪 Server Status & Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'Genesis Server is running... 🟢',
    timestamp: new Date(),
    uptime: process.uptime()
  });
});

// 🚫 404 Handler
app.use((req, res) => {
  res.status(404).json({ 
    error: `Route ${req.originalUrl} not found.`,
    suggestion: "Check your API prefix (/api/admin or /api/faculty)"
  });
});

// ⚡ Global Error Handler
app.use((err, req, res, next) => {
  console.error('💥 Global Error:', err.stack);
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

module.exports = app;