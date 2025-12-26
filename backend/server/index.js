import express from 'express';
import registerRoutes from './routes/register.js';

const app = express();

app.use(express.json());

// This makes all routes inside register.js start with /api/register
app.use('/api/register', registerRoutes);

export default app;