const mongoose = require('mongoose');

const TierListSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  likes: {
    type: Number,
    default: 0
  },
  tiers: [{
    name: String,
    color: String,
    games: [{
      gameId: String,
      title: String,
      cover: String,
      year: String
    }]
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
TierListSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const TierList = mongoose.model('TierList', TierListSchema);

module.exports = TierList;
