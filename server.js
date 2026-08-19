const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'frontend')));

const mongoURI = process.env.MONGO_URI || process.env.MONGO || 
  (process.env.MONGO_PASSWORD ? `mongodb+srv://admin:${process.env.MONGO_PASSWORD}@cluster0.mongodb.net/wellness?retryWrites=true&w=majority` : null);

if (mongoURI) {
  mongoose.connect(mongoURI)
    .then(() => console.log('MongoDB Connected Successfully'))
    .catch(err => console.error('MongoDB Connection Error:', err.message));
} else {
  console.warn("WARNING: MONGO_URI or MONGO variable is missing.");
}

// Schemas
const bookingSchema = new mongoose.Schema({
  therapist: String, time: String, date: String, patientName: String, patientPhone: String
});
const Booking = mongoose.model('Booking', bookingSchema);

const slotSchema = new mongoose.Schema({
  name: String, title: String, slots: [String]
});
const Slot = mongoose.model('Slot', slotSchema);

const contactSchema = new mongoose.Schema({
  name: String, phone: String
});
const Contact = mongoose.model('Contact', contactSchema);

// Bookings API
app.get('/api/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find({});
    res.json(bookings.map(b => ({
      practitioner: b.therapist, slot: b.time, name: b.patientName, phone: b.patientPhone, date: b.date
    })));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/bookings', async (req, res) => {
  try {
    const { practitioner, therapist, slot, time, name, patientName, phone, patientPhone, date } = req.body;
    await Booking.deleteOne({ therapist: practitioner || therapist, time: slot || time, date: date || new Date().toISOString().split('T')[0] });
    const newBooking = new Booking({
      therapist: practitioner || therapist, time: slot || time, date: date || new Date().toISOString().split('T')[0], patientName: name || patientName, patientPhone: phone || patientPhone
    });
    await newBooking.save();
    res.status(201).json({ success: true, booking: newBooking });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/bookings/cancel', async (req, res) => {
  try {
    const { practitioner, therapist, slot, time, date } = req.body;
    await Booking.deleteOne({ therapist: practitioner || therapist, time: slot || time, date: date });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Slots API
app.get('/api/slots', async (req, res) => {
  try { res.json(await Slot.find({})); } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/slots', async (req, res) => {
  try {
    const { name, title, slots } = req.body;
    await Slot.findOneAndUpdate({ name: name }, { name: name, title: title || "Physiotherapist", slots: slots }, { upsert: true, new: true });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Contacts API (Syncs contacts between desktop & mobile)
app.get('/api/contacts', async (req, res) => {
  try {
    const contacts = await Contact.find({});
    const map = {};
    contacts.forEach(c => map[c.name] = c.phone);
    res.json(map);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/contacts', async (req, res) => {
  try {
    const { contacts } = req.body;
    const ops = Object.keys(contacts || {}).map(name => ({
      updateOne: { filter: { name }, update: { name, phone: contacts[name] }, upsert: true }
    }));
    if (ops.length > 0) await Contact.bulkWrite(ops);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
