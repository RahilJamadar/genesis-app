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

// ✅ LAN IP detection (Keep this for logging, but also add to whitelist)
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

const localIP = getLocalIP();

// ✅ UPDATED WHITESPACE & ORIGIN LIST
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  `http://${localIP}:3000`, // Whitelist your actual LAN IP
  'https://extraordinary-sunburst-5110ea.netlify.app',
  'https://genesis8.netlify.app'
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS blocked an attempt from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  optionsSuccessStatus: 200 // Essential for older browsers or specific preflight cases
};

// ✅ INITIALIZE CORS BEFORE ROUTES
app.use(cors(corsOptions));
app.use(express.json());

// ✅ MongoDB Connection
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
  console.log(`🚀 Unified Backend running at http://${localIP}:${PORT}`);
  console.log(`📡 CORS Whitelist:`, allowedOrigins);
});