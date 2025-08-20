import { useState, useEffect } from 'react';
import vocabularyData from '../data/vocab/vocabulary.json';
import emailjs from '@emailjs/browser';
import * as XLSX from 'xlsx';

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
  const shuffledVocab = shuffleArray([...vocabularyData]);
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
  const [] = useState(true); // State for collapsible sidebar
  const [] = useState(false);
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
        const randomQuestions = getRandomQuestions(25);
        setQuestions(randomQuestions);
        setTotalQuestions(randomQuestions.length);
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

  const handleExamComplete = () => {
    const totalQuestions = questions.length;
    const correctAnswers = userAnswers.filter((answer) => answer.correct).length;
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);

    const examResults = {
      userId: username || 'anonymous',
      userName: username || 'Anonymous User',
      timestamp: new Date().toISOString(),
      score: correctAnswers,
      totalQuestions,
      percentage,
      answers: userAnswers.map((answer) => {
        const question = questions.find((q) => q.id === answer.questionId);
        if (!question?.options) return null;

        const selectedIndex = answer.selected ?? -1;
        const selectedOption = selectedIndex >= 0 && selectedIndex < question.options.length
          ? question.options[selectedIndex]
          : 'Not answered';

        return {
          question: question.question,
          correctAnswer: question.correct >= 0 && question.correct < question.options.length
            ? question.options[question.correct]
            : 'No correct answer',
          userAnswer: selectedOption,
          isCorrect: answer.correct ?? false,
        };
      }).filter(Boolean),
    };

    const existingResults = JSON.parse(localStorage.getItem('examResults') || '[]');
    const updatedResults = [...existingResults, examResults];
    localStorage.setItem('examResults', JSON.stringify(updatedResults));

    sendExamResultsEmail(examResults);

    setExamCompleted(true);
    localStorage.setItem('examAttempted', 'true');
  };

  const sendExamResultsEmail = async (result: any) => {
    try {
      const wb = XLSX.utils.book_new();
      
      const excelData = [
        ['User ID', result.userId],
        ['User Name', result.userName],
        ['Date', new Date(result.timestamp).toLocaleString()],
        ['Score', `${result.score}/${result.totalQuestions}`],
        ['Percentage', `${result.percentage}%`],
        [],
        ['Question', 'Your Answer', 'Correct Answer', 'Status']
      ];

      result.answers.forEach((answer: any, index: number) => {
        excelData.push([
          `Q${index + 1}. ${answer.question}`,
          answer.userAnswer,
          answer.correctAnswer,
          answer.isCorrect ? 'Correct' : 'Incorrect'
        ]);
      });

      const ws = XLSX.utils.aoa_to_sheet(excelData);
      XLSX.utils.book_append_sheet(wb, ws, 'Exam Results');
      
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const excelBase64 = btoa(
        new Uint8Array(excelBuffer).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ''
        )
      );

      const templateParams = {
        to_email: 'mymoonshaik004@gmail.com',
        to_name: 'Admin',
        from_name: 'Japanese Learning App',
        subject: `Exam Results - ${result.userName}`,
        name: result.userName,
        user_name: result.userName,
        user_id: result.userId,
        score: result.score,
        total_questions: result.totalQuestions,
        percentage: `${result.percentage}%`,
        date: new Date(result.timestamp).toLocaleString(),
        message: 'Please find the detailed exam results in the attached Excel file.',
        attachment: excelBase64,
        filename: `Exam_Results_${result.userId}_${new Date().toISOString().split('T')[0]}.xlsx`
      };

      const response = await emailjs.send(
        'service_zb7ruvd',
        'template_xc0kd4e',
        templateParams,
        'jBr6c1UQy5gCNkzB0'
      );

      console.log('Email sent successfully:', response);
      return true;
    } catch (error) {
      console.error('Failed to send exam results email:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const err = error as { response: { data: any } };
        console.error('Error response:', err.response.data);
      }
      return false;
    }
  };

  const handleRetakeWithDifferentEmail = () => {
    localStorage.removeItem('examAttempted');
    localStorage.removeItem('username');
    
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setUserAnswers([]);
    setExamCompleted(false);
    setLoggedIn(false);
    setUsername('');
    
    window.location.href = '/register';
  };

  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    
    const updatedAnswers = [...userAnswers];
    const answerIndexInArray = updatedAnswers.findIndex(a => a.questionId === questionId);
    
    const question = questions.find(q => q.id === questionId);
    if (!question) {
      console.error(`Question with id ${questionId} not found`);
      return;
    }
    
    const isCorrect = answerIndex === question.correct;
    
    if (answerIndexInArray >= 0) {
      updatedAnswers[answerIndexInArray] = {
        ...updatedAnswers[answerIndexInArray],
        selected: answerIndex,
        correct: isCorrect,
      };
    } else {
      updatedAnswers.push({
        questionId,
        selected: answerIndex,
        correct: isCorrect,
        feedback: '',
      });
    }
    
    setUserAnswers(updatedAnswers);
  };

  const renderQuestion = () => {
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center animate-fade-in">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-lg text-gray-700 font-semibold">Preparing your exam...</p>
          </div>
        </div>
      );
    }

    if (questions.length === 0) {
      return <div className="text-center text-red-600 font-medium">No questions available. Please check the vocabulary data.</div>;
    }

    const question = questions[currentQuestionIndex];
    const userAnswer = userAnswers.find(a => a.questionId === question.id);

    return (
      <div className="space-y-6 p-4 md:p-6 bg-white rounded-xl shadow-lg animate-fade-in">
        <div className="flex justify-between items-center border-b pb-4">
          <h2 className="text-2xl font-bold text-gray-800">Vocabulary Challenge</h2>
          <span className="text-sm text-gray-600 font-medium">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
        </div>
        <div className="space-y-4">
          <p className="text-xl text-gray-800 font-medium">
            {question.kanji && <span className="text-2xl mr-2">{question.kanji}</span>}
            {question.question}
          </p>
          <div className="grid gap-3">
            {question.options.map((option, index) => {
              const isSelected = userAnswer?.selected === index;
              let buttonStyle = 'border-gray-300 hover:bg-gray-50 hover:border-blue-300';
              
              // Only show correct/incorrect states after exam is submitted
              if (examCompleted) {
                if (index === question.correct) {
                  buttonStyle = 'bg-green-100 border-green-500 text-green-800';
                } else if (isSelected && !userAnswer?.correct) {
                  buttonStyle = 'bg-red-100 border-red-500 text-red-800';
                } else if (isSelected) {
                  buttonStyle = 'bg-blue-100 border-blue-500 text-blue-800';
                }
              } else if (isSelected) {
                buttonStyle = 'bg-blue-100 border-blue-500 text-blue-800';
              }
              
              return (
                <button
                  key={index}
                  onClick={() => !examCompleted && handleAnswerSelect(question.id, index)}
                  disabled={examCompleted}
                  className={`w-full p-4 rounded-lg border text-left transition-all duration-200 ${buttonStyle} ${
                    examCompleted ? 'cursor-default' : 'cursor-pointer'
                  }`}
                >
                  <span className="font-semibold text-gray-700">
                    {String.fromCharCode(65 + index)}.
                  </span>{' '}
                  <span className="ml-2">{option}</span>
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Show feedback only after exam is completed */}
        {examCompleted && userAnswer?.feedback && (
          <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-r">
            <p className="text-sm text-yellow-700">{userAnswer.feedback}</p>
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <button
            onClick={() => {
              if (currentQuestionIndex > 0) {
                setCurrentQuestionIndex(currentQuestionIndex - 1);
              }
            }}
            disabled={currentQuestionIndex === 0}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
              currentQuestionIndex === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600 hover:shadow-lg'
            }`}
          >
            Previous
          </button>
          
          <button
            onClick={handleSubmit}
            className="px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 hover:shadow-lg transition-all duration-200"
          >
            {currentQuestionIndex < questions.length - 1 ? 'Next' : examCompleted ? 'View Results' : 'Finish'}
          </button>
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
          <p className="text-gray-500 mb-6">Check your email for the results.</p>
          <button
            onClick={handleRetakeWithDifferentEmail}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Take Exam with Different Email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8" onContextMenu={(e) => e.preventDefault()}>
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-in-out;
        }
        .exam-content {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
        .exam-content * {
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          -khtml-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
      `}</style>
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden exam-content transition-all duration-300 hover:shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b">
          <h1 className="text-3xl font-bold text-gray-800">Japanese Vocabulary Challenge</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Logout
          </button>
        </div>
        <div className="p-6">
          <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
            <div
              className="bg-blue-600 h-4 rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
              }}
            >
              <span className="text-xs text-white font-medium ml-2">
                {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%
              </span>
            </div>
          </div>
          {error ? (
            <div className="p-4 mb-6 text-red-700 bg-red-100 rounded-lg text-center animate-pulse">
              {error}
            </div>
          ) : (
            renderQuestion()
          )}
        </div>
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