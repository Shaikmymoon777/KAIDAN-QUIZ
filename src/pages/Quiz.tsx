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
    { id: 'n5' as Level, name: 'N5', description: 'Beginner Level', color: 'from-green-400 to-green-600', emoji: '🌱' },
    { id: 'n4' as Level, name: 'N4', description: 'Elementary Level', color: 'from-blue-400 to-blue-600', emoji: '📘' },
    { id: 'n3' as Level, name: 'N3', description: 'Intermediate Level', color: 'from-yellow-400 to-yellow-600', emoji: '🌟' },
    { id: 'n2' as Level, name: 'N2', description: 'Upper Intermediate', color: 'from-orange-400 to-orange-600', emoji: '🔥' },
    { id: 'n1' as Level, name: 'N1', description: 'Advanced Level', color: 'from-red-400 to-red-600', emoji: '🧠' },
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
      // Fallback to default N5 set1
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

  // Japanese Themed Background with Sakura Petal Animations
  const JapaneseBackground = () => (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      <div className="sakura-petal left-[10%] top-[-10%]"></div>
      <div className="sakura-petal left-[30%] top-[-20%] animation-delay-2s"></div>
      <div className="sakura-petal left-[50%] top-[-15%] animation-delay-4s"></div>
      <div className="sakura-petal left-[70%] top-[-25%] animation-delay-6s"></div>
      <div className="sakura-petal left-[90%] top-[-10%] animation-delay-8s"></div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-gradient-to-t from-red-500/50 to-transparent rounded-t-full animate-pulse"></div>
    </div>
  );

  // --- Quiz in progress ---
  if (selectedSet && questions.length > 0 && !quizCompleted) {
    const question = questions[currentQuestion];
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-400 via-yellow-300 to-cyan-400 dark:from-pink-900 dark:via-yellow-900 dark:to-cyan-900 relative overflow-hidden">
        <style>
          {`
            @keyframes sakura-fall {
              0% { transform: translateY(-20vh) rotate(0deg); opacity: 0.9; }
              100% { transform: translateY(100vh) rotate(720deg); opacity: 0.2; }
            }
            .sakura-petal {
              position: absolute;
              width: 12px;
              height: 12px;
              background: radial-gradient(circle, #ffb7c5 40%, #ff87b2 70%, transparent);
              clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
              animation: sakura-fall 8s linear infinite;
            }
            .animation-delay-2s { animation-delay: 2s; }
            .animation-delay-4s { animation-delay: 4s; }
            .animation-delay-6s { animation-delay: 6s; }
            .animation-delay-8s { animation-delay: 8s; }
            @keyframes wave {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-8px); }
            }
            .animate-wave { animation: wave 2s ease-in-out infinite; }
            @keyframes shake {
              0%, 100% { transform: translateX(0); }
              25% { transform: translateX(-5px); }
              75% { transform: translateX(5px); }
            }
            .animate-shake { animation: shake 0.3s ease-in-out 3; }
          `}
        </style>
        <JapaneseBackground />
        <div className="max-w-3xl mx-auto px-4 py-12">
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            {/* Quiz Header */}
            <div className="flex items-center justify-between mb-8">
              <motion.button
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetQuiz}
                className="flex items-center space-x-3 text-white bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 px-6 py-3 rounded-full font-bold shadow-2xl"
              >
                <ArrowLeft size={24} />
                <span>Back</span>
              </motion.button>
              <div>
                <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-cyan-600 flex items-center gap-2 animate-wave">
                  {levels.find(l => l.id === selectedLevel)?.emoji}
                  {levels.find(l => l.id === selectedLevel)?.name} - {selectedSetType === 'grammar' ? 'Grammar ' : selectedSetType === 'reading' ? 'Reading ' : ''}Set {selectedSet}
                </h1>
                <p className="text-lg text-gray-100 dark:text-gray-200">
                  Question {currentQuestion + 1} of {questions.length}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-100 dark:text-gray-200">Score</div>
                <div className="text-xl font-bold text-yellow-400 dark:text-yellow-300">
                  {score}/{questions.length}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-white/30 dark:bg-gray-700/30 rounded-full h-4 shadow-inner mb-8">
              <motion.div
                className="h-4 bg-gradient-to-r from-pink-500 via-yellow-400 to-cyan-500 rounded-full shadow-lg"
                initial={{ width: 0 }}
                animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              />
            </div>

            {/* Question */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-br from-white/90 to-yellow-200/90 dark:bg-gradient-to-br dark:from-gray-800/90 dark:to-yellow-800/90 rounded-3xl shadow-2xl p-8 mb-8 border-4 border-pink-400 dark:border-pink-700"
            >
              <h2 className="text-2xl font-extrabold text-pink-600 dark:text-pink-400 mb-6">
                {question.question}
              </h2>
              <div className="space-y-4">
                {question.options.map((option, index) => {
                  let buttonClass = "w-full p-4 text-left rounded-2xl border-2 transition-all duration-300 ";
                  if (selectedAnswer !== null) {
                    if (index === question.correct) {
                      buttonClass += "bg-gradient-to-r from-green-400 to-emerald-500 border-green-300 text-white";
                    } else if (index === selectedAnswer) {
                      buttonClass += "bg-gradient-to-r from-red-400 to-rose-500 border-red-300 text-white animate-shake";
                    } else {
                      buttonClass += "bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400";
                    }
                  } else {
                    buttonClass += "bg-gradient-to-r from-pink-300 to-yellow-300 dark:from-pink-700 dark:to-yellow-700 border-pink-200 dark:border-pink-600 text-pink-700 dark:text-pink-300 hover:bg-gradient-to-r hover:from-pink-400 hover:to-yellow-400 dark:hover:from-pink-600 dark:hover:to-yellow-600";
                  }
                  return (
                    <motion.button
                      key={index}
                      whileHover={selectedAnswer === null ? { scale: 1.1, rotate: 3, boxShadow: "0 10px 20px rgba(0,0,0,0.2)" } : {}}
                      whileTap={selectedAnswer === null ? { scale: 0.95 } : {}}
                      onClick={() => handleAnswerSelect(index)}
                      className={buttonClass}
                      disabled={selectedAnswer !== null}
                    >
                      <div className="flex items-center space-x-3">
                        <motion.div
                          whileHover={selectedAnswer === null ? { rotate: 8, scale: 1.1 } : {}}
                          className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center font-semibold text-lg"
                        >
                          {String.fromCharCode(65 + index)}
                        </motion.div>
                        <span className="text-lg font-semibold">{option}</span>
                        {selectedAnswer !== null && index === question.correct && (
                          <CheckCircle className="ml-auto w-6 h-6 text-white" />
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
                  <div className="p-6 bg-gradient-to-r from-blue-300 to-cyan-300 dark:from-blue-800 dark:to-cyan-800 rounded-2xl border-2 border-blue-400 dark:border-blue-700">
                    <h3 className="font-extrabold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2 text-lg">
                      <Star className="w-5 h-5 text-yellow-400 animate-pulse" />
                      Explanation:
                    </h3>
                    <p className="text-blue-700 dark:text-blue-200 text-lg">
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
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={nextQuestion}
                  className="px-8 py-3 bg-gradient-to-r from-pink-500 to-cyan-500 hover:from-pink-600 hover:to-cyan-600 text-white rounded-full font-bold shadow-2xl flex items-center space-x-2"
                >
                  <span>{currentQuestion < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}</span>
                  <ArrowRight size={20} />
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
      <div className="min-h-screen bg-gradient-to-br from-pink-400 via-yellow-300 to-cyan-400 dark:from-pink-900 dark:via-yellow-900 dark:to-cyan-900 relative overflow-hidden">
        <style>
          {`
            @keyframes sakura-fall {
              0% { transform: translateY(-20vh) rotate(0deg); opacity: 0.9; }
              100% { transform: translateY(100vh) rotate(720deg); opacity: 0.2; }
            }
            .sakura-petal {
              position: absolute;
              width: 12px;
              height: 12px;
              background: radial-gradient(circle, #ffb7c5 40%, #ff87b2 70%, transparent);
              clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
              animation: sakura-fall 8s linear infinite;
            }
            .animation-delay-2s { animation-delay: 2s; }
            .animation-delay-4s { animation-delay: 4s; }
            .animation-delay-6s { animation-delay: 6s; }
            .animation-delay-8s { animation-delay: 8s; }
            @keyframes wave {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-8px); }
            }
            .animate-wave { animation: wave 2s ease-in-out infinite; }
          `}
        </style>
        <JapaneseBackground />
        <div className="max-w-xl mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="bg-gradient-to-br from-white/90 to-yellow-200/90 dark:bg-gradient-to-br dark:from-gray-800/90 dark:to-yellow-800/90 rounded-3xl shadow-2xl p-8 border-4 border-pink-400 dark:border-pink-700 text-center"
          >
            <motion.div
              initial={{ scale: 0.7, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
              className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
                passed ? 'bg-gradient-to-br from-green-400 to-emerald-500' : 'bg-gradient-to-br from-red-400 to-rose-500'
              }`}
            >
              {passed ? (
                <Trophy className="w-10 h-10 text-white animate-wave" />
              ) : (
                <Target className="w-10 h-10 text-white animate-wave" />
              )}
            </motion.div>
            <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-cyan-600 mb-4">
              {passed ? 'Congratulations!' : 'Keep Practicing!'}
            </h2>
            <p className="text-lg text-gray-100 dark:text-gray-200 mb-8">
              {passed 
                ? 'You passed the quiz! You can now proceed to the next set.'
                : 'You need 60% or higher to unlock the next set. Try again!'
              }
            </p>
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-gradient-to-r from-gray-200/50 to-gray-300/50 dark:from-gray-700/50 dark:to-gray-600/50 rounded-2xl p-4">
                <div className="text-2xl font-extrabold text-yellow-400 dark:text-yellow-300">
                  {finalScore}%
                </div>
                <div className="text-sm text-gray-100 dark:text-gray-200">Score</div>
              </div>
              <div className="bg-gradient-to-r from-gray-200/50 to-gray-300/50 dark:from-gray-700/50 dark:to-gray-600/50 rounded-2xl p-4">
                <div className="text-2xl font-extrabold text-yellow-400 dark:text-yellow-300">
                  {score}/{questions.length}
                </div>
                <div className="text-sm text-gray-100 dark:text-gray-200">Correct</div>
              </div>
              <div className="bg-gradient-to-r from-gray-200/50 to-gray-300/50 dark:from-gray-700/50 dark:to-gray-600/50 rounded-2xl p-4">
                <div className="text-2xl font-extrabold text-yellow-400 dark:text-yellow-300">
                  {formatTime(timeSpent)}
                </div>
                <div className="text-sm text-gray-100 dark:text-gray-200">Time</div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetQuiz}
                className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-full font-bold shadow-2xl"
              >
                Back to Quiz Selection
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1, rotate: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => startQuiz(selectedSet!, selectedSetType)}
                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-cyan-500 hover:from-pink-600 hover:to-cyan-600 text-white rounded-full font-bold shadow-2xl"
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
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-400 via-yellow-300 to-cyan-400 dark:from-pink-900 dark:via-yellow-900 dark:to-cyan-900 relative overflow-hidden">
      <style>
        {`
          @keyframes sakura-fall {
            0% { transform: translateY(-20vh) rotate(0deg); opacity: 0.9; }
            100% { transform: translateY(100vh) rotate(720deg); opacity: 0.2; }
          }
          .sakura-petal {
            position: absolute;
            width: 12px;
            height: 12px;
            background: radial-gradient(circle, #ffb7c5 40%, #ff87b2 70%, transparent);
            clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
            animation: sakura-fall 8s linear infinite;
          }
          .animation-delay-2s { animation-delay: 2s; }
          .animation-delay-4s { animation-delay: 4s; }
          .animation-delay-6s { animation-delay: 6s; }
          .animation-delay-8s { animation-delay: 8s; }
          @keyframes wave {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
          }
          .animate-wave { animation: wave 2s ease-in-out infinite; }
        `}
      </style>
      <JapaneseBackground />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0.8, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="mb-6"
            >
              <Smile className="w-16 h-16 text-pink-600 dark:text-pink-400 mx-auto animate-wave" />
            </motion.div>
            <motion.h1
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-cyan-600 mb-4"
            >
              JLPT Quiz Hub
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-2xl text-gray-100 dark:text-gray-200 max-w-3xl mx-auto"
            >
              Practice and master JLPT levels with interactive quizzes.<br />
              Currently, only N5 quizzes are available!
            </motion.p>
          </div>

          {/* Level Selection */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-cyan-600 mb-6 text-center">
              Choose Your Level
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-6">
              {levels.map((level) => {
                const isAvailable = level.id === 'n5';
                return (
                  <motion.button
                    key={level.id}
                    whileHover={isAvailable ? { scale: 1.1, rotate: 4, boxShadow: "0 15px 30px rgba(0,0,0,0.3)" } : {}}
                    whileTap={isAvailable ? { scale: 0.95 } : {}}
                    onClick={() => isAvailable && setSelectedLevel(level.id)}
                    className={`p-6 rounded-3xl shadow-2xl text-center transition-all duration-300 relative border-4 ${
                      selectedLevel === level.id
                        ? 'bg-gradient-to-br from-white/90 to-yellow-200/90 dark:bg-gradient-to-br dark:from-gray-800/90 dark:to-yellow-800/90 border-yellow-400 dark:border-yellow-700'
                        : isAvailable
                        ? 'bg-gradient-to-br from-pink-300 to-yellow-300 dark:from-pink-700 dark:to-yellow-700 border-pink-400 dark:border-pink-600 hover:bg-gradient-to-br hover:from-pink-400 hover:to-yellow-400 dark:hover:from-pink-600 dark:hover:to-yellow-600'
                        : 'bg-gradient-to-br from-gray-200/50 to-gray-300/50 dark:from-gray-700/50 dark:to-gray-600/50 border-gray-300 dark:border-gray-600 cursor-not-allowed opacity-70'
                    }`}
                    disabled={!isAvailable}
                  >
                    <motion.div
                      className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${level.color} flex items-center justify-center text-3xl animate-wave`}
                      whileHover={isAvailable ? { scale: 1.15, rotate: 8 } : {}}
                    >
                      {level.emoji}
                    </motion.div>
                    <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-1">
                      JLPT {level.name}
                    </h3>
                    <p className="text-sm text-gray-100 dark:text-gray-200">
                      {level.description}
                    </p>
                    {!isAvailable && (
                      <p className="text-xs text-gray-100 dark:text-gray-200 mt-2 absolute bottom-2 left-0 right-0">
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
                className="bg-gradient-to-br from-white/90 to-yellow-200/90 dark:bg-gradient-to-br dark:from-gray-800/90 dark:to-yellow-800/90 rounded-3xl shadow-2xl p-8 mb-8 border-4 border-pink-400 dark:border-pink-700"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
              >
                <div className="flex items-center space-x-3 mb-8">
                  <BookOpen className="w-8 h-8 text-pink-600 dark:text-pink-400 animate-pulse" />
                  <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-cyan-600">
                    N5 Quiz Sets
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {Array.from({ length: 7 }, (_, i) => i + 1).map((setNumber) => {
                    const isUnlocked = isSetUnlocked(selectedLevel, setNumber, 'regular');
                    const progress = getSetProgress(selectedLevel, setNumber, 'regular');
                    return (
                      <motion.div
                        key={`regular-${setNumber}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={isUnlocked ? { scale: 1.1, rotate: 4, boxShadow: "0 15px 30px rgba(0,0,0,0.3)" } : {}}
                        transition={{ delay: setNumber * 0.07 }}
                        className={`relative p-6 rounded-3xl border-4 transition-all duration-300 cursor-pointer ${
                          isUnlocked
                            ? 'bg-gradient-to-br from-pink-300 to-yellow-300 dark:from-pink-700 dark:to-yellow-700 border-pink-400 dark:border-pink-600 hover:bg-gradient-to-br hover:from-pink-400 hover:to-yellow-400 dark:hover:from-pink-600 dark:hover:to-yellow-600'
                            : 'bg-gradient-to-br from-gray-200/50 to-gray-300/50 dark:from-gray-700/50 dark:to-gray-600/50 border-gray-300 dark:border-gray-600 cursor-not-allowed opacity-70'
                        }`}
                        onClick={() => isUnlocked && startQuiz(setNumber, 'regular')}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h3 className={`text-lg font-extrabold ${
                            isUnlocked ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'
                          }`}>
                            Set {setNumber}
                          </h3>
                          {!isUnlocked && (
                            <Lock className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                          )}
                          {progress.completed && (
                            <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400 animate-pulse" />
                          )}
                        </div>
                        {progress.attempts > 0 && (
                          <div className="mb-4">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-100 dark:text-gray-200">Best Score</span>
                              <span className="font-extrabold text-yellow-400 dark:text-yellow-300">
                                {progress.bestScore}%
                              </span>
                            </div>
                            <div className="w-full bg-white/30 dark:bg-gray-700/30 rounded-full h-2">
                              <div
                                className="h-2 bg-gradient-to-r from-pink-500 via-yellow-400 to-cyan-500 rounded-full"
                                style={{ width: `${progress.bestScore}%` }}
                              />
                            </div>
                          </div>
                        )}
                        {progress.attempts > 0 && (
                          <div className="flex items-center justify-between text-xs text-gray-100 dark:text-gray-200 mb-4">
                            <span>{progress.attempts} attempts</span>
                            <span>
                              <Clock size={12} className="inline mr-1 text-yellow-400 dark:text-yellow-300" />
                              {formatTime(progress.timeSpent)}
                            </span>
                          </div>
                        )}
                        <motion.button
                          whileHover={isUnlocked ? { scale: 1.1, rotate: 5 } : {}}
                          whileTap={isUnlocked ? { scale: 0.95 } : {}}
                          onClick={e => { e.stopPropagation(); isUnlocked && startQuiz(setNumber, 'regular'); }}
                          disabled={!isUnlocked}
                          className={`w-full py-3 px-4 rounded-full font-bold shadow-2xl transition-colors flex items-center justify-center space-x-2 ${
                            isUnlocked
                              ? 'bg-gradient-to-r from-pink-500 to-cyan-500 hover:from-pink-600 hover:to-cyan-600 text-white'
                              : 'bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          <Play size={16} />
                          <span>{progress.attempts > 0 ? 'Retake Quiz' : 'Start Quiz'}</span>
                        </motion.button>
                        {!isUnlocked && setNumber > 1 && (
                          <p className="text-xs text-gray-100 dark:text-gray-200 mt-2 text-center">
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
                className="bg-gradient-to-br from-white/90 to-yellow-200/90 dark:bg-gradient-to-br dark:from-gray-800/90 dark:to-yellow-800/90 rounded-3xl shadow-2xl p-8 mb-8 border-4 border-pink-400 dark:border-pink-700"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <div className="flex items-center space-x-3 mb-8">
                  <BookOpen className="w-8 h-8 text-pink-600 dark:text-pink-400 animate-pulse" />
                  <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-cyan-600">
                    N5 Grammar Quiz Sets
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {Array.from({ length: 7 }, (_, i) => i + 1).map((setNumber) => {
                    const isUnlocked = isSetUnlocked(selectedLevel, setNumber, 'grammar');
                    const progress = getSetProgress(selectedLevel, setNumber, 'grammar');
                    return (
                      <motion.div
                        key={`grammar-${setNumber}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={isUnlocked ? { scale: 1.1, rotate: 4, boxShadow: "0 15px 30px rgba(0,0,0,0.3)" } : {}}
                        transition={{ delay: setNumber * 0.07 }}
                        className={`relative p-6 rounded-3xl border-4 transition-all duration-300 cursor-pointer ${
                          isUnlocked
                            ? 'bg-gradient-to-br from-pink-300 to-yellow-300 dark:from-pink-700 dark:to-yellow-700 border-pink-400 dark:border-pink-600 hover:bg-gradient-to-br hover:from-pink-400 hover:to-yellow-400 dark:hover:from-pink-600 dark:hover:to-yellow-600'
                            : 'bg-gradient-to-br from-gray-200/50 to-gray-300/50 dark:from-gray-700/50 dark:to-gray-600/50 border-gray-300 dark:border-gray-600 cursor-not-allowed opacity-70'
                        }`}
                        onClick={() => isUnlocked && startQuiz(setNumber, 'grammar')}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h3 className={`text-lg font-extrabold ${
                            isUnlocked ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'
                          }`}>
                            Grammar Set {setNumber}
                          </h3>
                          {!isUnlocked && (
                            <Lock className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                          )}
                          {progress.completed && (
                            <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400 animate-pulse" />
                          )}
                        </div>
                        {progress.attempts > 0 && (
                          <div className="mb-4">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-100 dark:text-gray-200">Best Score</span>
                              <span className="font-extrabold text-yellow-400 dark:text-yellow-300">
                                {progress.bestScore}%
                              </span>
                            </div>
                            <div className="w-full bg-white/30 dark:bg-gray-700/30 rounded-full h-2">
                              <div
                                className="h-2 bg-gradient-to-r from-pink-500 via-yellow-400 to-cyan-500 rounded-full"
                                style={{ width: `${progress.bestScore}%` }}
                              />
                            </div>
                          </div>
                        )}
                        {progress.attempts > 0 && (
                          <div className="flex items-center justify-between text-xs text-gray-100 dark:text-gray-200 mb-4">
                            <span>{progress.attempts} attempts</span>
                            <span>
                              <Clock size={12} className="inline mr-1 text-yellow-400 dark:text-yellow-300" />
                              {formatTime(progress.timeSpent)}
                            </span>
                          </div>
                        )}
                        <motion.button
                          whileHover={isUnlocked ? { scale: 1.1, rotate: 5 } : {}}
                          whileTap={isUnlocked ? { scale: 0.95 } : {}}
                          onClick={e => { e.stopPropagation(); isUnlocked && startQuiz(setNumber, 'grammar'); }}
                          disabled={!isUnlocked}
                          className={`w-full py-3 px-4 rounded-full font-bold shadow-2xl transition-colors flex items-center justify-center space-x-2 ${
                            isUnlocked
                              ? 'bg-gradient-to-r from-pink-500 to-cyan-500 hover:from-pink-600 hover:to-cyan-600 text-white'
                              : 'bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          <Play size={16} />
                          <span>{progress.attempts > 0 ? 'Retake Quiz' : 'Start Quiz'}</span>
                        </motion.button>
                        {!isUnlocked && setNumber > 1 && (
                          <p className="text-xs text-gray-100 dark:text-gray-200 mt-2 text-center">
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
                className="bg-gradient-to-br from-white/90 to-yellow-200/90 dark:bg-gradient-to-br dark:from-gray-800/90 dark:to-yellow-800/90 rounded-3xl shadow-2xl p-8 border-4 border-pink-400 dark:border-pink-700"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.9 }}
              >
                <div className="flex items-center space-x-3 mb-8">
                  <BookOpen className="w-8 h-8 text-pink-600 dark:text-pink-400 animate-pulse" />
                  <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-cyan-600">
                    N5 Reading Quiz Sets
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {Array.from({ length: 7 }, (_, i) => i + 1).map((setNumber) => {
                    const isUnlocked = isSetUnlocked(selectedLevel, setNumber, 'reading');
                    const progress = getSetProgress(selectedLevel, setNumber, 'reading');
                    return (
                      <motion.div
                        key={`reading-${setNumber}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={isUnlocked ? { scale: 1.1, rotate: 4, boxShadow: "0 15px 30px rgba(0,0,0,0.3)" } : {}}
                        transition={{ delay: setNumber * 0.07 }}
                        className={`relative p-6 rounded-3xl border-4 transition-all duration-300 cursor-pointer ${
                          isUnlocked
                            ? 'bg-gradient-to-br from-pink-300 to-yellow-300 dark:from-pink-700 dark:to-yellow-700 border-pink-400 dark:border-pink-600 hover:bg-gradient-to-br hover:from-pink-400 hover:to-yellow-400 dark:hover:from-pink-600 dark:hover:to-yellow-600'
                            : 'bg-gradient-to-br from-gray-200/50 to-gray-300/50 dark:from-gray-700/50 dark:to-gray-600/50 border-gray-300 dark:border-gray-600 cursor-not-allowed opacity-70'
                        }`}
                        onClick={() => isUnlocked && startQuiz(setNumber, 'reading')}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h3 className={`text-lg font-extrabold ${
                            isUnlocked ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'
                          }`}>
                            Reading Set {setNumber}
                          </h3>
                          {!isUnlocked && (
                            <Lock className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                          )}
                          {progress.completed && (
                            <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400 animate-pulse" />
                          )}
                        </div>
                        {progress.attempts > 0 && (
                          <div className="mb-4">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-100 dark:text-gray-200">Best Score</span>
                              <span className="font-extrabold text-yellow-400 dark:text-yellow-300">
                                {progress.bestScore}%
                              </span>
                            </div>
                            <div className="w-full bg-white/30 dark:bg-gray-700/30 rounded-full h-2">
                              <div
                                className="h-2 bg-gradient-to-r from-pink-500 via-yellow-400 to-cyan-500 rounded-full"
                                style={{ width: `${progress.bestScore}%` }}
                              />
                            </div>
                          </div>
                        )}
                        {progress.attempts > 0 && (
                          <div className="flex items-center justify-between text-xs text-gray-100 dark:text-gray-200 mb-4">
                            <span>{progress.attempts} attempts</span>
                            <span>
                              <Clock size={12} className="inline mr-1 text-yellow-400 dark:text-yellow-300" />
                              {formatTime(progress.timeSpent)}
                            </span>
                          </div>
                        )}
                        <motion.button
                          whileHover={isUnlocked ? { scale: 1.1, rotate: 5 } : {}}
                          whileTap={isUnlocked ? { scale: 0.95 } : {}}
                          onClick={e => { e.stopPropagation(); isUnlocked && startQuiz(setNumber, 'reading'); }}
                          disabled={!isUnlocked}
                          className={`w-full py-3 px-4 rounded-full font-bold shadow-2xl transition-colors flex items-center justify-center space-x-2 ${
                            isUnlocked
                              ? 'bg-gradient-to-r from-pink-500 to-cyan-500 hover:from-pink-600 hover:to-cyan-600 text-white'
                              : 'bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          <Play size={16} />
                          <span>{progress.attempts > 0 ? 'Retake Quiz' : 'Start Quiz'}</span>
                        </motion.button>
                        {!isUnlocked && setNumber > 1 && (
                          <p className="text-xs text-gray-100 dark:text-gray-200 mt-2 text-center">
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
              transition={{ duration: 0.8, delay: 0.7 }}
              className="bg-gradient-to-br from-white/90 to-yellow-200/90 dark:bg-gradient-to-br dark:from-gray-800/90 dark:to-yellow-800/90 rounded-3xl shadow-2xl p-8 border-4 border-pink-400 dark:border-pink-700 text-center"
            >
              <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-cyan-600 mb-4">
                {levels.find(l => l.id === selectedLevel)?.name} Quizzes
              </h2>
              <p className="text-lg text-gray-100 dark:text-gray-200">
                Quizzes for {levels.find(l => l.id === selectedLevel)?.name} are coming soon! Please select N5 to start practicing.
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}