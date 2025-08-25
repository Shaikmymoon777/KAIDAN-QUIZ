const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Question', 
    required: true 
  },
  selected: { 
    type: Number, 
    required: true 
  },
  correct: { 
    type: Boolean, 
    required: true 
  },
  feedback: { 
    type: String 
  }
});

const examResultSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  userName: { 
    type: String, 
    required: true 
  },
  level: { 
    type: String, 
    required: true, 
    enum: ['N5', 'N4', 'N3', 'N2', 'N1'] 
  },
  score: { 
    type: Number, 
    required: true,
    min: 0
  },
  totalQuestions: { 
    type: Number, 
    required: true,
    min: 1
  },
  percentage: { 
    type: Number, 
    required: true,
    min: 0,
    max: 100
  },
  answers: [answerSchema],
  completedAt: { 
    type: Date, 
    default: Date.now 
  },
  timeSpent: { 
    type: Number,
    required: true,
    min: 0
  }
}, { collection: 'examresults' });

// Add indexes for faster queries
examResultSchema.index({ userId: 1, completedAt: -1 });
examResultSchema.index({ level: 1, score: -1 });

// Add pre-save hook to calculate percentage
examResultSchema.pre('save', function(next) {
  if (this.isModified('score') || this.isModified('totalQuestions')) {
    this.percentage = Math.round((this.score / this.totalQuestions) * 100);
  }
  next();
});

module.exports = mongoose.model('ExamResult', examResultSchema);
