import { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';

interface ExamResult {
  userId: string;
  userName: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  timestamp: string;
  answers: Array<{
    questionId: string;
    selected?: number | null;
    correct?: boolean;
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
  const [, setIsModalOpen] = useState(false);

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
          ${result.answers.map((ans, idx) => {
            const selectedAnswer = ans.selected != null ? ans.selected + 1 : 'N/A';
            return `Q${idx + 1}: ${ans.correct ? '✓' : '✗'} (Selected: ${selectedAnswer})`;
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

  const renderDetailsModal = () => {
    if (!selectedResult) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                Exam Details - {selectedResult.userName} ({selectedResult.userId})
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedResult(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
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

            <div className="space-y-6">
              <h4 className="font-semibold text-gray-700 border-b pb-2">Question Details</h4>
              {selectedResult.answers.map((answer, index) => (
                <div key={index} className={`p-4 rounded-lg ${
                  answer.correct ? 'bg-green-50' : 'bg-red-50'
                }`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium">
                        Q{index + 1}. 
                      </p>
                      <p className="mt-1 text-sm text-gray-600">
                        Selected: {answer.selected != null ? `Option ${answer.selected + 1}` : 'Not answered'}
                      </p>
                      {answer.feedback && (
                        <p className="mt-1 text-sm text-gray-600">
                          Feedback: {answer.feedback}
                        </p>
                      )}
                    </div>
                    <span className={`ml-4 px-3 py-1 rounded-full text-xs font-medium ${
                      answer.correct 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {answer.correct ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
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
      {renderDetailsModal()}
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
                          className="text-blue-600 hover:text-blue-900"
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