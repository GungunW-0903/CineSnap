const mongoose = require('mongoose');

const FavoriteSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Ensure one favorite per user per movie
FavoriteSchema.index({ userId: 1, movie: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', FavoriteSchema);
