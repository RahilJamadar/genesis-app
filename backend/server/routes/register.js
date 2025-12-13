import express from 'express';
import Team from '../models/Team.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const team = new Team(req.body);
    await team.save();
    res.status(201).json({ success: true, team });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;