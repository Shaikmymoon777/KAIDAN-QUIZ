import React, { useEffect, useMemo } from 'react';

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
  
  // Pre-generate all options when the component mounts
  const questionOptions = useMemo(() => {
    const optionsMap = new Map<string | number, {text: string, key: string}[]>();
    
    questions.forEach(question => {
      if (question.options?.length) {
        optionsMap.set(question.id, question.options.map(opt => ({
          text: opt,
          key: `${question.id}-${opt}`
        })));
        return;
      }
      
      const seed = question.id.toString().split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const allOptions = questions
        .filter(q => q.id !== question.id)
        .map(q => q.meaning);
      
      const selectedOptions: string[] = [];
      const usedIndices = new Set<number>();
      
      // Select 3 unique options
      for (let i = 0; i < 3 && usedIndices.size < allOptions.length; i++) {
        const index = Math.abs((seed * (i + 1)) % allOptions.length);
        if (!usedIndices.has(index)) {
          selectedOptions.push(allOptions[index]);
          usedIndices.add(index);
        }
      }
      
      // Combine with correct answer and sort
      const finalOptions = [question.meaning, ...selectedOptions];
      
      // Stable sort based on content hash
      finalOptions.sort((a, b) => {
        const hashA = a.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const hashB = b.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return (seed + hashA) - (seed + hashB);
      });
      
      // Store with stable keys
      optionsMap.set(question.id, finalOptions.map(opt => ({
        text: opt,
        key: `${question.id}-${opt}`
      })));
    });
    
    return optionsMap;
  }, [questions]);
  
  const currentOptions = questionOptions.get(currentQuestion.id) || [];

  // Speak the Japanese text when question changes
  useEffect(() => {
    if (currentQuestion) {
      speak(currentQuestion.japanese);
    }
    return () => {
      speechSynthesis.cancel();
    };
  }, [currentQuestion?.id]);

  const handleAnswerClick = (option: string) => {
    if (!currentQuestion) return;
    const isCorrect = option === currentQuestion.meaning;
    onAnswerSelect(currentQuestion.id, option, currentQuestion.meaning, isCorrect);
  };

  if (!currentQuestion || currentOptions.length === 0) return null;

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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          </button>
        </div>
        <p className="text-gray-600 mb-6">{currentQuestion.reading}</p>
        
        <div className="space-y-3">
          {currentOptions.map(option => (
            <div 
              key={option.key}
              onClick={() => handleAnswerClick(option.text)}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedAnswer === option.text 
                  ? 'bg-blue-100 border-blue-500' 
                  : 'hover:bg-gray-50 border-gray-200'
              }`}
            >
              {option.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VocabularySection;
