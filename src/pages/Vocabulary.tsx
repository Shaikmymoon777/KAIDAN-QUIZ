import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle, XCircle, ArrowRight, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Types
type QuestionType = 'vocabulary' | 'sentence-selection' | 'sentence-matching';

interface VocabularyQuestion {
  id: string;
  word: string;
  reading: string;
  meaning: string;
  example: string;
}

interface SentenceSelectionQuestion {
  id: string;
  word: string;
  options: string[];
  correct: number;
}

interface SentenceMatchingQuestion {
  id: string;
  sentence: string;
  options: string[];
  correct: number;
}

// Sample data
const vocabularyData: VocabularyQuestion[] = [
  {
    id: 'v1',
    word: '食べる',
    reading: 'たべる',
    meaning: 'to eat',
    example: '朝ごはんを食べます。 (I eat breakfast.)'
  },
  {
    id: 'v2',
    word: '飲む',
    reading: 'のむ',
    meaning: 'to drink',
    example: 'お茶を飲みます。 (I drink tea.)'
  },
  // Add more vocabulary words as needed
];

const sentenceSelectionData: SentenceSelectionQuestion[] = [
  {
    id: 's1',
    word: '食べる',
    options: [
      'I eat breakfast every morning.',
      'I drink coffee every morning.',
      'I sleep at 10 PM.',
      'I go to school by bus.'
    ],
    correct: 0
  },
  // Add more sentence selection questions as needed
];

const sentenceMatchingData: SentenceMatchingQuestion[] = [
  {
    id: 'm1',
    sentence: 'I eat breakfast at 7 AM.',
    options: [
      'I eat breakfast at 7 AM.',
      'I eat lunch at 1 PM.',
      'I eat dinner at 8 PM.',
      'I eat snacks in the evening.'
    ],
    correct: 0
  },
  // Add more sentence matching questions as needed
];

