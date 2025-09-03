// Question Types
export interface VocabularyQuestion {
  id: string;
  question: string;
  options: string[];
  correct: number;
  explanation?: string;
}

export interface ListeningQuestion {
  text: any;
  audioSrc: string;
  id: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface ListeningSectionData {
  story: {
    title: string;
    content: string;
  };
  questions: ListeningQuestion[];
}

export interface SpeakingQuestion {
  text: string;
  id: string;
  sentence: string;
}

// Answer Types
export interface UserAnswerBase {
  questionId: string | number;
  section: 'vocabulary' | 'listening' | 'speaking';
  correct?: boolean;
  feedback?: string;
  isCorrect?: boolean;
  timestamp?: string;
}

export interface VocabularyAnswer extends UserAnswerBase {
  answer: string | number;
  isCorrect: boolean;
  section: 'vocabulary';
}

export interface ListeningAnswer extends UserAnswerBase {
  answer: string | number;
  isCorrect: boolean;
  section: 'listening';
}

export interface SpeakingAnswer extends UserAnswerBase {
  answer: string | undefined;
  audioUrl?: string;
  score?: number;
  section: 'speaking';
}

export type UserAnswer = VocabularyAnswer | ListeningAnswer | SpeakingAnswer;

// Score Types
export interface SectionScore {
  score: number;
  totalQuestions: number;
  percentage: number;
  maxPossible?: number;
  averagePerQuestion?: number;
  rawScore?: number;
}

export interface ScoreResponse {
  id: string;
  userId: string;
  username: string;
  score: number;
  totalQuestions: number;
  date: string;
  formattedDate: string;
  vocabulary?: SectionScore;
  listening?: SectionScore;
  speaking?: SectionScore & {
    rawScore?: number;
  };
}

export interface ExamScores {
  vocabulary: SectionScore;
  listening: SectionScore;
  speaking: SectionScore;
  score: number;
  total: number;
  details?: any;
}

// Component Props
export interface ResultsProps {
  scores: ExamScores;
  onBackToDashboard: () => void;
}

export type ExamSection = 'vocabulary' | 'listening' | 'speaking' | 'results';

export interface ExamState {
  currentSection: ExamSection;
  currentQuestionIndex: number;
  timeRemaining: number;
  isSubmitting: boolean;
  isComplete: boolean;
  error: string | null;
  userAnswers: Record<string, UserAnswer>;
  scores: ExamScores | null;
}
