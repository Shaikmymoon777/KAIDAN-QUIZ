const express = require('express');
const router = express.Router();
const Question = require('../models/Question');

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  // Implement your admin check logic here
  // For example, check if user has admin role in their JWT
  next();
};

// Get all questions with pagination
router.get('/questions', isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, type, level } = req.query;
    const query = {};
    
    if (type) query.type = type;
    if (level) query.level = level;
    
    const questions = await Question.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
      
    const count = await Question.countDocuments(query);
    
    res.json({
      questions,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalItems: count
    });
  } catch (err) {
    console.error('Error fetching questions:', err);
    res.status(500).json({ message: 'Error fetching questions' });
  }
});

// Create a new question
router.post('/questions', isAdmin, async (req, res) => {
  try {
    const question = new Question({
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    await question.save();
    res.status(201).json(question);
  } catch (err) {
    console.error('Error creating question:', err);
    res.status(500).json({ message: 'Error creating question', error: err.message });
  }
});

// Update a question
router.put('/questions/:id', isAdmin, async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(
      req.params.id,
      { 
        ...req.body,
        updatedAt: new Date() 
      },
      { new: true }
    );
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    
    res.json(question);
  } catch (err) {
    console.error('Error updating question:', err);
    res.status(500).json({ message: 'Error updating question' });
  }
});

// Delete a question
router.delete('/questions/:id', isAdmin, async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    
    res.json({ message: 'Question deleted successfully' });
  } catch (err) {
    console.error('Error deleting question:', err);
    res.status(500).json({ message: 'Error deleting question' });
  }
});

// Import questions from JSON
router.post('/questions/import', isAdmin, async (req, res) => {
  try {
    const { questions } = req.body;
    
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: 'No questions provided' });
    }
    
    // Add timestamps to each question
    const questionsWithTimestamps = questions.map(q => ({
      ...q,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    
    const result = await Question.insertMany(questionsWithTimestamps);
    res.json({ 
      message: `${result.length} questions imported successfully`,
      importedCount: result.length
    });
  } catch (err) {
    console.error('Error importing questions:', err);
    res.status(500).json({ message: 'Error importing questions', error: err.message });
  }
});

module.exports = router;
