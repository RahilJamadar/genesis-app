const express = require('express');
const router = express.Router();
const StudentCoordinator = require('../models/StudentCoordinator');
const verifyAdmin = require('../middleware/verifyAdmin');

// 📃 Get all coordinators
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const data = await StudentCoordinator.find();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch coordinators' });
  }
});

// ➕ Add a coordinator
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const newCoord = new StudentCoordinator(req.body);
    await newCoord.save();
    res.status(201).json({ success: true, message: 'Coordinator added successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Failed to add coordinator' });
  }
});

// ✏️ Update
router.put('/:id', verifyAdmin, async (req, res) => {
  try {
    const updated = await StudentCoordinator.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Coordinator not found' });
    res.status(200).json({ success: true, message: 'Updated successfully', coordinator: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating coordinator' });
  }
});

// 🗑️ Delete
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const deleted = await StudentCoordinator.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Coordinator not found' });
    res.status(200).json({ success: true, message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error deleting coordinator' });
  }
});

module.exports = router;