const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

// Serve static frontend files from the "frontend" folder
app.use(express.static(path.join(__dirname, 'frontend')));

// Connect to MongoDB using Environment Variable on Render
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB successfully'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// MongoDB Schemas
const bookingSchema = new mongoose.Schema({
  practitioner: String,
  slot: String,
  name: String,
  phone: String,
  date: String
});

const blockedSlotSchema = new mongoose.Schema({
  practitioner: String,
  slot: String,
  date: String,
  reason: String
});

const Booking = mongoose.model('Booking', bookingSchema);
const BlockedSlot = mongoose.model('BlockedSlot', blockedSlotSchema);

// API Endpoints
app.get('/api/schedule', async (req, res) => {
  try {
    const bookings = await Booking.find();
    const blockedSlots = await BlockedSlot.find();
    res.json({ bookings, blockedSlots });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch schedule data' });
  }
});

app.post('/api/bookings', async (req, res) => {
  try {
    const newBooking = new Booking(req.body);
    await newBooking.save();
    res.json(newBooking);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save booking' });
  }
});

app.delete('/api/bookings', async (req, res) => {
  try {
    const { practitioner, slot, date } = req.body;
    await Booking.deleteOne({ practitioner, slot, date });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

app.post('/api/blocks', async (req, res) => {
  try {
    const newBlock = new BlockedSlot(req.body);
    await newBlock.save();
    res.json(newBlock);
  } catch (err) {
    res.status(500).json({ error: 'Failed to block time slot' });
  }
});

app.delete('/api/blocks', async (req, res) => {
  try {
    const { practitioner, slot, date } = req.body;
    await BlockedSlot.deleteOne({ practitioner, slot, date });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to unblock slot' });
  }
});

// Fallback: Send index.html for any other request
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
