const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'bookings.json');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend')));

// Helper to read persistent bookings from disk
function loadBookings() {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf8');
            return [];
        }
        const raw = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(raw) || [];
    } catch (err) {
        console.error("Error reading bookings file:", err);
        return [];
    }
}

// Helper to save bookings to disk
function saveBookings(bookings) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(bookings, null, 2), 'utf8');
    } catch (err) {
        console.error("Error writing bookings file:", err);
    }
}

// Initialize memory store from disk on startup
let bookings = loadBookings();

// GET all bookings across all dates
app.get('/api/bookings', (req, res) => {
    res.json(bookings);
});

// POST create a new booking on a specific date
app.post('/api/bookings', (req, res) => {
    const { practitioner, therapist, slot, time, name, phone, date } = req.body;
    
    if (!name || (!practitioner && !therapist) || (!slot && !time)) {
        return res.status(400).json({ error: "Missing required booking details." });
    }

    const targetPractitioner = practitioner || therapist;
    const targetSlot = slot || time;
    const targetDate = date || new Date().toISOString().split('T')[0];

    // Conflict check for same practitioner, slot, and date
    const exists = bookings.some(b => 
        (b.practitioner === targetPractitioner || b.therapist === targetPractitioner) &&
        (b.slot === targetSlot || b.time === targetSlot) &&
        b.date === targetDate
    );

    if (exists) {
        return res.status(409).json({ error: "Slot already booked for this therapist on this date." });
    }

    const newBooking = {
        practitioner: targetPractitioner,
        therapist: targetPractitioner,
        slot: targetSlot,
        time: targetSlot,
        name,
        phone: phone || '',
        date: targetDate,
        createdAt: new Date().toISOString()
    };

    bookings.push(newBooking);
    saveBookings(bookings);

    res.status(201).json({ success: true, booking: newBooking });
});

// POST cancel a booking on a specific date
app.post('/api/bookings/cancel', (req, res) => {
    const { practitioner, therapist, slot, time, date } = req.body;
    const targetPractitioner = practitioner || therapist;
    const targetSlot = slot || time;

    bookings = bookings.filter(b => !(
        (b.practitioner === targetPractitioner || b.therapist === targetPractitioner) &&
        (b.slot === targetSlot || b.time === targetSlot) &&
        (!date || b.date === date)
    ));

    saveBookings(bookings);
    res.json({ success: true, remainingBookings: bookings.length });
});

// Fallback route to serve the frontend portal
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
