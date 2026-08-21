const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend')));

let bookings = [];

app.get('/api/bookings', (req, res) => {
    res.json(bookings);
});

app.post('/api/bookings', (req, res) => {
    bookings.push(req.body);
    res.json({ success: true, booking: req.body });
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

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
});
