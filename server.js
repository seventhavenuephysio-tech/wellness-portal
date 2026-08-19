const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'frontend')));

// MongoDB Atlas connection with fallback handling
const mongoURI = process.env.MONGO_URI || 
  (process.env.MONGO_PASSWORD ? `mongodb+srv://admin:${process.env.MONGO_PASSWORD}@cluster0.mongodb.net/wellness?retryWrites=true&w=majority` : null);

if (mongoURI) {
  mongoose.connect(mongoURI)
    .then(() => console.log('MongoDB Connected Successfully'))
    .catch(err => console.error('MongoDB Connection Error:', err.message));
} else {
  console.warn("WARNING: MONGO_URI or MONGO_PASSWORD environment variable is missing.");
}

// Schemas & Models
const bookingSchema = new mongoose.Schema({
  therapist: String,
  time: String,
  date: String,
  patientName: String,
  patientPhone: String
});
const Booking = mongoose.model('Booking', bookingSchema);

const slotSchema = new mongoose.Schema({
  name: String,
  title: String,
  slots: [String]
});
const Slot = mongoose.model('Slot', slotSchema);

// API Endpoints
app.get('/api/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find({});
    res.json(bookings.map(b => ({
      practitioner: b.therapist,
      slot: b.time,
      name: b.patientName,
      phone: b.patientPhone,
      date: b.date
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/bookings', async (req, res) => {
  try {
    const { practitioner, therapist, slot, time, name, patientName, phone, patientPhone, date } = req.body;
    
    // Remove duplicate existing booking for same therapist and slot
    await Booking.deleteOne({
      therapist: practitioner || therapist,
      time: slot || time,
      date: date || new Date().toISOString().split('T')[0]
    });

    const newBooking = new Booking({
      therapist: practitioner || therapist,
      time: slot || time,
      date: date || new Date().toISOString().split('T')[0],
      patientName: name || patientName,
      patientPhone: phone || patientPhone
    });

    await newBooking.save();
    res.status(201).json({ success: true, booking: newBooking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/bookings/cancel', async (req, res) => {
  try {
    const { practitioner, therapist, slot, time, date } = req.body;
    await Booking.deleteOne({
      therapist: practitioner || therapist,
      time: slot || time,
      date: date
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/slots', async (req, res) => {
  try {
    const slots = await Slot.find({});
    res.json(slots);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/slots', async (req, res) => {
  try {
    const { name, title, slots } = req.body;
    await Slot.findOneAndUpdate(
      { name: name },
      { name: name, title: title || "Physiotherapist", slots: slots },
      { upsert: true, new: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve frontend SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
