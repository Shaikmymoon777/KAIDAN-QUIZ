import { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';
import * as XLSX from 'xlsx';

interface ExamResult {
  userId: string;
  userName: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  timestamp: string;
  questions: Array<{
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    userAnswer: number | null;
    isCorrect: boolean;
    feedback?: string;
  }>;
}

// Initialize EmailJS with your public key
emailjs.init(' jBr6c1UQy5gCNkzB0');

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [examResults, setExamResults] = useState<ExamResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [selectedResult, setSelectedResult] = useState<ExamResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Admin credentials (in a real app, this should be handled server-side)
  const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'kimmoon' // In production, use environment variables and proper authentication
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_CREDENTIALS.password) {
      setIsAuthenticated(true);
      setError('');
      // Set a session flag (in a real app, use proper session management)
      sessionStorage.setItem('adminAuthenticated', 'true');
    } else {
      setError('Invalid credentials');
    }
  };

  const loadExamResults = () => {
    try {
      setIsLoading(true);
      const results = localStorage.getItem('examResults');
      console.log('Raw results from localStorage:', results); // Debug log
      
      if (results) {
        const parsedResults = JSON.parse(results);
        console.log('Parsed results:', parsedResults); // Debug log
        
        // Handle both array of results and single result
        const formattedResults = Array.isArray(parsedResults) 
          ? parsedResults 
          : [parsedResults];
          
        setExamResults(formattedResults);
      } else {
        console.log('No exam results found in localStorage');
        setExamResults([]);
      }
    } catch (err) {
      console.error('Error loading exam results:', err);
      setError('Failed to load exam results. Check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('adminAuthenticated');
    setPassword('');
  };

  const sendEmail = async (result: ExamResult) => {
    try {
      setIsSending(true);
      
      const templateParams = {
        to_email: 'mymoonshaik004@gmail.com',
        to_name: 'Admin',
        from_name: 'Exam System',
        subject: `Exam Results - ${result.userName || 'User'}`,
        message: `
          User: ${result.userName || 'Anonymous User'} (${result.userId})
          Score: ${result.score}/${result.totalQuestions}
          Percentage: ${result.percentage}%
          Date: ${new Date(result.timestamp).toLocaleString()}
          
          Detailed Results:
          ${result.questions.map((question, idx) => {
            const userAnswer = question.userAnswer !== null 
              ? `${String.fromCharCode(65 + question.userAnswer)}. ${question.options[question.userAnswer]}` 
              : 'Not answered';
            return `Q${idx + 1}: ${question.isCorrect ? '✓' : '✗'} (Your Answer: ${userAnswer})`;
          }).join('\n')}
        `
      };

      // Send email using EmailJS
      await emailjs.send(
        'service_zb7ruvd',
        'template_xc0kd4e',
        templateParams,
        'jBr6c1UQy5gCNkzB0'
      );

      alert('Results sent to your email successfully!');
    } catch (error) {
      console.error('Failed to send email:', error);
      setError('Failed to send email. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const downloadExcel = (result: ExamResult) => {
    // Prepare data for Excel
    const data = [
      ['User ID', result.userId],
      ['User Name', result.userName],
      ['Date', new Date(result.timestamp).toLocaleString()],
      ['Score', `${result.score}/${result.totalQuestions}`],
      ['Percentage', `${result.percentage}%`],
      [],
      ['Question', 'Your Answer', 'Correct Answer', 'Status']
    ];

    // Add each question and answer to the Excel data
    result.questions.forEach((question, index) => {
      data.push([
        `Q${index + 1}. ${question.question}`,
        question.userAnswer !== null 
          ? `${String.fromCharCode(65 + question.userAnswer)}. ${question.options[question.userAnswer]}` 
          : 'Not answered',
        `${String.fromCharCode(65 + question.correctAnswer)}. ${question.options[question.correctAnswer]}`,
        question.isCorrect ? 'Correct' : 'Incorrect'
      ]);
    });

    // Create worksheet and workbook
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Exam Results');
    
    // Generate Excel file
    XLSX.writeFile(wb, `Exam_Results_${result.userName || result.userId}.xlsx`);
  };


  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedResult(null), 300); // Wait for animation to complete
  };

  // Check if already authenticated on component mount
  useEffect(() => {
    const isAuth = sessionStorage.getItem('adminAuthenticated') === 'true';
    if (isAuth) {
      setIsAuthenticated(true);
      loadExamResults();
    }
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={ADMIN_CREDENTIALS.username}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter password"
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          {selectedResult && (
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-fade-in">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-800">
                    Exam Details - {selectedResult.userName} ({selectedResult.userId})
                  </h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadExcel(selectedResult);
                      }}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                    >
                      Download Excel
                    </button>
                    <button
                      onClick={closeModal}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Score</p>
                      <p className="font-medium">{selectedResult.score} / {selectedResult.totalQuestions}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Percentage</p>
                      <p className="font-medium">{selectedResult.percentage}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="font-medium">{new Date(selectedResult.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-700 border-b pb-2">Questions</h4>
                  {selectedResult.questions.map((question, index) => (
                    <div key={question.id} className={`p-4 rounded-lg ${question.isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                      <p className="font-medium mb-2">Q{index + 1}. {question.question}</p>
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-700">Options:</p>
                        <ul className="list-disc pl-5 mt-1 space-y-1">
                          {question.options.map((option, i) => (
                            <li 
                              key={i} 
                              className={`text-sm ${
                                i === question.correctAnswer 
                                  ? 'text-green-600 font-medium' 
                                  : i === question.userAnswer 
                                    ? 'text-red-600 font-medium' 
                                    : 'text-gray-600'
                              }`}
                            >
                              {String.fromCharCode(65 + i)}. {option}
                              {i === question.correctAnswer && ' (Correct)'}
                              {i === question.userAnswer && !question.isCorrect && ' (Your Answer)'}
                            </li>
                          ))}
                        </ul>
                      </div>
                      {question.feedback && (
                        <div className="mt-2 p-2 bg-yellow-50 border-l-4 border-yellow-400">
                          <p className="text-sm text-yellow-700">{question.feedback}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Exam Results Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Logout
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : examResults.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No exam results found.</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Percentage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {examResults.map((result, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {result.userName || 'Anonymous User'}
                        </div>
                        <div className="text-sm text-gray-500">{result.userId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {result.score} / {result.totalQuestions}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span 
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${result.percentage >= 70 ? 'bg-green-100 text-green-800' : 
                              result.percentage >= 50 ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-red-100 text-red-800'}`}
                        >
                          {result.percentage}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(result.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => sendEmail(result)}
                          disabled={isSending}
                          className={`text-blue-600 hover:text-blue-900 mr-4 ${isSending ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {isSending ? 'Sending...' : 'Email Results'}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedResult(result);
                            setIsModalOpen(true);
                          }}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;