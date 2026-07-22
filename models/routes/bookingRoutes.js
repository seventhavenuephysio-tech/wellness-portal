const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking'); // Import our Booking model

// 1. POST Route: Create a new booking
router.post('/create', async (req, res) => {
  try {
    const { clientName, serviceType, bookingDate } = req.body;

    const newBooking = new Booking({
      clientName,
      serviceType,
      bookingDate
    });

    const savedBooking = await newBooking.save();
    res.status(201).json({ message: 'Booking created successfully!', booking: savedBooking });
  } catch (error) {
    res.status(400).json({ message: 'Error creating booking', error: error.message });
  }
});

// 2. GET Route: Get all bookings
router.get('/all', async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ bookingDate: 1 });
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings', error: error.message });
  }
});

module.exports = router;
 file (Ctrl + S).


JavaScript
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const bookingRoutes = require('./routes/bookingRoutes'); 

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); 

// Database Connection
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => console.log('Successfully connected to MongoDB!'))
  .catch((error) => console.error('MongoDB connection error:', error));

// Use the Booking Routes
app.use('/api/bookings', bookingRoutes);

// Base Route
app.get('/', (req, res) => {
  res.send('Wellness Booking API is running and database is connecting!');
});

// Start the Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});