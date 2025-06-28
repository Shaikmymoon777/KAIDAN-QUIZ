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
  Smile
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';

interface Question {
  id: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export default function Quiz() {
  const { state, dispatch } = useApp();
  const [selectedLevel, setSelectedLevel] = useState('n5');
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
  const [, setUserAnswers] = useState<Array<{question: Question, selected: number, correct: boolean}>>([]);

  const levels = [
    { id: 'n5', name: 'N5', description: 'Beginner Level', color: 'from-green-400 to-green-600', emoji: '🌱' },
    { id: 'n4', name: 'N4', description: 'Elementary Level', color: 'from-blue-400 to-blue-600', emoji: '📘' },
    { id: 'n3', name: 'N3', description: 'Intermediate Level', color: 'from-yellow-400 to-yellow-600', emoji: '🌟' },
    { id: 'n2', name: 'N2', description: 'Upper Intermediate', color: 'from-orange-400 to-orange-600', emoji: '🔥' },
    { id: 'n1', name: 'N1', description: 'Advanced Level', color: 'from-red-400 to-red-600', emoji: '🧠' },
  ];

  const loadQuestions = async (level: string, set: number, setType: 'regular' | 'grammar' | 'reading') => {
    try {
      const filePath = setType === 'grammar' 
        ? `../data/${level}/grammar_set${set}.json`
        : setType === 'reading'
        ? `../data/${level}/reading_set${set}.json`
        : `../data/${level}/set${set}.json`;
      const response = await import(filePath);
      const allQuestions = response.default;
      const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
      setQuestions(
        shuffled
          .filter(
            (q): q is Question =>
              typeof q.id === 'string' &&
              typeof q.question === 'string' &&
              Array.isArray(q.options) &&
              typeof q.correct === 'number' &&
              typeof q.explanation === 'string'
          )
          .slice(0, 25)
      );
    } catch (error) {
      // Fallback to default N5 set1 if loading fails
      const response = await import('../data/n5/set1.json');
      const allQuestions = response.default;
      const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
      setQuestions(
        shuffled
          .filter(
            (q): q is Question =>
              typeof q.id === 'string' &&
              typeof q.question === 'string' &&
              Array.isArray(q.options) &&
              typeof q.correct === 'number' &&
              typeof q.explanation === 'string'
          )
          .slice(0, 25)
      );
    }
  };

  const isSetUnlocked = (level: string, set: number, setType: 'regular' | 'grammar' | 'reading'): boolean => {
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

  const getSetProgress = (level: string, set: number, setType: 'regular' | 'grammar' | 'reading') => {
    const levelProgress = state.quizProgress[level];
    const setKey = setType === 'grammar' 
      ? `grammar_set${set}` 
      : setType === 'reading'
      ? `reading_set${set}`
      : `set${set}`;
    return levelProgress?.[setKey] || { completed: false, bestScore: 0, attempts: 0, timeSpent: 0 };
  };

  const startQuiz = (set: number, setType: 'regular' | 'grammar' | 'reading') => {
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
      const finalScore = Math.round((score / questions.length) * 100);
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

  // Japanese Themed Background with CSS Animations
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto px-4 py-12"
        >
          <div className="bg-white/90 dark:bg-gray-900/90 rounded-3xl shadow-2xl p-8 border-4 border-yellow-400 dark:border-yellow-700">
            {/* Quiz Header */}
            <motion.div
              className="flex items-center justify-between mb-8"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center space-x-4">
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetQuiz}
                  className="flex items-center space-x-2 text-white bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 px-6 py-3 rounded-full font-bold shadow-2xl"
                >
                  <ArrowRight className="rotate-180" size={24} />
                  <span>Back</span>
                </motion.button>
                <div>
                  <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-cyan-600 flex items-center gap-2">
                    {levels.find(l => l.id === selectedLevel)?.emoji}
                    {levels.find(l => l.id === selectedLevel)?.name} - {selectedSetType === 'grammar' ? 'Grammar ' : selectedSetType === 'reading' ? 'Reading ' : ''}Set {selectedSet}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 font-semibold">
                    Question {currentQuestion + 1} of {questions.length}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500 dark:text-gray-300 font-semibold">Score</div>
                <div className="text-xl font-extrabold text-pink-600 dark:text-pink-400">
                  {score}/{questions.length}
                </div>
              </div>
            </motion.div>

            {/* Progress Bar */}
            <div className="w-full bg-white/30 dark:bg-gray-700/30 rounded-full h-4 mb-8 shadow-inner">
              <motion.div
                className="h-4 bg-gradient-to-r from-pink-500 via-yellow-400 to-cyan-500 rounded-full shadow-lg"
                initial={{ width: 0 }}
                animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            {/* Question */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-8"
            >
              <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mb-6 animate-wave">
                {question.question}
              </h2>
              <div className="space-y-3">
                {question.options.map((option, index) => {
                  let buttonClass = "w-full p-4 text-left rounded-xl border-2 transition-all duration-300 ";
                  if (selectedAnswer !== null) {
                    if (index === question.correct) {
                      buttonClass += "border-green-400 bg-gradient-to-r from-green-400/30 to-emerald-400/30 text-green-700 dark:text-green-300";
                    } else if (index === selectedAnswer) {
                      buttonClass += "border-red-400 bg-gradient-to-r from-red-400/30 to-rose-400/30 text-red-700 dark:text-red-300 animate-shake";
                    } else {
                      buttonClass += "border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-300";
                    }
                  } else {
                    buttonClass += "border-pink-300 bg-gradient-to-r from-pink-200/50 to-yellow-200/50 hover:from-pink-300/50 hover:to-yellow-300/50 text-gray-900 dark:text-white";
                  }
                  return (
                    <motion.button
                      key={index}
                      whileHover={selectedAnswer === null ? { scale: 1.05, rotate: 3 } : {}}
                      whileTap={selectedAnswer === null ? { scale: 0.95 } : {}}
                      onClick={() => handleAnswerSelect(index)}
                      className={buttonClass}
                      disabled={selectedAnswer !== null}
                    >
                      <div className="flex items-center space-x-3">
                        <motion.div
                          whileHover={selectedAnswer === null ? { rotate: 8, scale: 1.1 } : {}}
                          className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center font-semibold bg-white/50 dark:bg-gray-700/50"
                        >
                          {String.fromCharCode(65 + index)}
                        </motion.div>
                        <span className="text-lg font-semibold">{option}</span>
                        {selectedAnswer !== null && index === question.correct && (
                          <CheckCircle className="ml-auto w-6 h-6 text-green-500" />
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
                  <div className="p-4 bg-gradient-to-r from-cyan-200/50 to-blue-200/50 dark:from-cyan-900/50 dark:to-blue-900/50 rounded-xl border-2 border-cyan-300 dark:border-cyan-700">
                    <h3 className="font-semibold text-cyan-900 dark:text-cyan-300 mb-2 flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-400 animate-spin-slow" />
                      Explanation:
                    </h3>
                    <p className="text-cyan-800 dark:text-cyan-200">
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
          </div>
        </motion.div>
      </div>
    );
  }

  // --- Quiz completed ---
  if (quizCompleted) {
    const finalScore = Math.round((score / questions.length) * 100);
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
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-xl mx-auto px-4 py-12"
        >
          <div className="bg-white/90 dark:bg-gray-900/90 rounded-3xl shadow-2xl p-8 border-4 border-yellow-400 dark:border-yellow-700 text-center">
            <motion.div
              initial={{ scale: 0.7, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
              className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
                passed ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-red-400 to-rose-500'
              }`}
            >
              {passed ? (
                <Trophy className="w-10 h-10 text-white animate-bounce" />
              ) : (
                <Target className="w-10 h-10 text-white animate-pulse" />
              )}
            </motion.div>
            <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-cyan-600 mb-4 animate-wave">
              {passed ? 'Congratulations!' : 'Keep Practicing!'}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8 font-semibold">
              {passed 
                ? 'You passed the quiz! You can now proceed to the next set.'
                : 'You need 60% or higher to unlock the next set. Try again!'
              }
            </p>
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-gradient-to-r from-pink-200/50 to-yellow-200/50 dark:from-pink-900/50 dark:to-yellow-900/50 rounded-xl p-4 border-2 border-pink-300 dark:border-pink-700">
                <div className="text-2xl font-extrabold text-pink-600 dark:text-pink-400">{finalScore}%</div>
                <div className="text-sm text-gray-600 dark:text-gray-300 font-semibold">Score</div>
              </div>
              <div className="bg-gradient-to-r from-cyan-200/50 to-blue-200/50 dark:from-cyan-900/50 dark:to-blue-900/50 rounded-xl p-4 border-2 border-cyan-300 dark:border-cyan-700">
                <div className="text-2xl font-extrabold text-cyan-600 dark:text-cyan-400">{score}/{questions.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300 font-semibold">Correct</div>
              </div>
              <div className="bg-gradient-to-r from-yellow-200/50 to-orange-200/50 dark:from-yellow-900/50 dark:to-orange-900/50 rounded-xl p-4 border-2 border-yellow-300 dark:border-yellow-700">
                <div className="text-2xl font-extrabold text-yellow-600 dark:text-yellow-400">{formatTime(timeSpent)}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300 font-semibold">Time</div>
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
          </div>
        </motion.div>
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
          @keyframes spin-slow {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .animate-spin-slow { animation: spin-slow 10s linear infinite; }
        `}
      </style>
      <JapaneseBackground />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        <div className="flex flex-col items-center mb-10">
          <motion.div
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="mb-4"
          >
            <Smile className="w-16 h-16 text-pink-500 animate-wave" />
          </motion.div>
          <p className="text-lg text-gray-600 dark:text-gray-300 text-center font-semibold">
            Embark on a vibrant journey to master JLPT levels (N5 to N1) with fun quizzes!<br />
            Choose your level and set to start your ninja quest!
          </p>
        </div>

        {/* Level Selection */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-cyan-600 mb-6 text-center animate-wave">
            Choose Your Ninja Level
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {levels.map((level) => (
              <motion.button
                key={level.id}
                whileHover={{ scale: 1.1, rotate: 4, boxShadow: "0 10px 20px rgba(0,0,0,0.2)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedLevel(level.id)}
                className={`p-6 rounded-2xl shadow-lg border-4 transition-all duration-300 ${
                  selectedLevel === level.id
                    ? 'bg-gradient-to-br from-white/90 to-yellow-200/90 dark:from-gray-800/90 dark:to-yellow-800/90 border-yellow-400 dark:border-yellow-700'
                    : 'bg-gradient-to-br from-white/50 to-gray-200/50 dark:from-gray-900/50 dark:to-gray-700/50 border-pink-300 dark:border-pink-700 hover:bg-white/70 dark:hover:bg-gray-800/70'
                }`}
              >
                <motion.div
                  className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${level.color} flex items-center justify-center text-3xl shadow-xl`}
                  whileHover={{ scale: 1.15, rotate: 8 }}
                >
                  {level.emoji}
                </motion.div>
                <h3 className="font-extrabold text-gray-900 dark:text-white mb-1">
                  JLPT {level.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 font-semibold">
                  {level.description}
                </p>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Regular Quiz Sets */}
        <motion.div
          className="bg-gradient-to-br from-white/90 to-yellow-200/90 dark:from-gray-800/90 dark:to-yellow-800/90 rounded-3xl shadow-2xl p-8 mb-8 border-4 border-pink-400 dark:border-pink-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center space-x-3 mb-8">
            <BookOpen className="w-8 h-8 text-pink-600 animate-wave" />
            <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-cyan-600">
              {levels.find(l => l.id === selectedLevel)?.name} Quiz Sets
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
                  whileHover={isUnlocked ? { scale: 1.05, rotate: 3, boxShadow: "0 10px 20px rgba(0,0,0,0.2)" } : {}}
                  transition={{ delay: setNumber * 0.07 }}
                  className={`relative p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
                    isUnlocked
                      ? 'bg-gradient-to-br from-pink-200/50 to-yellow-200/50 dark:from-pink-900/50 dark:to-yellow-900/50 border-pink-300 dark:border-pink-700 hover:bg-pink-300/50 dark:hover:bg-pink-800/50'
                      : 'bg-gray-100/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-600 cursor-not-allowed opacity-70'
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
                      <Lock className="w-5 h-5 text-gray-400 animate-pulse" />
                    )}
                    {progress.completed && (
                      <CheckCircle className="w-5 h-5 text-green-500 animate-bounce" />
                    )}
                  </div>
                  {progress.attempts > 0 && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 dark:text-gray-300 font-semibold">Best Score</span>
                        <span className="font-extrabold text-pink-600 dark:text-pink-400">
                          {progress.bestScore}%
                        </span>
                      </div>
                      <div className="w-full bg-white/30 dark:bg-gray-700/30 rounded-full h-3 shadow-inner">
                        <div
                          className="h-3 bg-gradient-to-r from-pink-500 to-cyan-500 rounded-full shadow-lg"
                          style={{ width: `${progress.bestScore}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {progress.attempts > 0 && (
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-300 mb-4">
                      <span>{progress.attempts} attempts</span>
                      <span>
                        <Clock size={12} className="inline mr-1 animate-pulse" />
                        {formatTime(progress.timeSpent)}
                      </span>
                    </div>
                  )}
                  <motion.button
                    whileHover={isUnlocked ? { scale: 1.1, rotate: 5 } : {}}
                    whileTap={isUnlocked ? { scale: 0.95 } : {}}
                    onClick={e => { e.stopPropagation(); isUnlocked && startQuiz(setNumber, 'regular'); }}
                    disabled={!isUnlocked}
                    className={`w-full py-3 px-4 rounded-full font-bold shadow-lg transition-all duration-300 flex items-center justify-center space-x-2 ${
                      isUnlocked
                        ? 'bg-gradient-to-r from-pink-500 to-cyan-500 hover:from-pink-600 hover:to-cyan-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <Play size={16} />
                    <span>{progress.attempts > 0 ? 'Retake Quiz' : 'Start Quiz'}</span>
                  </motion.button>
                  {!isUnlocked && setNumber > 1 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center font-semibold">
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
          className="bg-gradient-to-br from-white/90 to-cyan-200/90 dark:from-gray-800/90 dark:to-cyan-800/90 rounded-3xl shadow-2xl p-8 mb-8 border-4 border-cyan-400 dark:border-cyan-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center space-x-3 mb-8">
            <BookOpen className="w-8 h-8 text-cyan-600 animate-wave" />
            <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600">
              {levels.find(l => l.id === selectedLevel)?.name} Grammar Quiz Sets
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
                  whileHover={isUnlocked ? { scale: 1.05, rotate: 3, boxShadow: "0 10px 20px rgba(0,0,0,0.2)" } : {}}
                  transition={{ delay: setNumber * 0.07 }}
                  className={`relative p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
                    isUnlocked
                      ? 'bg-gradient-to-br from-cyan-200/50 to-blue-200/50 dark:from-cyan-900/50 dark:to-blue-900/50 border-cyan-300 dark:border-cyan-700 hover:bg-cyan-300/50 dark:hover:bg-cyan-800/50'
                      : 'bg-gray-100/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-600 cursor-not-allowed opacity-70'
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
                      <Lock className="w-5 h-5 text-gray-400 animate-pulse" />
                    )}
                    {progress.completed && (
                      <CheckCircle className="w-5 h-5 text-green-500 animate-bounce" />
                    )}
                  </div>
                  {progress.attempts > 0 && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 dark:text-gray-300 font-semibold">Best Score</span>
                        <span className="font-extrabold text-cyan-600 dark:text-cyan-400">
                          {progress.bestScore}%
                        </span>
                      </div>
                      <div className="w-full bg-white/30 dark:bg-gray-700/30 rounded-full h-3 shadow-inner">
                        <div
                          className="h-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full shadow-lg"
                          style={{ width: `${progress.bestScore}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {progress.attempts > 0 && (
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-300 mb-4">
                      <span>{progress.attempts} attempts</span>
                      <span>
                        <Clock size={12} className="inline mr-1 animate-pulse" />
                        {formatTime(progress.timeSpent)}
                      </span>
                    </div>
                  )}
                  <motion.button
                    whileHover={isUnlocked ? { scale: 1.1, rotate: 5 } : {}}
                    whileTap={isUnlocked ? { scale: 0.95 } : {}}
                    onClick={e => { e.stopPropagation(); isUnlocked && startQuiz(setNumber, 'grammar'); }}
                    disabled={!isUnlocked}
                    className={`w-full py-3 px-4 rounded-full font-bold shadow-lg transition-all duration-300 flex items-center justify-center space-x-2 ${
                      isUnlocked
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <Play size={16} />
                    <span>{progress.attempts > 0 ? 'Retake Quiz' : 'Start Quiz'}</span>
                  </motion.button>
                  {!isUnlocked && setNumber > 1 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center font-semibold">
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
          className="bg-gradient-to-br from-white/90 to-purple-200/90 dark:from-gray-800/90 dark:to-purple-800/90 rounded-3xl shadow-2xl p-8 border-4 border-red-400 dark:border-red-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="flex items-center space-x-3 mb-8">
            <BookOpen className="w-8 h-8 text-red-600 animate-wave" />
            <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-red-600">
              {levels.find(l => l.id === selectedLevel)?.name} Reading Quiz Sets
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
                  whileHover={isUnlocked ? { scale: 1.05, rotate: 3, boxShadow: "0 10px 20px rgba(0,0,0,0.2)" } : {}}
                  transition={{ delay: setNumber * 0.07 }}
                  className={`relative p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
                    isUnlocked
                      ? 'bg-gradient-to-br from-purple-200/50 to-red-200/50 dark:from-purple-900/50 dark:to-red-900/50 border-red-300 dark:border-red-700 hover:bg-purple-300/50 dark:hover:bg-purple-800/50'
                      : 'bg-gray-100/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-600 cursor-not-allowed opacity-70'
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
                      <Lock className="w-5 h-5 text-gray-400 animate-pulse" />
                    )}
                    {progress.completed && (
                      <CheckCircle className="w-5 h-5 text-green-500 animate-bounce" />
                    )}
                  </div>
                  {progress.attempts > 0 && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 dark:text-gray-300 font-semibold">Best Score</span>
                        <span className="font-extrabold text-red-600 dark:text-red-400">
                          {progress.bestScore}%
                        </span>
                      </div>
                      <div className="w-full bg-white/30 dark:bg-gray-700/30 rounded-full h-3 shadow-inner">
                        <div
                          className="h-3 bg-gradient-to-r from-purple-500 to-red-500 rounded-full shadow-lg"
                          style={{ width: `${progress.bestScore}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {progress.attempts > 0 && (
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-300 mb-4">
                      <span>{progress.attempts} attempts</span>
                      <span>
                        <Clock size={12} className="inline mr-1 animate-pulse" />
                        {formatTime(progress.timeSpent)}
                      </span>
                    </div>
                  )}
                  <motion.button
                    whileHover={isUnlocked ? { scale: 1.1, rotate: 5 } : {}}
                    whileTap={isUnlocked ? { scale: 0.95 } : {}}
                    onClick={e => { e.stopPropagation(); isUnlocked && startQuiz(setNumber, 'reading'); }}
                    disabled={!isUnlocked}
                    className={`w-full py-3 px-4 rounded-full font-bold shadow-lg transition-all duration-300 flex items-center justify-center space-x-2 ${
                      isUnlocked
                        ? 'bg-gradient-to-r from-purple-500 to-red-500 hover:from-purple-600 hover:to-red-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <Play size={16} />
                    <span>{progress.attempts > 0 ? 'Retake Quiz' : 'Start Quiz'}</span>
                  </motion.button>
                  {!isUnlocked && setNumber > 1 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center font-semibold">
                      Complete Reading Set {setNumber - 1} with 60%+ to unlock
                    </p>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}