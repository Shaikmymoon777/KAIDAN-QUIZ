import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export interface Score {
  _id?: string;
  userId: string;
  username: string;
  score: number;
  totalQuestions: number;
  date?: string;
}

export const saveScore = async (scoreData: Omit<Score, '_id' | 'date'>) => {
  const response = await axios.post(`${API_URL}/scores`, scoreData);
  return response.data;
};

export const getScores = async () => {
  const response = await axios.get(`${API_URL}/scores`);
  return response.data;
};
