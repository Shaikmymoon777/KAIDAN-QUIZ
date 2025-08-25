const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const router = express.Router();

// Path to the vocabulary JSON file
const vocabPath = path.join(__dirname, '..', '..', 'src', 'data', 'vocab', 'vocabulary.json');

// Get vocabulary questions
router.get('/questions', async (req, res, next) => {
  try {
    // Read the vocabulary file
    const data = await fs.readFile(vocabPath, 'utf8');
    let questions = JSON.parse(data);
    
    // Get query parameters
    const count = parseInt(req.query.count) || 10;
    const level = req.query.level || 'N5';
    
    // Shuffle and select requested number of questions
    questions = questions
      .sort(() => 0.5 - Math.random())
      .slice(0, count);
    
    res.json({
      success: true,
      count: questions.length,
      data: questions
    });
  } catch (err) {
    console.error('Error reading vocabulary file:', err);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

module.exports = router;
