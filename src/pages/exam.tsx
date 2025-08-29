import { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';
import vocabularyData from '../data/vocab/vocabulary.json';
import listeningData from '../data/vocab/listening.json';
import speakingData from '../data/vocab/speaking.json';

// Initialize EmailJS with your public key
emailjs.init('jBr6c1UQy5gCNkzB0');

type ExamSection = 'vocabulary' | 'listening' | 'speaking';

interface GeminiVocabularyQuestion {
  id: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  part: string;
  type: 'vocabulary' | 'grammar' | 'kanji' | 'reading';
  kanji?: string;
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

interface SpeakingQuestion {
  id: string;
  sentence: string;
  romaji?: string;
  meaning?: string;
  audioSrc?: string;
}

interface VocabularyItem {
  id: number;
  japanese: string;
  reading: string;
  meaning: string;
}

// Function to shuffle an array using Fisher-Yates algorithm
// (Note: User code had a comment but no function; assuming it's needed but using sort for simplicity as in original)

const prepareVocabularyQuestions = (vocabData: VocabularyItem[], count: number = 10): GeminiVocabularyQuestion[] => {
  // Shuffle array and take first 'count' items
  const shuffled = [...vocabData].sort(() => 0.5 - Math.random());
  const selectedWords = shuffled.slice(0, count);

  return selectedWords.map(word => {
    // Get 3 random wrong answers
    const otherWords = vocabData
      .filter(w => w.id !== word.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map(w => w.meaning);
    
    // Combine correct answer with wrong answers and shuffle
    const options = [word.meaning, ...otherWords]
      .sort(() => 0.5 - Math.random());
    
    return {
      id: `vocab-${word.id}`,
      question: `What does "${word.japanese}" (${word.reading}) mean?`,
      options,
      correct: options.indexOf(word.meaning),
      explanation: `"${word.japanese}" (${word.reading}) means "${word.meaning}"`,
      part: 'vocabulary',
      type: 'vocabulary',
      japanese: word.japanese,
      reading: word.reading,
      meaning: word.meaning
    };
  });
};

const VOCAB_QUESTION_COUNT = 25;
const LISTENING_QUESTION_COUNT = 5;
const SPEAKING_QUESTION_COUNT = 5;
const EXAM_DURATION = 30 * 60 * 1000; // 30 minutes for all sections in milliseconds

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

const Exam: React.FC = () => {
  const [currentSection, setCurrentSection] = useState<ExamSection>('vocabulary');
  const [vocabularyQuestions, setVocabularyQuestions] = useState<GeminiVocabularyQuestion[]>([]);
  const [listeningQuestions, setListeningQuestions] = useState<ListeningQuestion[]>([]);
  const [speakingQuestions, setSpeakingQuestions] = useState<SpeakingQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [spokenText, setSpokenText] = useState<string>('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [examCompleted, setExamCompleted] = useState(false);
  const [vocabScore, setVocabScore] = useState(0);
  const [listeningScore, setListeningScore] = useState(0);
  const [speakingScore, setSpeakingScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{questionId: string; selected?: number | null; spoken?: string; correct: boolean; feedback?: string}[]>([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION);
  const [examStarted, setExamStarted] = useState(false);
  const [storyPlayed, setStoryPlayed] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [playedAudios, setPlayedAudios] = useState<Set<string>>(new Set());

  useEffect(() => {
    const storedUser = localStorage.getItem('username');
    if (storedUser) {
      setLoggedIn(true);
      setUsername(storedUser);
    }

    const history = localStorage.getItem('scoreHistory');
    if (history) {
      try {
        // setScoreHistory(JSON.parse(history));
      } catch (err) {
        console.error('Error parsing score history:', err);
      }
    }

    // Initialize speech recognition if available
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.lang = 'ja-JP'; // Japanese
      rec.continuous = false;
      rec.interimResults = false;
      setRecognition(rec);
    } else {
      console.warn('Speech recognition not supported');
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    if (users[username] && users[username] === password) {
      localStorage.setItem('username', username);
      setLoggedIn(true);
      setError('');
    } else {
      setError('Invalid username or password.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    if (users[username]) {
      setError('Username already exists. Please choose another.');
    } else if (username && password) {
      users[username] = password;
      localStorage.setItem('users', JSON.stringify(users));
      localStorage.setItem('username', username);
      setLoggedIn(true);
      setShowRegister(false);
      setError('');
    } else {
      setError('Please enter both username and password.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('username');
    setLoggedIn(false);
    setUsername('');
    setPassword('');
    setExamCompleted(false);
    setVocabScore(0);
    setListeningScore(0);
    setSpeakingScore(0);
    setVocabularyQuestions([]);
    setListeningQuestions([]);
    setSpeakingQuestions([]);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setShowRegister(false);
    setCurrentSection('vocabulary');
  };

  // Load questions when component mounts
  const loadQuestions = async () => {
    try {
      setIsLoading(true);
      
      // Validate vocabulary data
      if (!vocabularyData || !Array.isArray(vocabularyData) || vocabularyData.length === 0) {
        throw new Error('No vocabulary data available. Please try again later.');
      }
      
      // Load vocabulary questions
      const vocabQuestions = prepareVocabularyQuestions(vocabularyData as VocabularyItem[], VOCAB_QUESTION_COUNT);
      if (vocabQuestions.length === 0) {
        throw new Error('Failed to generate vocabulary questions. Please try again.');
      }
      
      // Load listening data (assume listeningData = { story: string, questions: ListeningQuestion[] })
      if (!listeningData || !listeningData.story || !Array.isArray(listeningData.questions) || listeningData.questions.length < LISTENING_QUESTION_COUNT) {
        throw new Error('Invalid listening data.');
      }
      const listeningQs = listeningData.questions.slice(0, LISTENING_QUESTION_COUNT);

      // Load speaking data (assume speakingData = SpeakingQuestion[])
      if (!Array.isArray(speakingData) || speakingData.length < SPEAKING_QUESTION_COUNT) {
        throw new Error('Invalid speaking data.');
      }
      const speakingQs = speakingData.slice(0, SPEAKING_QUESTION_COUNT).map(question => ({
        ...question,
        audioSrc: `#${question.id}-audio` // Add audio source ID
      }));
      
      setVocabularyQuestions(vocabQuestions);
      setListeningQuestions(listeningQs);
      setSpeakingQuestions(speakingQs);
      setIsLoading(false);
      setExamStarted(true); // Start the timer when questions are loaded
    } catch (error) {
      console.error('Error loading questions:', error);
      setError(error instanceof Error ? error.message : 'Failed to load questions. Please try again later.');
      setIsLoading(false);
    }
  };

  // Timer effect
  useEffect(() => {
    if (!examStarted || examCompleted) return;

    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1000) {
          clearInterval(timer);
          handleTimeUp();
          return 0;
        }
        return prevTime - 1000;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examStarted, examCompleted]);

  // Handle time up
  const handleTimeUp = () => {
    setExamCompleted(true);
    // Submit the exam with current answers
    const totalScore = vocabScore + listeningScore + speakingScore;
    sendResultsEmail(totalScore);
  };

  // Function to format time
  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async () => {
    let isCorrect = false;
    let feedback = '';
    let scoreIncrement = 0;
    const currentQuestion = getCurrentQuestion();
    const questionId = currentQuestion.id;

    if (currentSection === 'vocabulary') {
      if (selectedAnswer === null) {
        setError('Please select an answer before submitting.');
        return;
      }
      const vocabQuestion = currentQuestion as GeminiVocabularyQuestion;
      isCorrect = selectedAnswer === vocabQuestion.correct;
      feedback = isCorrect 
        ? 'Correct!' 
        : `Incorrect. The correct answer is: ${vocabQuestion.options[vocabQuestion.correct]}`;
      scoreIncrement = isCorrect ? 1 : 0;
      
      // Update vocabulary score
      setVocabScore(prev => prev + scoreIncrement);
      
    } else if (currentSection === 'listening') {
      if (selectedAnswer === null) {
        setError('Please select an answer before submitting.');
        return;
      }
      const listeningQuestion = currentQuestion as ListeningQuestion;
      isCorrect = selectedAnswer === listeningQuestion.correct;
      feedback = isCorrect 
        ? 'Correct!' 
        : `Incorrect. The correct answer is: ${listeningQuestion.options[listeningQuestion.correct]}`;
      scoreIncrement = isCorrect ? 1 : 0;
      
      // Update listening score
      setListeningScore(prev => prev + scoreIncrement);
      
    } else if (currentSection === 'speaking') {
      if (!spokenText) {
        setError('Please record your answer before submitting.');
        return;
      }
      
      // Simple comparison for speaking (you might want to make this more sophisticated)
      const speakingQuestion = currentQuestion as SpeakingQuestion;
      const expectedText = speakingQuestion.sentence.toLowerCase();
      const userText = spokenText.toLowerCase();
      isCorrect = userText.includes(expectedText) || expectedText.includes(userText);
      feedback = isCorrect 
        ? 'Good job! Your pronunciation was correct.' 
        : `Your answer was: "${spokenText}". Try to match the sentence more closely.`;
      scoreIncrement = isCorrect ? 1 : 0;
      
      // Update speaking score
      setSpeakingScore(prev => prev + scoreIncrement);
    }

    // Save the user's answer
    setUserAnswers(prev => [
      ...prev,
      {
        questionId,
        selected: currentSection !== 'speaking' ? selectedAnswer : undefined,
        spoken: currentSection === 'speaking' ? spokenText : undefined,
        correct: isCorrect,
        feedback
      }
    ]);

    resetAnswerState();
    setError('');

    // Move to next question or section
    if (currentQuestionIndex < getCurrentQuestions().length - 1) {
      // Just move to next question
      setCurrentQuestionIndex(prev => prev + 1);
      resetAnswerState();
      setError('');
    } else {
      // This is the last question in the section
      if (currentSection === 'vocabulary') {
        // Submit vocabulary section
        setCurrentSection('listening');
        setCurrentQuestionIndex(0);
        setStoryPlayed(false);
        resetAnswerState();
      } else if (currentSection === 'listening') {
        // Submit listening section and send email
        await submitListeningTest();
        setCurrentSection('speaking');
        setCurrentQuestionIndex(0);
        resetAnswerState();
      } else {
        // Submit speaking section and complete exam
        await submitSpeakingTest();
        setExamCompleted(true);
        const totalScore = vocabScore + listeningScore + speakingScore + scoreIncrement;
        await sendResultsEmail(totalScore);
      }
    }
  };

  const resetAnswerState = () => {
    setSelectedAnswer(null);
    setSpokenText('');
    setIsRecording(false);
  };

  const getCurrentQuestions = () => {
    if (currentSection === 'vocabulary') return vocabularyQuestions;
    if (currentSection === 'listening') return listeningQuestions;
    return speakingQuestions;
  };

  const getCurrentQuestion = () => {
    return getCurrentQuestions()[currentQuestionIndex];
  };

  // Function to send results email
  const sendResultsEmail = async (totalScore: number) => {
    try {
      // Prepare email template parameters with more details
      const templateParams = {
        to_email: 'mymoonshaik004@gmail.com',
        to_name: 'Admin',
        from_name: 'Japanese Learning App',
        reply_to: username ? username + '@example.com' : 'noreply@japaneselearningapp.com',
        subject: `Exam Results - ${new Date().toLocaleDateString()}`,
        message: `A user has completed the exam with the following results:\n\n` +
                `Total Score: ${totalScore} out of ${VOCAB_QUESTION_COUNT + LISTENING_QUESTION_COUNT + (SPEAKING_QUESTION_COUNT * 2)} (${((totalScore / (VOCAB_QUESTION_COUNT + LISTENING_QUESTION_COUNT + (SPEAKING_QUESTION_COUNT * 2))) * 100).toFixed(1)}%)\n` +
                `Vocabulary Score: ${vocabScore} out of ${VOCAB_QUESTION_COUNT}\n` +
                `Listening Score: ${listeningScore} out of ${LISTENING_QUESTION_COUNT}\n` +
                `Speaking Score: ${speakingScore} out of ${SPEAKING_QUESTION_COUNT * 2}\n` +
                `Time Taken: ${formatTime(EXAM_DURATION - timeLeft)}\n` +
                `Date: ${new Date().toLocaleString()}\n` +
                `User: ${username || 'Guest'}\n\n` +
                `Test Details:\n` +
                `- Total Questions: ${VOCAB_QUESTION_COUNT + LISTENING_QUESTION_COUNT + SPEAKING_QUESTION_COUNT}\n` +
                `- Correct Answers: ${vocabScore + listeningScore + (speakingScore / 2)}\n` +
                `- Success Rate: ${((totalScore / (VOCAB_QUESTION_COUNT + LISTENING_QUESTION_COUNT + (SPEAKING_QUESTION_COUNT * 2))) * 100).toFixed(1)}%\n\n` +
                '---\n' +
                'This is an automated message from the Japanese Learning App.'
      };

      // Send email using EmailJS
      await emailjs.send(
        'service_zb7ruvd', // Replace with your EmailJS service ID
        'template_xc0kd4e', // Replace with your EmailJS template ID
        templateParams,
        'jBr6c1UQy5gCNkzB0' // Your public key
      );
      
      console.log('Results email sent successfully');
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
    }
  };

  const sendTestResultsEmail = async (section: 'speaking' | 'listening', score: number, details: any) => {
    try {
      // Calculate percentages
      const vocabPercentage = Math.round((vocabScore / VOCAB_QUESTION_COUNT) * 100);
      const listeningPercentage = Math.round((listeningScore / LISTENING_QUESTION_COUNT) * 100);
      const speakingPercentage = Math.round((speakingScore / SPEAKING_QUESTION_COUNT) * 100);
      
      // Format the current date and time
      const now = new Date();
      const formattedDate = now.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const templateParams = {
        to_email: 'mymoonshaik004@gmail.com',
        to_name: 'Admin',
        from_name: 'Japanese Learning App',
        section: section.charAt(0).toUpperCase() + section.slice(1),
        date: formattedDate,
        student_name: username || 'Student',
        
        // Section scores with percentages
        vocabulary_score: `${vocabScore}/${VOCAB_QUESTION_COUNT} (${vocabPercentage}%)`,
        listening_score: `${listeningScore}/${LISTENING_QUESTION_COUNT} (${listeningPercentage}%)`,
        speaking_score: `${speakingScore}/${SPEAKING_QUESTION_COUNT} (${speakingPercentage}%)`,
        
        // Total score
        total_score: `${vocabScore + listeningScore + speakingScore}/` + 
                   `${VOCAB_QUESTION_COUNT + LISTENING_QUESTION_COUNT + SPEAKING_QUESTION_COUNT}`,
        
        // Current section details
        current_section: section,
        current_section_score: score,
        current_section_total: section === 'speaking' ? SPEAKING_QUESTION_COUNT : LISTENING_QUESTION_COUNT,
        
        // Detailed results
        details: JSON.stringify({
          timestamp: now.toISOString(),
          sectionScores: {
            vocabulary: { score: vocabScore, total: VOCAB_QUESTION_COUNT, percentage: vocabPercentage },
            listening: { score: listeningScore, total: LISTENING_QUESTION_COUNT, percentage: listeningPercentage },
            speaking: { score: speakingScore, total: SPEAKING_QUESTION_COUNT, percentage: speakingPercentage }
          },
          userAnswers: userAnswers,
          currentSection: section,
          currentSectionDetails: details
        }, null, 2)
      };

      console.log('Sending email with params:', templateParams);
      
      const response = await emailjs.send(
        'service_zb7ruvd',
        'template_xc0kd4e',
        templateParams,
        'jBr6c1UQy5gCNkzB0'
      );
      
      console.log('Email sent successfully:', response);
      return true;
    } catch (error) {
      console.error('Failed to send test results email:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        response: (error as any)?.response?.data
      });
      return false;
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  useEffect(() => {
    if (!examStarted || examCompleted) return;

    // Prevent right-click, etc. (same as original)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j')) ||
        (e.ctrlKey && (e.key === 'U' || e.key === 'u' || e.key === 'S' || e.key === 's' || e.key === 'P' || e.key === 'p' || e.key === 'c' || e.key === 'C'))
      ) {
        e.preventDefault();
        return false;
      }
    };

    const handleSelectStart = (e: Event) => {
      e.preventDefault();
      return false;
    };

    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('selectstart', handleSelectStart);
    document.addEventListener('dragstart', handleDragStart);
    
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('selectstart', handleSelectStart);
      document.removeEventListener('dragstart', handleDragStart);
    };
  }, [examStarted, examCompleted]);

  useEffect(() => {
    if (!examStarted || examCompleted) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const message = 'Are you sure you want to leave? The exam will be submitted automatically if you leave this page.';
      e.preventDefault();
      e.returnValue = message;
      return message;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [examStarted, examCompleted]);

  const preventCopyStyle: React.CSSProperties = {
    userSelect: 'none',
    WebkitUserSelect: 'none',
    msUserSelect: 'none',
    MozUserSelect: 'none',
    WebkitTouchCallout: 'none',
  };

  const containerStyle: React.CSSProperties = {
    ...preventCopyStyle,
    pointerEvents: 'auto',
  };

  const playStory = () => {
    if ('speechSynthesis' in window && listeningData.story) {
      const utterance = new SpeechSynthesisUtterance(listeningData.story);
      utterance.lang = 'ja-JP';
      speechSynthesis.speak(utterance);
      setStoryPlayed(true);
    } else {
      console.warn('Text-to-speech not supported or no story');
    }
  };

  const startRecording = () => {
    if (recognition) {
      recognition.start();
      setIsRecording(true);
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        setSpokenText(transcript);
        setIsRecording(false);
      };
      recognition.onerror = (event: Event) => {
        console.error('Speech recognition error', (event as any).error);
        setIsRecording(false);
        setError('Speech recognition error. Please try again.');
      };
    } else {
      setError('Speech recognition not supported in this browser.');
    }
  };

  const playQuestionAudio = (questionId: string, text: string) => {
    // Stop any currently playing audio
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    // Check if audio has already been played
    if (playedAudios.has(questionId)) {
      return; // Don't play again if already played
    }

    // Mark this audio as played
    setPlayedAudios(prev => new Set([...prev, questionId]));

    // Create speech synthesis
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    
    // Create audio element for better control
    const audio = new Audio();
    setCurrentAudio(audio);
    
    // Use Web Speech API to speak the text
    window.speechSynthesis.speak(utterance);
  };

  const renderQuestion = () => {
    if (isLoading) {
      return <div className="text-center py-8">Loading questions...</div>;
    }

    if (error) {
      return (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      );
    }

    const currentQuestions = getCurrentQuestions();
    if (!currentQuestions.length) {
      return (
        <div className="text-center py-8">
          <p>No questions available for {currentSection}. Please try again later.</p>
          <button
            onClick={loadQuestions}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      );
    }

    const currentQuestion = getCurrentQuestion();
    
    if (!currentQuestion) {
      return (
        <div className="text-center py-8">
          <p>Error loading question. Please try again.</p>
          <button
            onClick={loadQuestions}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Reload Questions
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-4">
          <div className="text-lg font-medium text-gray-700">
            Time Remaining: <span className={`font-bold ${timeLeft < 60000 ? 'text-red-600' : 'text-gray-800'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
          <div className="text-gray-600">
            {currentSection.toUpperCase()} - Question {currentQuestionIndex + 1} of {currentQuestions.length}
          </div>
        </div>
        
        <div className="w-full bg-gray-200 h-2 rounded-full mb-6">
          <div 
            className="h-full rounded-full transition-all duration-1000 ease-linear"
            style={{
              width: `${(timeLeft / EXAM_DURATION) * 100}%`,
              backgroundColor: timeLeft < 60000 ? '#dc2626' : '#3b82f6'
            }}
          />
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="mb-4">
            <span className="text-gray-600">
              {currentSection.toUpperCase()} - Question {currentQuestionIndex + 1} of {currentQuestions.length}
            </span>
            <div className="w-full bg-gray-200 h-2 mt-2 rounded">
              <div 
                className="bg-blue-500 h-2 rounded" 
                style={{ width: `${((currentQuestionIndex + 1) / currentQuestions.length) * 100}%` }}
              />
            </div>
          </div>
          
          {currentSection === 'vocabulary' && (
            <>
              <h3 className="text-xl font-semibold mb-6">{(currentQuestion as GeminiVocabularyQuestion).question}</h3>
              <div className="space-y-3">
                {(currentQuestion as GeminiVocabularyQuestion).options.map((option, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedAnswer(index)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedAnswer === index
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {option}
                  </div>
                ))}
              </div>
            </>
          )}

          {currentSection === 'listening' && (
            <>
              {!storyPlayed && (
                <div className="mb-6">
                  <button
                    onClick={playStory}
                    className="bg-green-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-600"
                  >
                    Play Story
                  </button>
                </div>
              )}
              {storyPlayed && (
                <>
                  <h3 className="text-xl font-semibold mb-6">{(currentQuestion as ListeningQuestion).question}</h3>
                  <div className="space-y-3">
                    {(currentQuestion as ListeningQuestion).options.map((option, index) => (
                      <div
                        key={index}
                        onClick={() => setSelectedAnswer(index)}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedAnswer === index
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {currentSection === 'speaking' && (
            <>
              <h3 className="text-xl font-semibold mb-6">Speak the following sentence:</h3>
              <p className="text-lg mb-4">{(currentQuestion as SpeakingQuestion).sentence}</p>
              <p className="text-md text-gray-600 mb-6">Romaji: {(currentQuestion as SpeakingQuestion).romaji}</p>
              <button
                onClick={startRecording}
                disabled={isRecording}
                className={`px-6 py-3 rounded-lg font-medium mb-4 ${
                  isRecording ? 'bg-gray-400 text-white' : 'bg-red-500 text-white hover:bg-red-600'
                }`}
              >
                {isRecording ? 'Recording...' : 'Start Speaking'}
              </button>
              {spokenText && (
                <p className="text-md text-gray-800 mb-4">You said: {spokenText}</p>
              )}
              <button
                onClick={() => playQuestionAudio((currentQuestion as SpeakingQuestion).id, (currentQuestion as SpeakingQuestion).sentence)}
                disabled={playedAudios.has((currentQuestion as SpeakingQuestion).id)}
                className={`p-2 rounded-full ${playedAudios.has((currentQuestion as SpeakingQuestion).id) ? 'bg-gray-300' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
                aria-label="Play question audio"
              >
                {playedAudios.has((currentQuestion as SpeakingQuestion).id) ? '✓ Played' : '▶ Play'}
              </button>
              {/* Add audio element for each question */}
              <audio id={`${(currentQuestion as SpeakingQuestion).id}-audio`} preload="none">
                <source src={`/audio/${(currentQuestion as SpeakingQuestion).id}.mp3`} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            </>
          )}
          
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                currentQuestionIndex === 0
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Previous
            </button>
            
            <button
              onClick={handleSubmit}
              disabled={
                (currentSection !== 'speaking' && selectedAnswer === null) ||
                (currentSection === 'speaking' && !spokenText) ||
                (currentSection === 'listening' && !storyPlayed)
              }
              className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                (currentSection !== 'speaking' && selectedAnswer === null) ||
                (currentSection === 'speaking' && !spokenText) ||
                (currentSection === 'listening' && !storyPlayed)
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200'
              }`}
            >
              {currentQuestionIndex < currentQuestions.length - 1 ? 'Next Question' : 'Next Section / Finish'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      // Restore previous answer
      const prevAnswer = userAnswers[currentQuestionIndex - 1];
      if (currentSection !== 'speaking') {
        setSelectedAnswer(prevAnswer?.selected ?? null);
      } else {
        setSpokenText(prevAnswer?.spoken ?? '');
      }
    }
  };

  if (!loggedIn && !showRegister) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full transform transition-all duration-300 hover:shadow-2xl">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Welcome Back!</h1>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button
              type="submit"
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Login
            </button>
            <p className="text-sm text-center text-gray-600">
              New here?{' '}
              <button
                onClick={() => setShowRegister(true)}
                className="text-blue-600 hover:underline font-medium"
              >
                Create an account
              </button>
            </p>
          </form>
        </div>
      </div>
    );
  }

  if (!loggedIn && showRegister) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full transform transition-all duration-300 hover:shadow-2xl">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Create Account</h1>
          <form onSubmit={handleRegister} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button
              type="submit"
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Register
            </button>
            <p className="text-sm text-center text-gray-600">
              Already have an account?{' '}
              <button
                onClick={() => setShowRegister(false)}
                className="text-blue-600 hover:underline font-medium"
              >
                Login
              </button>
            </p>
          </form>
        </div>
      </div>
    );
  }

  if (examCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-gray-50 p-4">
        <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full text-center animate-fade-in">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 transform transition-all duration-500 hover:scale-110">
            <svg
              className="w-16 h-16 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Congratulations!</h2>
          <p className="text-lg text-gray-600 mb-6">Your exam has been submitted successfully.</p>
          <button
            onClick={handleLogout}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  const submitSpeakingTest = async () => {
    // Get the latest speaking score
    const currentScore = userAnswers
      .filter(a => a.questionId.startsWith('speaking-'))
      .filter(a => a.correct).length;
    
    const speakingDetails = {
      answers: userAnswers.filter(a => a.questionId.startsWith('speaking-')),
      totalQuestions: SPEAKING_QUESTION_COUNT,
      score: currentScore,
      sectionScores: {
        vocabulary: vocabScore,
        listening: listeningScore,
        speaking: currentScore
      }
    };
    
    // Update the speaking score state
    setSpeakingScore(currentScore);
    
    // Send email with results
    await sendTestResultsEmail('speaking', currentScore, speakingDetails);
  };

  const submitListeningTest = async () => {
    // Get the latest listening score
    const currentScore = userAnswers
      .filter(a => a.questionId.startsWith('listening-'))
      .filter(a => a.correct).length;
      
    const listeningDetails = {
      answers: userAnswers.filter(a => a.questionId.startsWith('listening-')),
      totalQuestions: LISTENING_QUESTION_COUNT,
      score: currentScore,
      sectionScores: {
        vocabulary: vocabScore,
        listening: currentScore,
        speaking: speakingScore
      }
    };
    
    // Update the listening score state
    setListeningScore(currentScore);
    
    // Send email with results
    await sendTestResultsEmail('listening', currentScore, listeningDetails);
  };

  return (
    <div className="max-w-4xl mx-auto p-4" style={containerStyle}>
      <h1 className="text-2xl font-bold mb-6">Japanese Exam - {currentSection.toUpperCase()} Section</h1>
      {renderQuestion()}
      {currentSection === 'speaking' && (
        <button
          onClick={submitSpeakingTest}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          Submit Speaking Test
        </button>
      )}
      {currentSection === 'listening' && (
        <button
          onClick={submitListeningTest}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          Submit Listening Test
        </button>
      )}
    </div>
  );
};

export default Exam;