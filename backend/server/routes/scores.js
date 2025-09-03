const express = require('express');
const router = express.Router();
const Score = require('../models/scores');

// Helper function to calculate section scores
const calculateSectionScores = (answers, questions) => {
  let score = 0;
  const total = questions.length;
  
  const details = questions.map(q => {
    const answer = answers[q.id];
    const isCorrect = answer?.isCorrect || false;
    
    if (isCorrect) {
      score += 1;
    }
    
    return {
      questionId: q.id,
      isCorrect,
      userAnswer: answer?.answer || null,
      correctAnswer: q.meaning || q.correctAnswer
    };
  });
  
  return { score, total, details };
};

// @route   GET api/scores
// @desc    Get all scores
router.get('/', async (req, res) => {
  try {
    const scores = await Score.find().sort({ date: -1 });
    
    const formattedScores = scores.map(score => {
      const response = {
        id: score._id,
        userId: score.userId || 'anonymous',
        username: score.username,
        score: score.scores?.totalScore || 0,
        totalQuestions: score.scores?.totalQuestions || 0,
        date: score.date,
        formattedDate: new Date(score.date).toISOString().split('T')[0]
      };
      
      // Add section scores if they exist (excluding speaking)
      ['vocabulary', 'listening'].forEach(section => {
        if (score.scores?.[section]) {
          response[section] = {
            score: score.scores[section].score || 0,
            total: score.scores[section].total || 0
          };
        }
      });
      
      return response;
    });
    
    res.json(formattedScores);
  } catch (err) {
    console.error('Error fetching scores:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/scores
// @desc    Save a new score
router.post('/', async (req, res) => {
  try {
    const { userId, username, answers, questions } = req.body;
    
    if (!answers || !questions) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Calculate scores for each section
    const sectionScores = {};
    let totalScore = 0;
    let totalQuestions = 0;
    
    // Process each section
    ['vocabulary', 'listening', 'speaking'].forEach(section => {
      const sectionQuestions = questions[section] || [];
      const sectionAnswers = answers[section] || {};
      
      const { score, total } = calculateSectionScores(sectionAnswers, sectionQuestions);
      
      sectionScores[section] = { score, total };
      totalScore += score;
      totalQuestions += total || 1; // Ensure at least 1 to avoid division by zero
    });

    // Create the score document
    const newScore = new Score({
      userId: userId || 'anonymous',
      username: username || 'Anonymous',
      scores: {
        ...sectionScores,
        totalScore,
        totalQuestions
      },
      date: new Date()
    });

    const savedScore = await newScore.save();
    
    // Prepare response
    const response = {
      id: savedScore._id,
      userId: savedScore.userId,
      username: savedScore.username,
      score: totalScore,
      totalQuestions,
      date: savedScore.date,
      formattedDate: new Date(savedScore.date).toISOString().split('T')[0],
      ...sectionScores
    };
    
    res.status(201).json(response);
    
  } catch (err) {
    console.error('Error saving score:', err);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

module.exports = router;