const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors({ 
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/japanese-learning', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err));

// Import routes
const rankingRoutes = require('./routes/rankingRoutes');

// Import models
const User = require('./models/User');
  level: { type: String, default: 'N5' },
  joinDate: { type: Date, default: Date.now },
  streak: { type: Number, default: 0 },
  activeDays: { type: Number, default: 0 },
  totalQuizzes: { type: Number, default: 0 },
  averageScore: { type: Number, default: 0 },
  lastActiveDate: { type: Date, default: Date.now },
  practiceProgress: {
    flashcards: {
      hiragana: { completed: { type: Number, default: 0 }, total: { type: Number, default: 107 }, streak: { type: Number, default: 0 } },
      katakana: { completed: { type: Number, default: 0 }, total: { type: Number, default: 107 }, streak: { type: Number, default: 0 } }
    },
    vocabulary: {
      n5: { accuracy: { type: Number, default: 0 }, wordsLearned: { type: Number, default: 0 }, streak: { type: Number, default: 0 } },
      n4: { accuracy: { type: Number, default: 0 }, wordsLearned: { type: Number, default: 0 }, streak: { type: Number, default: 0 } },
      n3: { accuracy: { type: Number, default: 0 }, wordsLearned: { type: Number, default: 0 }, streak: { type: Number, default: 0 } },
      n2: { accuracy: { type: Number, default: 0 }, wordsLearned: { type: Number, default: 0 }, streak: { type: Number, default: 0 } },
      n1: { accuracy: { type: Number, default: 0 }, wordsLearned: { type: Number, default: 0 }, streak: { type: Number, default: 0 } }
    }
  }
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

// Quiz Questions Schema
const quizQuestionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correct: { type: Number, required: true },
  explanation: { type: String, required: true },
  level: { type: String, required: true }, // N5, N4, etc.
  category: { type: String, required: true }, // vocabulary, grammar, reading
  setId: { type: String, required: true }, // set1, set2, etc.
});
const QuizQuestion = mongoose.model('QuizQuestion', quizQuestionSchema);

// Flashcards Schema
const flashcardSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  character: { type: String, required: true },
  romaji: { type: String, required: true },
  meaning: { type: String, required: true },
  type: { type: String, required: true }, // hiragana, katakana
});
const Flashcard = mongoose.model('Flashcard', flashcardSchema);

// API Routes

// User Management
// Create new user
app.post('/api/users', async (req, res) => {
  try {
    console.log('🔵 POST /api/users - Request received');
    console.log('Request body:', req.body);
    
    const { name, email, avatar, level } = req.body;
    
    // Validate required fields
    if (!name || !email) {
      console.log('❌ Missing required fields: name or email');
      return res.status(400).json({ message: 'Name and email are required' });
    }
    
    console.log('🔍 Checking if user already exists with email:', email);
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('⚠️ User already exists:', existingUser._id);
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    console.log('✅ Creating new user with data:', { name, email, level, avatar: avatar ? 'present' : 'missing' });

    const user = new User({
      name,
      email,
      avatar,
      level: level || 'N5',
      joinDate: new Date(),
      lastActiveDate: new Date()
    });

    console.log('💾 Saving user to database...');
    await user.save();
    console.log('✅ User saved successfully with ID:', user._id);
    
    res.status(201).json(user);
  } catch (err) {
    console.error('❌ Error creating user:', err);
    res.status(500).json({ message: 'Error creating user', error: err.message });
  }
});

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users', error: err.message });
  }
});

// Get user by ID
app.get('/api/users/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user', error: err.message });
  }
});

// Get user by email
app.get('/api/users/email/:email', async (req, res) => {
  try {
    console.log('🔵 GET /api/users/email/:email - Request received');
    console.log('Email parameter:', req.params.email);
    
    const user = await User.findOne({ email: req.params.email });
    if (!user) {
      console.log('❌ User not found with email:', req.params.email);
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('✅ User found:', user._id);
    res.json(user);
  } catch (err) {
    console.error('❌ Error fetching user by email:', err);
    res.status(500).json({ message: 'Error fetching user', error: err.message });
  }
});

// Update user
app.put('/api/users/:userId', async (req, res) => {
  try {
    const { name, email, level, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { name, email, level, avatar, lastActiveDate: new Date() },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error updating user', error: err.message });
  }
});

// Get user stats (streak and active days)
app.get('/api/user-stats/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('streak activeDays totalQuizzes averageScore lastActiveDate');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({
      streak: user.streak,
      activeDays: user.activeDays,
      totalQuizzes: user.totalQuizzes,
      averageScore: user.averageScore,
      lastActiveDate: user.lastActiveDate
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user stats', error: err.message });
  }
});

