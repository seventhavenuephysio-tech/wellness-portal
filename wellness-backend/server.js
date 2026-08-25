const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

// 1. Connect to MongoDB Atlas
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

// 3. Raw Zimbabwean Public Holidays Data
const RAW_HOLIDAYS = [
    { year: 2026, month: 1, day: 1 },   // New Year's Day
    { year: 2026, month: 2, day: 21 },  // National Youth Day
    { year: 2026, month: 4, day: 3 },   // Good Friday
    { year: 2026, month: 4, day: 6 },   // Easter Monday
    { year: 2026, month: 4, day: 18 },  // Independence Day
    { year: 2026, month: 5, day: 1 },   // Workers' Day
    { year: 2026, month: 5, day: 25 },  // Africa Day
    { year: 2026, month: 8, day: 10 },  // Heroes' Day
    { year: 2026, month: 8, day: 11 },  // Defence Forces Day
    { year: 2026, month: 9, day: 15 },  // Munhumutapa Day
    { year: 2026, month: 12, day: 22 }, // National Unity Day
    { year: 2026, month: 12, day: 25 }, // Christmas Day
    { year: 2026, month: 12, day: 26 }  // Boxing Day
];

function generateDateVariations({ year, month, day }) {
    const mm = String(month).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    const m = String(month);
    const d = String(day);

    return [
        `${year}-${mm}-${dd}`,
        `${year}-${m}-${d}`,
        `${dd}/${mm}/${year}`,
        `${d}/${m}/${year}`,
        `${mm}/${dd}/${year}`,
        `${m}/${d}/${year}`
    ];
}

// 4. API Endpoints

// GET Schedule
app.get('/api/schedule', async (req, res) => {
    try {
        const bookings = await Booking.find({});
        const dbBlocks = await Block.find({});

        const practitioners = ['Chido', 'Mispar', 'Tinotenda'];
        const slots = [
            '8:00 AM', '08:00 AM',
            '9:00 AM', '09:00 AM',
            '10:00 AM',
            '11:00 AM',
            '12:00 PM',
            '1:00 PM', '01:00 PM',
            '2:00 PM', '02:00 PM',
            '3:00 PM', '03:00 PM'
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

// POST Block
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

// DELETE Block
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
