const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  icon: { type: String, required: true },
  points: { type: Number, required: true, default: 10 },
  criteria: {
    type: { 
      type: String, 
      required: true,
      enum: ['quiz_score', 'streak', 'level_completion', 'total_quizzes', 'total_points']
    },
    threshold: { type: Number, required: true }
  },
  level: { 
    type: String,
    enum: ['N5', 'N4', 'N3', 'N2', 'N1', null],
    default: null
  },
  isHidden: { type: Boolean, default: false }
}, { timestamps: true });

const Achievement = mongoose.model('Achievement', achievementSchema);

module.exports = Achievement;
