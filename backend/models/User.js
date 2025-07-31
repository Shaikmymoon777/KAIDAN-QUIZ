const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  avatar: { type: String },
  level: { type: String, default: 'N5' },
  points: { type: Number, default: 0 },
  achievements: [{
    name: String,
    description: String,
    icon: String,
    dateEarned: { type: Date, default: Date.now }
  }],
  quizScores: [{
    level: String,
    score: Number,
    date: { type: Date, default: Date.now },
    timeSpent: Number, // in seconds
    totalQuestions: Number
  }],
  lastActive: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  streak: { type: Number, default: 0 },
  lastLogin: { type: Date }
});

// Add index for faster leaderboard queries
userSchema.index({ points: -1 });
userSchema.index({ 'quizScores.level': 1, 'quizScores.score': -1 });

const User = mongoose.model('User', userSchema);

module.exports = User;
