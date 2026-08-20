const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend')));

let therapists = [
    { 
        name: "Chido", 
        role: "Physiotherapist", 
        slots: ["08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"] 
    },
    { 
        name: "Mispar", 
        role: "Physiotherapist", 
        slots: ["08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"] 
    },
    { 
        name: "Tinotenda", 
        role: "Physiotherapist", 
        slots: ["08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"] 
    }
];

let bookings = [];

app.get('/api/slots', (req, res) => {
    res.json(therapists);
});

app.get('/api/bookings', (req, res) => {
    res.json(bookings);
});

app.post('/api/bookings', (req, res) => {
    const booking = req.body;
    bookings.push(booking);
    res.json({ success: true, booking });
});

app.post('/api/bookings/cancel', (req, res) => {
    const { practitioner, slot, time } = req.body;
    const targetSlot = slot || time;
    bookings = bookings.filter(b => !(
        (b.practitioner === practitioner || b.therapist === practitioner) &&
        (b.slot === targetSlot || b.time === targetSlot)
    ));
    res.json({ success: true });
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
