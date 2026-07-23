const express = require('express');
const router = express.Router();
const Reminder = require('../models/Reminder');

// ✅ GET all reminders from MongoDB
router.get('/', async (req, res) => {
  try {
    const reminders = await Reminder.find().sort({ createdAt: -1 });
    res.json(reminders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ POST a new reminder to MongoDB
router.post('/', async (req, res) => {
  try {
    const newReminder = new Reminder({
      title: req.body.title,
    });
    const savedReminder = await newReminder.save();
    res.status(201).json(savedReminder);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;