// Update user streak and active days
app.post('/api/users/:userId/activity', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const today = new Date();
    const lastActive = new Date(user.lastActiveDate);
    const daysSinceLastActive = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));

    // Update streak logic
    if (daysSinceLastActive === 1) {
      user.streak += 1;
    } else if (daysSinceLastActive > 1) {
      user.streak = 1;
    }

    // Update active days
    if (daysSinceLastActive >= 1) {
      user.activeDays += 1;
    }

    user.lastActiveDate = today;
    await user.save();

    res.json({
      streak: user.streak,
      activeDays: user.activeDays,
      lastActiveDate: user.lastActiveDate
    });
  } catch (err) {
    res.status(500).json({ message: 'Error updating user activity', error: err.message });
  }
});

// Get user practice progress
app.get('/api/users/:userId/practice-progress', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('practiceProgress');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.practiceProgress);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching practice progress', error: err.message });
  }
});

// Update user practice progress
app.post('/api/users/:userId/practice-progress', async (req, res) => {
  try {
    const { type, data } = req.body; // type: 'flashcards' or 'vocabulary', data: progress data
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (type === 'flashcards') {
      // Merge the data properly to maintain the complete structure
      user.practiceProgress.flashcards = {
        hiragana: { ...user.practiceProgress.flashcards.hiragana, ...data.hiragana },
        katakana: { ...user.practiceProgress.flashcards.katakana, ...data.katakana }
      };
    } else if (type === 'vocabulary') {
      // Merge vocabulary data for each level
      Object.keys(data).forEach(level => {
        if (user.practiceProgress.vocabulary[level]) {
          user.practiceProgress.vocabulary[level] = { 
            ...user.practiceProgress.vocabulary[level], 
            ...data[level] 
          };
        }
      });
    }

    await user.save();
    res.json(user.practiceProgress);
  } catch (err) {
    res.status(500).json({ message: 'Error updating practice progress', error: err.message });
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
    const { userId, level, setId, bestScore, completed, timeSpent } = req.body;
    
    // Update quiz progress
    const progress = await QuizProgress.findOneAndUpdate(
      { userId, level, setId },
      { bestScore, completed, lastAttempted: new Date() },
      { upsert: true, new: true }
    );

    // Update user statistics
    const user = await User.findById(userId);
    if (user) {
      // Update total quizzes and average score
      const progressData = await QuizProgress.find({ userId });
      const totalQuizzes = progressData.length;
      const averageScore = progressData.reduce((sum, entry) => sum + entry.bestScore, 0) / (totalQuizzes || 1);
      
      user.totalQuizzes = totalQuizzes;
      user.averageScore = Math.round(averageScore);
      user.lastActiveDate = new Date();
      
      // Update streak and active days
      const today = new Date();
      const lastActive = new Date(user.lastActiveDate);
      const daysSinceLastActive = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));

      if (daysSinceLastActive === 1) {
        user.streak += 1;
      } else if (daysSinceLastActive > 1) {
        user.streak = 1;
      }

      if (daysSinceLastActive >= 1) {
        user.activeDays += 1;
      }

      await user.save();
    }

    // Update ranking
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

    res.json({
      progress,
      userStats: {
        totalQuizzes: user.totalQuizzes,
        averageScore: user.averageScore,
        streak: user.streak,
        activeDays: user.activeDays
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Error updating quiz progress', error: err.message });
  }
});

// Get quiz questions by level and category
app.get('/api/quiz-questions/:level/:category/:setId', async (req, res) => {
  try {
    const { level, category, setId } = req.params;
    const questions = await QuizQuestion.find({ level, category, setId });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching quiz questions', error: err.message });
  }
});

// Get all flashcards by type
app.get('/api/flashcards/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const flashcards = await Flashcard.find({ type });
    res.json(flashcards);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching flashcards', error: err.message });
  }
});

// Get all flashcards
app.get('/api/flashcards', async (req, res) => {
  try {
    const flashcards = await Flashcard.find();
    res.json(flashcards);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching flashcards', error: err.message });
  }
});

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));                                                        