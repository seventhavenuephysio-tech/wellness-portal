const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// 1. CRITICAL: Middleware to enable CORS and parse incoming JSON bodies
app.use(cors());
app.use(express.json());

// 2. Connect to MongoDB Atlas via Environment Variable
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

let dbConnected = false;

if (MONGO_URI) {
    mongoose.connect(MONGO_URI)
        .then(() => {
            console.log("Connected to MongoDB Atlas successfully");
            dbConnected = true;
        })
        .catch(err => {
            console.error("MongoDB Connection Error:", err.message);
            dbConnected = false;
        });
} else {
    console.warn("Warning: MONGODB_URI environment variable is not defined!");
}

// 3. Define Booking Schema & Model
const bookingSchema = new mongoose.Schema({
    therapist: { type: String, required: true },
    time: { type: String, required: true },
    date: { type: String, required: true },
    patientName: { type: String, required: true }
}, { timestamps: true });

const Booking = mongoose.model('Booking', bookingSchema);

// 4. API Endpoints

// Health Check / Status Route
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
                error: "Missing required fields: therapist, time, date, and patientName are all required." 
            });
        }

        const newBooking = new Booking({ therapist, time, date, patientName });
        await newBooking.save();

        console.log("Booking successfully saved:", newBooking);
        return res.status(201).json({ 
            message: "Booking saved successfully", 
            booking: newBooking 
        });
    } catch (err) {
        console.error("Error creating booking:", err);
        return res.status(500).json({ error: "Server error when saving booking" });
    }
});

// 5. Start Express Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
