const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose'); // 1. Import Mongoose
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// 2. Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/wellness-booking';

mongoose.connect(MONGO_URI)
  .then(() => console.log('Successfully connected to MongoDB!'))
  .catch((error) => console.error('MongoDB connection error:', error));

// Basic Route
app.get('/', (req, res) => {
  res.send('Wellness Booking API is running and database is connecting!');
});

// Start the Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});