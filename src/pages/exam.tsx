import { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';
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

// Function to shuffle an array using Fisher-Yates algorithm

// Function to get random questions for the exam
const prepareVocabularyQuestions = (vocabData: VocabularyItem[], count: number = 10): GeminiVocabularyQuestion[] => {
  // Shuffle array and take first 'count' items
  const shuffled = [...vocabData].sort(() => 0.5 - Math.random());
  const selectedWords = shuffled.slice(0, count);

  return selectedWords.map(word => {
    // Get 3 random wrong answers
    const otherWords = vocabData
      .filter(w => w.id !== word.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map(w => w.meaning);
    
    // Combine correct answer with wrong answers and shuffle
    const options = [word.meaning, ...otherWords]
      .sort(() => 0.5 - Math.random());
    
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
  const [userAnswers, setUserAnswers] = useState<{questionId: string; selected: number | null; correct: boolean; feedback?: string}[]>([]);
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

    const history = localStorage.getItem('scoreHistory');
    if (history) {
      try {
        // setScoreHistory(JSON.parse(history));
      } catch (err) {
        console.error('Error parsing score history:', err);
      }
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

  // Load questions when component mounts
  const loadQuestions = async () => {
    try {
      setIsLoading(true);
      
      // Validate vocabulary data
      if (!vocabularyData || !Array.isArray(vocabularyData) || vocabularyData.length === 0) {
        throw new Error('No vocabulary data available. Please try again later.');
      }
      
      // Load vocabulary questions with 25 questions
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
    
    // Update user answers
    const updatedAnswers = [
      ...userAnswers.slice(0, currentQuestionIndex),
      {
        questionId: currentQuestion.id,
        selected: selectedAnswer,
        correct: isCorrect,
        feedback: isCorrect 
          ? 'Correct! ' 
          : `Incorrect. The correct answer is: ${currentQuestion.options[currentQuestion.correct]}`
      },
      ...userAnswers.slice(currentQuestionIndex + 1)
    ];
    
    setUserAnswers(updatedAnswers);

    // Update score if correct
    if (isCorrect) {
      setScore(newScore);
    }

    // Move to next question or complete exam
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      // Pre-select the answer if already answered
      const nextAnswer = updatedAnswers[currentQuestionIndex + 1]?.selected;
      setSelectedAnswer(nextAnswer ?? null);
      setError('');
    } else {
      // Exam completed
      setExamCompleted(true);
      
      try {
        // Prepare email template parameters with more details
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
                  `Test Details:\n` +
                  `- Total Questions: ${questions.length}\n` +
                  `- Correct Answers: ${newScore}\n` +
                  `- Incorrect Answers: ${questions.length - newScore}\n` +
                  `- Success Rate: ${((newScore / questions.length) * 100).toFixed(1)}%\n\n` +
                  '---\n' +
                  'This is an automated message from the Japanese Learning App.'
        };

        // Send email using EmailJS
        await emailjs.send(
          'service_zb7ruvd', // Replace with your EmailJS service ID
          'template_xc0kd4e', // Replace with your EmailJS template ID
          templateParams,
          'jBr6c1UQy5gCNkzB0' // Your public key
        );
        
        console.log('Results email sent successfully');
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
        // Consider showing a non-intrusive message to the user
        // that the results couldn't be sent but were saved locally
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      // Restore the previously selected answer if it exists
      const prevAnswer = userAnswers[currentQuestionIndex - 1];
      setSelectedAnswer(prevAnswer?.selected ?? null);
    }
  };

  const renderQuestion = () => {
    if (isLoading) {
      return <div className="text-center py-8">Loading questions...</div>;
    }

    if (error) {
      return (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      );
    }

    if (!questions.length) {
      return (
        <div className="text-center py-8">
          <p>No questions available. Please try again later.</p>
          <button
            onClick={loadQuestions}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      );
    }

    const currentQuestion = questions[currentQuestionIndex];
    
    if (!currentQuestion) {
      return (
        <div className="text-center py-8">
          <p>Error loading question. Please try again.</p>
          <button
            onClick={loadQuestions}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Reload Questions
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="mb-4">
            <span className="text-gray-600">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <div className="w-full bg-gray-200 h-2 mt-2 rounded">
              <div 
                className="bg-blue-500 h-2 rounded" 
                style={{ width: `${((currentQuestionIndex) / questions.length) * 100}%` }}
              />
            </div>
          </div>
          
          <h3 className="text-xl font-semibold mb-6">{currentQuestion.question}</h3>
          
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <div
                key={index}
                onClick={() => setSelectedAnswer(index)}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedAnswer === index
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                {option}
              </div>
            ))}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                currentQuestionIndex === 0
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Previous
            </button>
            
            <button
              onClick={handleSubmit}
              disabled={selectedAnswer === null}
              className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                selectedAnswer === null
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200'
              }`}
            >
              {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Test'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (!loggedIn && !showRegister) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full transform transition-all duration-300 hover:shadow-2xl">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Welcome Back!</h1>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button
              type="submit"
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Login
            </button>
            <p className="text-sm text-center text-gray-600">
              New here?{' '}
              <button
                onClick={() => setShowRegister(true)}
                className="text-blue-600 hover:underline font-medium"
              >
                Create an account
              </button>
            </p>
          </form>
        </div>
      </div>
    );
  }

  if (!loggedIn && showRegister) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full transform transition-all duration-300 hover:shadow-2xl">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Create Account</h1>
          <form onSubmit={handleRegister} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button
              type="submit"
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Register
            </button>
            <p className="text-sm text-center text-gray-600">
              Already have an account?{' '}
              <button
                onClick={() => setShowRegister(false)}
                className="text-blue-600 hover:underline font-medium"
              >
                Login
              </button>
            </p>
          </form>
        </div>
      </div>
    );
  }

  if (examCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-gray-50 p-4">
        <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full text-center animate-fade-in">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 transform transition-all duration-500 hover:scale-110">
            <svg
              className="w-16 h-16 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Congratulations!</h2>
          <p className="text-lg text-gray-600 mb-6">Your exam has been submitted successfully.</p>
          <button
            onClick={handleLogout}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Vocabulary Test</h1>
      {renderQuestion()}
    </div>
  );
};

export default Exam;