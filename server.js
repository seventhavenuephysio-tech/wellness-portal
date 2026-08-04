const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
const cors = require('cors');

// Allow requests from your frontend Render domain and local development
app.use(cors({
  origin: [
    'https://wellness-portal-7qny.onrender.com',
    'http://localhost:3000',
    'http://localhost:5000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected successfully!'))
.catch(err => console.error('MongoDB connection error:', err));
// Health check route for the frontend badge / Sync button
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'online', message: 'Backend is fully operational' });
});
// Routes
app.get('/', (req, res) => {
  res.send('API is running successfully!');
});

// Reminder API Routes connected to MongoDB
app.use('/api/reminders', require('./routes/reminders'));

// Port configuration
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});