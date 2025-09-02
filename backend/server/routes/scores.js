const express = require('express');
const router = express.Router();
const Score = require('../models/scores');

router.post('/', async (req, res) => {
  try {
    const newScore = new Score(req.body);
    const savedScore = await newScore.save();
    res.status(201).json(savedScore);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const scores = await Score.find().sort({ date: -1 });
    res.json(scores);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;