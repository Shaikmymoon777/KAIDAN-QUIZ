import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import emailjs from '@emailjs/browser';
import { ArrowLeft, CheckCircle, ArrowRight, BookOpen, Smile, Trophy } from 'lucide-react';
import vocabularyData from '../data/vocab/vocabulary.json';

// Initialize EmailJS with your public key
emailjs.init('jBr6c1UQy5gCNkzB0');

type ExamSection = 'vocabulary' | 'listening' | 'speaking';

interface GeminiVocabularyQuestion {
  id: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  part: string;
  type: 'vocabulary' | 'grammar' | 'kanji' | 'reading';
  kanji?: string;
  japanese?: string;
  reading?: string;
  meaning?: string;
}

interface VocabularyItem {
  id: number;
  japanese: string;
  reading: string;
  meaning: string;
}

// Function to get random questions for the exam
const prepareVocabularyQuestions = (vocabData: VocabularyItem[], count: number = 10): GeminiVocabularyQuestion[] => {
  const shuffled = [...vocabData].sort(() => 0.5 - Math.random());
  const selectedWords = shuffled.slice(0, count);

  return selectedWords.map(word => {
    const otherWords = vocabData
      .filter(w => w.id !== word.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map(w => w.meaning);
    
    const options = [word.meaning, ...otherWords].sort(() => 0.5 - Math.random());
    
    return {
      id: `vocab-${word.id}`,
      question: `What does "${word.japanese}" (${word.reading}) mean?`,
      options,
      correct: options.indexOf(word.meaning),
      explanation: `"${word.japanese}" (${word.reading}) means "${word.meaning}"`,
      part: 'vocabulary',
      type: 'vocabulary',
      japanese: word.japanese,
      reading: word.reading,
      meaning: word.meaning
    };
  });
};

const QUESTION_COUNT = 25;

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

const Exam: React.FC = () => {
  const [] = useState<ExamSection>('vocabulary');
  const [questions, setQuestions] = useState<GeminiVocabularyQuestion[]>([]);
  const [, setListeningQuestions] = useState<any[]>([]);
  const [, setSpeakingQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [examCompleted, setExamCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{questionId: string; selected: number | null; correct: boolean}[]>([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('username');
    if (storedUser) {
      setLoggedIn(true);
      setUsername(storedUser);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    if (users[username] && users[username] === password) {
      localStorage.setItem('username', username);
      setLoggedIn(true);
      setError('');
    } else {
      setError('Invalid username or password.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    if (users[username]) {
      setError('Username already exists. Please choose another.');
    } else if (username && password) {
      users[username] = password;
      localStorage.setItem('users', JSON.stringify(users));
      localStorage.setItem('username', username);
      setLoggedIn(true);
      setShowRegister(false);
      setError('');
    } else {
      setError('Please enter both username and password.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('username');
    setLoggedIn(false);
    setUsername('');
    setPassword('');
    setExamCompleted(false);
    setScore(0);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setShowRegister(false);
  };

  const loadQuestions = async () => {
    try {
      setIsLoading(true);
      if (!vocabularyData || !Array.isArray(vocabularyData) || vocabularyData.length === 0) {
        throw new Error('No vocabulary data available. Please try again later.');
      }
      const vocabQuestions = prepareVocabularyQuestions(vocabularyData as VocabularyItem[], QUESTION_COUNT);
      if (vocabQuestions.length === 0) {
        throw new Error('Failed to generate questions. Please try again.');
      }
      setQuestions(vocabQuestions);
      setListeningQuestions([]);
      setSpeakingQuestions([]);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading questions:', error);
      setError(error instanceof Error ? error.message : 'Failed to load questions. Please try again later.');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  const handleSubmit = async () => {
    if (selectedAnswer === null) {
      setError('Please select an answer before submitting.');
      return;
    }

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correct;
    const newScore = isCorrect ? score + 1 : score;
    
    const updatedAnswers = [
      ...userAnswers.slice(0, currentQuestionIndex),
      {
        questionId: currentQuestion.id,
        selected: selectedAnswer,
        correct: isCorrect,
      },
      ...userAnswers.slice(currentQuestionIndex + 1)
    ];
    
    setUserAnswers(updatedAnswers);
    
    if (isCorrect) {
      setScore(newScore);
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setError('');
    } else {
      setExamCompleted(true);
      
      try {
        const templateParams = {
          to_email: 'mymoonshaik004@gmail.com',
          to_name: 'Admin',
          from_name: 'Japanese Learning App',
          reply_to: username ? username + '@example.com' : 'noreply@japaneselearningapp.com',
          subject: `Vocabulary Test Results - ${new Date().toLocaleDateString()}`,
          message: `A user has completed the vocabulary test with the following results:\n\n` +
                  `Score: ${newScore} out of ${questions.length} (${((newScore / questions.length) * 100).toFixed(1)}%)\n` +
                  `Date: ${new Date().toLocaleString()}\n` +
                  `User: ${username || 'Guest'}\n\n` +
                  '---\n' +
                  'This is an automated message from the Japanese Learning App.'
        };

        await emailjs.send(
          'service_zb7ruvd',
          'template_xc0kd4e',
          templateParams,
          'jBr6c1UQy5gCNkzB0'
        );
        console.log('Results email sent successfully');
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      const prevAnswer = userAnswers[currentQuestionIndex - 1];
      setSelectedAnswer(prevAnswer?.selected ?? null);
    }
  };

  const renderQuestion = () => {
    if (isLoading) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center py-8 text-blue-700 dark:text-blue-300"
        >
          Loading questions...
        </motion.div>
      );
    }

    if (examCompleted) {
      const percentage = (score / questions.length) * 100;
      const passed = percentage >= 70;
      return (
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
              <CheckCircle className="w-8 h-8 text-white" />
            )}
          </motion.div>
          <h2 className="text-2xl font-semibold text-blue-800 dark:text-blue-200 mb-4">
            {passed ? 'Congratulations!' : 'Keep Practicing!'}
          </h2>
          <p className="text-md text-gray-600 dark:text-gray-400 mb-6">
            {passed 
              ? 'You passed the vocabulary test! Great job!'
              : 'You need 70% or higher to pass. Try again!'}
          </p>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
              <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">{percentage.toFixed(1)}%</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Score</div>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
              <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">{score}/{questions.length}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Correct</div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
            >
              Try Again
              <ArrowRight size={18} className="inline ml-2" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
            >
              Logout
            </motion.button>
          </div>
        </motion.div>
      );
    }

    const currentQuestion = questions[currentQuestionIndex];
    
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center justify-between mb-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="flex items-center space-x-2 text-blue-700 dark:text-blue-300 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-md hover:bg-blue-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Logout</span>
          </motion.button>
          <div>
            <h1 className="text-3xl font-bold text-blue-800 dark:text-blue-200 flex items-center gap-2">
              <BookOpen className="w-6 h-6" />
              Vocabulary Test
            </h1>
            <p className="text-md text-gray-600 dark:text-gray-400">
              Question {currentQuestionIndex + 1} of {questions.length}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600 dark:text-gray-400">Score</div>
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {score}/{questions.length}
            </div>
          </div>
        </div>

        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-8">
          <motion.div
            className="h-3 bg-blue-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8"
        >
          <h2 className="text-xl font-semibold text-blue-800 dark:text-blue-200 mb-4 no-select">
            {currentQuestion.question}
          </h2>
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <motion.button
                key={index}
                whileHover={selectedAnswer === null ? { scale: 1.02 } : {}}
                onClick={() => selectedAnswer === null && setSelectedAnswer(index)}
                className={`w-full p-3 text-left rounded-lg border transition-colors ${
                  selectedAnswer === index
                    ? 'bg-blue-100 dark:bg-blue-900 border-blue-500 text-blue-700 dark:text-blue-300'
                    : 'bg-white dark:bg-gray-800 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-gray-700'
                }`}
                disabled={selectedAnswer !== null}
              >
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full border flex items-center justify-center font-medium">
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className="text-md no-select">{option}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {selectedAnswer !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 ${
                currentQuestionIndex === 0
                  ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  : 'bg-gray-500 text-white hover:bg-gray-600'
              }`}
            >
              <ArrowLeft size={18} />
              <span>Previous</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmit}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
            >
              <span>{currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Test'}</span>
              <ArrowRight size={18} />
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    );
  };

  if (!loggedIn && !showRegister) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 relative overflow-hidden">
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
        <CherryBlossoms />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md mx-auto px-4 py-12"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-4"
            >
              <Smile className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto" />
            </motion.div>
            <h1 className="text-3xl font-bold text-blue-800 dark:text-blue-200 mb-6">Welcome Back!</h1>
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1 block w-full p-3 border border-blue-300 dark:border-blue-600 rounded-lg bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full p-3 border border-blue-300 dark:border-blue-600 rounded-lg bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  required
                />
              </div>
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-all duration-200"
              >
                Login
              </motion.button>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                New here?{' '}
                <button
                  onClick={() => setShowRegister(true)}
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  Create an account
                </button>
              </p>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!loggedIn && showRegister) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 relative overflow-hidden">
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
        <CherryBlossoms />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md mx-auto px-4 py-12"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-4"
            >
              <Smile className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto" />
            </motion.div>
            <h1 className="text-3xl font-bold text-blue-800 dark:text-blue-200 mb-6">Create Account</h1>
            <form onSubmit={handleRegister} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1 block w-full p-3 border border-blue-300 dark:border-blue-600 rounded-lg bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full p-3 border border-blue-300 dark:border-blue-600 rounded-lg bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  required
                />
              </div>
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-all duration-200"
              >
                Register
              </motion.button>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                Already have an account?{' '}
                <button
                  onClick={() => setShowRegister(false)}
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  Login
                </button>
              </p>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8 relative overflow-hidden">
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
          .hover-scale:hover { transform: scale(1.05); transition: transform 0.3s ease; }
          .no-select {
            user-select: none;
            -webkit-user-select: none;
            -ms-user-select: none;
            -moz-user-select: none;
          }
        `}
      </style>
      <JapaneseBackground />
      <CherryBlossoms />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-4"
          >
            {error}
          </motion.div>
        ) : (
          renderQuestion()
        )}
      </div>
    </div>
  );
};

export default Exam;