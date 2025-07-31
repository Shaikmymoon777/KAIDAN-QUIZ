const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/japanese-learning', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB Atlas for migration'))
.catch(err => console.error('MongoDB connection error:', err));

// Quiz Questions Schema
const quizQuestionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correct: { type: Number, required: true },
  explanation: { type: String, required: true },
  level: { type: String, required: true },
  category: { type: String, required: true },
  setId: { type: String, required: true },
});
const QuizQuestion = mongoose.model('QuizQuestion', quizQuestionSchema);

// Flashcards Schema
const flashcardSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  character: { type: String, required: true },
  romaji: { type: String, required: true },
  meaning: { type: String, required: true },
  type: { type: String, required: true },
});
const Flashcard = mongoose.model('Flashcard', flashcardSchema);

// Function to read JSON file
function readJsonFile(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return null;
  }
}

// Function to migrate quiz questions
async function migrateQuizQuestions() {
  console.log('Starting quiz questions migration...');
  
  const dataPath = path.join(__dirname, '..', 'src', 'data', 'n5');
  const files = fs.readdirSync(dataPath);
  
  for (const file of files) {
    if (file.endsWith('.json') && !file.includes('grammar') && !file.includes('reading')) {
      const setId = file.replace('.json', '');
      const filePath = path.join(dataPath, file);
      const questions = readJsonFile(filePath);
      
      if (questions) {
        console.log(`Migrating ${setId}...`);
        
        for (const question of questions) {
          try {
            await QuizQuestion.findOneAndUpdate(
              { id: question.id },
              {
                ...question,
                level: 'N5',
                category: 'vocabulary',
                setId: setId
              },
              { upsert: true, new: true }
            );
          } catch (error) {
            console.error(`Error migrating question ${question.id}:`, error);
          }
        }
        console.log(`✅ Migrated ${questions.length} questions from ${setId}`);
      }
    }
  }
}

// Function to migrate grammar questions
async function migrateGrammarQuestions() {
  console.log('Starting grammar questions migration...');
  
  const dataPath = path.join(__dirname, '..', 'src', 'data', 'n5');
  const files = fs.readdirSync(dataPath);
  
  for (const file of files) {
    if (file.includes('grammar_set')) {
      const setId = file.replace('.json', '');
      const filePath = path.join(dataPath, file);
      const questions = readJsonFile(filePath);
      
      if (questions) {
        console.log(`Migrating ${setId}...`);
        
        for (const question of questions) {
          try {
            await QuizQuestion.findOneAndUpdate(
              { id: question.id },
              {
                ...question,
                level: 'N5',
                category: 'grammar',
                setId: setId
              },
              { upsert: true, new: true }
            );
          } catch (error) {
            console.error(`Error migrating question ${question.id}:`, error);
          }
        }
        console.log(`✅ Migrated ${questions.length} questions from ${setId}`);
      }
    }
  }
}

// Function to migrate reading questions
async function migrateReadingQuestions() {
  console.log('Starting reading questions migration...');
  
  const dataPath = path.join(__dirname, '..', 'src', 'data', 'n5');
  const files = fs.readdirSync(dataPath);
  
  for (const file of files) {
    if (file.includes('reading_set')) {
      const setId = file.replace('.json', '');
      const filePath = path.join(dataPath, file);
      const questions = readJsonFile(filePath);
      
      if (questions) {
        console.log(`Migrating ${setId}...`);
        
        for (const question of questions) {
          try {
            await QuizQuestion.findOneAndUpdate(
              { id: question.id },
              {
                ...question,
                level: 'N5',
                category: 'reading',
                setId: setId
              },
              { upsert: true, new: true }
            );
          } catch (error) {
            console.error(`Error migrating question ${question.id}:`, error);
          }
        }
        console.log(`✅ Migrated ${questions.length} questions from ${setId}`);
      }
    }
  }
}

// Function to migrate flashcards
async function migrateFlashcards() {
  console.log('Starting flashcards migration...');
  
  const flashcardPath = path.join(__dirname, '..', 'src', 'data', 'flashcards');
  const files = fs.readdirSync(flashcardPath);
  
  for (const file of files) {
    if (file.endsWith('.json')) {
      const type = file.replace('.json', '');
      const filePath = path.join(flashcardPath, file);
      const flashcards = readJsonFile(filePath);
      
      if (flashcards) {
        console.log(`Migrating ${type} flashcards...`);
        
        for (const flashcard of flashcards) {
          try {
            await Flashcard.findOneAndUpdate(
              { id: flashcard.id },
              {
                ...flashcard,
                type: type
              },
              { upsert: true, new: true }
            );
          } catch (error) {
            console.error(`Error migrating flashcard ${flashcard.id}:`, error);
          }
        }
        console.log(`✅ Migrated ${flashcards.length} flashcards from ${type}`);
      }
    }
  }
}

// Main migration function
async function runMigration() {
  try {
    console.log('🚀 Starting data migration to MongoDB Atlas...');
    
    // Clear existing data (optional - comment out if you want to keep existing data)
    // await QuizQuestion.deleteMany({});
    // await Flashcard.deleteMany({});
    
    // Run migrations
    await migrateQuizQuestions();
    await migrateGrammarQuestions();
    await migrateReadingQuestions();
    await migrateFlashcards();
    
    console.log('✅ Migration completed successfully!');
    
    // Get counts
    const questionCount = await QuizQuestion.countDocuments();
    const flashcardCount = await Flashcard.countDocuments();
    
    console.log(`📊 Migration Summary:`);
    console.log(`   - Quiz Questions: ${questionCount}`);
    console.log(`   - Flashcards: ${flashcardCount}`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  runMigration();
}

module.exports = { runMigration }; 