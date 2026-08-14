const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// 1. Essential Middleware
app.use(cors());
app.use(express.json());

// 2. Database Connection
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

if (MONGO_URI) {
    mongoose.connect(MONGO_URI)
        .then(() => console.log("Connected to MongoDB Atlas successfully"))
        .catch(err => console.error("MongoDB Connection Error:", err.message));
} else {
    console.warn("Warning: MONGODB_URI environment variable is missing!");
}

// 3. Schema & Model definition
const bookingSchema = new mongoose.Schema({
    therapist: { type: String, required: true },
    time: { type: String, required: true },
    date: { type: String, required: true },
    patientName: { type: String, required: true }
}, { timestamps: true });

const Booking = mongoose.model('Booking', bookingSchema);

// 4. API Routes

// Root Health Check
app.get('/', (req, res) => {
    res.json({
        status: "online",
        dbConnected: mongoose.connection.readyState === 1
    });
});

// GET all bookings
app.get('/api/bookings', async (req, res) => {
    try {
        const bookings = await Booking.find({});
        res.status(200).json(bookings);
    } catch (err) {
        console.error("Error fetching bookings:", err);
        res.status(500).json({ error: "Failed to fetch bookings" });
    }
});

// POST new booking
app.post('/api/bookings', async (req, res) => {
    try {
        const { therapist, time, date, patientName } = req.body;

        if (!therapist || !time || !date || !patientName) {
            return res.status(400).json({ 
                error: "Missing required fields: therapist, time, date, and patientName are required." 
            });
        }

        const newBooking = new Booking({ therapist, time, date, patientName });
        await newBooking.save();

        console.log("Booking created:", newBooking);
        return res.status(201).json({ 
            message: "Booking saved successfully", 
            booking: newBooking 
        });
    } catch (err) {
        console.error("Error saving booking:", err);
        return res.status(500).json({ error: "Server error when saving booking" });
    }
});

// 5. Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
