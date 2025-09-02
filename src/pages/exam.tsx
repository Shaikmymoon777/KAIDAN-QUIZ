<<<<<<< HEAD
import { useState, useEffect, useRef, useCallback } from 'react';
=======
import { useState, useEffect, useCallback } from 'react';
>>>>>>> 4d3957774c580a7e5924e3010122c83da2f24307
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/usercontext';
import emailjs from '@emailjs/browser';
import vocabularyData from '../data/vocab/vocabulary.json';
import { saveScore } from '../api/scores';

// EmailJS Configuration - Direct values
const EMAILJS_PUBLIC_KEY = 'apCvL9RIRkvZDjG';
const EMAILJS_SERVICE_ID = 'service_dzsjpmy';
const EMAILJS_TEMPLATE_ID = 'template_w3l4zw9';

// Initialize EmailJS
try {
  emailjs.init(EMAILJS_PUBLIC_KEY);
  console.log('EmailJS initialized successfully');
} catch (error) {
  console.error('Failed to initialize EmailJS:', error);
}

type ExamSection = 'vocabulary';

interface GeminiVocabularyQuestion {
  id: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  part: string;
  type: 'vocabulary' | 'grammar' | 'kanji' | 'reading';
  japanese?: string;
  reading?: string;
  meaning?: string;
}

interface VocabularyItem {
  id: number;
  japanese: string;
  reading: string;
  meaning: string;
  kanji?: string;
}

// Function to shuffle an array using a seeded random algorithm
const prepareVocabularyQuestions = (vocabData: VocabularyItem[], count: number = 25): GeminiVocabularyQuestion[] => {
  // Filter out items with kanji
  const filteredVocabData = vocabData.filter(item => !item.kanji || item.kanji.trim() === '');
  
  // Use a seeded random for consistent randomization per user
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  const userSeed = localStorage.getItem('userId') 
    ? parseInt(localStorage.getItem('userId') || '0', 36) 
    : Math.floor(Math.random() * 1000000);
  
  const shuffled = [...filteredVocabData].sort((a, b) => 
    seededRandom(userSeed + a.id) - seededRandom(userSeed + b.id)
  );
  
  // Ensure exactly 25 questions (or less if data is limited)
  const selectedQuestions = shuffled.slice(0, Math.min(count, shuffled.length));
  
  return selectedQuestions.map((item, index) => {
    const options = generateOptions(filteredVocabData, item.meaning, 3);
    const correctIndex = options.findIndex(opt => opt === item.meaning);
    
    return {
      id: `vocab-${index}`,
      question: `What is the meaning of "${item.reading}"?`,
      options: options,
      correct: correctIndex >= 0 ? correctIndex : 0,
      explanation: `The correct answer is: ${item.meaning} (${item.japanese})`,
      part: 'vocabulary',
      type: 'vocabulary',
      japanese: item.japanese,
      reading: item.reading,
      meaning: item.meaning
    };
  });
};

const generateOptions = (vocabData: VocabularyItem[], correctAnswer: string, count: number) => {
  const otherWords = vocabData
    .filter(w => w.meaning !== correctAnswer)
    .sort(() => 0.5 - Math.random())
    .slice(0, count)
    .map(w => w.meaning);
  
  const options = [correctAnswer, ...otherWords].sort(() => 0.5 - Math.random());
  
  return options;
};

const VOCAB_QUESTION_COUNT = 25;
const EXAM_DURATION = 30 * 60 * 1000;

