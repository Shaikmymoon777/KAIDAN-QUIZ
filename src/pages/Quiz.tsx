import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Lock, 
  CheckCircle, 
  Clock, 
  Trophy, 
  Play,
  ArrowRight,
  Star,
  Target,
  Smile,
  ArrowLeft
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';

// Define the Question interface
interface Question {
  id: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

// Define valid level keys
type Level = 'n5' | 'n4' | 'n3' | 'n2' | 'n1';

// Define the structure of quizDataMap
interface QuizDataMap {
  [key: string]: {
    regular: { [key: number]: Question[] };
    grammar: { [key: number]: Question[] };
    reading: { [key: number]: Question[] };
  };
}

// Static imports for N5 quiz sets
import n5Set1 from '../data/n5/set1.json';
import n5Set2 from '../data/n5/set2.json';
import n5Set3 from '../data/n5/set3.json';
import n5Set4 from '../data/n5/set4.json';
import n5Set5 from '../data/n5/set5.json';
import n5Set6 from '../data/n5/set6.json';
import n5Set7 from '../data/n5/set7.json';
import n5GrammarSet1 from '../data/n5/grammar_set1.json';
import n5GrammarSet2 from '../data/n5/grammar_set2.json';
import n5GrammarSet3 from '../data/n5/grammar_set3.json';
import n5GrammarSet4 from '../data/n5/grammar_set4.json';
import n5GrammarSet5 from '../data/n5/grammar_set5.json';
import n5GrammarSet6 from '../data/n5/grammar_set6.json';
import n5GrammarSet7 from '../data/n5/grammar_set7.json';
import n5ReadingSet1 from '../data/n5/reading_set1.json';
import n5ReadingSet2 from '../data/n5/reading_set2.json';
import n5ReadingSet3 from '../data/n5/reading_set3.json';
import n5ReadingSet4 from '../data/n5/reading_set4.json';
import n5ReadingSet5 from '../data/n5/reading_set5.json';
import n5ReadingSet6 from '../data/n5/reading_set6.json';
import n5ReadingSet7 from '../data/n5/reading_set7.json';

// Map of all quiz data (only N5 populated)
const quizDataMap: QuizDataMap = {
  n5: {
    regular: {
      1: (n5Set1 as any[]).filter(
        (q): q is Question =>
          typeof q.id === 'string' &&
          typeof q.question === 'string' &&
          Array.isArray(q.options) &&
          typeof q.correct === 'number' &&
          typeof q.explanation === 'string'
      ),
      2: (n5Set2 as any[]).filter(
        (q): q is Question =>
          typeof q.id === 'string' &&
          typeof q.question === 'string' &&
          Array.isArray(q.options) &&
          typeof q.correct === 'number' &&
          typeof q.explanation === 'string'
      ),
      3: (n5Set3 as any[]).filter(
        (q): q is Question =>
          typeof q.id === 'string' &&
          typeof q.question === 'string' &&
          Array.isArray(q.options) &&
          typeof q.correct === 'number' &&
          typeof q.explanation === 'string'
      ),
      4: (n5Set4 as any[]).filter(
        (q): q is Question =>
          typeof q.id === 'string' &&
          typeof q.question === 'string' &&
          Array.isArray(q.options) &&
          typeof q.correct === 'number' &&
          typeof q.explanation === 'string'
      ),
      5: (n5Set5 as any[]).filter(
        (q): q is Question =>
          typeof q.id === 'string' &&
          typeof q.question === 'string' &&
          Array.isArray(q.options) &&
          typeof q.correct === 'number' &&
          typeof q.explanation === 'string'
      ),
      6: (n5Set6 as any[]).filter(
        (q): q is Question =>
          typeof q.id === 'string' &&
          typeof q.question === 'string' &&
          Array.isArray(q.options) &&
          typeof q.correct === 'number' &&
          typeof q.explanation === 'string'
      ),
      7: (n5Set7 as any[]).filter(
        (q): q is Question =>
          typeof q.id === 'string' &&
          typeof q.question === 'string' &&
          Array.isArray(q.options) &&
          typeof q.correct === 'number' &&
          typeof q.explanation === 'string'
      ),
    },
    grammar: {
      1: (n5GrammarSet1 as any[]).filter(
        (q): q is Question =>
          typeof q.id === 'string' &&
          typeof q.question === 'string' &&
          Array.isArray(q.options) &&
          typeof q.correct === 'number' &&
          typeof q.explanation === 'string'
      ),
      2: (n5GrammarSet2 as any[]).filter(
        (q): q is Question =>
          typeof q.id === 'string' &&
          typeof q.question === 'string' &&
          Array.isArray(q.options) &&
          typeof q.correct === 'number' &&
          typeof q.explanation === 'string'
      ),
      3: (n5GrammarSet3 as any[]).filter(
        (q): q is Question =>
          typeof q.id === 'string' &&
          typeof q.question === 'string' &&
          Array.isArray(q.options) &&
          typeof q.correct === 'number' &&
          typeof q.explanation === 'string'
      ),
      4: (n5GrammarSet4 as any[]).filter(
        (q): q is Question =>
          typeof q.id === 'string' &&
          typeof q.question === 'string' &&
          Array.isArray(q.options) &&
          typeof q.correct === 'number' &&
          typeof q.explanation === 'string'
      ),
      5: (n5GrammarSet5 as any[]).filter(
        (q): q is Question =>
          typeof q.id === 'string' &&
          typeof q.question === 'string' &&
          Array.isArray(q.options) &&
          typeof q.correct === 'number' &&
          typeof q.explanation === 'string'
      ),
      6: (n5GrammarSet6 as any[]).filter(
        (q): q is Question =>
          typeof q.id === 'string' &&
          typeof q.question === 'string' &&
          Array.isArray(q.options) &&
          typeof q.correct === 'number' &&
          typeof q.explanation === 'string'
      ),
      7: (n5GrammarSet7 as any[]).filter(
        (q): q is Question =>
          typeof q.id === 'string' &&
          typeof q.question === 'string' &&
          Array.isArray(q.options) &&
          typeof q.correct === 'number' &&
          typeof q.explanation === 'string'
      ),
    },
    reading: {
      1: (n5ReadingSet1 as any[])
        .map(q => ({ ...q, correct: q.correct ?? q.answer }))
        .filter(
          (q): q is Question =>
            typeof q.id === 'string' &&
            typeof q.question === 'string' &&
            Array.isArray(q.options) &&
            typeof q.correct === 'number' &&
            typeof q.explanation === 'string'
        ),
      2: (n5ReadingSet2 as any[])
        .map(q => ({ ...q, correct: q.correct ?? q.answer }))
        .filter(
          (q): q is Question =>
            typeof q.id === 'string' &&
            typeof q.question === 'string' &&
            Array.isArray(q.options) &&
            typeof q.correct === 'number' &&
            typeof q.explanation === 'string'
        ),
      3: (n5ReadingSet3 as any[])
        .map(q => ({ ...q, correct: q.correct ?? q.answer }))
        .filter(
          (q): q is Question =>
            typeof q.id === 'string' &&
            typeof q.question === 'string' &&
            Array.isArray(q.options) &&
            typeof q.correct === 'number' &&
            typeof q.explanation === 'string'
        ),
      4: (n5ReadingSet4 as any[])
        .map(q => ({ ...q, correct: q.correct ?? q.answer }))
        .filter(
          (q): q is Question =>
            typeof q.id === 'string' &&
            typeof q.question === 'string' &&
            Array.isArray(q.options) &&
            typeof q.correct === 'number' &&
            typeof q.explanation === 'string'
        ),
      5: (n5ReadingSet5 as any[])
        .map(q => ({ ...q, correct: q.correct ?? q.answer }))
        .filter(
          (q): q is Question =>
            typeof q.id === 'string' &&
            typeof q.question === 'string' &&
            Array.isArray(q.options) &&
            typeof q.correct === 'number' &&
            typeof q.explanation === 'string'
        ),
      6: (n5ReadingSet6 as any[])
        .map(q => ({ ...q, correct: q.correct ?? q.answer }))
        .filter(
          (q): q is Question =>
            typeof q.id === 'string' &&
            typeof q.question === 'string' &&
            Array.isArray(q.options) &&
            typeof q.correct === 'number' &&
            typeof q.explanation === 'string'
        ),
      7: (n5ReadingSet7 as any[])
        .map(q => ({ ...q, correct: q.correct ?? q.answer }))
        .filter(
          (q): q is Question =>
            typeof q.id === 'string' &&
            typeof q.question === 'string' &&
            Array.isArray(q.options) &&
            typeof q.correct === 'number' &&
            typeof q.explanation === 'string'
        ),
    },
  },
  n4: { regular: {}, grammar: {}, reading: {} },
  n3: { regular: {}, grammar: {}, reading: {} },
  n2: { regular: {}, grammar: {}, reading: {} },
  n1: { regular: {}, grammar: {}, reading: {} },
};

export default function Quiz() {
  const { state, dispatch } = useApp();
  const [selectedLevel, setSelectedLevel] = useState<Level>('n5');
  const [selectedSet, setSelectedSet] = useState<number | null>(null);
  const [selectedSetType, setSelectedSetType] = useState<'regular' | 'grammar' | 'reading'>('regular');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [timeStarted, setTimeStarted] = useState<number | null>(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [, setUserAnswers] = useState<Array<{ question: Question; selected: number; correct: boolean }>>([]);

  const levels = [
    { id: 'n5' as Level, name: 'N5', description: 'Beginner Level', color: 'bg-blue-500', emoji: '🌸' },
    { id: 'n4' as Level, name: 'N4', description: 'Elementary Level', color: 'bg-blue-600', emoji: '📖' },
    { id: 'n3' as Level, name: 'N3', description: 'Intermediate Level', color: 'bg-blue-700', emoji: '✨' },
    { id: 'n2' as Level, name: 'N2', description: 'Upper Intermediate', color: 'bg-blue-800', emoji: '🔥' },
    { id: 'n1' as Level, name: 'N1', description: 'Advanced Level', color: 'bg-blue-900', emoji: '🧠' },
  ];

  const loadQuestions = (level: Level, set: number, setType: 'regular' | 'grammar' | 'reading') => {
    try {
      if (level !== 'n5') {
        throw new Error(`Quiz sets for ${level} are not available`);
      }
      const allQuestions = quizDataMap[level][setType][set];
      if (!allQuestions || allQuestions.length === 0) {
        throw new Error(`No questions found for ${level} ${setType} set ${set}`);
      }
      const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
      setQuestions(shuffled.slice(0, 25));
    } catch (error) {
      console.error('Error loading questions:', error);
      const allQuestions = quizDataMap.n5.regular[1];
      const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
      setQuestions(shuffled.slice(0, 25));
    }
  };

  const isSetUnlocked = (level: Level, set: number, setType: 'regular' | 'grammar' | 'reading'): boolean => {
    if (level !== 'n5') return false;
    if (set === 1) return true;
    const levelProgress = state.quizProgress[level];
    if (!levelProgress) return false;
    const previousSetKey = setType === 'grammar' 
      ? `grammar_set${set - 1}` 
      : setType === 'reading'
      ? `reading_set${set - 1}`
      : `set${set - 1}`;
    const previousSet = levelProgress[previousSetKey];
    return previousSet?.completed && previousSet?.bestScore >= 60;
  };

  const getSetProgress = (level: Level, set: number, setType: 'regular' | 'grammar' | 'reading') => {
    const levelProgress = state.quizProgress[level];
    const setKey = setType === 'grammar' 
      ? `grammar_set${set}` 
      : setType === 'reading'
      ? `reading_set${set}`
      : `set${set}`;
    return levelProgress?.[setKey] || { completed: false, bestScore: 0, attempts: 0, timeSpent: 0 };
  };

  const startQuiz = (set: number, setType: 'regular' | 'grammar' | 'reading') => {
    if (selectedLevel !== 'n5') return;
    setSelectedSet(set);
    setSelectedSetType(setType);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setQuizCompleted(false);
    setTimeStarted(Date.now());
    setUserAnswers([]);
    loadQuestions(selectedLevel, set, setType);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(answerIndex);
    setShowExplanation(true);
    const isCorrect = answerIndex === questions[currentQuestion].correct;
    if (isCorrect) setScore(prev => prev + 1);
    setUserAnswers(prev => [...prev, {
      question: questions[currentQuestion],
      selected: answerIndex,
      correct: isCorrect
    }]);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      const finalScore = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
      const timeSpent = timeStarted ? Math.round((Date.now() - timeStarted) / 1000) : 0;
      dispatch({
        type: 'UPDATE_QUIZ_PROGRESS',
        payload: {
          level: selectedLevel,
          set: selectedSetType === 'grammar' 
            ? `grammar_set${selectedSet}` 
            : selectedSetType === 'reading'
            ? `reading_set${selectedSet}`
            : `set${selectedSet}`,
          score: finalScore,
          timeSpent
        }
      });
      setTimeSpent(timeSpent);
      setQuizCompleted(true);
    }
  };

  const resetQuiz = () => {
    setSelectedSet(null);
    setSelectedSetType('regular');
    setQuestions([]);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setQuizCompleted(false);
    setTimeStarted(null);
    setUserAnswers([]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Japanese Themed Background with Wave Patterns
  const JapaneseBackground = () => (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="wave" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
            <path d="M0 50 Q25 30 50 50 T100 50" fill="none" stroke="#e0f7fa" strokeWidth="1" opacity="0.2"/>
            <path d="M0 60 Q25 40 50 60 T100 60" fill="none" stroke="#e0f7fa" strokeWidth="1" opacity="0.1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#wave)"/>
      </svg>
    </div>
  );

  // --- Quiz in progress ---
  if (selectedSet && questions.length > 0 && !quizCompleted) {
    const question = questions[currentQuestion];
    return (
      <div className="min-h-screen bg-blue-50 dark:bg-gray-900 relative overflow-hidden">
        <style>
          {`
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(10px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
            .hover-scale:hover { transform: scale(1.05); transition: transform 0.3s ease; }
          `}
        </style>
        <JapaneseBackground />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            {/* Quiz Header */}
            <div className="flex items-center justify-between mb-8">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetQuiz}
                className="flex items-center space-x-2 text-blue-700 dark:text-blue-300 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-md hover:bg-blue-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft size={20} />
                <span>Back</span>
              </motion.button>
              <div>
                <h1 className="text-3xl font-bold text-blue-800 dark:text-blue-200 flex items-center gap-2">
                  {levels.find(l => l.id === selectedLevel)?.emoji}
                  {levels.find(l => l.id === selectedLevel)?.name} - {selectedSetType === 'grammar' ? 'Grammar ' : selectedSetType === 'reading' ? 'Reading ' : ''}Set {selectedSet}
                </h1>
                <p className="text-md text-gray-600 dark:text-gray-400">
                  Question {currentQuestion + 1} of {questions.length}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600 dark:text-gray-400">Score</div>
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {score}/{questions.length}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-8">
              <motion.div
                className="h-3 bg-blue-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            {/* Question */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8"
            >
              <h2 className="text-xl font-semibold text-blue-800 dark:text-blue-200 mb-4">
                {question.question}
              </h2>
              <div className="space-y-3">
                {question.options.map((option, index) => {
                  let buttonClass = "w-full p-3 text-left rounded-lg border transition-colors ";
                  if (selectedAnswer !== null) {
                    if (index === question.correct) {
                      buttonClass += "bg-green-100 dark:bg-green-900 border-green-500 text-green-700 dark:text-green-300";
                    } else if (index === selectedAnswer) {
                      buttonClass += "bg-red-100 dark:bg-red-900 border-red-500 text-red-700 dark:text-red-300";
                    } else {
                      buttonClass += "bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400";
                    }
                  } else {
                    buttonClass += "bg-white dark:bg-gray-800 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-gray-700";
                  }
                  return (
                    <motion.button
                      key={index}
                      whileHover={selectedAnswer === null ? { scale: 1.02 } : {}}
                      onClick={() => handleAnswerSelect(index)}
                      className={buttonClass}
                      disabled={selectedAnswer !== null}
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full border flex items-center justify-center font-medium">
                          {String.fromCharCode(65 + index)}
                        </div>
                        <span className="text-md">{option}</span>
                        {selectedAnswer !== null && index === question.correct && (
                          <CheckCircle className="ml-auto w-5 h-5" />
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

            {/* Explanation */}
            <AnimatePresence>
              {showExplanation && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-8"
                >
                  <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      Explanation
                    </h3>
                    <p className="text-blue-700 dark:text-blue-300">
                      {question.explanation}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Next Button */}
            {showExplanation && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={nextQuestion}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                >
                  {currentQuestion < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                  <ArrowRight size={18} className="inline ml-2" />
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  // --- Quiz completed ---
  if (quizCompleted) {
    const finalScore = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
    const passed = finalScore >= 60;
    return (
      <div className="min-h-screen bg-blue-50 dark:bg-gray-900 relative overflow-hidden">
        <style>
          {`
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(10px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
          `}
        </style>
        <JapaneseBackground />
        <div className="max-w-lg mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${passed ? 'bg-green-500' : 'bg-red-500'}`}
            >
              {passed ? (
                <Trophy className="w-8 h-8 text-white" />
              ) : (
                <Target className="w-8 h-8 text-white" />
              )}
            </motion.div>
            <h2 className="text-2xl font-semibold text-blue-800 dark:text-blue-200 mb-4">
              {passed ? 'Congratulations!' : 'Keep Practicing!'}
            </h2>
            <p className="text-md text-gray-600 dark:text-gray-400 mb-6">
              {passed 
                ? 'You passed the quiz! You can now proceed to the next set.'
                : 'You need 60% or higher to unlock the next set. Try again!'
              }
            </p>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">{finalScore}%</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Score</div>
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">{score}/{questions.length}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Correct</div>
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">{formatTime(timeSpent)}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Time</div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetQuiz}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
              >
                Back to Quiz Selection
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => startQuiz(selectedSet!, selectedSetType)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
              >
                Try Again
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // --- Quiz selection (Home Quiz Page) ---
  // Cherry Blossom Animation Component
  const CherryBlossoms = () => {
    const blossomTypes = [
      { emoji: '🌸', size: 1.0, speed: 1.0, rotation: 360 },
      { emoji: '🌸', size: 0.8, speed: 1.2, rotation: -360 },
      { emoji: '🌸', size: 1.2, speed: 0.8, rotation: 180 }
    ];

    return (
      <div className="cherry-blossom-container absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(25)].map((_, i) => {
          const type = blossomTypes[Math.floor(Math.random() * blossomTypes.length)];
          const startX = Math.random() * 100;
          const endX = startX + (Math.random() * 20 - 10);
          const delay = Math.random() * 10;
          const duration = 15 + Math.random() * 20;
          const size = 8 + Math.random() * 12;
          const opacity = 0.2 + Math.random() * 0.6;
          
          return (
            <div 
              key={i}
              className="cherry-blossom"
              style={{
                left: `${startX}%`,
                animationDelay: `${delay}s`,
                animationDuration: `${duration}s`,
                fontSize: `${size}px`,
                opacity: opacity,
                '--end-x': `${endX}%`,
                '--rotation': `${type.rotation}deg`
              } as React.CSSProperties}
            >
              {type.emoji}
            </div>
          );
        })}
        <style>
          {`
            .cherry-blossom {
              position: absolute;
              top: -50px;
              z-index: 0;
              animation: falling linear infinite;
              pointer-events: none;
              will-change: transform;
              filter: drop-shadow(0 0 2px rgba(255, 192, 203, 0.5));
            }
            
            @keyframes falling {
              0% {
                transform: translateY(-10vh) translateX(0) rotate(0deg);
                opacity: 0;
              }
              10% {
                opacity: 0.8;
              }
              90% {
                opacity: 0.8;
              }
              100% {
                transform: translateY(100vh) translateX(calc(var(--end-x) - 50%)) rotate(var(--rotation));
                opacity: 0;
              }
            }
          `}
        </style>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8 relative overflow-hidden">
      <CherryBlossoms />
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
          .hover-scale:hover { transform: scale(1.05); transition: transform 0.3s ease; }
        `}
      </style>
      <JapaneseBackground />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-4"
            >
              <Smile className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto" />
            </motion.div>
            <h1 className="text-5xl font-bold text-blue-800 dark:text-blue-200 mb-4">
              JLPT Quiz Hub
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Practice and master JLPT levels with interactive quizzes. Currently, only N5 quizzes are available!
            </p>
          </div>

          {/* Level Selection */}
          <motion.div className="mb-12">
            <h2 className="text-2xl font-semibold text-blue-800 dark:text-blue-200 mb-6 text-center">
              Choose Your Level
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {levels.map((level) => {
                const isAvailable = level.id === 'n5';
                return (
                  <motion.button
                    key={level.id}
                    whileHover={isAvailable ? { scale: 1.05 } : {}}
                    whileTap={isAvailable ? { scale: 0.95 } : {}}
                    onClick={() => isAvailable && setSelectedLevel(level.id)}
                    className={`p-4 rounded-lg shadow-md text-center transition-colors relative ${
                      selectedLevel === level.id
                        ? 'bg-blue-100 dark:bg-blue-900 border-blue-500'
                        : isAvailable
                        ? 'bg-white dark:bg-gray-800 border-blue-300 dark:border-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700'
                        : 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 cursor-not-allowed opacity-50'
                    }`}
                    disabled={!isAvailable}
                  >
                    <div className={`w-12 h-12 mx-auto mb-2 rounded-full ${level.color} flex items-center justify-center text-2xl text-white`}>
                      {level.emoji}
                    </div>
                    <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">
                      JLPT {level.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {level.description}
                    </p>
                    {!isAvailable && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 absolute bottom-2 left-0 right-0">
                        Coming Soon!
                      </p>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Only show sets if N5 is selected */}
          {selectedLevel === 'n5' && (
            <>
              {/* Regular Quiz Sets */}
              <motion.div
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center space-x-2 mb-6">
                  <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  <h2 className="text-2xl font-semibold text-blue-800 dark:text-blue-200">
                    N5 Quiz Sets
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 7 }, (_, i) => i + 1).map((setNumber) => {
                    const isUnlocked = isSetUnlocked(selectedLevel, setNumber, 'regular');
                    const progress = getSetProgress(selectedLevel, setNumber, 'regular');
                    return (
                      <motion.div
                        key={`regular-${setNumber}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={isUnlocked ? { scale: 1.05 } : {}}
                        transition={{ delay: setNumber * 0.05 }}
                        className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                          isUnlocked
                            ? 'bg-white dark:bg-gray-800 border-blue-300 dark:border-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700'
                            : 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 cursor-not-allowed opacity-50'
                        }`}
                        onClick={() => isUnlocked && startQuiz(setNumber, 'regular')}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h3 className={`text-md font-semibold ${
                            isUnlocked ? 'text-blue-800 dark:text-blue-200' : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            Set {setNumber}
                          </h3>
                          {!isUnlocked && (
                            <Lock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          )}
                          {progress.completed && (
                            <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400" />
                          )}
                        </div>
                        {progress.attempts > 0 && (
                          <div className="mb-3">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-600 dark:text-gray-400">Best Score</span>
                              <span className="font-semibold text-blue-600 dark:text-blue-400">{progress.bestScore}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="h-2 bg-blue-500 rounded-full"
                                style={{ width: `${progress.bestScore}%` }}
                              />
                            </div>
                          </div>
                        )}
                        {progress.attempts > 0 && (
                          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-3">
                            <span>{progress.attempts} attempts</span>
                            <span>
                              <Clock size={10} className="inline mr-1 text-blue-600 dark:text-blue-400" />
                              {formatTime(progress.timeSpent)}
                            </span>
                          </div>
                        )}
                        <motion.button
                          whileHover={isUnlocked ? { scale: 1.05 } : {}}
                          whileTap={isUnlocked ? { scale: 0.95 } : {}}
                          onClick={e => { e.stopPropagation(); isUnlocked && startQuiz(setNumber, 'regular'); }}
                          disabled={!isUnlocked}
                          className={`w-full py-2 px-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 ${
                            isUnlocked
                              ? 'bg-blue-500 text-white hover:bg-blue-600'
                              : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <Play size={14} />
                          <span>{progress.attempts > 0 ? 'Retake Quiz' : 'Start Quiz'}</span>
                        </motion.button>
                        {!isUnlocked && setNumber > 1 && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                            Complete Set {setNumber - 1} with 60%+ to unlock
                          </p>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Grammar Quiz Sets */}
              <motion.div
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center space-x-2 mb-6">
                  <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  <h2 className="text-2xl font-semibold text-blue-800 dark:text-blue-200">
                    N5 Grammar Quiz Sets
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 7 }, (_, i) => i + 1).map((setNumber) => {
                    const isUnlocked = isSetUnlocked(selectedLevel, setNumber, 'grammar');
                    const progress = getSetProgress(selectedLevel, setNumber, 'grammar');
                    return (
                      <motion.div
                        key={`grammar-${setNumber}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={isUnlocked ? { scale: 1.05 } : {}}
                        transition={{ delay: setNumber * 0.05 }}
                        className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                          isUnlocked
                            ? 'bg-white dark:bg-gray-800 border-blue-300 dark:border-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700'
                            : 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 cursor-not-allowed opacity-50'
                        }`}
                        onClick={() => isUnlocked && startQuiz(setNumber, 'grammar')}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h3 className={`text-md font-semibold ${
                            isUnlocked ? 'text-blue-800 dark:text-blue-200' : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            Grammar Set {setNumber}
                          </h3>
                          {!isUnlocked && (
                            <Lock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          )}
                          {progress.completed && (
                            <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400" />
                          )}
                        </div>
                        {progress.attempts > 0 && (
                          <div className="mb-3">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-600 dark:text-gray-400">Best Score</span>
                              <span className="font-semibold text-blue-600 dark:text-blue-400">{progress.bestScore}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="h-2 bg-blue-500 rounded-full"
                                style={{ width: `${progress.bestScore}%` }}
                              />
                            </div>
                          </div>
                        )}
                        {progress.attempts > 0 && (
                          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-3">
                            <span>{progress.attempts} attempts</span>
                            <span>
                              <Clock size={10} className="inline mr-1 text-blue-600 dark:text-blue-400" />
                              {formatTime(progress.timeSpent)}
                            </span>
                          </div>
                        )}
                        <motion.button
                          whileHover={isUnlocked ? { scale: 1.05 } : {}}
                          whileTap={isUnlocked ? { scale: 0.95 } : {}}
                          onClick={e => { e.stopPropagation(); isUnlocked && startQuiz(setNumber, 'grammar'); }}
                          disabled={!isUnlocked}
                          className={`w-full py-2 px-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 ${
                            isUnlocked
                              ? 'bg-blue-500 text-white hover:bg-blue-600'
                              : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <Play size={14} />
                          <span>{progress.attempts > 0 ? 'Retake Quiz' : 'Start Quiz'}</span>
                        </motion.button>
                        {!isUnlocked && setNumber > 1 && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                            Complete Grammar Set {setNumber - 1} with 60%+ to unlock
                          </p>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Reading Quiz Sets */}
              <motion.div
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center space-x-2 mb-6">
                  <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  <h2 className="text-2xl font-semibold text-blue-800 dark:text-blue-200">
                    N5 Reading Quiz Sets
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 7 }, (_, i) => i + 1).map((setNumber) => {
                    const isUnlocked = isSetUnlocked(selectedLevel, setNumber, 'reading');
                    const progress = getSetProgress(selectedLevel, setNumber, 'reading');
                    return (
                      <motion.div
                        key={`reading-${setNumber}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={isUnlocked ? { scale: 1.05 } : {}}
                        transition={{ delay: setNumber * 0.05 }}
                        className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                          isUnlocked
                            ? 'bg-white dark:bg-gray-800 border-blue-300 dark:border-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700'
                            : 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 cursor-not-allowed opacity-50'
                        }`}
                        onClick={() => isUnlocked && startQuiz(setNumber, 'reading')}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h3 className={`text-md font-semibold ${
                            isUnlocked ? 'text-blue-800 dark:text-blue-200' : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            Reading Set {setNumber}
                          </h3>
                          {!isUnlocked && (
                            <Lock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          )}
                          {progress.completed && (
                            <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400" />
                          )}
                        </div>
                        {progress.attempts > 0 && (
                          <div className="mb-3">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-600 dark:text-gray-400">Best Score</span>
                              <span className="font-semibold text-blue-600 dark:text-blue-400">{progress.bestScore}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="h-2 bg-blue-500 rounded-full"
                                style={{ width: `${progress.bestScore}%` }}
                              />
                            </div>
                          </div>
                        )}
                        {progress.attempts > 0 && (
                          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-3">
                            <span>{progress.attempts} attempts</span>
                            <span>
                              <Clock size={10} className="inline mr-1 text-blue-600 dark:text-blue-400" />
                              {formatTime(progress.timeSpent)}
                            </span>
                          </div>
                        )}
                        <motion.button
                          whileHover={isUnlocked ? { scale: 1.05 } : {}}
                          whileTap={isUnlocked ? { scale: 0.95 } : {}}
                          onClick={e => { e.stopPropagation(); isUnlocked && startQuiz(setNumber, 'reading'); }}
                          disabled={!isUnlocked}
                          className={`w-full py-2 px-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 ${
                            isUnlocked
                              ? 'bg-blue-500 text-white hover:bg-blue-600'
                              : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <Play size={14} />
                          <span>{progress.attempts > 0 ? 'Retake Quiz' : 'Start Quiz'}</span>
                        </motion.button>
                        {!isUnlocked && setNumber > 1 && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                            Complete Reading Set {setNumber - 1} with 60%+ to unlock
                          </p>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            </>
          )}

          {/* Message for non-N5 levels */}
          {selectedLevel !== 'n5' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center"
            >
              <h2 className="text-2xl font-semibold text-blue-800 dark:text-blue-200 mb-4">
                {levels.find(l => l.id === selectedLevel)?.name} Quizzes
              </h2>
              <p className="text-md text-gray-600 dark:text-gray-400">
                Quizzes for {levels.find(l => l.id === selectedLevel)?.name} are coming soon! Please select N5 to start practicing.
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}