const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Load .env variables locally (Render handles production variables automatically)
if (process.env.NODE_ENV !== 'production') {
    try {
        require('dotenv').config();
    } catch (e) {
        // dotenv optional in production
    }
}

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Load connection string strictly from system environment
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!MONGO_URI) {
    console.error("CRITICAL ERROR: MONGO_URI environment variable is missing!");
} else {
    mongoose.connect(MONGO_URI)
        .then(() => console.log("MongoDB Connected Successfully!"))
        .catch(err => console.error("MongoDB Error:", err.message));
}

// Booking Schema & Model
const bookingSchema = new mongoose.Schema({
    therapist: String,
    time: String,
    date: String,
    patientName: String,
    status: { type: String, default: "Booked" }
}, { timestamps: true });

const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);

// Base Health Check Route
app.get('/', (req, res) => {
    const isDbConnected = mongoose.connection.readyState === 1;
    res.json({
        status: "online",
        dbConnected: isDbConnected,
        message: isDbConnected ? "Server and Database connected" : "Server online, database disconnected"
    });
});

// GET /api/bookings - Fetch all bookings
app.get('/api/bookings', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.json([]);
        }
        const bookings = await Booking.find({}).sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        console.error("GET /api/bookings error:", error);
        res.status(500).json({ error: "Failed to fetch bookings" });
    }
});

// POST /api/bookings - Create new booking
app.post('/api/bookings', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ error: "Database disconnected" });
        }
        const { therapist, time, date, patientName } = req.body;
        const newBooking = new Booking({ therapist, time, date, patientName });
        await newBooking.save();
        res.status(201).json({ message: "Booking created", booking: newBooking });
    } catch (error) {
        console.error("POST /api/bookings error:", error);
        res.status(500).json({ error: "Failed to save booking" });
    }
});

// Start Server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});