const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: true,
    index: true,
  },
  userId: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    trim: true,
    maxlength: 1000,
  },
  likes: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

// One review per user per movie
ReviewSchema.index({ movie: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Review', ReviewSchema);
