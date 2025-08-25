const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const ExamResult = require('../models/ExamResult');

// Get questions for exam
router.get('/questions', async (req, res) => {
  try {
    const { level = 'N5', count = 10, type } = req.query;
    
    // Validate input
    if (!['N5', 'N4', 'N3', 'N2', 'N1'].includes(level.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid level. Must be one of: N5, N4, N3, N2, N1'
      });
    }
    
    const query = { level: level.toUpperCase() };
    if (type) {
      query.type = type.toLowerCase();
    }
    
    // Get random questions
    const questions = await Question.aggregate([
      { $match: query },
      { $sample: { size: parseInt(count) } }
    ]);
    
    // Remove correct answers from response
    const questionsWithoutAnswers = questions.map(q => {
      const { correct, ...questionWithoutAnswer } = q;
      return questionWithoutAnswer;
    });
    
    res.json({
      success: true,
      count: questionsWithoutAnswers.length,
      data: questionsWithoutAnswers
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching questions'
    });
  }
});

// Submit exam results
router.post('/submit', async (req, res) => {
  try {
    const { userId, userName, level, answers, timeSpent } = req.body;
    
    // Validate required fields
    if (!userId || !userName || !level || !Array.isArray(answers) || !timeSpent) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    // Get all question IDs from answers
    const questionIds = answers.map(a => a.questionId);
    
    // Get correct answers for these questions
    const questions = await Question.find({ 
      _id: { $in: questionIds } 
    });
    
    // Create a map of questionId to correct answer
    const correctAnswersMap = {};
    questions.forEach(q => {
      correctAnswersMap[q._id.toString()] = q.correct;
    });
    
    // Calculate score and prepare answers with correctness
    let score = 0;
    const evaluatedAnswers = answers.map(answer => {
      const isCorrect = correctAnswersMap[answer.questionId] === answer.selected;
      if (isCorrect) score++;
      
      return {
        ...answer,
        correct: isCorrect,
        feedback: isCorrect ? 'Correct!' : 'Incorrect',
        correctAnswer: correctAnswersMap[answer.questionId]
      };
    });
    
    const totalQuestions = answers.length;
    const percentage = Math.round((score / totalQuestions) * 100);
    
    // Create exam result
    const examResult = new ExamResult({
      userId,
      userName,
      level: level.toUpperCase(),
      score,
      totalQuestions,
      percentage,
      answers: evaluatedAnswers,
      timeSpent,
      completedAt: new Date()
    });
    
    await examResult.save();
    
    res.status(201).json({
      success: true,
      data: {
        score,
        totalQuestions,
        percentage,
        resultId: examResult._id
      }
    });
    
  } catch (error) {
    console.error('Error submitting exam:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while submitting exam',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get exam result by ID
router.get('/result/:id', async (req, res) => {
  try {
    const result = await ExamResult.findById(req.params.id);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Exam result not found'
      });
    }
    
    res.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    console.error('Error fetching exam result:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching exam result'
    });
  }
});

// Get user's exam history
router.get('/history/:userId', async (req, res) => {
  try {
    const { limit = 10, skip = 0 } = req.query;
    
    const results = await ExamResult.find({ userId: req.params.userId })
      .sort({ completedAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));
    
    const count = await ExamResult.countDocuments({ userId: req.params.userId });
    
    res.json({
      success: true,
      count: results.length,
      total: count,
      data: results
    });
    
  } catch (error) {
    console.error('Error fetching exam history:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching exam history'
    });
  }
});

module.exports = router;