// Format time in milliseconds to MM:SS format
const formatTime = (milliseconds: number): string => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const Exam: React.FC = () => {
  const { user, loading: userLoading } = useUser();
  const navigate = useNavigate();
  
  // Check authentication status when user changes
  useEffect(() => {
    if (!userLoading && !user) {
      navigate('/login', { 
        state: { 
          from: window.location.pathname,
          message: 'Please log in to access the exam.'
        },
        replace: true
      });
    }
  }, [user, userLoading, navigate]);

  // Show loading state while checking auth
  if (userLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

<<<<<<< HEAD
  const [currentSection, setCurrentSection] = useState<ExamSection>('vocabulary');
=======
  const [currentSection] = useState<ExamSection>('vocabulary');
>>>>>>> 4d3957774c580a7e5924e3010122c83da2f24307
  const [vocabularyQuestions, setVocabularyQuestions] = useState<GeminiVocabularyQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [examCompleted, setExamCompleted] = useState(false);
  const [, setVocabScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{questionId: string; selected?: number | null; correct: boolean; feedback?: string; section?: string}[]>([]);
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION);
  const [examStarted, setExamStarted] = useState(false);
<<<<<<< HEAD
  const [, setRecognition] = useState<SpeechRecognition | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<string | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [, setAudioChunks] = useState<Blob[]>([]);
  const [emailStatus, setEmailStatus] = useState<{success: boolean; message: string} | null>(null);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
=======
>>>>>>> 4d3957774c580a7e5924e3010122c83da2f24307

  useEffect(() => {
    const storedUser = localStorage.getItem('username');
    if (storedUser) {
      // setUsername(storedUser);
    }

    const history = localStorage.getItem('scoreHistory');
    if (history) {
      try {
        // setScoreHistory(JSON.parse(history));
      } catch (err) {
        console.error('Error parsing score history:', err);
      }
    }

    // Load questions when component mounts
    loadQuestions();
  }, []);

  const sendResultsEmail = useCallback(async (results: {
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    percentage: number;
  }): Promise<boolean> => {
    if (!user?.email) {
      console.error('No email found for the user');
      return false;
    }

<<<<<<< HEAD
  const sendResultsEmail = useCallback(async (results: {
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    percentage: number;
  }): Promise<boolean> => {
    if (!user?.email) {
      console.error('No email found for the user');
      return false;
    }

=======
>>>>>>> 4d3957774c580a7e5924e3010122c83da2f24307
    try {
      const templateParams = {
        to_email: user.email,
        to_name: user.username || 'User',
        score: results.score,
        total_questions: results.totalQuestions,
        correct_answers: results.correctAnswers,
        percentage: results.percentage,
      };

      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );
      
      console.log('Results email sent successfully');
      return true;
    } catch (error) {
      console.error('Failed to send results email:', error);
      return false;
    }
  }, [user]);

  const handleAutoSubmit = useCallback(async () => {
<<<<<<< HEAD
    setExamCompleted(true);
    
    // Calculate vocabulary score
    const vocabCorrect = userAnswers
      .filter(a => a.questionId.startsWith('vocab-') && a.correct)
      .length;
    setVocabScore(vocabCorrect);

    const totalScore = vocabCorrect + listeningScore + speakingScore;
    
    try {
      setIsSendingEmail(true);
      const emailResult = await sendResultsEmail({
        score: totalScore,
        totalQuestions: VOCAB_QUESTION_COUNT + LISTENING_QUESTION_COUNT + SPEAKING_QUESTION_COUNT,
        correctAnswers: vocabCorrect + listeningScore + speakingScore,
        percentage: Math.round((totalScore / (VOCAB_QUESTION_COUNT + LISTENING_QUESTION_COUNT + SPEAKING_QUESTION_COUNT)) * 100),
      });
      setEmailStatus({
        success: emailResult,
        message: 'Results sent successfully'
      });
      
      if (emailResult) {
        console.log('Exam results sent successfully');
      } else {
        console.error('Failed to send exam results:');
      }
    } catch (error) {
      console.error('Error sending exam results:', error);
      setEmailStatus({
        success: false,
        message: 'An error occurred while sending results. Please contact support.'
      });
    } finally {
      setIsSendingEmail(false);
    }
  }, [sendResultsEmail, listeningScore, speakingScore]);
=======
    try {
      // Calculate scores
      const vocabScore = userAnswers
        .filter(a => a.questionId.startsWith('vocab-') && a.correct)
        .length;
      
      const totalQuestions = VOCAB_QUESTION_COUNT; // Adjust if you have more sections
      const percentage = Math.round((vocabScore / totalQuestions) * 100);

      // Save score to MongoDB
      if (user) {
        try {
          await saveScore({
            userId: user.id || 'unknown',
            username: user.username || 'Anonymous',
            score: vocabScore,
            totalQuestions: totalQuestions
          });
          console.log('Score saved successfully');
        } catch (error) {
          console.error('Failed to save score:', error);
          // Continue with exam completion even if saving fails
        }
      }

      // Send email with results
      const emailSent = await sendResultsEmail({
        score: vocabScore,
        totalQuestions,
        correctAnswers: vocabScore,
        percentage
      });

      if (!emailSent) {
        console.warn('Failed to send results email');
      }

      // Update local state
      setVocabScore(vocabScore);
      setExamCompleted(true);
      
      // Update score history in local storage
      const history = localStorage.getItem('scoreHistory');
      const newScore = {
        date: new Date().toISOString(),
        score: vocabScore,
        total: totalQuestions,
        percentage
      };
      
      const updatedHistory = history 
        ? [...JSON.parse(history), newScore] 
        : [newScore];
      
      localStorage.setItem('scoreHistory', JSON.stringify(updatedHistory));
      
    } catch (error) {
      console.error('Error submitting exam:', error);
      setError('Failed to submit exam. Please try again.');
    }
  }, [userAnswers, user, sendResultsEmail]);
>>>>>>> 4d3957774c580a7e5924e3010122c83da2f24307

  useEffect(() => {
    if (!examStarted || examCompleted) return;

    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1000) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prevTime - 1000;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examStarted, examCompleted, handleAutoSubmit]);

