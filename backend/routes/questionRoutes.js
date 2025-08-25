const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const Question = require('../models/Question');
const { authenticate, authorize } = require('../middleware/auth');

// @route   GET /api/questions
// @desc    Get questions with filtering and pagination
// @access  Public
router.get('/', [
  check('level').optional().isIn(['N5', 'N4', 'N3', 'N2', 'N1']),
  check('type').optional().isIn(['vocabulary', 'grammar', 'kanji', 'reading']),
  check('page').optional().isInt({ min: 1 }).toInt(),
  check('limit').optional().isInt({ min: 1, max: 100 }).toInt()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { level, type, page = 1, limit = 20 } = req.query;
    const query = { isActive: true };
    
    if (level) query.level = level;
    if (type) query.type = type;

    const skip = (page - 1) * limit;

    const [questions, total] = await Promise.all([
      Question.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Question.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: questions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('Error fetching questions:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/questions/random
// @desc    Get random questions
// @access  Public
router.get('/random', [
  check('level').optional().isIn(['N5', 'N4', 'N3', 'N2', 'N1']),
  check('type').optional().isIn(['vocabulary', 'grammar', 'kanji', 'reading']),
  check('limit').optional().isInt({ min: 1, max: 50 }).toInt()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { level, type, limit = 10 } = req.query;
    const filter = {};
    
    if (level) filter.level = level;
    if (type) filter.type = type;

    const questions = await Question.getRandomQuestions(filter, limit);
    
    res.json({
      success: true,
      count: questions.length,
      data: questions
    });
  } catch (err) {
    console.error('Error fetching random questions:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/questions
// @desc    Create a new question
// @access  Private/Admin
router.post('/', [
  authenticate,
  authorize('admin'),
  [
    check('type', 'Type is required').isIn(['vocabulary', 'grammar', 'kanji', 'reading']),
    check('level', 'Level is required').isIn(['N5', 'N4', 'N3', 'N2', 'N1']),
    check('question', 'Question text is required').not().isEmpty(),
    check('options', 'Options must be an array with at least 2 items').isArray({ min: 2 }),
    check('correct', 'Correct answer index is required').isInt({ min: 0 })
  ]
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type, level, question, options, correct, explanation, kanji } = req.body;

    // Create new question
    const newQuestion = new Question({
      type,
      level,
      question,
      options,
      correct,
      explanation,
      kanji,
      createdBy: req.user.id
    });

    const questionDoc = await newQuestion.save();
    
    res.status(201).json({
      success: true,
      data: questionDoc
    });
  } catch (err) {
    console.error('Error creating question:', err);
    
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(err.errors).map(e => e.message)
      });
    }
    
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/questions/:id
// @desc    Update a question
// @access  Private/Admin
router.put('/:id', [
  authenticate,
  authorize('admin'),
  [
    check('type', 'Type is required').optional().isIn(['vocabulary', 'grammar', 'kanji', 'reading']),
    check('level', 'Level is required').optional().isIn(['N5', 'N4', 'N3', 'N2', 'N1']),
    check('question', 'Question text is required').optional().not().isEmpty(),
    check('options', 'Options must be an array with at least 2 items').optional().isArray({ min: 2 }),
    check('correct', 'Correct answer index is required').optional().isInt({ min: 0 })
  ]
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const question = await Question.findById(req.params.id);
    
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    // Update fields
    const { type, level, question: questionText, options, correct, explanation, kanji } = req.body;
    
    if (type) question.type = type;
    if (level) question.level = level;
    if (questionText) question.question = questionText;
    if (options) question.options = options;
    if (correct !== undefined) question.correct = correct;
    if (explanation !== undefined) question.explanation = explanation;
    if (kanji !== undefined) question.kanji = kanji;

    const updatedQuestion = await question.save();
    
    res.json({
      success: true,
      data: updatedQuestion
    });
  } catch (err) {
    console.error('Error updating question:', err);
    
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(err.errors).map(e => e.message)
      });
    }
    
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/questions/:id
// @desc    Delete a question (soft delete)
// @access  Private/Admin
router.delete('/:id', [authenticate, authorize('admin')], async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    // Soft delete
    question.isActive = false;
    await question.save();
    
    res.json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error('Error deleting question:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
