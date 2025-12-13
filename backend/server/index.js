import express from 'express';
import registerRoutes from './routes/register.js';

const app = express();

// ❌ Removed cors() — already handled in backend/index.js
app.use(express.json());

// Public Routes
app.use('/api', registerRoutes);

export default app;