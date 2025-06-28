import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Volume2, 
  Mic, 
  ArrowLeft, 
  ArrowRight, 
  BookOpen,
  Zap,
  Target,
  Trophy,
  Grid3X3,
  Star
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import IncorrectAnswerDialog from '../components/IncorrectAnswerDialog';

// Interfaces
interface FlashCard {
  id: string;
  character: string;
  romaji: string;
  meaning: string;
}

interface VocabWord {
  id: string;
  word: string;
  reading: string;
  meaning: string;
  category: string;
}

interface CharacterData {
  character: string;
  romaji: string;
  learned?: boolean;
}

// Mock data (replace with actual data)
const hiraganaCharts: CharacterData[][] = [
  [
    { character: 'あ', romaji: 'a' },
    { character: 'い', romaji: 'i' },
    { character: 'う', romaji: 'u' },
    { character: 'え', romaji: 'e' },
    { character: 'お', romaji: 'o' }
  ],
  // Add more rows as needed
];
const katakanaCharts: CharacterData[][] = [
  [
    { character: 'ア', romaji: 'a' },
    { character: 'イ', romaji: 'i' },
    { character: 'ウ', romaji: 'u' },
    { character: 'エ', romaji: 'e' },
    { character: 'オ', romaji: 'o' }
  ],
  // Add more rows as needed
];
const vocabularyData: { [key: string]: VocabWord[] } = {
  greetings: [
    { id: '1', word: 'こんにちは', reading: 'konnichiwa', meaning: 'Hello', category: 'greetings' },
    { id: '2', word: 'おはよう', reading: 'ohayou', meaning: 'Good morning', category: 'greetings' }
  ],
  // Add more categories as needed
};

