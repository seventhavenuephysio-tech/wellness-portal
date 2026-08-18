const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const twilio = require('twilio');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Twilio safely (prevents startup crash if keys are missing)
let twilioClient = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    try {
        twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    } catch (e) {
        console.error("Twilio Init Warning:", e.message);
    }
}

// Connect to MongoDB Atlas
const mongoURI = process.env.MONGO_URI || process.env.MONGO_PASSWORD;
mongoose.connect(mongoURI)
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

// CREATE BOOKING
app.post('/api/bookings', async (req, res) => {
    try {
        const { therapist, time, date, patientName, patientPhone, patient_name, name } = req.body;
        const finalPatientName = patientName || patient_name || name || 'Patient';

        // 1. Always save booking to MongoDB first
        const newBooking = new Booking({ 
            therapist, 
            time, 
            date, 
            patientName: finalPatientName, 
            patientPhone 
        });
        await newBooking.save();

        // 2. Optional: Attempt Twilio without letting errors block the response
        if (patientPhone && twilioClient && process.env.TWILIO_WHATSAPP_NUMBER) {
            try {
                await twilioClient.messages.create({
                    body: `Hello ${finalPatientName}, your appointment with ${therapist} is confirmed for ${date} at ${time}. - Seventh Avenue Physio`,
                    from: process.env.TWILIO_WHATSAPP_NUMBER,
                    to: `whatsapp:${patientPhone}`
                });
            } catch (twilioErr) {
                console.error("Twilio Notification Warning (Booking was saved anyway):", twilioErr.message);
            }
        }

        res.status(201).json({ message: "Booking created successfully!", booking: newBooking });
    } catch (error) {
        console.error("Booking Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// GET BOOKINGS (Supports date filtering or returns all)
app.get('/api/bookings', async (req, res) => {
    try {
        const { date } = req.query;
        const query = date ? { date: date } : {};
        const bookings = await Booking.find(query);
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
