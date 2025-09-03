const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    default: 'unknown'
  },
  username: {
    type: String,
    required: true
  },
  scores: {
    totalScore: {
      type: Number,
      required: true,
      default: 0
    },
    totalQuestions: {
      type: Number,
      required: true,
      default: 0
    },
    vocabulary: {
      score: Number,
      total: Number
    },
    listening: {
      score: Number,
      total: Number
    },
    speaking: {
      score: Number,
      total: Number
    }
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add a virtual for formattedDate
scoreSchema.virtual('formattedDate').get(function() {
  return this.date.toISOString().split('T')[0];
});

// Ensure virtuals are included in toJSON output
scoreSchema.set('toJSON', { virtuals: true });

// Create a compound index for faster queries
scoreSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('Score', scoreSchema);