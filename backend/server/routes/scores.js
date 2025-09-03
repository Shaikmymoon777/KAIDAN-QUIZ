const express = require('express');
const router = express.Router();
const Score = require('../models/scores');

// Helper function to calculate section scores
const calculateSectionScores = (answers, questions, section) => {
  let score = 0;
  const total = questions.length;
  
  if (section === 'speaking') {
    // For speaking, sum up the scores (0-10 per question)
    score = Object.values(answers).reduce((sum, answer) => {
      return sum + (answer?.score || 0);
    }, 0);
    
    // Convert to 0-5 scale
    const normalizedScore = Math.round(score / 2);
    return { score: normalizedScore, total: total * 2, rawScore: score };
  } else {
    // For vocabulary and listening
    const details = questions.map(q => {
      const answer = answers[q.id];
      const isCorrect = answer?.isCorrect || false;
      
      if (isCorrect) {
        score += section === 'vocabulary' ? 4 : 2; // 4 points per vocab, 2 per listening
      }
      
      return {
        questionId: q.id,
        isCorrect,
        userAnswer: answer?.answer || null,
        correctAnswer: q.meaning || q.correctAnswer
      };
    });
    
    return { 
      score, 
      total: section === 'vocabulary' ? total * 4 : total * 2, // 40 for vocab, 10 for listening
      details 
    };
  }
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
      
      // Add section scores if they exist (including speaking)
      ['vocabulary', 'listening', 'speaking'].forEach(section => {
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
    
    // Process each section
    ['vocabulary', 'listening', 'speaking'].forEach(section => {
      const sectionQuestions = questions[section] || [];
      const sectionAnswers = answers[section] || {};
      
      const result = calculateSectionScores(sectionAnswers, sectionQuestions, section);
      
      sectionScores[section] = { 
        score: result.score,
        total: result.total,
        ...(section === 'speaking' && { rawScore: result.rawScore })
      };
      
      totalScore += result.score;
    });

    // Create the score document
    const newScore = new Score({
      userId: userId || 'anonymous',
      username: username || 'Anonymous',
      scores: {
        ...sectionScores,
        totalScore,
        totalQuestions: 55 // 40 (vocab) + 10 (listening) + 5 (speaking)
      },
      date: new Date(),
      rawScores: answers // Store raw answers for reference
    });

    const savedScore = await newScore.save();
    
    // Prepare response
    const response = {
      id: savedScore._id,
      userId: savedScore.userId,
      username: savedScore.username,
      score: totalScore,
      totalQuestions: 55,
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