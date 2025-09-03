import React, { useMemo, useEffect, useCallback } from 'react';

interface VocabularyQuestion {
  id: string | number;
  japanese: string;
  reading: string;
  meaning: string;
  options?: string[];
}

interface VocabularySectionProps {
  questions: VocabularyQuestion[];
  currentQuestionIndex: number;
  selectedAnswer: string | null;
  onAnswerSelect: (questionId: string | number, answer: string, correctAnswer: string, isCorrect: boolean) => void;
}

// Helper function to get random items from array

// Speech synthesis function
const speak = (text: string, lang = 'ja-JP') => {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9;
    speechSynthesis.speak(utterance);
  }
};

const VocabularySection: React.FC<VocabularySectionProps> = ({
  questions,
  currentQuestionIndex,
  selectedAnswer,
  onAnswerSelect,
}) => {
  const currentQuestion = questions[currentQuestionIndex];
  
  // Generate a stable key for consistent randomization based on question id
  const getStableOptions = useCallback((question: VocabularyQuestion, allQuestions: VocabularyQuestion[]) => {
    if (question.options && question.options.length > 0) {
      return [...question.options];
    }

    // Create a stable seed based on question id
    const seed = question.id.toString().split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Get all possible options (meanings of other questions)
    const allOptions = allQuestions
      .filter(q => q.id !== question.id)
      .map(q => q.meaning);
    
    // Select 3 unique options using the seed
    const selectedOptions: string[] = [];
    let options = [...allOptions];
    
    // Simple deterministic shuffle based on seed
    for (let i = 0; i < 3 && options.length > 0; i++) {
      const randomIndex = (seed * (i + 1)) % options.length;
      selectedOptions.push(options[randomIndex]);
      options = options.filter((_, idx) => idx !== randomIndex);
    }
    
    // Combine with correct answer and shuffle
    const finalOptions = [question.meaning, ...selectedOptions];
    return finalOptions.sort((a, b) => 
      (question.id.toString() + a).localeCompare(question.id.toString() + b)
    );
  }, []);

  // Memoize the options to be consistent for each question
  const options = useMemo(() => {
    if (!currentQuestion) return [];
    return getStableOptions(currentQuestion, questions);
  }, [currentQuestion, questions, getStableOptions]);

  // Speak the Japanese text when question changes
  useEffect(() => {
    if (currentQuestion) {
      speak(currentQuestion.japanese);
    }
    return () => {
      speechSynthesis.cancel();
    };
  }, [currentQuestion]);

  const handleAnswerClick = (option: string) => {
    if (!currentQuestion) return;
    const isCorrect = option === currentQuestion.meaning;
    onAnswerSelect(currentQuestion.id, option, currentQuestion.meaning, isCorrect);
  };

  if (!currentQuestion) return null;

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold">{currentQuestion.japanese}</h3>
          <button 
            onClick={() => speak(currentQuestion.japanese)}
            className="p-2 text-blue-600 hover:text-blue-800"
            aria-label="Play pronunciation"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          </button>
        </div>
        <p className="text-gray-600 mb-6">{currentQuestion.reading}</p>
        
        <div className="space-y-3">
          {options.map((option, index) => (
            <div 
              key={index}
              onClick={() => handleAnswerClick(option)}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedAnswer === option 
                  ? 'bg-blue-100 border-blue-500' 
                  : 'hover:bg-gray-50 border-gray-200'
              }`}
            >
              {option}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VocabularySection;
