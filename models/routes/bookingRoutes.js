const express = require('express');
const router = express.Router();

// GET /api/bookings
router.get('/', async (req, res) => {
  try {
    res.status(200).json([]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/bookings
router.post('/', async (req, res) => {
  try {
    res.status(201).json({ message: 'Booking created successfully', data: req.body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;