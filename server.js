const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB Connection
if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB Connected successfully!'))
  .catch(err => console.error('MongoDB connection error:', err));
}

// 1. Root Health Check Endpoint
app.get('/', (req, res) => {
  res.status(200).json({ status: 'online', message: 'API active' });
});

// 2. Direct Bookings Endpoint (No external route files needed)
app.get('/api/bookings', (req, res) => {
  res.status(200).json([]);
});

app.post('/api/bookings', (req, res) => {
  res.status(201).json({ message: 'Booking created successfully', data: req.body });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));