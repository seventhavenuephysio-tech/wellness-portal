const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => console.error('MongoDB connection error:', err));

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

const RAW_HOLIDAYS = [
    { year: 2026, month: 1, day: 1 },
    { year: 2026, month: 2, day: 21 },
    { year: 2026, month: 4, day: 3 },
    { year: 2026, month: 4, day: 6 },
    { year: 2026, month: 4, day: 18 },
    { year: 2026, month: 5, day: 1 },
    { year: 2026, month: 5, day: 25 },
    { year: 2026, month: 8, day: 10 },
    { year: 2026, month: 8, day: 11 },
    { year: 2026, month: 9, day: 15 },
    { year: 2026, month: 12, day: 22 },
    { year: 2026, month: 12, day: 25 },
    { year: 2026, month: 12, day: 26 }
];

function generateDateVariations({ year, month, day }) {
    const mm = String(month).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return [
        `${year}-${mm}-${dd}`,
        `${year}-${month}-${day}`,
        `${dd}/${mm}/${year}`,
        `${day}/${month}/${year}`,
        `${mm}/${dd}/${year}`,
        `${month}/${day}/${year}`
    ];
}

app.get('/api/schedule', async (req, res) => {
    try {
        const bookings = await Booking.find({});
        const dbBlocks = await Block.find({});

        const practitioners = ['Chido', 'Mispar', 'Tinotenda'];
        const slots = [
            '08:00 AM', '8:00 AM',
            '09:00 AM', '9:00 AM',
            '10:00 AM', '11:00 AM', '12:00 PM',
            '01:00 PM', '1:00 PM',
            '02:00 PM', '2:00 PM',
            '03:00 PM', '3:00 PM'
        ];

        let holidayBlocks = [];
        RAW_HOLIDAYS.forEach(holiday => {
            const dateVariations = generateDateVariations(holiday);
            dateVariations.forEach(dateStr => {
                practitioners.forEach(practitioner => {
                    slots.forEach(slot => {
                        holidayBlocks.push({
                            practitioner,
                            slot,
                            date: dateStr,
                            reason: 'Public Holiday (Closed)'
                        });
                    });
                });
            });
        });

        res.json({ bookings, blocks: [...dbBlocks, ...holidayBlocks] });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch schedule' });
    }
});

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

app.delete('/api/bookings', async (req, res) => {
    const { practitioner, slot, date } = req.body;
    try {
        await Booking.deleteOne({ practitioner: new RegExp(`^${practitioner}$`, 'i'), slot, date });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to cancel booking' });
    }
});

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

app.delete('/api/block', async (req, res) => {
    const { practitioner, slot, date } = req.body;
    try {
        await Block.deleteOne({ practitioner: new RegExp(`^${practitioner}$`, 'i'), slot, date });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to unblock slot' });
    }
});

// Serve frontend if Render is pointing to the root directory
app.use(express.static(__dirname + '/../frontend'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