<<<<<<< HEAD
  const getCurrentQuestions = () => {
    if (currentSection === 'vocabulary') return vocabularyQuestions;
    if (currentSection === 'listening' && listeningStory) return listeningStory.questions;
    return speakingQuestions;
=======
  const getCurrentQuestions = (): GeminiVocabularyQuestion[] => {
    return vocabularyQuestions;
>>>>>>> 4d3957774c580a7e5924e3010122c83da2f24307
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const currentQuestions = getCurrentQuestions();
    const currentQuestion = currentQuestions[currentQuestionIndex];
    
    setSelectedAnswer(answerIndex);
    
    setUserAnswers(prev => {
      const existingAnswerIndex = prev.findIndex(a => a.questionId === currentQuestion.id);
      
      const isCorrect = answerIndex === currentQuestion.correct;

      if (existingAnswerIndex >= 0) {
        const updated = [...prev];
        updated[existingAnswerIndex] = {
          ...updated[existingAnswerIndex],
          selected: answerIndex,
          correct: isCorrect,
          section: currentSection
        };
        return updated;
      }
      return [
        ...prev,
        {
          questionId: currentQuestion.id,
          selected: answerIndex,
          correct: isCorrect,
          section: currentSection
        }
      ];
    });
  };

  useEffect(() => {
    const currentQuestions = getCurrentQuestions();
    if (currentQuestions.length === 0) return;
    
    const currentQuestion = currentQuestions[currentQuestionIndex];
    const existingAnswer = userAnswers.find(a => a.questionId === currentQuestion.id);
    
    setSelectedAnswer(existingAnswer?.selected ?? null);
  }, [currentQuestionIndex, currentSection, userAnswers]);

  const handleNext = async () => {
    const currentQuestions = getCurrentQuestions();
    
    // If it's the last question of the vocabulary section
    if (currentSection === 'vocabulary' && currentQuestionIndex === VOCAB_QUESTION_COUNT - 1) {
      const currentScore = userAnswers
        .filter(a => a.questionId.startsWith('vocab-') && a.correct)
        .length;
      setVocabScore(currentScore);
      await handleAutoSubmit();  
      return;
    }
    
    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
    } else {
      await handleAutoSubmit();
    }
  };

<<<<<<< HEAD
  const submitSpeakingTest = async () => {
    try {
      const score = userAnswers.filter(a => a.questionId.startsWith('speaking-')).length;
      setSpeakingScore(score);
      
      const results = {
        score: score,
        totalQuestions: SPEAKING_QUESTION_COUNT,
        correctAnswers: score,
        percentage: Math.round((score / SPEAKING_QUESTION_COUNT) * 100),
      };

      await sendResultsEmail(results);
      
      const totalScore = vocabScore + listeningScore + score;
      await sendResultsEmail({
        score: totalScore,
        totalQuestions: VOCAB_QUESTION_COUNT + LISTENING_QUESTION_COUNT + SPEAKING_QUESTION_COUNT,
        correctAnswers: vocabScore + listeningScore + score,
        percentage: Math.round((totalScore / (VOCAB_QUESTION_COUNT + LISTENING_QUESTION_COUNT + SPEAKING_QUESTION_COUNT)) * 100),
      });
      setExamCompleted(true);
    } catch (error) {
      console.error('Error submitting speaking test:', error);
      setError('Failed to submit speaking test.');
    }
  };

  const submitListeningTest = async () => {
    const currentScore = userAnswers
      .filter(a => a.questionId.startsWith('listening-'))
      .filter(a => a.correct).length;
    
    const listeningDetails = {
      score: currentScore,
      totalQuestions: LISTENING_QUESTION_COUNT,
      correctAnswers: currentScore,
      percentage: Math.round((currentScore / LISTENING_QUESTION_COUNT) * 100),
    };
    
    setListeningScore(currentScore);
    await sendResultsEmail(listeningDetails);
  };

