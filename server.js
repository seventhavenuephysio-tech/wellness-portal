const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Enable CORS for all origins (allows frontend to call backend without browser blocks)
app.use(cors());
app.use(express.json());

// Load MongoDB Connection String from Environment Variable
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

// Connect to MongoDB Atlas
if (!MONGO_URI) {
    console.error("CRITICAL ERROR: MONGO_URI / MONGODB_URI environment variable is missing!");
} else {
    mongoose.connect(MONGO_URI)
        .then(() => console.log("MongoDB Connected Successfully!"))
        .catch(err => console.error("MongoDB Error:", err));
}

// Define Booking Schema & Model
const bookingSchema = new mongoose.Schema({
    therapist: String,
    time: String,
    date: String,
    patientName: String,
    status: { type: String, default: "Booked" }
}, { timestamps: true });

const Booking = mongoose.model('Booking', bookingSchema);

// Root / Health Check Route (Used by cron-job.org and Sync Database button)
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
            return res.status(500).json({ error: "Database not connected" });
        }
        const bookings = await Booking.find({});
        res.json(bookings);
    } catch (error) {
        console.error("Error fetching bookings:", error);
        res.status(500).json({ error: "Failed to fetch bookings" });
    }
});

// POST /api/bookings - Create a new booking
app.post('/api/bookings', async (req, res) => {
    try {
        const { therapist, time, date, patientName } = req.body;
        const newBooking = new Booking({ therapist, time, date, patientName });
        await newBooking.save();
        res.status(201).json({ message: "Booking saved successfully", booking: newBooking });
    } catch (error) {
        console.error("Error saving booking:", error);
        res.status(500).json({ error: "Failed to save booking" });
    }
});

// Start Server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});