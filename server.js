const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// 1. MIDDLEWARE
app.use(cors());
app.use(express.json());
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Root test route
app.get('/', (req, res) => {
  res.send('API is running successfully!');
});

// Reminders routes
app.use('/api/reminders', require('./routes/reminders'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
// 2. MONGO_URI CONNECTION STRING
// Using environment variables to keep your database password secure on GitHub!
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => console.log('Successfully connected to MongoDB Atlas 🍃'))
  .catch((err) => {
    console.error('\n❌ DATABASE CONNECTION ERROR:');
    console.error(err.message);
  });

// 3. BOOKING DATABASE SCHEMA (Includes the required 'date' string)
const bookingSchema = new mongoose.Schema({
  therapist: { type: String, required: true },
  time: { type: String, required: true },
  patientName: { type: String, required: true },
  date: { type: String, required: true } // format: YYYY-MM-DD
});

const Booking = mongoose.model('Booking', bookingSchema);

// 4. API ROUTES

// A. READ: Get bookings (optionally filtered by a specific date)
app.post('/api/bookings', async (req, res) => {
  try {
    const { date } = req.query;
    const filter = date ? { date } : {};
    const bookings = await Booking.find(filter);
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// B. CREATE: Book a slot on a specific date
app.post('/api/bookings', async (req, res) => {
  try {
    const { therapist, time, patientName, date } = req.body;
    if (!therapist || !time || !patientName || !date) {
      return res.status(400).json({ error: "Missing required fields (therapist, time, patientName, or date)." });
    }

    // Ensure the therapist isn't double-booked on this specific day and time
    const existingBooking = await Booking.findOne({ therapist, time, date });
    if (existingBooking) {
      return res.status(400).json({ error: "This slot is already booked for this date!" });
    }

    const newBooking = new Booking({ therapist, time, patientName, date });
    await newBooking.save();
    res.status(201).json(newBooking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// C. UPDATE: Edit a booking on a specific date
app.put('/api/bookings/:id', async (req, res) => {
  try {
    const { therapist, time, patientName, date } = req.body;
    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      { therapist, time, patientName, date },
      { new: true }
    );
    if (!updatedBooking) return res.status(404).json({ error: "Booking not found." });
    res.json(updatedBooking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// D. DELETE: Cancel a booking
app.delete('/api/bookings/:id', async (req, res) => {
  try {
    const deletedBooking = await Booking.findByIdAndDelete(req.params.id);
    if (!deletedBooking) return res.status(404).json({ error: "Booking not found." });
    res.json({ message: "Booking cancelled!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. START SERVER (Dynamically uses Render's port or defaults to 5001)
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running smoothly on port ${PORT}`);
});