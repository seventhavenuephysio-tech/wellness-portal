const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  clientName: {
    type: String,
    required: true,
    trim: true
  },
  serviceType: {
    type: String,
    required: true,
    // Example: 'Physiotherapy', 'Massage', 'Acupuncture'
  },
  bookingDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Cancelled'],
    default: 'Pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Booking', bookingSchema);