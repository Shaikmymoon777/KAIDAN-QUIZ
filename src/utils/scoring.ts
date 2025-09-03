import { UserAnswer, ExamScores, SectionScore } from '../types/exam';

interface Question {
  id: string | number;
  correctAnswer?: string;
  meaning?: string;
}

const createSectionScore = (score = 0, total = 0): SectionScore => ({
  score,
  totalQuestions: total,
  percentage: Math.round((score / Math.max(1, total)) * 100) || 0
});

export const calculateScores = (
  userAnswers: Record<string, UserAnswer>,
  questions: Question[],
  section: 'vocabulary' | 'listening' | 'speaking'
): ExamScores => {
  const scores: ExamScores = {
    score: 0,
    total: questions.length,
    details: {},
    vocabulary: createSectionScore(),
    listening: createSectionScore(),
    speaking: createSectionScore()
  };

  questions.forEach(question => {
    const userAnswer = userAnswers[question.id];
    
    if (!userAnswer) {
      scores.details[question.id] = { 
        isCorrect: false, 
        correctAnswer: question.correctAnswer || question.meaning,
        userAnswer: undefined
      };
      return;
    }

    let isCorrect = false;
    
    if (section === 'vocabulary') {
      isCorrect = 'isCorrect' in userAnswer 
        ? Boolean(userAnswer.isCorrect)
        : userAnswer.answer === question.correctAnswer || 
          userAnswer.answer === question.meaning;
    } else if (section === 'listening') {
      // For listening, first check if isCorrect is already set
      if ('isCorrect' in userAnswer) {
        isCorrect = Boolean(userAnswer.isCorrect);
      } else {
        // Fallback to checking the answer against the correct index
        const correctIndex = (question as any).correct;
        if (correctIndex !== undefined) {
          isCorrect = userAnswer.answer === correctIndex || 
                     (typeof userAnswer.answer === 'string' && 
                      parseInt(userAnswer.answer, 10) === correctIndex);
        }
      }
    } else if (section === 'speaking') {
      isCorrect = 'score' in userAnswer ? Boolean(userAnswer.score && userAnswer.score > 0) : false;
    }

    // Always update the score if the answer is correct
    if (isCorrect) {
      scores.score += 1;
      scores[section] = {
        score: (scores[section]?.score || 0) + 1,
        totalQuestions: questions.length,
        percentage: Math.round((((scores[section]?.score || 0) + 1) / questions.length) * 100) || 0
      };
    } else {
      // Make sure to update the section score even if the answer is incorrect
      scores[section] = {
        score: scores[section]?.score || 0,
        totalQuestions: questions.length,
        percentage: Math.round(((scores[section]?.score || 0) / questions.length) * 100) || 0
      };
    }

    scores.details[question.id] = {
      isCorrect,
      correctAnswer: question.correctAnswer || question.meaning,
      userAnswer: 'answer' in userAnswer ? userAnswer.answer : undefined
    };
  });

  return scores;
};

export const calculateTotalScores = (
  vocabScores: ExamScores,
  listeningScores: ExamScores,
  speakingScores: ExamScores
) => {
  const totalScore = vocabScores.score + listeningScores.score + speakingScores.score;
  const totalQuestions = vocabScores.total + listeningScores.total + speakingScores.total;
  
  return {
    totalScore,
    totalQuestions,
    percentage: Math.round((totalScore / Math.max(1, totalQuestions)) * 100) || 0,
    sections: {
      vocabulary: vocabScores.vocabulary,
      listening: listeningScores.listening,
      speaking: speakingScores.speaking
    }
  };
};
