const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Enable CORS for all incoming requests
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected successfully!'))
.catch(err => console.error('MongoDB connection error:', err));

// 1. Root route for Health/Status checks
app.get('/', (req, res) => {
  res.status(200).json({ status: 'online', message: 'Wellness Portal API is running' });
});

// 2. Reminders API Route
app.use('/api/reminders', require('./routes/reminders'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});