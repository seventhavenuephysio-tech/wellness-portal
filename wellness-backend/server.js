const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

// 1. Connect to MongoDB Atlas using Render environment variable
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => console.error('MongoDB connection error:', err));

// 2. Schemas & Models
const BookingSchema = new mongoose.Schema({
    practitioner: { type: String, required: true },
    slot: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: String, default: '' },
    date: { type: String, required: true }
});

const BlockSchema = new mongoose.Schema({
    practitioner: { type: String, required: true },
    slot: { type: String, required: true },
    date: { type: String, required: true },
    reason: { type: String, default: 'Away' }
});

const Booking = mongoose.model('Booking', BookingSchema);
const Block = mongoose.model('Block', BlockSchema);

// 3. API Endpoints

// GET Schedule
app.get('/api/schedule', async (req, res) => {
    try {
        const bookings = await Booking.find({});
        const blocks = await Block.find({});
        res.json({ bookings, blocks });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch schedule' });
    }
});

// POST Booking
app.post('/api/bookings', async (req, res) => {
    const { practitioner, slot, name, phone, date } = req.body;
    if (!practitioner || !slot || !name || !date) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const booking = await Booking.create({ practitioner, slot, name, phone, date });
        res.status(201).json(booking);
    } catch (err) {
        res.status(500).json({ error: 'Failed to save booking' });
    }
});

// DELETE Booking
app.delete('/api/bookings', async (req, res) => {
    const { practitioner, slot, date } = req.body;
    try {
        await Booking.deleteOne({ 
            practitioner: new RegExp(`^${practitioner}$`, 'i'), 
            slot, 
            date 
        });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to cancel booking' });
    }
});

// POST Block Slot
app.post('/api/block', async (req, res) => {
    const { practitioner, slot, date, reason } = req.body;
    if (!practitioner || !slot || !date) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const block = await Block.create({ practitioner, slot, date, reason });
        res.status(201).json(block);
    } catch (err) {
        res.status(500).json({ error: 'Failed to block slot' });
    }
});

// DELETE Block Slot
app.delete('/api/block', async (req, res) => {
    const { practitioner, slot, date } = req.body;
    try {
        await Block.deleteOne({ 
            practitioner: new RegExp(`^${practitioner}$`, 'i'), 
            slot, 
            date 
        });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to unblock slot' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
