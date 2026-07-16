const mongoose = require('mongoose');

const MovieSchema = new mongoose.Schema({
  tmdbId: {
    type: Number,
    unique: true,
    sparse: true
  },
  title: {
    type: String,
    required: true,
    index: true
  },
  overview: {
    type: String,
    required: true
  },
  poster_path: String,
  backdrop_path: String,
  genres: [{
    id: Number,
    name: String
  }],
  casts: [{
    name: String,
    character: String,
    profile_path: String
  }],
  director: String,
  release_date: {
    type: String,
    index: true
  },
  original_language: String,
  tagline: String,
  vote_average: {
    type: Number,
    min: 0,
    max: 10
  },
  vote_count: {
    type: Number,
    default: 0
  },
  runtime: {
    type: Number,
    min: 0
  },
  trailer_url: String,
  rating: {
    type: String,
    enum: ['G', 'PG', 'PG-13', 'R', 'NC-17', 'NR', 'U', 'UA', 'A', 'S'],
    default: 'NR'
  },
  status: {
    type: String,
    enum: ['now_showing', 'coming_soon', 'ended'],
    default: 'now_showing',
    index: true
  },
  popularity: {
    type: Number,
    default: 0
  },
  viewCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
MovieSchema.index({ status: 1, popularity: -1 });
MovieSchema.index({ 'genres.name': 1 });
MovieSchema.index({ title: 'text', overview: 'text' });

module.exports = mongoose.model('Movie', MovieSchema);
