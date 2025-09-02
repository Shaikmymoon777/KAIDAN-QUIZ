import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// API functions
export const login = async (username: string, password: string) => {
  const formData = new FormData();
  formData.append('username', username);
  formData.append('password', password);
  
  const response = await axios.post(`${API_BASE_URL}/auth/token`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  if (response.data.access_token) {
    localStorage.setItem('access_token', response.data.access_token);
  }
  
  return response.data;
};

export const getListeningQuestions = async (count: number = 10) => {
  const response = await api.get('/questions/listening', {
    params: { count },
  });
  return response.data.questions;
};

export const getSpeakingQuestions = async (count: number = 10) => {
  const response = await api.get('/questions/speaking', {
    params: { count },
  });
  return response.data.questions;
};

export const evaluateSpeaking = async (audioBlob: Blob, expectedText: string) => {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'recording.wav');
  formData.append('expected_text', expectedText);
  
  const response = await api.post('/questions/evaluate', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data.evaluation;
};

export const getCurrentUser = async () => {
  const response = await api.get('/users/me');
  return response.data;
};

export const registerUser = async (userData: {
  username: string;
  email: string;
  password: string;
  full_name?: string;
}) => {
  const response = await api.post('/users/', userData);
  return response.data;
};

export default {
  login,
  getListeningQuestions,
  getSpeakingQuestions,
  evaluateSpeaking,
  getCurrentUser,
  registerUser,
};
