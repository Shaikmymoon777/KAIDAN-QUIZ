const mongoose = require('mongoose');
const Question = require('./models/Question');
require('dotenv').config();

const sampleQuestions = [
  {
    type: 'vocabulary',
    level: 'N5',
    question: 'What does "こんにちは" mean?',
    options: ['Good morning', 'Hello/Good afternoon', 'Good evening', 'Goodbye'],
    correct: 1,
    explanation: '"こんにちは" is a common Japanese greeting used during the day.'
  },
  {
    type: 'vocabulary',
    level: 'N5',
    question: 'How do you say "book" in Japanese?',
    options: ['ほん (hon)', 'えんぴつ (enpitsu)', 'つくえ (tsukue)', 'いす (isu)'],
    correct: 0,
    explanation: 'The Japanese word for "book" is "ほん" (hon).'
  },
  {
    type: 'grammar',
    level: 'N5',
    question: 'Which particle indicates the direct object of a sentence?',
    options: ['は (wa)', 'が (ga)', 'を (wo)', 'に (ni)'],
    correct: 2,
    explanation: 'The particle "を" (wo) marks the direct object of a verb.'
  },
  {
    type: 'kanji',
    level: 'N5',
    question: 'What is the reading of this kanji: 人?',
    kanji: '人',
    options: ['いぬ (inu)', 'ひと (hito)', 'ねこ (neko)', 'いえ (ie)'],
    correct: 1,
    explanation: 'The kanji 人 is read as "ひと" (hito) and means "person".'
  },
  {
    type: 'reading',
    level: 'N5',
    question: 'Read the following: これはペンです。',
    options: ['Kore wa pen desu.', 'Sore wa hon desu.', 'Are wa kami desu.', 'Kore wa enpitsu desu.'],
    correct: 0,
    explanation: '"これはペンです。" translates to "This is a pen."'
  }
];

const seedDB = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Clear existing questions
    await Question.deleteMany({});
    console.log('Cleared existing questions');

    // Insert sample questions
    await Question.insertMany(sampleQuestions);
    console.log('Added sample questions');

    // Disconnect
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
