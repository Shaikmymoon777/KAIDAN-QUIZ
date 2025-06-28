import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, Volume2 } from 'lucide-react';

interface IncorrectAnswerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userAnswer: string;
  correctAnswer: string;
  word: string;
}

export default function IncorrectAnswerDialog({
  isOpen,
  onClose,
  userAnswer,
  correctAnswer,
  word
}: IncorrectAnswerDialogProps) {
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const recognizeSpeech = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser.');
      return;
    }
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = 'ja-JP';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.trim();
      // Simple comparison, you can use a better similarity check here
      if (transcript === correctAnswer) {
        alert('Great! Your pronunciation is correct.');
        onClose();
      } else {
        alert(`You said: ${transcript}. Try again!`);
      }
    };

    recognition.onerror = (event: any) => {
      alert('Error occurred in recognition: ' + event.error);
    };

    recognition.start();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            {/* Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 border border-gray-200 dark:border-gray-700"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Try Again
                  </h3>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    {word}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
                    <h4 className="text-sm font-semibold text-red-800 dark:text-red-300 mb-2">
                      Your pronunciation:
                    </h4>
                    <p className="text-red-700 dark:text-red-400 text-lg">
                      {userAnswer}
                    </p>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-green-800 dark:text-green-300">
                        Correct pronunciation:
                      </h4>
                      <button
                        onClick={() => speakText(word)}
                        className="p-2 hover:bg-green-100 dark:hover:bg-green-800/30 rounded-lg transition-colors"
                      >
                        <Volume2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </button>
                    </div>
                    <p className="text-green-700 dark:text-green-400 text-lg font-medium">
                      {correctAnswer}
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                  <p className="text-blue-800 dark:text-blue-300 text-sm">
                    💡 <strong>Tip:</strong> Listen carefully and try to match the pronunciation. 
                    Practice makes perfect!
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 mt-8">
                <button
                  onClick={() => speakText(word)}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors font-medium flex items-center justify-center space-x-2"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Listen Again</span>
                </button>
                <button
                  onClick={recognizeSpeech}
                  className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors font-medium flex items-center justify-center space-x-2"
                >
                  <span>Try Speaking</span>
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-xl transition-colors font-medium"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}