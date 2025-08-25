const express = require('express');
const router = express.Router();
const ExamResult = require('../models/ExamResult');

// Get top scores
router.get('/', async (req, res) => {
  try {
    const { level, limit = 10 } = req.query;
    
    const query = {};
    if (level) query.level = level.toUpperCase();
    
    const rankings = await ExamResult.find(query)
      .sort({ score: -1, timeSpent: 1 })
      .limit(parseInt(limit))
      .select('userName level score totalQuestions percentage timeSpent completedAt');
    
    res.json({
      success: true,
      count: rankings.length,
      data: rankings
    });
  } catch (error) {
    console.error('Error fetching rankings:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching rankings'
    });
  }
});

// Get user's ranking
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { level } = req.query;
    
    const query = { userId };
    if (level) query.level = level.toUpperCase();
    
    const userResults = await ExamResult.find(query)
      .sort({ completedAt: -1 })
      .limit(10);
    
    res.json({
      success: true,
      count: userResults.length,
      data: userResults
    });
  } catch (error) {
    console.error('Error fetching user rankings:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user rankings'
    });
  }
});

module.exports = router;
