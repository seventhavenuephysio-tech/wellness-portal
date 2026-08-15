const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const twilio = require('twilio');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Twilio Client using your Render Environment Variables
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI || process.env.MONGO_PASSWORD)
    .then(() => console.log('MongoDB Connected Successfully'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// Booking Schema & Model
const bookingSchema = new mongoose.Schema({
    therapist: String,
    time: String,
    date: String,
    patientName: String,
    patientPhone: String
});

const Booking = mongoose.model('Booking', bookingSchema);

// CREATE BOOKING + SEND WHATSAPP
app.post('/api/bookings', async (req, res) => {
    try {
        const { therapist, time, date, patientName, patientPhone } = req.body;

        // 1. Save booking to MongoDB Atlas
        const newBooking = new Booking({ therapist, time, date, patientName, patientPhone });
        await newBooking.save();

        // 2. Send WhatsApp notification via Twilio
        if (patientPhone) {
            await twilioClient.messages.create({
                body: `Hello ${patientName}, your appointment with ${therapist} is confirmed for ${date} at ${time}. - Seventh Avenue Physio`,
                from: process.env.TWILIO_WHATSAPP_NUMBER,
                to: `whatsapp:${patientPhone}`
            });
        }

        res.status(201).json({ message: "Booking created and WhatsApp reminder sent!", booking: newBooking });
    } catch (error) {
        console.error("Booking/WhatsApp Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// GET ALL BOOKINGS
app.get('/api/bookings', async (req, res) => {
    try {
        const bookings = await Booking.find();
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ROOT STATUS CHECK
app.get('/', (req, res) => {
    res.json({ status: "online", dbConnected: mongoose.connection.readyState === 1 });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
