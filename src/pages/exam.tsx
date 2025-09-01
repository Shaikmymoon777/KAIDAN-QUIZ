import { useState, useEffect, useRef, useCallback } from 'react';
import emailjs from '@emailjs/browser';
import vocabularyData from '../data/vocab/vocabulary.json';
import listeningData from '../data/vocab/listening.json';
import speakingData from '../data/vocab/speaking.json';

// EmailJS Configuration
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'jBr6c1UQy5gCNkzB0';
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_zb7ruvd';
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_xc0kd4e';

// Check if EmailJS is properly configured
if (!EMAILJS_PUBLIC_KEY || !EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID) {
  console.warn('EmailJS is not properly configured. Check your environment variables.');
}

// Initialize EmailJS
try {
  emailjs.init(EMAILJS_PUBLIC_KEY);
  console.log('EmailJS initialized successfully');
} catch (error) {
  console.error('Failed to initialize EmailJS:', error);
}

type ExamSection = 'vocabulary' | 'listening' | 'speaking';

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

interface ListeningQuestion {
  id: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface ListeningStory {
  story: {
    title: string;
    content: string;
  };
  questions: ListeningQuestion[];
}

interface SpeakingQuestion {
  id: string;
  sentence: string;
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

const getRandomItems = <T,>(array: T[], count: number): T[] => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const prepareSpeakingQuestions = (speakingData: SpeakingQuestion[], count: number = 5): SpeakingQuestion[] => {
  return getRandomItems(speakingData, count);
};

const VOCAB_QUESTION_COUNT = 25;
const LISTENING_QUESTION_COUNT = 5;
const SPEAKING_QUESTION_COUNT = 5;
const EXAM_DURATION = 30 * 60 * 1000;

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

interface SpeechRecognitionEvent extends Event {
  results: {
    [index: number]: {
      transcript: any;
      [index: number]: {
        transcript: string;
      };
    };
    isFinal: boolean;
  }[];
  resultIndex: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: Event) => void;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

declare var SpeechRecognition: {
  prototype: SpeechRecognition;
  new (): SpeechRecognition;
};

const isListeningQuestion = (q: any): q is ListeningQuestion => 'correct' in q;

const formatTime = (milliseconds: number): string => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const Exam: React.FC = () => {
  const [currentSection, setCurrentSection] = useState<ExamSection>('vocabulary');
  const [vocabularyQuestions, setVocabularyQuestions] = useState<GeminiVocabularyQuestion[]>([]);
  const [listeningStory, setListeningStory] = useState<ListeningStory | null>(null);
  const [speakingQuestions, setSpeakingQuestions] = useState<SpeakingQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [examCompleted, setExamCompleted] = useState(false);
  const [vocabScore, setVocabScore] = useState(0);
  const [listeningScore, setListeningScore] = useState(0);
  const [speakingScore, setSpeakingScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{questionId: string; selected?: number | null; spoken?: string; correct: boolean; feedback?: string; section?: string}[]>([]);
  const [, setUsername] = useState('');
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION);
  const [examStarted, setExamStarted] = useState(false);
  const [, setRecognition] = useState<SpeechRecognition | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<string | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [, setAudioChunks] = useState<Blob[]>([]);
  const [emailStatus, setEmailStatus] = useState<{success: boolean; message: string} | null>(null);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Prevent text selection and copying
  const preventCopyStyle: React.CSSProperties = {
    userSelect: 'none',
    WebkitUserSelect: 'none',
    msUserSelect: 'none',
    MozUserSelect: 'none',
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('username');
    if (storedUser) setUsername(storedUser);

    const history = localStorage.getItem('scoreHistory');
    if (history) {
      try {
        // setScoreHistory(JSON.parse(history));
      } catch (err) {
        console.error('Error parsing score history:', err);
      }
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.lang = 'ja-JP';
      rec.continuous = false;
      rec.interimResults = false;
      setRecognition(rec);
    } else {
      console.warn('Speech recognition not supported');
    }

    // Load questions when component mounts
    loadQuestions();
  }, []);

