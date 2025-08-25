import axios, { AxiosError } from 'axios';

const API_URL = 'http://localhost:5000/api/exam';

export interface Answer {
  questionId: string;
  selected: number | null;
  correct: boolean;
  feedback?: string;
}

export interface Question {
  type: 'vocabulary' | 'grammar' | 'kanji' | 'reading';
  _id: string;
  question: any;
  options: any;
  correct: any;
  explanation: string;
  kanji: any;
  id: number;
  japanese: string;
  reading: string;
  meaning: string;
  level?: string;
}

export interface ExamResult {
  _id: string;
  userId: string;
  userName: string;
  level: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  answers: Answer[];
  completedAt: string;
  timeSpent: number;
}

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Request interceptor for auth tokens
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error Response:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('API Request Error:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('API Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export const examApi = {
  // Get questions for exam
  getQuestions: async (
    level: string = 'N5',
    count: number = 10,
    type?: string
  ): Promise<Question[]> => {
    try {
      const response = await api.get<{ success: boolean; data: Question[] }>('/vocab/questions', {
        params: { level, count, type },
      });
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error('Failed to fetch questions');
    } catch (error) {
      console.error('Error fetching questions:', error);
      throw new Error('Failed to fetch questions. Please try again later.');
    }
  },

  // Submit exam results
  submitExam: async (
    userId: string,
    userName: string,
    level: string,
    answers: Answer[],
    timeSpent: number
  ): Promise<ExamResult> => {
    try {
      const response = await api.post<ExamResult>('/submit', {
        userId,
        userName,
        level,
        answers,
        timeSpent,
      });
      return response.data;
    } catch (error) {
      console.error('Error submitting exam:', error);
      throw new Error('Failed to submit exam. Please try again.');
    }
  },

  // Get user's exam history
  getExamHistory: async (userId: string): Promise<ExamResult[]> => {
    try {
      const response = await api.get<ExamResult[]>(`/history/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching exam history:', error);
      throw new Error('Failed to load exam history.');
    }
  },

  // Export results to Excel
  exportResults: async (resultId: string): Promise<Blob> => {
    try {
      const response = await api.get(`/export/${resultId}`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting results:', error);
      throw new Error('Failed to export results.');
    }
  },

  // Submit exam results
  submitExamResults: async (results: any) => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.post(
        '/exam/results',
        results,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error submitting exam results:', error);
      throw error;
    }
  },
};

export const adminApi = {
  // Get all questions
  getQuestions: async (page: number = 1, limit: number = 20, filters: { type?: string; level?: string } = {}) => {
    const response = await axios.get('http://localhost:5000/api/admin/questions', {
      params: { page, limit, ...filters }
    });
    return response.data;
  },

  // Create a new question
  createQuestion: async (questionData: any) => {
    const response = await axios.post('http://localhost:5000/api/admin/questions', questionData);
    return response.data;
  },

  // Update a question
  updateQuestion: async (id: string, questionData: any) => {
    const response = await axios.put(`http://localhost:5000/api/admin/questions/${id}`, questionData);
    return response.data;
  },

  // Delete a question
  deleteQuestion: async (id: string) => {
    const response = await axios.delete(`http://localhost:5000/api/admin/questions/${id}`);
    return response.data;
  },

  // Import questions
  importQuestions: async (questions: any[]) => {
    const response = await axios.post('http://localhost:5000/api/admin/questions/import', { questions });
    return response.data;
  }
};

export default examApi;
