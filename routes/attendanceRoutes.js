const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const auth = require('../middleware/auth');

// ✅ Helper: Normalize a date to just YYYY-MM-DD (no time)
const normalizeDate = (date) => {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

// ✅ POST /api/attendance → Employee marks attendance
router.post('/', auth, async (req, res) => {
  try {
    const today = normalizeDate(new Date());

    const alreadyMarked = await Attendance.findOne({
      employee: req.user.id,
      date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
    });

    if (alreadyMarked) {
      return res.status(400).send('❗ Already marked attendance today');
    }

    const attendance = new Attendance({
      employee: req.user.id,
      date: new Date()
    });

    await attendance.save();
    res.send('✅ Attendance marked successfully');
  } catch (err) {
    console.error('⚠️ Attendance Error:', err.message);
    res.status(500).send('❌ Server error while marking attendance');
  }
});

// ✅ GET /api/attendance → Admin views all attendance
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).send('🚫 Access denied: Admins only');
    }

    const records = await Attendance.find()
      .populate('employee', 'name email role')
      .sort({ date: -1 });

    res.json(records);
  } catch (err) {
    console.error('⚠️ Admin attendance fetch error:', err.message);
    res.status(500).send('❌ Server error while fetching records');
  }
});

module.exports = router;
