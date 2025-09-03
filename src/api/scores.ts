import { SectionScore as ExamSectionScore } from '@/types/exam';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Types
export interface SectionScores {
  vocabulary: ExamSectionScore;
  listening: ExamSectionScore;
  speaking: ExamSectionScore;
}

export interface ScoreData {
  userId: string;
  username: string;
  scores: SectionScores;
  date: string;
  totalScore?: number;
  totalQuestions?: number;
  percentage?: number;
}

interface SaveScoreParams {
  userId: string;
  username: string;
  answers: {
    vocabulary: Record<string, { answer: any; isCorrect: boolean }>;
    listening: Record<string, { answer: any; isCorrect: boolean }>;
    speaking: Record<string, { score: number; audioUrl?: string }>;
  };
  questions: {
    vocabulary: Array<{ id: string; meaning: any }>;
    listening: Array<{ id: string; correctAnswer: any }>;
    speaking: Array<{ id: string }>;
  };
  scores: SectionScores;
}

// Save score to the database
export const saveScore = async (_userId: string, _scores: SectionScores, _scoreData: { userId: string; username: string; scores: SectionScores; date: string; speakingResponses: { questionId: string; audioUrl: string | undefined; score: number; feedback: string; }[]; }, data: SaveScoreParams) => {
  try {
    const response = await axios.post(`${API_URL}/api/scores`, {
      userId: data.userId,
      username: data.username,
      answers: data.answers,
      questions: data.questions,
      scores: data.scores
    });

    return response.data;
  } catch (error) {
    console.error('Error saving score:', error);
    throw error;
  }
};

// Get scores for a specific user or all scores if no userId provided
export const getScores = async (userId?: string) => {
  try {
    const url = userId 
      ? `${API_URL}/api/scores?userId=${encodeURIComponent(userId)}`
      : `${API_URL}/api/scores`;

    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching scores:', error);
    throw error;
  }
};

// Get a single score by ID
export const getScoreById = async (id: string) => {
  try {
    const response = await axios.get(`${API_URL}/api/scores/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching score:', error);
    throw error;
  }
};

// Delete a score by ID
export const deleteScore = async (id: string) => {
  try {
    const response = await axios.delete(`${API_URL}/api/scores/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting score:', error);
    throw error;
  }
};

// Get user's scores
export const getUserScores = async (userId: string) => {
  try {
    const response = await axios.get(`${API_URL}/scores/user/${userId}`);
    return response.data as ScoreData[];
  } catch (error) {
    console.error('Error fetching user scores:', error);
    throw error;
  }
};

// Get user statistics
export const getUserStats = async (userId: string) => {
  try {
    const response = await axios.get(`${API_URL}/scores/stats/${userId}`);
    return response.data as {
      totalExams: number;
      averageScore: number;
      highestScore: number;
      sectionAverages: Record<keyof SectionScores, number>;
    };
  } catch (error) {
    console.error('Error fetching user stats:', error);
    throw error;
  }
};

// Get leaderboard
export const getLeaderboard = async (limit: number = 10) => {
  try {
    const response = await axios.get(`${API_URL}/scores/leaderboard`, {
      params: { limit }
    });
    return response.data as Array<{
      username: string;
      score: number;
      total: number;
      percentage: number;
      date: string;
    }>;
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    throw error;
  }
};
