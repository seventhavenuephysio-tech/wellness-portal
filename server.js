const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// 1. Booking Schema & Model
const bookingSchema = new mongoose.Schema({
  therapist: { type: String, required: true },
  time: { type: String, required: true },
  date: { type: String, required: true },
  clientName: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);

// 2. MongoDB Connection
const MONGO_URI = process.env.MONGO_URI;
if (MONGO_URI) {
  mongoose.connect(MONGO_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => console.log('MongoDB Connected successfully!'))
  .catch(err => console.error('MongoDB connection error:', err));
}

// 3. Health Check
app.get('/', (req, res) => {
  res.status(200).json({ status: 'online', dbConnected: mongoose.connection.readyState === 1 });
});

// 4. GET Bookings
app.get('/api/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find({});
    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bookings: ' + err.message });
  }
});

// 5. POST Booking (Create)
app.post('/api/bookings', async (req, res) => {
  try {
    const newBooking = new Booking(req.body);
    const savedBooking = await newBooking.save();
    res.status(201).json({ message: 'Booking saved successfully', booking: savedBooking });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save booking: ' + err.message });
  }
});

// 6. PUT Booking (UPDATE PATIENT DETAILS) 🛠️
app.put('/api/bookings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedBooking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.status(200).json({ message: 'Patient updated successfully', booking: updatedBooking });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update patient: ' + err.message });
  }
});

// 7. DELETE Booking (Cancel)
app.delete('/api/bookings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Booking.findByIdAndDelete(id);
    res.status(200).json({ message: 'Booking cancelled successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to cancel booking: ' + err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));