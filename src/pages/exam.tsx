import { useState, useEffect } from 'react';
import vocabularyData from '../data/vocab/vocabulary.json';
import emailjs from '@emailjs/browser';

// Initialize EmailJS with your public key
emailjs.init('jBr6c1UQy5gCNkzB0');

type ExamSection = 'vocabulary';

interface GeminiQuestionBase {
  id: string;
  part: 'part1';
  explanation: string;
  type: string;
}

interface GeminiVocabularyQuestion extends GeminiQuestionBase {
  type: 'vocabulary';
  question: string;
  options: string[];
  correct: number;
  kanji?: string;
}

type Question = GeminiVocabularyQuestion;

interface ScoreHistory {
  date: string;
  score: number;
  total: number;
}

// Function to shuffle an array using Fisher-Yates algorithm
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// Function to get random questions for the exam
const getRandomQuestions = (count: number): GeminiVocabularyQuestion[] => {
  // Create a copy of the vocabulary data to avoid mutating the original
  const shuffledVocab = shuffleArray([...vocabularyData]);
  
  // Take the first 'count' questions from the shuffled array
  return shuffledVocab.slice(0, count).map((item, index) => ({
    id: `q-${Date.now()}-${index}`,
    part: 'part1' as const,
    explanation: '',
    type: 'vocabulary' as const,
    question: `What is the meaning of "${item.japanese}" (${item.reading})?`,
    options: generateOptions(item.meaning, vocabularyData),
    correct: generateCorrectIndex(item.meaning, generateOptions(item.meaning, vocabularyData)),
    kanji: item.japanese,
  }));
};

