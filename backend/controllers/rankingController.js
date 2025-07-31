const User = require('../models/User');

// Get global leaderboard
exports.getGlobalLeaderboard = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const leaderboard = await User.aggregate([
      {
        $project: {
          name: 1,
          avatar: 1,
          points: 1,
          level: 1,
          achievementsCount: { $size: "$achievements" },
          quizzesTaken: { $size: "$quizScores" }
        }
      },
      { $sort: { points: -1 } },
      { $skip: skip },
      { $limit: parseInt(limit) }
    ]);

    const totalUsers = await User.countDocuments();

    res.json({
      success: true,
      data: leaderboard,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers
      }
    });
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get level-based leaderboard
exports.getLevelLeaderboard = async (req, res) => {
  try {
    const { level, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // Validate level
    if (!['N5', 'N4', 'N3', 'N2', 'N1'].includes(level)) {
      return res.status(400).json({ success: false, message: 'Invalid level' });
    }

    const leaderboard = await User.aggregate([
      { $unwind: "$quizScores" },
      { $match: { "quizScores.level": level } },
      {
        $group: {
          _id: "$_id",
          name: { $first: "$name" },
          avatar: { $first: "$avatar" },
          level: { $first: "$level" },
          maxScore: { $max: "$quizScores.score" },
          lastAttempt: { $max: "$quizScores.date" },
          attempts: { $sum: 1 }
        }
      },
      { $sort: { maxScore: -1, lastAttempt: 1 } },
      { $skip: skip },
      { $limit: parseInt(limit) }
    ]);

    const totalUsers = await User.countDocuments({ 'quizScores.level': level });

    res.json({
      success: true,
      data: leaderboard,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers
      }
    });
  } catch (error) {
    console.error('Error getting level leaderboard:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get user's rank and stats
exports.getUserRanking = async (req, res) => {
  try {
    const { userId } = req.params;

    // Get user's global rank
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const globalRank = await User.countDocuments({
      $or: [
        { points: { $gt: user.points } },
        { points: user.points, _id: { $lt: user._id } }
      ]
    }) + 1;

    // Get level-based ranks
    const levelRanks = {};
    const levels = ['N5', 'N4', 'N3', 'N2', 'N1'];
    
    for (const level of levels) {
      const usersWithHigherScores = await User.countDocuments({
        'quizScores.level': level,
        'quizScores.score': { $gt: user.quizScores
          .filter(score => score.level === level)
          .reduce((max, score) => Math.max(max, score.score), 0) }
      });
      levelRanks[level] = usersWithHigherScores + 1;
    }

    // Get user stats
    const stats = {
      totalQuizzes: user.quizScores.length,
      totalPoints: user.points,
      achievements: user.achievements.length,
      currentStreak: user.streak,
      averageScore: user.quizScores.reduce((sum, score) => sum + score.score, 0) / (user.quizScores.length || 1)
    };

    res.json({
      success: true,
      data: {
        globalRank,
        levelRanks,
        stats,
        user: {
          name: user.name,
          avatar: user.avatar,
          level: user.level,
          points: user.points
        }
      }
    });
  } catch (error) {
    console.error('Error getting user ranking:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update user points and check for achievements
exports.updateUserScore = async (userId, scoreData) => {
  try {
    const { level, score, timeSpent, totalQuestions } = scoreData;
    
    // Update user's quiz scores and points
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          quizScores: {
            level,
            score,
            timeSpent,
            totalQuestions,
            date: new Date()
          }
        },
        $inc: { points: score },
        lastActive: new Date()
      },
      { new: true }
    );

    // Check for achievements (simplified example)
    await checkForAchievements(userId, scoreData);

    return user;
  } catch (error) {
    console.error('Error updating user score:', error);
    throw error;
  }
};

// Helper function to check for achievements
async function checkForAchievements(userId, scoreData) {
  const user = await User.findById(userId);
  const achievements = [];

  // Example achievement checks
  const totalQuizzes = user.quizScores.length;
  const totalPoints = user.points;
  const perfectScores = user.quizScores.filter(s => s.score === 100).length;
  const currentStreak = user.streak;

  // Achievement: First Quiz
  if (totalQuizzes === 1) {
    achievements.push({
      name: 'First Steps',
      description: 'Complete your first quiz',
      icon: 'first-steps',
      dateEarned: new Date()
    });
  }

  // Achievement: Perfect Score
  if (scoreData.score === 100) {
    achievements.push({
      name: 'Perfect Score',
      description: 'Score 100% on a quiz',
      icon: 'perfect-score',
      dateEarned: new Date()
    });
  }

  // Achievement: Quiz Master
  if (totalQuizzes >= 10) {
    achievements.push({
      name: 'Quiz Master',
      description: 'Complete 10 quizzes',
      icon: 'quiz-master',
      dateEarned: new Date()
    });
  }

  // Add more achievement checks as needed

  if (achievements.length > 0) {
    await User.findByIdAndUpdate(
      userId,
      { $push: { achievements: { $each: achievements } } }
    );
  }

  return achievements;
}
