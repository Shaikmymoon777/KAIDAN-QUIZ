import React, { useState, useEffect } from 'react';
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
  Zap
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
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [timeStarted, setTimeStarted] = useState<number | null>(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Array<{question: Question, selected: number, correct: boolean}>>([]);

  const levels = [
    { id: 'n5', name: 'N5', description: 'Beginner Level', color: 'from-green-400 to-green-600' },
    { id: 'n4', name: 'N4', description: 'Elementary Level', color: 'from-blue-400 to-blue-600' },
    { id: 'n3', name: 'N3', description: 'Intermediate Level', color: 'from-yellow-400 to-yellow-600' },
    { id: 'n2', name: 'N2', description: 'Upper Intermediate', color: 'from-orange-400 to-orange-600' },
    { id: 'n1', name: 'N1', description: 'Advanced Level', color: 'from-red-400 to-red-600' },
  ];

  const loadQuestions = async (level: string, set: number) => {
    try {
      const response = await import(`../data/${level}/set${set}.json`);
      const allQuestions = response.default;
      // Shuffle and take 20 random questions
      const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
      setQuestions(shuffled.slice(0, 25));
    } catch (error) {
      console.error('Failed to load questions:', error);
      // Fallback to N5 Set 1 questions
      const response = await import('../data/n5/set1.json');
      const allQuestions = response.default;
      const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
      setQuestions(shuffled.slice(0, 25));
    }
  };

  const isSetUnlocked = (level: string, set: number): boolean => {
    if (set === 1) return true; // First set is always unlocked
    
    const levelProgress = state.quizProgress[level];
    if (!levelProgress) return false;
    
    const previousSet = levelProgress[`set${set - 1}`];
    return previousSet?.completed && previousSet.bestScore >= 60;
  };

  const getSetProgress = (level: string, set: number) => {
    const levelProgress = state.quizProgress[level];
    return levelProgress?.[`set${set}`] || { completed: false, bestScore: 0, attempts: 0 };
  };

  const startQuiz = (set: number) => {
    setSelectedSet(set);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setQuizCompleted(false);
    setTimeStarted(Date.now());
    setUserAnswers([]);
    loadQuestions(selectedLevel, set);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(answerIndex);
    setShowExplanation(true);
    
    const isCorrect = answerIndex === questions[currentQuestion].correct;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    
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
      // Quiz completed
      const finalScore = Math.round((score / questions.length) * 100);
      const timeSpent = timeStarted ? Math.round((Date.now() - timeStarted) / 1000) : 0;
      
      dispatch({
        type: 'UPDATE_QUIZ_PROGRESS',
        payload: {
          level: selectedLevel,
          set: `set${selectedSet}`,
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

  if (selectedSet && questions.length > 0 && !quizCompleted) {
    const question = questions[currentQuestion];
    
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8"
        >
          {/* Quiz Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={resetQuiz}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ← Back
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {levels.find(l => l.id === selectedLevel)?.name} - Set {selectedSet}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Question {currentQuestion + 1} of {questions.length}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 dark:text-gray-400">Score</div>
              <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                {score}/{questions.length}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-8">
            <motion.div
              className="h-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {/* Question */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              {question.question}
            </h2>
            
            <div className="space-y-3">
              {question.options.map((option, index) => {
                let buttonClass = "w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ";
                
                if (selectedAnswer !== null) {
                  if (index === question.correct) {
                    buttonClass += "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300";
                  } else if (index === selectedAnswer) {
                    buttonClass += "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300";
                  } else {
                    buttonClass += "border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400";
                  }
                } else {
                  buttonClass += "border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-gray-900 dark:text-white";
                }
                
                return (
                  <motion.button
                    key={index}
                    whileHover={selectedAnswer === null ? { scale: 1.02 } : {}}
                    whileTap={selectedAnswer === null ? { scale: 0.98 } : {}}
                    onClick={() => handleAnswerSelect(index)}
                    className={buttonClass}
                    disabled={selectedAnswer !== null}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center font-semibold">
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span className="text-lg">{option}</span>
                      {selectedAnswer !== null && index === question.correct && (
                        <CheckCircle className="ml-auto w-6 h-6 text-green-500" />
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Explanation */}
          <AnimatePresence>
            {showExplanation && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8"
              >
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                    Explanation:
                  </h3>
                  <p className="text-blue-800 dark:text-blue-200">
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
              <button
                onClick={nextQuestion}
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <span>{currentQuestion < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}</span>
                <ArrowRight size={20} />
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    );
  }

  if (quizCompleted) {
    const finalScore = Math.round((score / questions.length) * 100);
    const passed = finalScore >= 60;
    
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center"
        >
          <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
            passed ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'
          }`}>
            {passed ? (
              <Trophy className="w-10 h-10 text-green-600 dark:text-green-400" />
            ) : (
              <Target className="w-10 h-10 text-red-600 dark:text-red-400" />
            )}
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {passed ? 'Congratulations!' : 'Keep Practicing!'}
          </h2>
          
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {passed 
              ? 'You passed the quiz! You can now proceed to the next set.'
              : 'You need 60% or higher to unlock the next set. Try again!'
            }
          </p>
          
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {finalScore}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Score</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {score}/{questions.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Correct</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {formatTime(timeSpent)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Time</div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={resetQuiz}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
            >
              Back to Quiz Selection
            </button>
            <button
              onClick={() => startQuiz(selectedSet!)}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            JLPT Quiz Hub
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Test your Japanese knowledge with our comprehensive JLPT practice quizzes. 
            Complete each set with 60% or higher to unlock the next level.
          </p>
        </div>

        {/* Level Selection */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Choose Your Level
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {levels.map((level) => (
              <motion.button
                key={level.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedLevel(level.id)}
                className={`p-6 rounded-xl text-center transition-all duration-200 ${
                  selectedLevel === level.id
                    ? 'bg-white dark:bg-gray-800 shadow-lg ring-2 ring-indigo-500'
                    : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-white dark:hover:bg-gray-800 hover:shadow-md'
                }`}
              >
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${level.color} flex items-center justify-center`}>
                  <span className="text-white font-bold text-xl">{level.name}</span>
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                  JLPT {level.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {level.description}
                </p>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Quiz Sets */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <div className="flex items-center space-x-3 mb-8">
            <BookOpen className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {levels.find(l => l.id === selectedLevel)?.name} Quiz Sets
            </h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 7 }, (_, i) => i + 1).map((setNumber) => {
              const isUnlocked = isSetUnlocked(selectedLevel, setNumber);
              const progress = getSetProgress(selectedLevel, setNumber);
              
              return (
                <motion.div
                  key={setNumber}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: setNumber * 0.1 }}
                  className={`relative p-6 rounded-xl border-2 transition-all duration-200 ${
                    isUnlocked
                      ? 'border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-lg cursor-pointer'
                      : 'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-lg font-bold ${
                      isUnlocked ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-600'
                    }`}>
                      Set {setNumber}
                    </h3>
                    {!isUnlocked && (
                      <Lock className="w-5 h-5 text-gray-400 dark:text-gray-600" />
                    )}
                    {progress.completed && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                  
                  {progress.attempts > 0 && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 dark:text-gray-400">Best Score</span>
                        <span className="font-medium text-indigo-600 dark:text-indigo-400">
                          {progress.bestScore}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div
                          className="h-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
                          style={{ width: `${progress.bestScore}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {progress.attempts > 0 && (
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
                      <span>{progress.attempts} attempts</span>
                      <span>
                        <Clock size={12} className="inline mr-1" />
                        {formatTime(progress.timeSpent)}
                      </span>
                    </div>
                  )}
                  
                  <button
                    onClick={() => isUnlocked && startQuiz(setNumber)}
                    disabled={!isUnlocked}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
                      isUnlocked
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <Play size={16} />
                    <span>{progress.attempts > 0 ? 'Retake Quiz' : 'Start Quiz'}</span>
                  </button>
                  
                  {!isUnlocked && setNumber > 1 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                      Complete Set {setNumber - 1} with 60%+ to unlock
                    </p>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}