import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import os from 'os';
import { createRequire } from 'module';
import serverApp from './server/index.js';

const require = createRequire(import.meta.url);
const adminApp = require('./genesis-admin/index.js');

dotenv.config();
const app = express();

// ✅ LAN IP detection
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// ✅ CORS Configuration (wildcard removed to support credentials)
const allowedOrigins = [
  'http://localhost:3000',
  `http://${getLocalIP()}:3000`
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// ✅ MongoDB Connection (shared across both apps)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ✅ Mount both apps
app.use(serverApp);   // Public routes
app.use(adminApp);    // Admin routes

// ✅ Health Check
app.get('/', (req, res) => {
  res.send('Genesis Unified Backend is running ✅');
});

// ✅ Server Start
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  const ip = getLocalIP();
  console.log(`🚀 Unified Backend running at http://${ip}:${PORT}`);
});