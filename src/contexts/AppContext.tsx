import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from 'react';

/* ────────────────────────
   Types & Interfaces
   ──────────────────────── */

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
  isLoggedIn: boolean; // ← NEW
}

/* ────────────────────────
   Actions
   ──────────────────────── */

type AppAction =
  | { type: 'SET_USER'; payload: Partial<User> }
  | {
      type: 'UPDATE_QUIZ_PROGRESS';
      payload: { level: string; set: string; score: number; timeSpent: number };
    }
  | { type: 'UPDATE_PRACTICE_PROGRESS'; payload: { type: string; data: any } }
  | { type: 'ADD_RANKING_ENTRY'; payload: RankingEntry }
  | { type: 'LOAD_STATE'; payload: AppState }
  | { type: 'LOGIN'; payload: AppState } // ← NEW
  | { type: 'LOGOUT' };

/* ────────────────────────
   Initial State
   ──────────────────────── */

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
    {
      id: '1',
      name: 'Sakura',
      score: 95,
      level: 'N1',
      date: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Takeshi',
      score: 92,
      level: 'N2',
      date: new Date().toISOString(),
    },
    {
      id: '3',
      name: 'Yuki',
      score: 89,
      level: 'N3',
      date: new Date().toISOString(),
    },
    {
      id: '4',
      name: 'Hiroshi',
      score: 87,
      level: 'N4',
      date: new Date().toISOString(),
    },
    {
      id: '5',
      name: 'Miyuki',
      score: 85,
      level: 'N5',
      date: new Date().toISOString(),
    },
  ],
  isLoggedIn: false, // ← NEW
};

/* ────────────────────────
   Reducer
   ──────────────────────── */

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    /* ── Auth ────────────────── */
    case 'LOGIN':
      // action.payload should be the state you loaded from backend / storage
      return { ...action.payload, isLoggedIn: true };

    case 'LOGOUT':
      return {
        ...initialState,
        user: {
          ...initialState.user,
          id: crypto.randomUUID(),
          joinDate: new Date().toISOString(),
        },
        isLoggedIn: false,
      };

    /* ── State persistence ───── */
    case 'LOAD_STATE':
      // ensure isLoggedIn exists even on older stored data
      return { ...action.payload, isLoggedIn: action.payload.isLoggedIn ?? false };

    /* ── User & progress ─────── */
    case 'SET_USER':
      return { ...state, user: { ...state.user, ...action.payload } };

    case 'UPDATE_QUIZ_PROGRESS': {
      const { level, set, score, timeSpent } = action.payload;
      const current = state.quizProgress[level]?.[set] ?? {
        completed: false,
        bestScore: 0,
        attempts: 0,
        timeSpent: 0,
      };
      const updatedLevel = {
        ...state.quizProgress[level],
        [set]: {
          completed: score >= 60,
          bestScore: Math.max(current.bestScore, score),
          attempts: current.attempts + 1,
          timeSpent: current.timeSpent + timeSpent,
        },
      };
      return {
        ...state,
        quizProgress: { ...state.quizProgress, [level]: updatedLevel },
      };
    }

    case 'UPDATE_PRACTICE_PROGRESS':
      return {
        ...state,
        practiceProgress: {
          ...state.practiceProgress,
          [action.payload.type]: {
            ...state.practiceProgress[
              action.payload.type as keyof PracticeProgress
            ],
            ...action.payload.data,
          },
        },
      };

    case 'ADD_RANKING_ENTRY':
      return {
        ...state,
        rankings: [...state.rankings, action.payload]
          .sort((a, b) => b.score - a.score)
          .slice(0, 20),
      };

    /* ── default ─────────────── */
    default:
      return state;
  }
}

/* ────────────────────────
   Context & Provider
   ──────────────────────── */

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  /* Load saved state once on mount */
  useEffect(() => {
    const saved = localStorage.getItem('japanese-learning-app-state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        dispatch({
          type: 'LOAD_STATE',
          payload: { ...initialState, ...parsed },
        });
      } catch (err) {
        console.error('Failed to parse saved state:', err);
      }
    }
  }, []);

  /* Persist state whenever it changes */
  useEffect(() => {
    localStorage.setItem('japanese-learning-app-state', JSON.stringify(state));
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

/* ────────────────────────
   Hook
   ──────────────────────── */

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within an AppProvider');
  return ctx;
};

/* ────────────────────────
   Example helper (optional)
   ──────────────────────── */

// Example logout handler (place in a component):
// const { dispatch } = useApp();
// const handleLogout = () => dispatch({ type: 'LOGOUT' });