const Exam: React.FC = () => {
  const [] = useState<ExamSection>('vocabulary');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [examCompleted, setExamCompleted] = useState(false);
  const [, setScore] = useState(0);
  const [, setTotalQuestions] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Array<{
    questionId: string;
    selected?: number | null;
    correct?: boolean;
    feedback?: string;
  }>>([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [, setScoreHistory] = useState<ScoreHistory[]>([]);
  const [] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    // Check local storage for login state
    const storedUser = localStorage.getItem('username');
    if (storedUser) {
      setLoggedIn(true);
      setUsername(storedUser);
    }

    // Load score history
    const history = localStorage.getItem('scoreHistory');
    if (history) {
      try {
        setScoreHistory(JSON.parse(history));
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
    setTotalQuestions(0);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setShowRegister(false);
  };

  useEffect(() => {
    if (loggedIn) {
      try {
        setIsLoading(true);
        // Generate 25 random questions for the exam
        const randomQuestions = getRandomQuestions(25);
        setQuestions(randomQuestions);
        setTotalQuestions(randomQuestions.length);
        
        // Initialize user answers array
        setUserAnswers(
          randomQuestions.map((q) => ({
            questionId: q.id,
            selected: null,
            correct: false,
          }))
        );
      } catch (err) {
        console.error('Error initializing exam:', err);
        setError('Failed to load exam questions. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  }, [loggedIn]);

  const handleSubmit = () => {
    const currentQuestion = questions[currentQuestionIndex];
    let isCorrect = false;
    let feedback = '';

    if (currentQuestion.type === 'vocabulary') {
      if (selectedAnswer === null) {
        alert('Please select an answer before submitting.');
        return;
      }

      isCorrect = selectedAnswer === currentQuestion.correct;
      feedback = isCorrect ? 'Correct!' : `Incorrect. The correct answer was: ${currentQuestion.options[currentQuestion.correct]}`;
      setUserAnswers(prev => [...prev, {
        questionId: currentQuestion.id,
        selected: selectedAnswer,
        correct: isCorrect,
        feedback
      }]);

      if (isCorrect) setScore(prev => prev + 1);
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
    } else {
      handleExamComplete();
    }
  };

  const sendExamResultsEmail = async (result: any) => {
    try {
      const templateParams = {
        to_email: 'mymoonshaik004@gmail.com',
        to_name: 'Admin',
        from_name: 'Exam System',
        subject: `New Exam Results - ${result.userName || 'User'}`,
        message: `
          User: ${result.userName || 'Anonymous User'} (${result.userId})
          Score: ${result.score}/${result.totalQuestions}
          Percentage: ${result.percentage}%
          Date: ${new Date(result.timestamp).toLocaleString()}
          
          Detailed Results:
          ${result.answers.map((ans: any, idx: number) => {
            const selectedAnswer = ans.selected != null ? ans.selected + 1 : 'N/A';
            return `Q${idx + 1}: ${ans.correct ? '✓' : '✗'} (Selected: ${selectedAnswer})`;
          }).join('\n')}
        `
      };

      await emailjs.send(
        'service_zb7ruvd',
        'template_xc0kd4e',
        templateParams,
        'jBr6c1UQy5gCNkzB0'
      );
      
      console.log('Exam results email sent successfully');
    } catch (error) {
      console.error('Failed to send exam results email:', error);
      // Don't show error to user, just log it
    }
  };

  const handleExamComplete = () => {
    // Calculate final score
    const finalScore = userAnswers.filter(answer => answer.correct).length;
    const total = questions.length;
    const percentage = Math.round((finalScore / total) * 100);
    
    // Prepare exam results
    const examResults = {
      userId: username || 'anonymous',
      userName: username || 'Anonymous User',
      score: finalScore,
      totalQuestions: total,
      percentage: percentage,
      timestamp: new Date().toISOString(),
      answers: userAnswers,
    };

    // Save to local storage
    const existingResults = JSON.parse(localStorage.getItem('examResults') || '[]');
    const updatedResults = [...existingResults, examResults];
    localStorage.setItem('examResults', JSON.stringify(updatedResults));
    
    // Mark exam as completed
    setExamCompleted(true);
    localStorage.setItem('examAttempted', 'true');
    
    // Send email with results
    sendExamResultsEmail(examResults);
    
    // Redirect to registration after a short delay
    setTimeout(() => {
      window.location.href = '/register';
    }, 3000);
  };

  const handleRetakeWithDifferentEmail = () => {
    // Clear all exam-related data
    localStorage.removeItem('examAttempted');
    localStorage.removeItem('username');
    
    // Reset all states
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setUserAnswers([]);
    setExamCompleted(false);
    setLoggedIn(false);
    setUsername('');
    
    // Redirect to registration page
    window.location.href = '/register';
  };

  const renderQuestion = () => {
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Preparing your exam...</p>
          </div>
        </div>
      );
    }

    if (questions.length === 0) {
      return <div>No questions available. Please check the vocabulary data.</div>;
    }

    const question = questions[currentQuestionIndex];

    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Vocabulary Section</h2>
            <span className="text-sm text-gray-500">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
          </div>
          <div className="space-y-4">
            <p className="text-lg">
              {question.kanji && <span className="mr-2">{question.kanji}</span>}
              ({question.question})
            </p>
            <div className="space-y-2">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedAnswer(index)}
                  className={`w-full p-3 text-left rounded border transition-colors ${
                    selectedAnswer === index
                      ? 'bg-blue-100 border-blue-500'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {String.fromCharCode(65 + index)}. {option}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
          >
            {currentQuestionIndex < questions.length - 1 ? 'Next' : 'Finish'}
          </button>
        </div>
      </div>
    );
  };


  if (!loggedIn && !showRegister) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
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
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full px-6 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              Login
            </button>
            <p className="text-sm text-center mt-4">
              Don't have an account?{' '}
              <button
                onClick={() => setShowRegister(true)}
                className="text-blue-500 hover:underline"
              >
                Register
              </button>
            </p>
          </form>
        </div>
      </div>
    );
  }

  if (!loggedIn && showRegister) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Register</h1>
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
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
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full px-6 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              Register
            </button>
            <p className="text-sm text-center mt-4">
              Already have an account?{' '}
              <button
                onClick={() => setShowRegister(false)}
                className="text-blue-500 hover:underline"
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-12 h-12 text-green-500"
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
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Exam Submitted Successfully</h2>
          <p className="text-gray-600 mb-6">
            Thank you for completing the exam.
          </p>
          <p className="text-gray-500 text-sm mb-6">
            Your results have been recorded.
          </p>
          <button
            onClick={handleRetakeWithDifferentEmail}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Take Exam with Different Email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8" 
         onContextMenu={(e) => e.preventDefault()}>
      <style jsx global>{`
        /* Prevent text selection */
        .exam-content {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
        
        /* Disable right-click context menu */
        .exam-content * {
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          -khtml-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
      `}</style>
      
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden exam-content">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Japanese Vocabulary Exam</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>
        <div className="mb-8">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{
                width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>

        {error ? (
          <div className="p-4 mb-6 text-red-700 bg-red-100 rounded-md">
            {error}
          </div>
        ) : (
          renderQuestion()
        )}
      </div>
    </div>
  );
};

export default Exam;

function generateOptions(meaning: string, vocabularyData: { id: number; japanese: string; reading: string; meaning: string }[]): string[] {
  const incorrectOptions = vocabularyData
    .filter(item => item.meaning !== meaning)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
    .map(item => item.meaning);
  const options = [meaning, ...incorrectOptions].sort(() => Math.random() - 0.5);
  return options;
}

function generateCorrectIndex(meaning: string, options: string[]): number {
  return options.findIndex(option => option === meaning);
}