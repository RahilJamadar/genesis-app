const express = require('express');
const router = express.Router();
const StudentCoordinator = require('../models/StudentCoordinator');
const Event = require('../models/Event');
const verifyAdmin = require('../middleware/verifyAdmin');

// All routes here are protected for Admin use only
router.use(verifyAdmin);

/**
 * @route   GET /api/coordinators
 * @desc    Get all coordinators with their assigned event names
 */
router.get('/', async (req, res) => {
  try {
    const data = await StudentCoordinator.find().populate('assignedEvents', 'name');
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch coordinators' });
  }
});

/**
 * @route   POST /api/coordinators
 * @desc    Add a coordinator with duplicate checking
 */
router.post('/', async (req, res) => {
  try {
    const { email, phone } = req.body;

    // Check if coordinator already exists by email or phone
    const existing = await StudentCoordinator.findOne({ 
      $or: [{ email: email.toLowerCase() }, { phone }] 
    });

    if (existing) {
      return res.status(400).json({ 
        success: false, 
        message: 'A coordinator with this email or phone already exists.' 
      });
    }

    const newCoord = new StudentCoordinator({
      ...req.body,
      email: email.toLowerCase()
    });

    await newCoord.save();
    res.status(201).json({ success: true, message: 'Coordinator added successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

/**
 * @route   PUT /api/coordinators/:id
 * @desc    Update coordinator details
 */
router.put('/:id', async (req, res) => {
  try {
    const updated = await StudentCoordinator.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    
    if (!updated) return res.status(404).json({ message: 'Coordinator not found' });
    res.status(200).json({ success: true, message: 'Updated successfully', coordinator: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating coordinator' });
  }
});

/**
 * @route   DELETE /api/coordinators/:id
 * @desc    Delete coordinator and remove them from assigned events
 */
router.delete('/:id', async (req, res) => {
  try {
    const coordinatorId = req.params.id;

    // 1. Remove this coordinator from all events they are managing
    await Event.updateMany(
      { studentCoordinators: coordinatorId },
      { $pull: { studentCoordinators: coordinatorId } }
    );

    // 2. Delete the coordinator
    const deleted = await StudentCoordinator.findByIdAndDelete(coordinatorId);
    
    if (!deleted) return res.status(404).json({ message: 'Coordinator not found' });
    res.status(200).json({ success: true, message: 'Deleted successfully and removed from all events' });
  } catch (err) {
    console.error('Delete Error:', err);
    res.status(500).json({ success: false, message: 'Error deleting coordinator' });
  }
});

module.exports = router;