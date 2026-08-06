const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Enable CORS for all domains
app.use(cors());
app.use(express.json());

// Load Connection String
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

// Connect to MongoDB Atlas
if (!MONGO_URI) {
    console.error("CRITICAL WARNING: Neither MONGO_URI nor MONGODB_URI is defined!");
} else {
    mongoose.connect(MONGO_URI)
        .then(() => console.log("MongoDB Connected Successfully!"))
        .catch(err => console.error("MongoDB Connection Error:", err.message));
}

// Booking Schema & Model
const bookingSchema = new mongoose.Schema({
    therapist: { type: String, required: true },
    time: { type: String, required: true },
    date: { type: String, required: true },
    patientName: { type: String, required: true },
    status: { type: String, default: "Booked" }
}, { timestamps: true });

const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);

// Root Route: Status Ping
app.get('/', (req, res) => {
    const isDbConnected = mongoose.connection.readyState === 1;
    res.json({
        status: "online",
        dbConnected: isDbConnected,
        timestamp: new Date()
    });
});

// GET /api/bookings: Fetch all bookings safely
app.get('/api/bookings', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            // Return empty array instead of throwing 500 error if DB isn't connected yet
            return res.json([]);
        }
        const bookings = await Booking.find({}).sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        console.error("GET /api/bookings error:", error);
        res.status(500).json({ error: "Internal Server Error loading bookings", details: error.message });
    }
});

// POST /api/bookings: Create new booking
app.post('/api/bookings', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ error: "Database not connected. Please try again in a few seconds." });
        }
        const { therapist, time, date, patientName } = req.body;
        if (!therapist || !time || !date || !patientName) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        const newBooking = new Booking({ therapist, time, date, patientName });
        await newBooking.save();
        res.status(201).json({ message: "Booking created", booking: newBooking });
    } catch (error) {
        console.error("POST /api/bookings error:", error);
        res.status(500).json({ error: "Internal Server Error creating booking", details: error.message });
    }
});

// Start Server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});