  useEffect(() => {
    try {
      emailjs.init(EMAILJS_PUBLIC_KEY);
      console.log('EmailJS initialized successfully');
    } catch (error) {
      console.error('Failed to initialize EmailJS:', error);
    }
  }, []);

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
  }, [examStarted, examCompleted]);

  const handleAutoSubmit = async () => {
    setExamCompleted(true);
    
    // Calculate vocabulary score
    const vocabCorrect = userAnswers
      .filter(a => a.questionId.startsWith('vocab-') && a.correct)
      .length;
    setVocabScore(vocabCorrect);

    const totalScore = vocabCorrect + listeningScore + speakingScore;
    
    try {
      setIsSendingEmail(true);
      const emailResult = await sendResultsEmail(totalScore);
      setEmailStatus({
        success: emailResult.success,
        message: emailResult.message
      });
      
      if (emailResult.success) {
        console.log('Exam results sent successfully');
      } else {
        console.error('Failed to send exam results:', emailResult.error);
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
  };

  const getCurrentQuestions = () => {
    if (currentSection === 'vocabulary') return vocabularyQuestions;
    if (currentSection === 'listening' && listeningStory) return listeningStory.questions;
    return speakingQuestions;
  };

  const sendResultsEmail = async (totalScore: number) => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const totalPossible = VOCAB_QUESTION_COUNT + LISTENING_QUESTION_COUNT + SPEAKING_QUESTION_COUNT;
      const overallPercentage = Math.round((totalScore / totalPossible) * 100);

      const templateParams = {
        to_email: currentUser.email || 'mymoonshaik004@gmail.com',
        to_name: currentUser.username || 'Student',
        from_name: 'Japanese Learning App',
        subject: `Exam Results - ${currentUser.username || 'Student'}`,
        student_name: currentUser.username || 'Student',
        exam_date: new Date().toLocaleString(),
        total_score: totalScore,
        total_questions: totalPossible,
        percentage: overallPercentage,
        time_spent: formatTime(EXAM_DURATION - timeLeft),
        vocabulary_score: vocabScore,
        listening_score: listeningScore,
        speaking_score: speakingScore,
        vocabulary_total: VOCAB_QUESTION_COUNT,
        listening_total: LISTENING_QUESTION_COUNT,
        speaking_total: SPEAKING_QUESTION_COUNT
      };

      console.log('Sending email with params:', templateParams);
      
      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );
      
      console.log('Email sent successfully:', response);
      return { success: true, message: 'Results sent successfully' };
    } catch (error: any) {
      console.error('Email sending failed:', {
        status: error?.status,
        text: error?.text,
        message: error?.message,
        stack: error?.stack
      });
      
      return { 
        success: false, 
        message: 'Failed to send results. Please try again later.',
        error: error?.message || 'Unknown error'
      };
    }
  };

  const sendTestResultsEmail = async (section: 'speaking' | 'listening', score: number, results: {
    section: string;
    score: number;
    total: number;
    percentage: number;
    timestamp: string;
    userAnswers: { questionId: string; selected?: number | null; spoken?: string; correct: boolean; feedback?: string; }[];
  }) => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const userEmail = currentUser?.email || 'mymoonshaik004@gmail.com';

      const vocabPercentage = Math.round((vocabScore / VOCAB_QUESTION_COUNT) * 100);
      const listeningPercentage = Math.round((listeningScore / LISTENING_QUESTION_COUNT) * 100);
      const speakingPercentage = Math.round((speakingScore / SPEAKING_QUESTION_COUNT) * 100);
      
      const now = new Date();
      const formattedDate = now.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      const templateParams = {
        to_email: userEmail,
        to_name: currentUser?.username || 'Student',
        from_name: 'Japanese Learning App',
        subject: `Test Results - ${section.toUpperCase()} - ${currentUser?.username || 'Student'}`,
        section: section.charAt(0).toUpperCase() + section.slice(1),
        date: formattedDate,
        student_name: currentUser?.username || 'Student',
        vocabulary_score: `${vocabScore}/${VOCAB_QUESTION_COUNT} (${vocabPercentage}%)`,
        listening_score: `${listeningScore}/${LISTENING_QUESTION_COUNT} (${listeningPercentage}%)`,
        speaking_score: `${speakingScore}/${SPEAKING_QUESTION_COUNT} (${speakingPercentage}%)`,
        total_score: `${vocabScore + listeningScore + speakingScore}/` + 
                   `${VOCAB_QUESTION_COUNT + LISTENING_QUESTION_COUNT + SPEAKING_QUESTION_COUNT}`,
        current_section: section,
        current_section_score: score,
        current_section_total: section === 'speaking' ? SPEAKING_QUESTION_COUNT : LISTENING_QUESTION_COUNT,
        details: JSON.stringify({
          timestamp: now.toISOString(),
          sectionScores: {
            vocabulary: vocabScore,
            listening: listeningScore,
            speaking: speakingScore
          },
          userAnswers: results.userAnswers,
          currentSection: section,
          score: score
        }, null, 2)
      };

      try {
        console.log('Attempting to send email with params:', {
          service_id: EMAILJS_SERVICE_ID,
          template_id: EMAILJS_TEMPLATE_ID,
          public_key: EMAILJS_PUBLIC_KEY,
          to_email: templateParams.to_email,
          subject: templateParams.subject
        });
        
        const response = await emailjs.send(
          EMAILJS_SERVICE_ID,
          EMAILJS_TEMPLATE_ID,
          templateParams,
          EMAILJS_PUBLIC_KEY
        );
        
        console.log('Email sent successfully:', response);
        return true;
      } catch (error: any) {
        console.error('Failed to send email:', {
          error: error.toString(),
          message: error.message || 'Unknown error',
          status: error.status,
          text: error.text,
          response: error.response,
          stack: error.stack
        });
        return false;
      }
    } catch (error) {
      console.error('Error in sendTestResultsEmail:', error);
      return false;
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const currentQuestions = getCurrentQuestions();
    const currentQuestion = currentQuestions[currentQuestionIndex];
    
    setSelectedAnswer(answerIndex);
    
    setUserAnswers(prev => {
      const existingAnswerIndex = prev.findIndex(a => a.questionId === currentQuestion.id);
      
      const isCorrect = isListeningQuestion(currentQuestion) 
        ? answerIndex === currentQuestion.correct 
        : true;

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
    
    if (currentQuestion.id.startsWith('speaking-')) {
      setRecordedAudio(existingAnswer?.spoken ?? null);
    }
  }, [currentQuestionIndex, currentSection, userAnswers]);

  const playRecordedAudio = useCallback(() => {
    if (!recordedAudio) return;
    
    const audio = new Audio(recordedAudio);
    audioRef.current = audio;
    
    const handlePlay = () => setIsPlaying(true);
    const handleEnd = () => setIsPlaying(false);
    const handleError = (error: Event) => {
      console.error('Error playing audio:', error);
      setError('Could not play the recorded audio. Please try recording again.');
      setIsPlaying(false);
    };
    
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('ended', handleEnd);
    audio.addEventListener('error', handleError);
    
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.error('Playback failed:', error);
        setError('Playback failed. Please check your audio settings.');
        setIsPlaying(false);
      });
    }
    
    return () => {
      audio.pause();
      audio.currentTime = 0;
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('ended', handleEnd);
      audio.removeEventListener('error', handleError);
    };
  }, [recordedAudio]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const playAudio = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) {
      setError('Text-to-speech is not supported in your browser');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.9;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    // Speak the text
    window.speechSynthesis.speak(utterance);
    
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const handleNext = async () => {
    const currentQuestions = getCurrentQuestions();
    
    if (currentSection === 'vocabulary' && currentQuestionIndex === VOCAB_QUESTION_COUNT - 1) {
      const currentScore = userAnswers
        .filter(a => a.questionId.startsWith('vocab-') && a.correct)
        .length;
      setVocabScore(currentScore);
      moveToNextSection();
      return;
    }
    
    if (currentSection === 'speaking' && currentQuestionIndex === speakingQuestions.length - 1) {
      if (recordedAudio && !userAnswers.some(a => a.questionId === speakingQuestions[currentQuestionIndex].id)) {
        const newAnswer = {
          questionId: speakingQuestions[currentQuestionIndex].id,
          spoken: recordedAudio,
          correct: true,
          section: 'speaking'
        };
        setUserAnswers(prev => [...prev, newAnswer]);
      }
      await submitSpeakingTest();
      return;
    }
    
    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setRecordedAudio(null);
    } else {
      moveToNextSection();
    }
  };

  const submitSpeakingTest = async () => {
    try {
      const score = userAnswers.filter(a => a.questionId.startsWith('speaking-')).length;
      setSpeakingScore(score);
      
      const results = {
        section: 'speaking',
        score: score,
        total: SPEAKING_QUESTION_COUNT,
        percentage: Math.round((score / SPEAKING_QUESTION_COUNT) * 100),
        timestamp: new Date().toISOString(),
        userAnswers: userAnswers.filter(a => a.questionId.startsWith('speaking-'))
      };

      await sendTestResultsEmail('speaking', score, results);
      const totalScore = vocabScore + listeningScore + score;
      await sendResultsEmail(totalScore);
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
      section: 'listening',
      score: currentScore,
      total: LISTENING_QUESTION_COUNT,
      percentage: Math.round((currentScore / LISTENING_QUESTION_COUNT) * 100),
      timestamp: new Date().toISOString(),
      userAnswers: userAnswers.filter(a => a.questionId.startsWith('listening-'))
    };
    
    setListeningScore(currentScore);
    await sendTestResultsEmail('listening', currentScore, listeningDetails);
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setSelectedAnswer(null);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudio(audioUrl);
        setAudioChunks([]);
        setIsSpeaking(false);
      };

      mediaRecorder.start();
      setMediaRecorder(mediaRecorder);
      setIsSpeaking(true);
      setAudioChunks(chunks);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setError('Could not access microphone.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isSpeaking) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      setSelectedAnswer(1);
    }
  };

  const renderQuestion = () => {
    if (examCompleted) {
      return (
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="bg-white p-8 rounded-lg shadow-md border border-gray-100 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Thank you for taking the exam!</h2>
            <p className="text-gray-600">Your results have been sent to the administrator. You'll receive feedback soon.</p>
            {emailStatus && (
              <div className="mt-4">
                {emailStatus.success ? (
                  <p className="text-green-600">Results sent successfully!</p>
                ) : (
                  <p className="text-red-600">{emailStatus.message}</p>
                )}
              </div>
            )}
            {isSendingEmail && (
              <div className="mt-4">
                <p className="text-gray-600">Sending results...</p>
              </div>
            )}
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

    if (currentSection === 'listening') {
      return renderListeningSection();
    }

    if (currentSection === 'vocabulary') {
      const vocabQuestion = currentQuestion as GeminiVocabularyQuestion;
      return (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-800">{vocabQuestion.question}</h3>
          <div className="space-y-3">
            {vocabQuestion.options.map((option, index) => (
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
    }
    
    return renderSpeakingSection();
  };

  const renderListeningSection = () => {
    if (!listeningStory) return <p className="text-gray-600">Loading story...</p>;
    
    const currentQuestion = listeningStory.questions[currentQuestionIndex];
    if (!currentQuestion) return <p className="text-gray-600">Loading question...</p>;

    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-800">
              {listeningStory.story.title}
            </h3>
            <button
              onClick={() => playAudio(listeningStory.story.content)}
              className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
              aria-label="Play story"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            </button>
          </div>
          <p className="mb-4 text-gray-700">{listeningStory.story.content}</p>
          
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <p className="font-medium text-gray-800">Question {currentQuestionIndex + 1}: {currentQuestion.question}</p>
            
            <div className="mt-4 space-y-3">
              {currentQuestion.options.map((option, index) => (
                <div 
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedAnswer === index 
                      ? 'bg-blue-50 border-blue-500' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-5 h-5 rounded-full border mr-3 flex-shrink-0 ${
                      selectedAnswer === index ? 'border-blue-500' : 'border-gray-400'
                    }`}>
                      {selectedAnswer === index && (
                        <div className="w-3 h-3 rounded-full bg-blue-500 m-0.5"></div>
                      )}
                    </div>
                    <span className="text-gray-800">{option}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
            <div className="text-gray-600">
              Question {currentQuestionIndex + 1} of {listeningStory.questions.length}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={handleNext}
                disabled={selectedAnswer === null}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {currentQuestionIndex === listeningStory.questions.length - 1 ? 'Finish' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSpeakingSection = () => {
    const currentQuestion = speakingQuestions[currentQuestionIndex];
    
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Listen to the sentence and repeat it in Japanese:
          </h3>
          
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <p className="text-lg text-gray-800">{currentQuestion.sentence}</p>
              <button
                onClick={() => playAudio(currentQuestion.sentence)}
                className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                aria-label="Play sentence"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 mt-6">
            <button
              onClick={isSpeaking ? stopRecording : startRecording}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isSpeaking 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isSpeaking ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>Stop Recording</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  <span>Record Your Answer</span>
                </>
              )}
            </button>
            
            {recordedAudio && (
              <button
                onClick={playRecordedAudio}
                disabled={isPlaying}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                <span>{isPlaying ? 'Playing...' : 'Play Recording'}</span>
              </button>
            )}
          </div>
          
          <div className="mt-8">
            <h4 className="font-medium text-gray-700 mb-2">Tips for better recording:</h4>
            <ul className="list-disc pl-5 text-gray-600 space-y-1">
              <li>Speak clearly and at a natural pace</li>
              <li>Make sure you're in a quiet environment</li>
              <li>Keep the microphone close to your mouth</li>
              <li>Listen to the example carefully before recording</li>
            </ul>
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
          <div className="text-gray-600">
            Question {currentQuestionIndex + 1} of {speakingQuestions.length}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              disabled={!recordedAudio}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {currentQuestionIndex === speakingQuestions.length - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    );
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

  return (
    <div className="max-w-4xl mx-auto p-6" style={preventCopyStyle}>
      <h1 className="text-3xl font-bold text-gray-900 mb-8 capitalize">{currentSection} Section</h1>
      <div className="mb-6 text-lg font-semibold text-gray-800">
        Time Remaining: {formatTime(timeLeft)}
      </div>
      {renderQuestion()}
      {currentSection === 'speaking' && !examCompleted && (
        <button
          onClick={submitSpeakingTest}
          className="w-full mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          Submit Speaking Test
        </button>
      )}
      {currentSection === 'listening' && !examCompleted && (
        <button
          onClick={submitListeningTest}
          className="w-full mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          Submit Listening Test
        </button>
      )}
    </div>
  );
};

export default Exam;