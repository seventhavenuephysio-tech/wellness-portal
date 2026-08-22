const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

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

// Root route so visitors don't see "Cannot GET /"
app.get('/', (req, res) => {
  res.send('🏥 Seventh Avenue Physio API is running live!');
});

// Fetch all bookings and blocks
app.get('/api/schedule', async (req, res) => {
  try {
    const bookings = await Booking.find();
    const blockedSlots = await BlockedSlot.find();
    res.json({ bookings, blockedSlots });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch schedule data' });
  }
});

// Add a booking
app.post('/api/bookings', async (req, res) => {
  try {
    const newBooking = new Booking(req.body);
    await newBooking.save();
    res.json(newBooking);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save booking' });
  }
});

// Delete/Cancel a booking
app.delete('/api/bookings', async (req, res) => {
  try {
    const { practitioner, slot, date } = req.body;
    await Booking.deleteOne({ practitioner, slot, date });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

// Add a time block
app.post('/api/blocks', async (req, res) => {
  try {
    const newBlock = new BlockedSlot(req.body);
    await newBlock.save();
    res.json(newBlock);
  } catch (err) {
    res.status(500).json({ error: 'Failed to block time slot' });
  }
});

// Remove a time block
app.delete('/api/blocks', async (req, res) => {
  try {
    const { practitioner, slot, date } = req.body;
    await BlockedSlot.deleteOne({ practitioner, slot, date });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to unblock slot' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
