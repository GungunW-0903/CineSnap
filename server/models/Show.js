const mongoose = require('mongoose');

const ShowSchema = new mongoose.Schema({
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: true
  },
  theater: {
    name: {
      type: String,
      required: true,
      default: 'CineSnap Theater'
    },
    location: {
      type: String,
      default: 'Downtown'
    },
    screen: {
      type: String,
      default: 'Screen 1'
    }
  },
  date: {
    type: String,
    required: true,
    index: true
  },
  time: {
    type: String,
    required: true
  },
  ticketPrice: {
    type: Number,
    required: true,
    default: 12.00,
    min: 0
  },
  format: {
    type: String,
    enum: ['2D', '3D', 'IMAX', 'Dolby', '4DX'],
    default: '2D'
  },
  language: {
    type: String,
    default: 'English'
  },
  totalSeats: {
    type: Number,
    required: true,
    default: 100
  },
  availableSeats: {
    type: Number,
    required: true,
    default: 100
  },
  seats: [{
    seatNumber: {
      type: String,
      required: true
    },
    row: String,
    isBooked: {
      type: Boolean,
      default: false
    },
    bookedBy: {
      type: String
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking'
    }
  }],
  status: {
    type: String,
    enum: ['active', 'full', 'cancelled', 'completed'],
    default: 'active',
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for efficient date/time queries
ShowSchema.index({ date: 1, time: 1, status: 1 });
ShowSchema.index({ movie: 1, date: 1 });

// Update available seats count
ShowSchema.methods.updateAvailableSeats = function() {
  this.availableSeats = this.seats.filter(s => !s.isBooked).length;
  if (this.availableSeats === 0) {
    this.status = 'full';
  } else if (this.status === 'full') {
    this.status = 'active';
  }
};

module.exports = mongoose.model('Show', ShowSchema);