// Fisher-Yates shuffle
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function Practice() {
  const { state } = useApp();
  const [mode, setMode] = useState<'flashcards' | 'vocabulary' | 'charts' | null>(null);
  const [flashcardType, setFlashcardType] = useState<'hiragana' | 'katakana'>('hiragana');
  const [vocabularyCategory, setVocabularyCategory] = useState('greetings');
  const [chartType, setChartType] = useState<'hiragana' | 'katakana'>('hiragana');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [] = useState(false);
  const [isAutoplay] = useState(false);
  const [flashcards, setFlashcards] = useState<FlashCard[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [userSpeech, setUserSpeech] = useState('');
  const [showIncorrectDialog, setShowIncorrectDialog] = useState(false);
  const [incorrectAnswerData, setIncorrectAnswerData] = useState({
    userAnswer: '',
    correctAnswer: '',
    word: ''
  });
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterData | null>(null);
  const [quizOptions, setQuizOptions] = useState<FlashCard[]>([]);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [quizCorrect, setQuizCorrect] = useState<boolean | null>(null);

  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[。、！？\s]/g, '')
      .replace(/っ/g, 'tsu')
      .replace(/ー/g, '')
      .replace(/[ァ-ヶ]/g, (match) => {
        const code = match.charCodeAt(0) - 0x60;
        return String.fromCharCode(code);
      });
  };

  const checkPronunciation = (userInput: string, correctReading: string, word: string): boolean => {
    const normalizeJapanese = (text: string) =>
      text.replace(/[。、！？\s]/g, '').replace(/ー/g, '').trim();
    const normalizedUserJapanese = normalizeJapanese(userInput);
    const normalizedCorrectJapanese = normalizeJapanese(word);
    const normalizedUserRomaji = normalizeText(userInput);
    const normalizedCorrectRomaji = normalizeText(correctReading);
    const isCorrectJapanese =
      normalizedUserJapanese === normalizedCorrectJapanese ||
      normalizedUserJapanese.includes(normalizedCorrectJapanese) ||
      normalizedCorrectJapanese.includes(normalizedUserJapanese);
    const isCorrectRomaji =
      normalizedUserRomaji === normalizedCorrectRomaji ||
      normalizedUserRomaji.includes(normalizedCorrectRomaji) ||
      normalizedCorrectRomaji.includes(normalizedUserRomaji);
    const isCorrect = isCorrectJapanese || isCorrectRomaji;
    if (!isCorrect) {
      setIncorrectAnswerData({ userAnswer: userInput, correctAnswer: correctReading, word });
      setShowIncorrectDialog(true);
    }
    return isCorrect;
  };

  useEffect(() => {
    const loadFlashcards = () => {
      try {
        const data = flashcardType === 'hiragana' 
          ? hiraganaCharts.flat().filter(c => c.character)
          : katakanaCharts.flat().filter(c => c.character);
        const formattedData = data.map((item, index) => ({
          id: `fc-${index}`,
          character: item.character,
          romaji: item.romaji,
          meaning: item.romaji
        }));
        setFlashcards(mode === 'flashcards' ? shuffleArray(formattedData) : formattedData);
        setCurrentCardIndex(0);
      } catch (error) {
        console.error('Failed to load flashcards:', error);
      }
    };
    if (mode === 'flashcards') loadFlashcards();
  }, [flashcardType, mode]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = false;
        recognitionInstance.lang = 'ja-JP';
        recognitionInstance.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setUserSpeech(transcript);
          setIsListening(false);
          if (mode === 'vocabulary') {
            const vocabularyWords = vocabularyData[vocabularyCategory] || [];
            const currentWord = vocabularyWords[currentCardIndex] || vocabularyWords[0];
            if (currentWord) {
              const isCorrect = checkPronunciation(transcript, currentWord.reading, currentWord.word);
              if (isCorrect) {
                setTimeout(() => {
                  setCurrentCardIndex((prev) => (prev < vocabularyWords.length - 1 ? prev + 1 : 0));
                }, 800);
              }
            }
          }
        };
        recognitionInstance.onerror = () => setIsListening(false);
        recognitionInstance.onend = () => setIsListening(false);
        setRecognition(recognitionInstance);
      }
    }
  }, [mode, vocabularyCategory, currentCardIndex]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isAutoplay && mode === 'flashcards') {
      interval = setInterval(() => {
        setCurrentCardIndex(prev => (prev < flashcards.length - 1 ? prev + 1 : 0));
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isAutoplay, currentCardIndex, mode]);

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const startListening = () => {
    if (recognition && !isListening) {
      setIsListening(true);
      setUserSpeech('');
      recognition.start();
    }
  };

  const closeIncorrectDialog = () => {
    setShowIncorrectDialog(false);
    setUserSpeech('');
  };

  const getQuizOptions = (cards: FlashCard[], correctIndex: number): FlashCard[] => {
    const correct = cards[correctIndex];
    const others = cards.filter((_, idx) => idx !== correctIndex);
    const distractors = [];
    while (distractors.length < 3 && others.length > 0) {
      const idx = Math.floor(Math.random() * others.length);
      distractors.push(others[idx]);
      others.splice(idx, 1);
    }
    const options = [correct, ...distractors];
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    return options;
  };

  useEffect(() => {
    if (mode === 'flashcards' && flashcards.length > 0) {
      setQuizOptions(getQuizOptions(flashcards, currentCardIndex));
      setQuizAnswered(false);
      setQuizCorrect(null);
    }
  }, [mode, flashcards, currentCardIndex]);

  const handleQuizOptionClick = (option: FlashCard) => {
    if (quizAnswered) return;
    const isCorrect = option.id === flashcards[currentCardIndex].id;
    setQuizAnswered(true);
    setQuizCorrect(isCorrect);
    if (!isCorrect) {
      setIncorrectAnswerData({
        userAnswer: option.character,
        correctAnswer: flashcards[currentCardIndex].character,
        word: flashcards[currentCardIndex].romaji
      });
      setShowIncorrectDialog(true);
    } else {
      setTimeout(() => {
        setCurrentCardIndex((prev) => (prev < flashcards.length - 1 ? prev + 1 : 0));
      }, 800);
    }
  };

  // Japanese Themed Background with CSS Animations
  const JapaneseBackground = () => (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      <div className="sakura-petal left-[10%] top-[-10%]"></div>
      <div className="sakura-petal left-[30%] top-[-20%] animation-delay-2s"></div>
      <div className="sakura-petal left-[50%] top-[-15%] animation-delay-4s"></div>
      <div className="sakura-petal left-[70%] top-[-25%] animation-delay-6s"></div>
      <div className="sakura-petal left-[90%] top-[-10%] animation-delay-8s"></div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-gradient-to-t from-red-500/50 to-transparent rounded-t-full animate-pulse"></div>
    </div>
  );

  // Main Menu
  if (!mode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-400 via-yellow-300 to-cyan-400 dark:from-pink-900 dark:via-yellow-900 dark:to-cyan-900 relative overflow-hidden">
        <style>
          {`
            @keyframes sakura-fall {
              0% { transform: translateY(-20vh) rotate(0deg); opacity: 0.9; }
              100% { transform: translateY(100vh) rotate(720deg); opacity: 0.2; }
            }
            .sakura-petal {
              position: absolute;
              width: 12px;
              height: 12px;
              background: radial-gradient(circle, #ffb7c5 40%, #ff87b2 70%, transparent);
              clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
              animation: sakura-fall 8s linear infinite;
            }
            .animation-delay-2s { animation-delay: 2s; }
            .animation-delay-4s { animation-delay: 4s; }
            .animation-delay-6s { animation-delay: 6s; }
            .animation-delay-8s { animation-delay: 8s; }
            @keyframes wave {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-8px); }
            }
            .animate-wave { animation: wave 2s ease-in-out infinite; }
            @keyframes shake {
              0%, 100% { transform: translateX(0); }
              25% { transform: translateX(-5px); }
              75% { transform: translateX(5px); }
            }
            .animate-shake { animation: shake 0.3s ease-in-out 3; }
          `}
        </style>
        <JapaneseBackground />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}>
            <div className="text-center mb-12">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mb-6 relative"
              >
                <div className="w-32 h-32 mx-auto bg-gradient-to-br from-red-500 to-pink-400 rounded-full flex items-center justify-center shadow-2xl animate-wave">
                  <span className="text-6xl">🏯</span>
                </div>
              </motion.div>
              <motion.h1
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-6xl font-extrabold bg-gradient-to-r from-red-500 via-pink-500 to-yellow-500 bg-clip-text text-transparent mb-4 drop-shadow-2xl animate-pulse"
              >
                Nihongo Quest!
              </motion.h1>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="text-2xl text-gray-800 dark:text-gray-100 max-w-3xl mx-auto leading-relaxed font-semibold"
              >
                Embark on a colorful journey to master Japanese Hiragana, Katakana, and vocabulary with playful quizzes and animations!
              </motion.p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 4, boxShadow: "0 15px 30px rgba(0,0,0,0.3)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMode('flashcards')}
                className="group bg-gradient-to-br from-pink-500 to-red-500 dark:from-pink-800 dark:to-red-800 rounded-3xl shadow-2xl border-4 border-yellow-400 dark:border-yellow-700 cursor-pointer p-8 relative overflow-hidden"
              >
                <div className="absolute -top-8 -right-8 w-24 h-24 bg-yellow-400/30 rounded-full animate-pulse"></div>
                <BookOpen className="w-14 h-14 text-yellow-300 group-hover:scale-125 transition-transform duration-300" />
                <h2 className="text-3xl font-extrabold text-white mb-3">Flashcard Quest</h2>
                <p className="text-gray-100 mb-4 text-lg">Race through kana with vibrant quizzes!</p>
                <div className="flex items-center space-x-2 text-sm">
                  <Star className="w-5 h-5 text-yellow-300 animate-spin-slow" />
                  <span className="font-semibold text-white">Collect Stars!</span>
                </div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.1, rotate: -4, boxShadow: "0 15px 30px rgba(0,0,0,0.3)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMode('charts')}
                className="group bg-gradient-to-br from-cyan-500 to-blue-500 dark:from-cyan-800 dark:to-blue-800 rounded-3xl shadow-2xl border-4 border-pink-400 dark:border-pink-700 cursor-pointer p-8 relative overflow-hidden"
              >
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-28 h-28 bg-pink-400/30 rounded-full animate-pulse"></div>
                <Grid3X3 className="w-14 h-14 text-pink-300 group-hover:scale-125 transition-transform duration-300" />
                <h2 className="text-3xl font-extrabold text-white mb-3">Kana Garden</h2>
                <p className="text-gray-100 mb-4 text-lg">Explore colorful kana charts with sound!</p>
                <div className="flex items-center space-x-2 text-sm">
                  <Volume2 className="w-5 h-5 text-yellow-300 animate-pulse" />
                  <span className="font-semibold text-white">Hear & Learn</span>
                </div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.1, rotate: 4, boxShadow: "0 15px 30px rgba(0,0,0,0.3)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMode('vocabulary')}
                className="group bg-gradient-to-br from-yellow-500 to-orange-500 dark:from-yellow-800 dark:to-orange-800 rounded-3xl shadow-2xl border-4 border-cyan-400 dark:border-cyan-700 cursor-pointer p-8 relative overflow-hidden"
              >
                <div className="absolute -bottom-10 right-0 w-32 h-32 bg-cyan-400/30 rounded-full animate-pulse"></div>
                <Brain className="w-14 h-14 text-cyan-300 group-hover:scale-125 transition-transform duration-300" />
                <h2 className="text-3xl font-extrabold text-white mb-3">Vocab Temple</h2>
                <p className="text-gray-100 mb-4 text-lg">Master words with fun speech challenges!</p>
                <div className="flex items-center space-x-2 text-sm">
                  <Mic className="w-5 h-5 text-pink-300 animate-pulse" />
                  <span className="font-semibold text-white">Speak & Shine</span>
                </div>
              </motion.div>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="bg-gradient-to-r from-pink-300/90 to-cyan-300/90 dark:from-pink-800/90 dark:to-cyan-800/90 backdrop-blur-lg rounded-3xl shadow-2xl p-10 border-4 border-yellow-400 dark:border-yellow-700"
            >
              <h3 className="text-3xl font-extrabold text-white mb-8 text-center bg-gradient-to-r from-pink-600 to-cyan-600 bg-clip-text text-transparent">
                Your Ninja Journey
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="text-center">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl"
                  >
                    <Target className="w-10 h-10 text-white" />
                  </motion.div>
                  <div className="text-4xl font-extrabold text-white mb-2">
                    {state.practiceProgress.flashcards.hiragana.completed + state.practiceProgress.flashcards.katakana.completed}
                  </div>
                  <div className="text-base text-gray-100 font-semibold">Kana Mastered</div>
                </div>
                <div className="text-center">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: -5 }}
                    className="w-20 h-20 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl"
                  >
                    <Zap className="w-10 h-10 text-white" />
                  </motion.div>
                  <div className="text-4xl font-extrabold text-white mb-2">
                    {Math.max(state.practiceProgress.flashcards.hiragana.streak, state.practiceProgress.flashcards.katakana.streak)}
                  </div>
                  <div className="text-base text-gray-100 font-semibold">Epic Streak</div>
                </div>
                <div className="text-center">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl"
                  >
                    <Brain className="w-10 h-10 text-white" />
                  </motion.div>
                  <div className="text-4xl font-extrabold text-white mb-2">
                    {Object.values(state.practiceProgress.vocabulary).reduce((sum, level) => sum + (level.wordsLearned || 0), 0)}
                  </div>
                  <div className="text-base text-gray-100 font-semibold">Words Conquered</div>
                </div>
                <div className="text-center">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: -5 }}
                    className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl"
                  >
                    <Trophy className="w-10 h-10 text-white" />
                  </motion.div>
                  <div className="text-4xl font-extrabold text-white mb-2">
                    {Math.max(...Object.values(state.practiceProgress.vocabulary).map(level => level.accuracy || 0), 0)}%
                  </div>
                  <div className="text-base text-gray-100 font-semibold">Top Accuracy</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Flashcards Mode
  if (mode === 'flashcards' && flashcards.length > 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-400 via-yellow-300 to-cyan-400 dark:from-pink-900 dark:via-yellow-900 dark:to-cyan-900 relative overflow-hidden">
        <style>
          {`
            @keyframes sakura-fall {
              0% { transform: translateY(-20vh) rotate(0deg); opacity: 0.9; }
              100% { transform: translateY(100vh) rotate(720deg); opacity: 0.2; }
            }
            .sakura-petal {
              position: absolute;
              width: 12px;
              height: 12px;
              background: radial-gradient(circle, #ffb7c5 40%, #ff87b2 70%, transparent);
              clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
              animation: sakura-fall 8s linear infinite;
            }
            .animation-delay-2s { animation-delay: 2s; }
            .animation-delay-4s { animation-delay: 4s; }
            .animation-delay-6s { animation-delay: 6s; }
            .animation-delay-8s { animation-delay: 8s; }
            @keyframes wave {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-8px); }
            }
            .animate-wave { animation: wave 2s ease-in-out infinite; }
            @keyframes shake {
              0%, 100% { transform: translateX(0); }
              25% { transform: translateX(-5px); }
              75% { transform: translateX(5px); }
            }
            .animate-shake { animation: shake 0.3s ease-in-out 3; }
          `}
        </style>
        <JapaneseBackground />
        <div className="max-w-3xl mx-auto px-4 py-12">
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="flex items-center justify-between mb-8">
              <motion.button
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMode(null)}
                className="flex items-center space-x-3 text-white bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 px-6 py-3 rounded-full font-bold shadow-2xl"
              >
                <ArrowLeft size={24} />
                <span>Back</span>
              </motion.button>
              <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-cyan-600">Flashcard Frenzy</h1>
              <select
                value={flashcardType}
                onChange={e => setFlashcardType(e.target.value as 'hiragana' | 'katakana')}
                className="rounded-full border-4 border-yellow-400 px-6 py-3 bg-gradient-to-r from-white/90 to-yellow-200/90 dark:bg-gradient-to-r dark:from-gray-800/90 dark:to-yellow-800/90 text-pink-600 font-bold shadow-lg hover:bg-yellow-300/90 transition-all duration-300"
              >
                <option value="hiragana">Hiragana</option>
                <option value="katakana">Katakana</option>
              </select>
            </div>
            <div className="mb-8">
              <div className="w-full bg-white/30 rounded-full h-4 shadow-inner">
                <motion.div
                  className="h-4 bg-gradient-to-r from-pink-500 via-yellow-400 to-cyan-500 rounded-full shadow-lg"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentCardIndex + 1) / flashcards.length) * 100}%` }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                />
              </div>
              <div className="text-right text-sm text-white font-bold mt-2">
                {currentCardIndex + 1} / {flashcards.length}
              </div>
            </div>
            <motion.div
              key={currentCardIndex}
              initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-br from-white/90 to-yellow-200/90 dark:bg-gradient-to-br dark:from-gray-800/90 dark:to-yellow-800/90 rounded-3xl shadow-2xl border-4 border-pink-400 dark:border-pink-700 p-8 mb-6 text-center relative overflow-hidden max-w-md mx-auto"
            >
              <div className="sakura-petal absolute -top-6 right-6"></div>
              <div className="text-lg font-bold text-pink-600 mb-4">Find the character for:</div>
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-5xl font-extrabold text-cyan-600 mb-6 animate-wave"
              >
                {flashcards[currentCardIndex].romaji}
              </motion.div>
              <div className="grid grid-cols-2 gap-4">
                {quizOptions.map(option => (
                  <motion.button
                    key={option.id}
                    whileHover={{ scale: quizAnswered ? 1 : 1.1, rotate: quizAnswered ? 0 : 3, boxShadow: quizAnswered ? "" : "0 10px 20px rgba(0,0,0,0.2)" }}
                    whileTap={{ scale: quizAnswered ? 1 : 0.95 }}
                    onClick={() => handleQuizOptionClick(option)}
                    disabled={quizAnswered}
                    className={`
                      p-6 rounded-2xl shadow-lg border-2 text-4xl font-extrabold transition-all duration-300
                      ${quizAnswered
                        ? option.id === flashcards[currentCardIndex].id
                          ? 'bg-gradient-to-r from-green-400 to-emerald-500 border-green-300 text-white'
                          : 'bg-gradient-to-r from-red-400 to-rose-500 border-red-300 text-white animate-shake'
                        : 'bg-gradient-to-r from-pink-300 to-yellow-300 border-pink-200 text-pink-700 hover:bg-gradient-to-r hover:from-pink-400 hover:to-yellow-400'
                      }
                    `}
                  >
                    {option.character}
                  </motion.button>
                ))}
              </div>
              {quizAnswered && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="mt-6 text-center"
                >
                  {quizCorrect ? (
                    <div className="text-xl font-extrabold text-green-500 mb-2 animate-bounce">Awesome! 🎉</div>
                  ) : (
                    <>
                      <div className="text-xl font-extrabold text-red-500 mb-2 animate-shake">
                        Oops! Correct answer: <span className="font-mono">{flashcards[currentCardIndex].character}</span>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCurrentCardIndex((prev) => (prev < flashcards.length - 1 ? prev + 1 : 0))}
                        className="mt-4 px-8 py-3 bg-gradient-to-r from-pink-500 to-cyan-500 text-white rounded-full font-bold shadow-lg"
                      >
                        Next
                      </motion.button>
                    </>
                  )}
                </motion.div>
              )}
            </motion.div>
            <IncorrectAnswerDialog
              isOpen={showIncorrectDialog}
              onClose={closeIncorrectDialog}
              userAnswer={incorrectAnswerData.userAnswer}
              correctAnswer={incorrectAnswerData.correctAnswer}
              word={incorrectAnswerData.word}
            />
          </motion.div>
        </div>
      </div>
    );
  }

  // Charts Mode
  if (mode === 'charts') {
    const currentCharts = chartType === 'hiragana' ? hiraganaCharts : katakanaCharts;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-green-300 to-yellow-400 dark:from-cyan-900 dark:via-green-900 dark:to-yellow-900 relative overflow-hidden">
        <style>
          {`
            @keyframes sakura-fall {
              0% { transform: translateY(-20vh) rotate(0deg); opacity: 0.9; }
              100% { transform: translateY(100vh) rotate(720deg); opacity: 0.2; }
            }
            .sakura-petal {
              position: absolute;
              width: 12px;
              height: 12px;
              background: radial-gradient(circle, #ffb7c5 40%, #ff87b2 70%, transparent);
              clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
              animation: sakura-fall 8s linear infinite;
            }
            .animation-delay-2s { animation-delay: 2s; }
            .animation-delay-4s { animation-delay: 4s; }
            .animation-delay-6s { animation-delay: 6s; }
            .animation-delay-8s { animation-delay: 8s; }
            @keyframes wave {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-8px); }
            }
            .animate-wave { animation: wave 2s ease-in-out infinite; }
          `}
        </style>
        <JapaneseBackground />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setMode(null)}
                  className="flex items-center space-x-3 text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 px-6 py-3 rounded-full font-bold shadow-2xl"
                >
                  <ArrowLeft size={24} />
                  <span>Back</span>
                </motion.button>
                <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-yellow-600">
                  {chartType.charAt(0).toUpperCase() + chartType.slice(1)} Garden
                </h1>
              </div>
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value as 'hiragana' | 'katakana')}
                className="px-6 py-3 bg-gradient-to-r from-white/90 to-cyan-200/90 dark:bg-gradient-to-r dark:from-gray-800/90 dark:to-cyan-800/90 rounded-full border-4 border-yellow-400 text-cyan-600 font-bold shadow-lg hover:bg-cyan-300/90 transition-all duration-300"
              >
                <option value="hiragana">Hiragana</option>
                <option value="katakana">Katakana</option>
              </select>
            </div>
            <div className="bg-gradient-to-br from-white/90 to-cyan-200/90 dark:bg-gradient-to-br dark:from-gray-800/90 dark:to-cyan-800/90 rounded-3xl shadow-2xl p-8 border-4 border-yellow-400 dark:border-yellow-700">
              <div className="space-y-4">
                {currentCharts.map((row, rowIndex) => (
                  <div key={rowIndex} className="grid grid-cols-5 gap-2">
                    {row.map((char, colIndex) => (
                      <motion.div
                        key={`${rowIndex}-${colIndex}`}
                        whileHover={{ scale: 1.1, rotate: 5, boxShadow: "0 8px 16px rgba(0,0,0,0.2)" }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          if (char.character) {
                            setSelectedCharacter(char);
                            speakText(char.character);
                          }
                        }}
                        className={`
                          aspect-square flex flex-col items-center justify-center rounded-xl transition-all duration-300 cursor-pointer
                          ${char.character 
                            ? 'bg-gradient-to-br from-cyan-400 to-blue-400 dark:from-cyan-700 dark:to-blue-700 hover:from-cyan-500 hover:to-blue-500 dark:hover:from-cyan-600 dark:hover:to-blue-600 shadow-lg hover:shadow-xl border-2 border-yellow-300 dark:border-yellow-600' 
                            : 'bg-transparent'
                          }
                          p-2 min-w-[40px] min-h-[40px]
                        `}
                      >
                        {char.character && (
                          <>
                            <div className="text-2xl font-extrabold text-white mb-1">{char.character}</div>
                            <div className="text-xs text-gray-100 font-semibold">{char.romaji}</div>
                          </>
                        )}
                      </motion.div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <AnimatePresence>
              {selectedCharacter && (
                <motion.div
                  initial={{ opacity: 0, y: 50, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -50 }}
                  transition={{ duration: 0.6 }}
                  className="mt-8 bg-gradient-to-br from-green-400 to-cyan-400 dark:from-green-800 dark:to-cyan-800 rounded-3xl shadow-2xl p-10 border-4 border-yellow-400 dark:border-yellow-700"
                >
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5 }}
                      className="text-9xl font-extrabold text-white mb-6 animate-wave"
                    >
                      {selectedCharacter.character}
                    </motion.div>
                    <div className="text-4xl text-gray-100 mb-6 font-semibold">{selectedCharacter.romaji}</div>
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => speakText(selectedCharacter.character)}
                      className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-full font-bold shadow-2xl"
                    >
                      <Volume2 size={24} />
                      <span>Pronounce</span>
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    );
  }

  // Vocabulary Mode
  if (mode === 'vocabulary') {
    const vocabularyWords = vocabularyData[vocabularyCategory] || [];
    const currentWord = vocabularyWords[currentCardIndex] || vocabularyWords[0];
    
    if (!currentWord) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-red-400 dark:from-purple-900 dark:via-pink-900 dark:to-red-900 flex items-center justify-center relative overflow-hidden">
          <style>
            {`
              @keyframes sakura-fall {
                0% { transform: translateY(-20vh) rotate(0deg); opacity: 0.9; }
                100% { transform: translateY(100vh) rotate(720deg); opacity: 0.2; }
              }
              .sakura-petal {
                position: absolute;
                width: 12px;
                height: 12px;
                background: radial-gradient(circle, #ffb7c5 40%, #ff87b2 70%, transparent);
                clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
                animation: sakura-fall 8s linear infinite;
              }
              .animation-delay-2s { animation-delay: 2s; }
              .animation-delay-4s { animation-delay: 4s; }
              .animation-delay-6s { animation-delay: 6s; }
              .animation-delay-8s { animation-delay: 8s; }
              @keyframes wave {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-8px); }
              }
              .animate-wave { animation: wave 2s ease-in-out infinite; }
            `}
          </style>
          <JapaneseBackground />
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white mb-6 bg-clip-text bg-gradient-to-r from-purple-600 to-red-600">
              No vocabulary available for this category
            </h2>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setMode(null)}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-red-500 hover:from-purple-600 hover:to-red-600 text-white rounded-full font-bold shadow-2xl"
            >
              Back to Practice Zone
            </motion.button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-red-400 dark:from-purple-900 dark:via-pink-900 dark:to-red-900 relative overflow-hidden">
        <style>
          {`
            @keyframes sakura-fall {
              0% { transform: translateY(-20vh) rotate(0deg); opacity: 0.9; }
              100% { transform: translateY(100vh) rotate(720deg); opacity: 0.2; }
            }
            .sakura-petal {
              position: absolute;
              width: 12px;
              height: 12px;
              background: radial-gradient(circle, #ffb7c5 40%, #ff87b2 70%, transparent);
              clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
              animation: sakura-fall 8s linear infinite;
            }
            .animation-delay-2s { animation-delay: 2s; }
            .animation-delay-4s { animation-delay: 4s; }
            .animation-delay-6s { animation-delay: 6s; }
            .animation-delay-8s { animation-delay: 8s; }
            @keyframes wave {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-8px); }
            }
            .animate-wave { animation: wave 2s ease-in-out infinite; }
          `}
        </style>
        <JapaneseBackground />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setMode(null)}
                  className="flex items-center space-x-3 text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-3 rounded-full font-bold shadow-2xl"
                >
                  <ArrowLeft size={24} />
                  <span>Back</span>
                </motion.button>
                <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-red-600">
                  Vocabulary Temple
                </h1>
              </div>
              <select
                value={vocabularyCategory}
                onChange={(e) => {
                  setVocabularyCategory(e.target.value);
                  setCurrentCardIndex(0);
                }}
                className="px-6 py-3 bg-gradient-to-r from-white/90 to-purple-200/90 dark:bg-gradient-to-r dark:from-gray-800/90 dark:to-purple-800/90 rounded-full border-4 border-red-400 text-purple-600 font-bold shadow-lg hover:bg-purple-300/90 transition-all duration-300 capitalize"
              >
                {Object.keys(vocabularyData).map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <motion.div
              key={currentWord.id}
              initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-br from-white/90 to-purple-200/90 dark:bg-gradient-to-br dark:from-gray-800/90 dark:to-purple-800/90 rounded-3xl shadow-2xl p-12 mb-8 border-4 border-red-400 dark:border-red-700"
            >
              <div className="text-center mb-12">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-8xl font-extrabold text-purple-600 dark:text-white mb-6 animate-wave"
                >
                  {currentWord.word}
                </motion.div>
                <div className="text-4xl text-red-500 dark:text-red-400 mb-4 font-semibold">{currentWord.reading}</div>
                <div className="text-3xl text-gray-700 dark:text-gray-100">{currentWord.meaning}</div>
                <div className="mt-4 inline-block px-4 py-2 bg-red-300/50 dark:bg-red-900/50 text-red-800 dark:text-red-300 rounded-full text-base font-semibold capitalize">
                  {currentWord.category}
                </div>
              </div>
              <div className="flex justify-center space-x-6 mb-8">
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => speakText(currentWord.word)}
                  className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-purple-500 to-red-500 hover:from-purple-600 hover:to-red-600 text-white rounded-full font-bold shadow-2xl"
                >
                  <Volume2 size={24} />
                  <span>Listen</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startListening}
                  disabled={isListening || !recognition}
                  className={`flex items-center space-x-3 px-8 py-4 rounded-full font-bold shadow-2xl transition-all duration-300 ${
                    isListening
                      ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
                      : 'bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-100 hover:from-gray-300 hover:to-gray-400 dark:hover:from-gray-600 dark:hover:to-gray-500'
                  }`}
                >
                  <Mic size={24} />
                  <span>{isListening ? 'Listening...' : 'Practice'}</span>
                </motion.button>
              </div>
              {userSpeech && !showIncorrectDialog && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-gradient-to-r from-blue-300 to-cyan-300 dark:from-blue-800/50 dark:to-cyan-800/50 rounded-2xl p-6 mb-6 border-2 border-blue-400 dark:border-blue-700"
                >
                  <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-3">
                    Your pronunciation:
                  </h4>
                  <p className="text-blue-700 dark:text-blue-200 text-lg">{userSpeech}</p>
                </motion.div>
              )}
              {!recognition && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-gradient-to-r from-yellow-300 to-orange-300 dark:from-yellow-800/50 dark:to-orange-800/50 rounded-2xl p-6 mb-6 border-2 border-orange-400 dark:border-orange-700"
                >
                  <p className="text-orange-700 dark:text-orange-200">
                    Speech recognition is not supported in your browser. You can still practice by listening to the pronunciation.
                  </p>
                </motion.div>
              )}
            </motion.div>
            <div className="flex items-center justify-between">
              <motion.button
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentCardIndex(Math.max(0, currentCardIndex - 1))}
                disabled={currentCardIndex === 0}
                className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-white/90 to-purple-200/90 dark:bg-gradient-to-r dark:from-gray-800/90 dark:to-purple-800/90 hover:bg-purple-300/90 text-purple-600 rounded-full font-bold shadow-2xl border-4 border-red-400 dark:border-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft size={24} />
                <span>Previous</span>
              </motion.button>
              <div className="text-center">
                <span className="text-white font-extrabold text-lg">
                  {currentCardIndex + 1} of {vocabularyWords.length}
                </span>
                <div className="text-sm text-gray-100 font-semibold capitalize">
                  {vocabularyCategory} category
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentCardIndex(Math.min(vocabularyWords.length - 1, currentCardIndex + 1))}
                disabled={currentCardIndex === vocabularyWords.length - 1}
                className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-white/90 to-purple-200/90 dark:bg-gradient-to-r dark:from-gray-800/90 dark:to-purple-800/90 hover:bg-purple-300/90 text-purple-600 rounded-full font-bold shadow-2xl border-4 border-red-400 dark:border-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Next</span>
                <ArrowRight size={24} />
              </motion.button>
            </div>
            <IncorrectAnswerDialog
              isOpen={showIncorrectDialog}
              onClose={closeIncorrectDialog}
              userAnswer={incorrectAnswerData.userAnswer}
              correctAnswer={incorrectAnswerData.correctAnswer}
              word={incorrectAnswerData.word}
            />
          </motion.div>
        </div>
      </div>
    );
  }

  return null;
}