const Vocabulary = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<QuestionType>('vocabulary');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const currentVocabulary = vocabularyData[currentIndex % vocabularyData.length];
  const currentSelection = sentenceSelectionData[currentIndex % sentenceSelectionData.length];
  const currentMatching = sentenceMatchingData[currentIndex % sentenceMatchingData.length];

  const handleNext = () => {
    setSelectedOption(null);
    setShowAnswer(false);
    if (activeTab === 'vocabulary' && currentIndex < vocabularyData.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (activeTab === 'sentence-selection' && currentIndex < sentenceSelectionData.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (activeTab === 'sentence-matching' && currentIndex < sentenceMatchingData.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setQuizCompleted(true);
    }
  };

  const handleOptionSelect = (index: number) => {
    if (showAnswer) return;
    setSelectedOption(index);
    
    const isCorrect = 
      (activeTab === 'sentence-selection' && index === currentSelection.correct) ||
      (activeTab === 'sentence-matching' && index === currentMatching.correct);
    
    if (isCorrect) {
      setScore(score + 1);
    }
    
    setShowAnswer(true);
  };

  const resetQuiz = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setShowAnswer(false);
    setScore(0);
    setQuizCompleted(false);
  };

  const renderContent = () => {
    if (quizCompleted) {
      return (
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold mb-4">Quiz Completed!</h2>
          <p className="text-xl mb-6">Your score: {score} out of {currentIndex + 1}</p>
          <button
            onClick={resetQuiz}
            className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-6 rounded-full transition duration-300"
          >
            Restart Quiz
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case 'vocabulary':
        return (
          <div className="p-6 bg-white rounded-xl shadow-md">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">{currentVocabulary.word}</h2>
              <p className="text-gray-600 text-xl mb-4">{currentVocabulary.reading}</p>
              
              {showAnswer && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-lg text-gray-700"><span className="font-semibold">Meaning:</span> {currentVocabulary.meaning}</p>
                  <p className="text-lg text-gray-700 mt-2"><span className="font-semibold">Example:</span> {currentVocabulary.example}</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-center mt-8">
              <button
                onClick={() => setShowAnswer(!showAnswer)}
                className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-8 rounded-full transition duration-300 flex items-center"
              >
                {showAnswer ? 'Hide Answer' : 'Show Answer'}
              </button>
              
              {showAnswer && (
                <button
                  onClick={handleNext}
                  className="ml-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-full transition duration-300 flex items-center"
                >
                  Next <ArrowRight className="ml-2" />
                </button>
              )}
            </div>
          </div>
        );

      case 'sentence-selection':
        return (
          <div className="p-6 bg-white rounded-xl shadow-md">
            <h2 className="text-2xl font-bold text-center mb-8">Select the correct sentence for:</h2>
            <h3 className="text-3xl text-center font-bold text-pink-600 mb-8">{currentSelection.word}</h3>
            
            <div className="space-y-4">
              {currentSelection.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleOptionSelect(index)}
                  disabled={showAnswer}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                    showAnswer
                      ? index === currentSelection.correct
                        ? 'border-green-500 bg-green-50'
                        : selectedOption === index
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                      : selectedOption === index
                      ? 'border-pink-500 bg-pink-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                      showAnswer && index === currentSelection.correct 
                        ? 'bg-green-500 text-white' 
                        : showAnswer && selectedOption === index 
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span>{option}</span>
                  </div>
                </button>
              ))}
            </div>
            
            {showAnswer && (
              <div className="mt-8 text-center">
                <button
                  onClick={handleNext}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-full transition duration-300 flex items-center mx-auto"
                >
                  Continue <ArrowRight className="ml-2" />
                </button>
              </div>
            )}
          </div>
        );

      case 'sentence-matching':
        return (
          <div className="p-6 bg-white rounded-xl shadow-md">
            <h2 className="text-2xl font-bold text-center mb-8">Find the matching sentence:</h2>
            <div className="bg-pink-50 p-4 rounded-lg mb-8">
              <p className="text-xl text-center">"{currentMatching.sentence}"</p>
            </div>
            
            <div className="space-y-4">
              {currentMatching.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleOptionSelect(index)}
                  disabled={showAnswer}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                    showAnswer
                      ? index === currentMatching.correct
                        ? 'border-green-500 bg-green-50'
                        : selectedOption === index
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                      : selectedOption === index
                      ? 'border-pink-500 bg-pink-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                      showAnswer && index === currentMatching.correct 
                        ? 'bg-green-500 text-white' 
                        : showAnswer && selectedOption === index 
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span>{option}</span>
                  </div>
                </button>
              ))}
            </div>
            
            {showAnswer && (
              <div className="mt-8 text-center">
                <button
                  onClick={handleNext}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-full transition duration-300 flex items-center mx-auto"
                >
                  Continue <ArrowRight className="ml-2" />
                </button>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-pink-600 hover:text-pink-800 mr-4"
          >
            <ArrowLeft className="mr-1" /> Back
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Vocabulary Practice</h1>
        </div>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => {
                setActiveTab('vocabulary');
                resetQuiz();
              }}
              className={`flex-1 py-4 px-6 text-center font-medium ${
                activeTab === 'vocabulary'
                  ? 'text-pink-600 border-b-2 border-pink-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <BookOpen className="inline-block mr-2" />
              Vocabulary
            </button>
            <button
              onClick={() => {
                setActiveTab('sentence-selection');
                resetQuiz();
              }}
              className={`flex-1 py-4 px-6 text-center font-medium ${
                activeTab === 'sentence-selection'
                  ? 'text-pink-600 border-b-2 border-pink-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <CheckCircle className="inline-block mr-2" />
              Sentence Selection
            </button>
            <button
              onClick={() => {
                setActiveTab('sentence-matching');
                resetQuiz();
              }}
              className={`flex-1 py-4 px-6 text-center font-medium ${
                activeTab === 'sentence-matching'
                  ? 'text-pink-600 border-b-2 border-pink-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <CheckCircle className="inline-block mr-2" />
              Sentence Matching
            </button>
          </div>
          
          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        
        <div className="text-center text-gray-500 text-sm">
          <p>Question {currentIndex + 1} of {
            activeTab === 'vocabulary' ? vocabularyData.length : 
            activeTab === 'sentence-selection' ? sentenceSelectionData.length : 
            sentenceMatchingData.length
          }</p>
        </div>
      </div>
    </div>
  );
};

export default Vocabulary;
