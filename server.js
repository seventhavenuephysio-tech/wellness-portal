const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Schemas
const BookingSchema = new mongoose.Schema({
  practitioner: String,
  slot: String,
  name: String,
  phone: String,
  date: String
});

const BlockedSlotSchema = new mongoose.Schema({
  practitioner: String,
  slot: String,
  date: String,
  reason: String
});

const Booking = mongoose.model('Booking', BookingSchema);
const BlockedSlot = mongoose.model('BlockedSlot', BlockedSlotSchema);

// API Routes
app.get('/api/schedule', async (req, res) => {
  const bookings = await Booking.find();
  const blockedSlots = await BlockedSlot.find();
  res.json({ bookings, blockedSlots });
});

app.post('/api/bookings', async (req, res) => {
  const booking = new Booking(req.body);
  await booking.save();
  res.json(booking);
});

app.delete('/api/bookings', async (req, res) => {
  const { practitioner, slot, date } = req.body;
  await Booking.deleteOne({ practitioner, slot, date });
  res.json({ success: true });
});

app.post('/api/blocks', async (req, res) => {
  const block = new BlockedSlot(req.body);
  await block.save();
  res.json(block);
});

app.delete('/api/blocks', async (req, res) => {
  const { practitioner, slot, date } = req.body;
  await BlockedSlot.deleteOne({ practitioner, slot, date });
  res.json({ success: true });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
