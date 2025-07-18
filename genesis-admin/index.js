require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const teamRoutes = require('./routes/teams');
const scoringRoutes = require('./routes/scoring');
const facultyRoutes = require('./routes/faculty');
const adminManageRoutes = require('./routes/admin'); // handles CRUD for admins
const studentCoordinatorsRoutes = require('./routes/studentCoordinators');
const scheduleRoutes = require('./routes/scheduleRoutes');

const app = express();

// ✅ Middleware Setup
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
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



// ✅ Health Check
app.get('/', (req, res) => {
  res.send('Genesis Admin Backend is running ✅');
});

// ✅ Server Start
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Admin server running at http://localhost:${PORT}`);
});