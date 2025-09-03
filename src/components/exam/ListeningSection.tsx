import React, { useEffect, useState } from 'react';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis';

export interface ListeningQuestion {
  id: string;
  q: string;
  options: string[];
  answer: string;
  correct?: number; // Added for backward compatibility
}

interface ListeningSectionProps {
  questions: ListeningQuestion[];
  currentQuestionIndex: number;
  selectedAnswer: number | string | null;
  onAnswerSelect: (questionId: string, answerIndex: number, isCorrect: boolean) => void;
  story: {
    title: string;
    content: string;
  };
}

const ListeningSection: React.FC<ListeningSectionProps> = ({
  questions,
  currentQuestionIndex,
  selectedAnswer,
  onAnswerSelect,
  story
}) => {
  const [showScript, setShowScript] = useState(false);
  const currentQuestion = questions[currentQuestionIndex];
  const { speak: speakStory } = useSpeechSynthesis(story?.content || '');
  const { speak: speakQuestion } = useSpeechSynthesis(currentQuestion?.q || '');

  useEffect(() => {
    // Clean up any ongoing speech when component unmounts or question changes
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [currentQuestionIndex]);

  const handlePlayStory = () => {
    if (story?.content) {
      speakStory();
    }
  };

  const handlePlayQuestion = () => {
    if (currentQuestion?.q) {
      speakQuestion();
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (!currentQuestion) return;
    
    const isCorrect = currentQuestion.options[answerIndex] === currentQuestion.answer;
    onAnswerSelect(currentQuestion.id, answerIndex, isCorrect);
  };

  if (!currentQuestion) return null;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Listening Comprehension</h2>
          <button
            onClick={() => setShowScript(!showScript)}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            {showScript ? 'Hide Script' : 'Show Script'}
          </button>
        </div>
        
        {showScript && (
          <div className="mb-6 p-4 bg-gray-50 rounded">
            <h3 className="font-semibold mb-2">{story.title}</h3>
            <p className="whitespace-pre-line">{story.content}</p>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={handlePlayStory}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              <span>▶️</span>
              <span>Play Story</span>
            </button>
            <button
              onClick={handlePlayQuestion}
              className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200"
            >
              <span>▶️</span>
              <span>Play Question</span>
            </button>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-medium mb-4">{currentQuestion.q}</h3>
            <div className="space-y-2">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className={`w-full text-left p-3 rounded border ${
                    selectedAnswer === index
                      ? 'bg-blue-100 border-blue-500'
                      : 'hover:bg-gray-50 border-gray-200'
                  }`}
                >
                  {String.fromCharCode(65 + index)}. {option}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListeningSection;
