const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const auth = require('../middleware/auth');

// ✅ Admin: Assign a task to an employee
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).send('Only admins can assign tasks');
    }

    const { assignedTo, task } = req.body;

    if (!assignedTo || !task) {
      return res.status(400).send('Employee ID and task are required');
    }

    console.log('Assigning Task:', { assignedTo, task });

    // ✅ Include `assignedBy` to fix validation error
    const newTask = new Task({
      assignedTo,
      assignedBy: req.user.id,
      task
    });

    await newTask.save();
    res.send('✅ Task assigned successfully');
  } catch (err) {
    console.error('❌ Error assigning task:', err);
    res.status(500).send('Server error');
  }
});

// ✅ Employee: View their own tasks
router.get('/my', auth, async (req, res) => {
  try {
    if (req.user.role !== 'employee') {
      return res.status(403).send('Only employees can view their tasks');
    }

    const tasks = await Task.find({ assignedTo: req.user.id }).sort({ date: -1 });
    res.json(tasks);
  } catch (err) {
    console.error('❌ Error fetching tasks:', err);
    res.status(500).send('Server error');
  }
});

// ✅ Admin: View all tasks
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).send('Only admins can view all tasks');
    }

    const tasks = await Task.find()
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email') // optional: show who assigned the task
      .sort({ date: -1 });

    res.json(tasks);
  } catch (err) {
    console.error('❌ Error fetching all tasks:', err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
