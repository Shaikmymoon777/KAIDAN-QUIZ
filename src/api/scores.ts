import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Types
export interface SectionScore {
  score: number;
  totalQuestions: number;
  percentage: number;
}

export interface ExamScores {
  vocabulary: SectionScore;
  listening: SectionScore;
  speaking: SectionScore;
}

export interface ScoreData {
  userId: string;
  username: string;
  scores: ExamScores;
  date: string;
  totalScore?: number;
  totalQuestions?: number;
  percentage?: number;
}

// Save score to the database
export const saveScore = async (
  userId: string, 
  scores: ExamScores,
  scoreData: any
) => {
  try {
    // Prepare data for backend - include all scores for storage
    const response = await axios.post(`${API_URL}/scores`, {
      userId,
      username: scoreData.username || 'Anonymous',
      answers: scoreData.answers || {},
      questions: scoreData.questions || {},
      // Include all scores in the request for backend storage
      scores: {
        vocabulary: scores.vocabulary,
        listening: scores.listening,
        speaking: scores.speaking // Still send speaking scores to backend
      }
    });

    // Process response to remove speaking scores before returning to UI
    const responseData = response.data;
    
    // Remove speaking scores from the response
    if (responseData.speaking) {
      delete responseData.speaking;
    }
    
    return responseData;
  } catch (error) {
    console.error('Error saving score:', error);
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
      sectionAverages: Record<keyof ExamScores, number>;
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

// Get all scores (for admin)
export const getScores = async (userId: string) => {
  try {
    const response = await axios.get(`${API_URL}/scores?userId=${userId}`);
    
    // Process scores to remove speaking section
    const scores = Array.isArray(response.data) 
      ? response.data.map((score: any) => {
          const { speaking, ...rest } = score;
          return rest;
        })
      : [];
      
    return scores;
  } catch (error) {
    console.error('Error fetching scores:', error);
    throw error;
  }
};