=======
>>>>>>> 4d3957774c580a7e5924e3010122c83da2f24307
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setSelectedAnswer(null);
    }
  };

  const loadQuestions = async () => {
    try {
      setIsLoading(true);
      if (!vocabularyData || !Array.isArray(vocabularyData) || vocabularyData.length < VOCAB_QUESTION_COUNT) {
        throw new Error('Insufficient vocabulary data available. Need at least 25 non-kanji items.');
      }
      
      const vocabQuestions = prepareVocabularyQuestions(vocabularyData as VocabularyItem[], VOCAB_QUESTION_COUNT);
      if (vocabQuestions.length !== VOCAB_QUESTION_COUNT) {
        throw new Error(`Failed to generate exactly ${VOCAB_QUESTION_COUNT} vocabulary questions.`);
      }
      
      setVocabularyQuestions(vocabQuestions);
      setIsLoading(false);
      setExamStarted(true);
    } catch (error) {
      console.error('Error loading questions:', error);
      setError(error instanceof Error ? error.message : 'Failed to load questions.');
      setIsLoading(false);
    }
  };

  const renderQuestion = () => {
    if (examCompleted) {
      return (
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="bg-white p-8 rounded-lg shadow-md border border-gray-100 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Thank you for taking the exam!</h2>
            <p className="text-gray-600">Your results have been sent to the administrator. You'll receive feedback soon.</p>
          </div>
        </div>
      );
    }

    const currentQuestions = getCurrentQuestions();
    
    if (isLoading) {
      return <div className="text-center py-8 text-gray-600">Loading questions...</div>;
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-lg mb-6">
          {error}
        </div>
      );
    }

    if (!currentQuestions.length) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">No questions available for {currentSection}.</p>
          <button
            onClick={loadQuestions}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      );
    }

    const currentQuestion = currentQuestions[currentQuestionIndex];
    if (!currentQuestion) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">Error loading question.</p>
          <button
            onClick={loadQuestions}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reload Questions
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-800">{currentQuestion.question}</h3>
        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <div 
              key={index}
              onClick={() => handleAnswerSelect(index)}
              className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                selectedAnswer === index 
                  ? 'bg-blue-50 border-blue-500' 
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center">
                <div className={`w-6 h-6 rounded-full border mr-4 flex items-center justify-center ${
                  selectedAnswer === index ? 'border-blue-500' : 'border-gray-300'
                }`}>
                  {selectedAnswer === index && (
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  )}
                </div>
                <span className="text-gray-700">{option}</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            disabled={selectedAnswer === null}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {currentQuestionIndex < currentQuestions.length - 1 ? 'Next' : 'Submit'}
          </button>
        </div>
      </div>
    );
  };

<<<<<<< HEAD
  const loadQuestions = async () => {
    try {
      setIsLoading(true);
      if (!vocabularyData || !Array.isArray(vocabularyData) || vocabularyData.length < VOCAB_QUESTION_COUNT) {
        throw new Error('Insufficient vocabulary data available. Need at least 25 non-kanji items.');
      }
      
      const vocabQuestions = prepareVocabularyQuestions(vocabularyData as VocabularyItem[], VOCAB_QUESTION_COUNT);
      if (vocabQuestions.length !== VOCAB_QUESTION_COUNT) {
        throw new Error(`Failed to generate exactly ${VOCAB_QUESTION_COUNT} vocabulary questions.`);
      }
      
      if (!listeningData || !listeningData.story || !Array.isArray(listeningData.questions)) {
        throw new Error('Invalid listening data format.');
      }
      
      const randomQuestions = getRandomItems(listeningData.questions, LISTENING_QUESTION_COUNT);
      const listeningStory: ListeningStory = {
        story: listeningData.story,
        questions: randomQuestions
      };

      if (!Array.isArray(speakingData) || speakingData.length < SPEAKING_QUESTION_COUNT) {
        throw new Error('Invalid speaking data.');
      }
      const speakingQs = prepareSpeakingQuestions(speakingData, SPEAKING_QUESTION_COUNT);
      
      setVocabularyQuestions(vocabQuestions);
      setListeningStory(listeningStory);
      setSpeakingQuestions(speakingQs);
      setIsLoading(false);
      setExamStarted(true);
    } catch (error) {
      console.error('Error loading questions:', error);
      setError(error instanceof Error ? error.message : 'Failed to load questions.');
      setIsLoading(false);
    }
  };

  const moveToNextSection = () => {
    if (currentSection === 'vocabulary') {
      setCurrentSection('listening');
    } else if (currentSection === 'listening') {
      setCurrentSection('speaking');
    }
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setRecordedAudio(null);
  };

  const preventCopyStyle: React.CSSProperties = {
    userSelect: 'none',
    WebkitUserSelect: 'none',
    msUserSelect: 'none',
    MozUserSelect: 'none',
  };

=======
>>>>>>> 4d3957774c580a7e5924e3010122c83da2f24307
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 capitalize">{currentSection} Section</h1>
      <div className="mb-6 text-lg font-semibold text-gray-800">
        Time Remaining: {formatTime(timeLeft)}
      </div>
      {renderQuestion()}
    </div>
  );
};

export default Exam;