const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// In-memory data store
let bookings = [];
let blocks = [];

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'frontend')));

// GET Schedule (bookings + blocks)
app.get('/api/schedule', (req, res) => {
    res.json({ bookings, blocks });
});

// POST Booking
app.post('/api/bookings', (req, res) => {
    const { practitioner, therapist, slot, time, name, phone, date } = req.body;
    const booking = {
        practitioner: practitioner || therapist,
        slot: slot || time,
        name,
        phone,
        date
    };
    bookings.push(booking);
    res.status(201).json({ message: 'Booking created', booking });
});

// DELETE Booking
app.delete('/api/bookings', (req, res) => {
    const { practitioner, therapist, slot, time, date } = req.body;
    const targetPractitioner = (practitioner || therapist || '').toLowerCase();
    const targetSlot = slot || time;

    bookings = bookings.filter(b => 
        !(b.practitioner.toLowerCase() === targetPractitioner && b.slot === targetSlot && b.date === date)
    );
    res.json({ message: 'Booking deleted' });
});

// POST Block Slot
app.post('/api/block', (req, res) => {
    const { practitioner, therapist, slot, time, date, reason } = req.body;
    const block = {
        practitioner: practitioner || therapist,
        slot: slot || time,
        date,
        reason: reason || 'Away'
    };
    blocks.push(block);
    res.status(201).json({ message: 'Block created', block });
});

// DELETE Block Slot
app.delete('/api/block', (req, res) => {
    const { practitioner, therapist, slot, time, date } = req.body;
    const targetPractitioner = (practitioner || therapist || '').toLowerCase();
    const targetSlot = slot || time;

    blocks = blocks.filter(b => 
        !(b.practitioner.toLowerCase() === targetPractitioner && b.slot === targetSlot && b.date === date)
    );
    res.json({ message: 'Block deleted' });
});

// Fallback to index.html for SPA routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
