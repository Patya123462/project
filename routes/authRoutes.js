const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ✅ Signup
router.post('/signup', async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashed, role });
    await user.save();
    res.send('User Registered');
  } catch (err) {
    console.error('Signup Error:', err);
    res.status(500).send('Error registering user');
  }
});

// ✅ Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).send('User not found');

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).send('Invalid credentials');

    // Include name in JWT payload
    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name },
      process.env.JWT_SECRET
    );

    res.json({ token, role: user.role }); // Optional: include role in response
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).send('Login failed');
  }
});

// ✅ Get all employees (for dropdown in admin's assign-task page)
router.get('/employees', async (req, res) => {
  try {
    const employees = await User.find({ role: 'employee' }).select('name email _id');
    res.json(employees);
  } catch (err) {
    console.error('Employee Fetch Error:', err);
    res.status(500).send('Failed to fetch employees');
  }
});

module.exports = router;
