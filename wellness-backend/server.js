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

// 2. Define Schemas & Models
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

// 3. Zimbabwean Public Holidays (supporting both YYYY-MM-DD and DD/MM/YYYY formats)
const ZIM_PUBLIC_HOLIDAYS = [
    '2026-01-01', '01/01/2026', '1/1/2026',
    '2026-02-21', '21/02/2026', '21/2/2026',
    '2026-04-03', '03/04/2026', '3/4/2026',
    '2026-04-06', '06/04/2026', '6/4/2026',
    '2026-04-18', '18/04/2026', '18/4/2026',
    '2026-05-01', '01/05/2026', '1/5/2026',
    '2026-05-25', '25/05/2026', '25/5/2026',
    '2026-08-10', '10/08/2026', '10/8/2026',
    '2026-08-11', '11/08/2026', '11/8/2026',
    '2026-09-15', '15/09/2026', '15/9/2026',
    '2026-12-22', '22/12/2026', '22/12/2026',
    '2026-12-25', '25/12/2026', '25/12/2026',
    '2026-12-26', '26/12/2026', '26/12/2026'
];

// 4. API Endpoints

// GET Schedule Data
app.get('/api/schedule', async (req, res) => {
    try {
        const bookings = await Booking.find({});
        const dbBlocks = await Block.find({});

        const practitioners = ['Chido', 'Mispar', 'Tinotenda'];
        // Includes single digit and zero-padded slots to guarantee matching
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
        ZIM_PUBLIC_HOLIDAYS.forEach(holidayDate => {
            practitioners.forEach(practitioner => {
                slots.forEach(slot => {
                    holidayBlocks.push({
                        practitioner,
                        slot,
                        date: holidayDate,
                        reason: 'Public Holiday (Closed)'
                    });
                });
            });
        });

        res.json({ bookings, blocks: [...dbBlocks, ...holidayBlocks] });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch schedule' });
    }
});

// POST New Booking
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

// POST Manual Block
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

// DELETE Manual Block
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
