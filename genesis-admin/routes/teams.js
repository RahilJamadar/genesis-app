const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const verifyAdmin = require('../middleware/verifyAdmin');

// 📃 Get all teams
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const teams = await Team.find();
    res.status(200).json(teams);
  } catch (err) {
    console.error('Fetch teams failed:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch teams' });
  }
});

// 📄 Get team by ID
router.get('/:id', verifyAdmin, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });
    res.status(200).json(team);
  } catch (err) {
    console.error('Fetch team failed:', err);
    res.status(500).json({ success: false, message: 'Error fetching team' });
  }
});

// ✏️ Update team
router.put('/:id', verifyAdmin, async (req, res) => {
  try {
    const updated = await Team.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Team not found' });
    res.status(200).json({ success: true, message: 'Team updated successfully', team: updated });
  } catch (err) {
    console.error('Update team failed:', err);
    res.status(500).json({ success: false, message: 'Error updating team' });
  }
});

// 🗑️ Delete team
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const deleted = await Team.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Team not found' });
    res.status(200).json({ success: true, message: 'Team deleted successfully' });
  } catch (err) {
    console.error('Delete team failed:', err);
    res.status(500).json({ success: false, message: 'Error deleting team' });
  }
});

module.exports = router;