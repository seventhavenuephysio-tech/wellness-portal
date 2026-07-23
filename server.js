const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
if (process.env.MONGODB_URI) {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB Connected...'))
    .catch((err) => console.error('MongoDB connection error:', err));
}

// Health check route
app.get('/', (req, res) => {
  res.send('API is running successfully!');
});

// Direct test route (no extra files needed!)
app.get('/api/reminders', (req, res) => {
  res.json({ message: 'Reminders API working!' });
});

// Port configuration
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
