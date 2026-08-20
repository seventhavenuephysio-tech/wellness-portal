const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'frontend')));

// In-memory data structures
let bookings = [];
let contacts = {};
let slotsData = [];

// --- API Endpoints ---
app.get('/api/bookings', (req, res) => {
    res.json(bookings);
});

app.post('/api/bookings', (req, res) => {
    const newBooking = req.body;
    bookings = bookings.filter(b => !(
        (b.practitioner === newBooking.practitioner || b.therapist === newBooking.practitioner) &&
        (b.slot === newBooking.slot || b.time === newBooking.slot)
    ));
    bookings.push(newBooking);
    res.json({ success: true, bookings });
});

app.post('/api/bookings/cancel', (req, res) => {
    const { practitioner, therapist, slot, time } = req.body;
    const targetTherapist = practitioner || therapist;
    const targetSlot = slot || time;

    bookings = bookings.filter(b => !(
        (b.practitioner === targetTherapist || b.therapist === targetTherapist) &&
        (b.slot === targetSlot || b.time === targetSlot)
    ));

    res.json({ success: true, bookings });
});

app.get('/api/contacts', (req, res) => {
    res.json(contacts);
});

app.post('/api/contacts', (req, res) => {
    if (req.body.contacts) {
        contacts = { ...contacts, ...req.body.contacts };
    }
    res.json({ success: true, contacts });
});

app.get('/api/slots', (req, res) => {
    res.json(slotsData);
});

app.post('/api/slots', (req, res) => {
    slotsData = req.body;
    res.json({ success: true, slots: slotsData });
});

// Wildcard fallback route for single page app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// --- Server Startup (Bind to 0.0.0.0 for Render) ---
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
});
