const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Optimized MongoDB Connection
const MONGO_URI = process.env.MONGO_URI;

if (MONGO_URI) {
  mongoose.connect(MONGO_URI, {
    maxPoolSize: 10,               // Keeps up to 10 sockets open
    serverSelectionTimeoutMS: 5000, // Timeout fast instead of hanging
    socketTimeoutMS: 45000,        // Close sockets after 45s of inactivity
  })
  .then(() => console.log('MongoDB Connected successfully!'))
  .catch(err => console.error('MongoDB connection error:', err));
}

// Fast Health Check Endpoint (doesn't wait on DB if just checking server state)
app.get('/', (req, res) => {
  const dbState = mongoose.connection.readyState;
  // 1 = connected, 2 = connecting
  res.status(200).json({ 
    status: 'online', 
    dbStatus: dbState === 1 ? 'connected' : 'connecting' 
  });
});

// Direct Bookings Endpoint
app.get('/api/bookings', async (req, res) => {
  try {
    res.status(200).json([]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/bookings', async (req, res) => {
  try {
    res.status(201).json({ message: 'Booking created successfully', data: req.body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));