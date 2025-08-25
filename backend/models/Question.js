const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['vocabulary', 'grammar', 'kanji', 'reading'],
    default: 'vocabulary'
  },
  level: {
    type: String,
    required: true,
    enum: ['N5', 'N4', 'N3', 'N2', 'N1'],
    default: 'N5'
  },
  question: {
    type: String,
    required: true,
    trim: true
  },
  kanji: {
    type: String,
    trim: true
  },
  options: {
    type: [String],
    required: true,
    validate: {
      validator: function(v) {
        return v.length >= 2 && v.length <= 5; // 2-5 options per question
      },
      message: 'A question must have between 2 and 5 options.'
    }
  },
  correct: {
    type: Number,
    required: true,
    validate: {
      validator: function(v) {
        return v >= 0 && v < this.options.length;
      },
      message: 'Correct answer index must be a valid option index.'
    }
  },
  explanation: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for faster querying
questionSchema.index({ type: 1, level: 1, isActive: 1 });
questionSchema.index({ question: 'text', explanation: 'text' });

// Pre-save hook to ensure correct answer index is valid
questionSchema.pre('save', function(next) {
  if (this.isModified('options') || this.isModified('correct')) {
    if (this.correct < 0 || this.correct >= this.options.length) {
      throw new Error('Correct answer index is out of bounds.');
    }
  }
  next();
});

// Static method to get random questions
questionSchema.statics.getRandomQuestions = async function(filter, limit = 10) {
  const matchStage = { $match: { ...filter, isActive: true } };
  const sampleStage = { $sample: { size: limit } };
  
  return this.aggregate([matchStage, sampleStage]);
};

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;
