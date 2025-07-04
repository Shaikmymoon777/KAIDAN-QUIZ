import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  avatar?: string;
  level: string;
  totalQuizzes: number;
  averageScore: number;
  streak: number;
  joinDate: string;
}

export interface QuizProgress {
  [level: string]: {
    [set: string]: {
      completed: boolean;
      bestScore: number;
      attempts: number;
      timeSpent: number;
    };
  };
}

export interface PracticeProgress {
  flashcards: {
    hiragana: { completed: number; total: number; streak: number };
    katakana: { completed: number; total: number; streak: number };
  };
  vocabulary: {
    [level: string]: {
      accuracy: number;
      wordsLearned: number;
      streak: number;
    };
  };
}

export interface RankingEntry {
  id: string;
  name: string;
  score: number;
  level: string;
  date: string;
}

export interface AppState {
  user: User;
  quizProgress: QuizProgress;
  practiceProgress: PracticeProgress;
  rankings: RankingEntry[];
}

type AppAction =
  | { type: 'SET_USER'; payload: Partial<User> }
  | { type: 'UPDATE_QUIZ_PROGRESS'; payload: { level: string; set: string; score: number; timeSpent: number } }
  | { type: 'UPDATE_PRACTICE_PROGRESS'; payload: { type: string; data: any } }
  | { type: 'ADD_RANKING_ENTRY'; payload: RankingEntry }
  | { type: 'LOAD_STATE'; payload: AppState }
  | { type: 'LOGOUT' }; // <-- Add this line

const initialState: AppState = {
  user: {
    id: crypto.randomUUID(),
    name: 'Student',
    level: 'N5',
    totalQuizzes: 0,
    averageScore: 0,
    streak: 0,
    joinDate: new Date().toISOString(),
  },
  quizProgress: {},
  practiceProgress: {
    flashcards: {
      hiragana: { completed: 0, total: 46, streak: 0 },
      katakana: { completed: 0, total: 46, streak: 0 },
    },
    vocabulary: {},
  },
  rankings: [
    { id: '1', name: 'Sakura', score: 95, level: 'N1', date: new Date().toISOString() },
    { id: '2', name: 'Takeshi', score: 92, level: 'N2', date: new Date().toISOString() },
    { id: '3', name: 'Yuki', score: 89, level: 'N3', date: new Date().toISOString() },
    { id: '4', name: 'Hiroshi', score: 87, level: 'N4', date: new Date().toISOString() },
    { id: '5', name: 'Miyuki', score: 85, level: 'N5', date: new Date().toISOString() },
  ],
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: { ...state.user, ...action.payload } };
    case 'UPDATE_QUIZ_PROGRESS': {
      const { level, set, score, timeSpent } = action.payload;
      const currentProgress = state.quizProgress[level]?.[set] || { completed: false, bestScore: 0, attempts: 0, timeSpent: 0 };
      const newProgress = {
        ...state.quizProgress,
        [level]: {
          ...state.quizProgress[level],
          [set]: {
            completed: score >= 60,
            bestScore: Math.max(currentProgress.bestScore, score),
            attempts: currentProgress.attempts + 1,
            timeSpent: currentProgress.timeSpent + timeSpent,
          },
        },
      };
      return { ...state, quizProgress: newProgress };
    }
    case 'UPDATE_PRACTICE_PROGRESS':
      return {
        ...state,
        practiceProgress: {
          ...state.practiceProgress,
          [action.payload.type]: { ...state.practiceProgress[action.payload.type as keyof PracticeProgress], ...action.payload.data },
        },
      };
    case 'ADD_RANKING_ENTRY':
      const newRankings = [...state.rankings, action.payload]
        .sort((a, b) => b.score - a.score)
        .slice(0, 20);
      return { ...state, rankings: newRankings };
    case 'LOAD_STATE':
      return action.payload;
    case 'LOGOUT':
      return {
        ...state,
        user: {
          id: crypto.randomUUID(),
          name: 'Student',
          level: 'N5',
          totalQuizzes: 0,
          averageScore: 0,
          streak: 0,
          joinDate: new Date().toISOString(),
        },
        quizProgress: {}, // <-- Reset quiz progress
        practiceProgress: {
          flashcards: {
            hiragana: { completed: 0, total: 46, streak: 0 },
            katakana: { completed: 0, total: 46, streak: 0 },
          },
          vocabulary: {},
        },
      };
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    const savedState = localStorage.getItem('japanese-learning-app-state');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        dispatch({ type: 'LOAD_STATE', payload: { ...initialState, ...parsedState } });
      } catch (error) {
        console.error('Failed to load saved state:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('japanese-learning-app-state', JSON.stringify(state));
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

// Example usage of useApp (move this to a component file if needed)
// const { dispatch } = useApp();
// const handleLogout = () => {
//   dispatch({ type: 'LOGOUT' });
//   // ...any other logout logic (like redirect)...
// };