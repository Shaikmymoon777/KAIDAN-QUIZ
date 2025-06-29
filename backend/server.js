const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000' })); // Adjust for your React app URL

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/japanese-learning', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to local MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  avatar: { type: String },
  level: { type: String, default: 'N5' },
  joinDate: { type: Date, default: Date.now },
  streak: { type: Number, default: 0 },
  activeDays: { type: Number, default: 0 },
});
const User = mongoose.model('User', userSchema);

// QuizProgress Schema
const quizProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  level: { type: String, required: true },
  setId: { type: String, required: true },
  bestScore: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },
  lastAttempted: { type: Date, default: Date.now },
});
const QuizProgress = mongoose.model('QuizProgress', quizProgressSchema);

// Rankings Schema
const rankingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  avatar: { type: String },
  level: { type: String, required: true },
  averageScore: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now },
});
const Ranking = mongoose.model('Ranking', rankingSchema);

// API Routes
// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users', error: err.message });
  }
});

// Get user stats (streak and active days)
app.get('/api/user-stats/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('streak activeDays');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ streak: user.streak, activeDays: user.activeDays });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user stats', error: err.message });
  }
});

// Get quiz progress for a user
app.get('/api/quiz-progress/:userId', async (req, res) => {
  try {
    const progress = await QuizProgress.find({ userId: req.params.userId });
    const formattedProgress = {
      n5: {},
      n4: {},
      n3: {},
      n2: {},
      n1: {},
    };
    progress.forEach(entry => {
      formattedProgress[entry.level][entry.setId] = {
        bestScore: entry.bestScore,
        completed: entry.completed,
        lastAttempted: entry.lastAttempted,
      };
    });
    res.json(formattedProgress);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching quiz progress', error: err.message });
  }
});

// Get rankings
app.get('/api/rankings', async (req, res) => {
  try {
    const rankings = await Ranking.find().populate('userId', 'name avatar level');
    res.json(rankings);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching rankings', error: err.message });
  }
});

// Update user avatar
app.post('/api/user/:userId/avatar', async (req, res) => {
  try {
    const { avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { avatar },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error updating avatar', error: err.message });
  }
});

// Update quiz progress
app.post('/api/quiz-progress', async (req, res) => {
  try {
    const { userId, level, setId, bestScore, completed } = req.body;
    const progress = await QuizProgress.findOneAndUpdate(
      { userId, level, setId },
      { bestScore, completed, lastAttempted: new Date() },
      { upsert: true, new: true }
    );
    // Update ranking
    const user = await User.findById(userId);
    const progressData = await QuizProgress.find({ userId });
    const averageScore = progressData.reduce((sum, entry) => sum + entry.bestScore, 0) / (progressData.length || 1);
    await Ranking.findOneAndUpdate(
      { userId },
      { 
        userId, 
        name: user.name, 
        avatar: user.avatar, 
        level: user.level, 
        averageScore: Math.round(averageScore), 
        lastUpdated: new Date() 
      },
      { upsert: true }
    );
    res.json(progress);
  } catch (err) {
    res.status(500).json({ message: 'Error updating quiz progress', error: err.message });
  }
});

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));