const express = require('express');

// Import admin routes
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

// ✅ Middleware (CORS and JSON parsing are already handled in backend/index.js)
app.use(express.json());

// ✅ Admin Routes
app.use('/api/admin/auth', authRoutes);
app.use('/api/admin/manage', adminManageRoutes);
app.use('/api/admin/events', eventRoutes);
app.use('/api/admin/teams', teamRoutes);
app.use('/api/admin/scoring', scoringRoutes);
app.use('/api/admin/faculty', facultyRoutes);
app.use('/api/admin/student-coordinators', studentCoordinatorsRoutes);
app.use('/api/schedules', scheduleRoutes);

// ✅ Faculty Routes
app.use('/api/faculty', facultyAuth);
app.use('/api/faculty', facultyDashboard);
app.use('/api/faculty', scoringRoutes);

module.exports = app;