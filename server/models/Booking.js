const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  userEmail: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  show: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Show',
    required: true
  },
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: true
  },
  seats: [{
    type: String,
    required: true
  }],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  originalAmount: {
    type: Number
  },
  promoCode: {
    type: String
  },
  discount: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'inr'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending',
    index: true
  },
  paymentIntentId: {
    type: String,
    sparse: true
  },
  stripeSessionId: {
    type: String,
    sparse: true
  },
  razorpayOrderId: {
    type: String,
    sparse: true
  },
  razorpayPaymentId: {
    type: String,
    sparse: true
  },
  bookingCode: {
    type: String,
    unique: true,
    sparse: true
  },
  qrCode: {
    type: String
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled', 'expired', 'used'],
    default: 'confirmed',
    index: true
  },
  showDate: {
    type: String,
    required: true
  },
  showTime: {
    type: String,
    required: true
  },
  emailSent: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Generate booking code before save
BookingSchema.pre('save', function(next) {
  if (!this.bookingCode) {
    this.bookingCode = `CS${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }
  next();
});

// Index for efficient queries
BookingSchema.index({ userId: 1, createdAt: -1 });
BookingSchema.index({ paymentStatus: 1, status: 1 });

module.exports = mongoose.model('Booking', BookingSchema);
