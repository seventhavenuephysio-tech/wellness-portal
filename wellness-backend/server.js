const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI;

if (MONGO_URI) {
    mongoose.connect(MONGO_URI)
        .then(() => console.log('Connected to MongoDB Atlas'))
        .catch(err => console.error('MongoDB connection error:', err));
} else {
    console.warn('WARNING: MONGO_URI is missing from environment variables.');
}

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

const PatientSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    phone: { type: String, default: '' }
});

const Booking = mongoose.model('Booking', BookingSchema);
const Block = mongoose.model('Block', BlockSchema);
const Patient = mongoose.model('Patient', PatientSchema);

const frontendPath = fs.existsSync(path.join(__dirname, '../frontend'))
    ? path.join(__dirname, '../frontend')
    : path.join(__dirname, 'frontend');

app.use(express.static(frontendPath));

// Schedule retrieval
app.get('/api/schedule', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.json({ bookings: [], blocks: [] });
        }
        const rawBookings = await Booking.find({});
        const rawBlocks = await Block.find({});

        const bookings = rawBookings.filter(b => b && b.practitioner && b.slot && b.date);
        const blocks = rawBlocks.filter(b => b && b.practitioner && b.slot && b.date);

        res.json({ bookings, blocks });
    } catch (err) {
        console.error('Error fetching schedule:', err);
        res.status(500).json({ error: 'Failed to fetch schedule' });
    }
});

// Patient directory for typing auto-complete
app.get('/api/patients', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) return res.json([]);
        
        const storedPatients = await Patient.find({});
        const bookings = await Booking.find({}, 'name phone');
        
        const patientsMap = {};
        
        // Load explicitly saved patients
        storedPatients.forEach(p => {
            if (p.name) patientsMap[p.name.toLowerCase()] = { name: p.name, phone: p.phone };
        });

        // Merge past bookings
        bookings.forEach(b => {
            if (b.name && !patientsMap[b.name.toLowerCase()]) {
                patientsMap[b.name.toLowerCase()] = { name: b.name, phone: b.phone || '' };
            }
        });

        res.json(Object.values(patientsMap));
    } catch (err) {
        console.error('Error fetching patients:', err);
        res.status(500).json({ error: 'Failed to fetch patients' });
    }
});

// Single booking creation & patient index update
app.post('/api/bookings', async (req, res) => {
    const { practitioner, slot, name, phone, date } = req.body;
    if (!practitioner || !slot || !name || !date) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const booking = await Booking.create({ practitioner, slot, name, phone, date });

        // Save/Update patient phone for future auto-fill
        if (name && phone) {
            await Patient.updateOne(
                { name: name.trim() },
                { $set: { name: name.trim(), phone: phone.trim() } },
                { upsert: true }
            );
        }

        res.status(201).json(booking);
    } catch (err) {
        res.status(500).json({ error: 'Failed to save booking' });
    }
});

// CSV Bulk booking import
app.post('/api/bookings/bulk', async (req, res) => {
    const { bookings } = req.body;
    if (!Array.isArray(bookings) || bookings.length === 0) {
        return res.status(400).json({ error: 'No bookings provided' });
    }

    try {
        const validBookings = bookings.filter(b => b.practitioner && b.slot && b.name && b.date);
        const created = await Booking.insertMany(validBookings);

        // Bulk upsert patient names and numbers
        const patientOps = validBookings
            .filter(b => b.name && b.phone)
            .map(b => ({
                updateOne: {
                    filter: { name: b.name.trim() },
                    update: { $set: { name: b.name.trim(), phone: b.phone.trim() } },
                    upsert: true
                }
            }));

        if (patientOps.length > 0) {
            await Patient.bulkWrite(patientOps);
        }

        res.status(201).json({ count: created.length });
    } catch (err) {
        console.error('Bulk import error:', err);
        res.status(500).json({ error: 'Failed to import bookings' });
    }
});

// Booking cancellation
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

// Block slot
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

// Unblock slot
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

app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
