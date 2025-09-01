import { useState, useEffect } from 'react';
import { FaPlay } from 'react-icons/fa';

interface Sentence {
  id: string;
  sentence: string;
}

interface JapaneseSentencePlayerProps {
  sentences: Sentence[];
}

export default function JapaneseSentencePlayer({ sentences }: JapaneseSentencePlayerProps) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [currentPlaying, setCurrentPlaying] = useState<string | null>(null);

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    // Load voices when component mounts
    loadVoices();

    // Update voices when they change
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const speak = (text: string, id: string) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Text-to-speech not supported in this browser');
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set language and voice properties for better Japanese pronunciation
    utterance.lang = 'ja-JP';
    utterance.rate = 0.8;
    utterance.pitch = 1.0;
    
    // Try to find a Japanese voice
    const japaneseVoice = voices.find(voice => 
      voice.lang.includes('ja') || voice.name.includes('Japanese')
    );
    
    if (japaneseVoice) {
      utterance.voice = japaneseVoice;
    } else if (voices.length > 0) {
      // Fallback to any available voice
      utterance.voice = voices[0];
    }

    // Update currently playing state
    setCurrentPlaying(id);
    
    // Reset current playing when done
    utterance.onend = () => setCurrentPlaying(null);
    utterance.onerror = () => setCurrentPlaying(null);
    
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-4">
      {sentences.map((item) => (
        <div 
          key={item.id} 
          className="flex items-center p-4 bg-white rounded-lg shadow hover:bg-gray-50 transition-colors"
        >
          <button
            onClick={() => speak(item.sentence, item.id)}
            className={`p-3 rounded-full mr-4 ${
              currentPlaying === item.id 
                ? 'bg-blue-600 text-white' 
                : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
            } transition-colors`}
            aria-label="Play sentence"
            disabled={currentPlaying === item.id}
          >
            <FaPlay className="w-4 h-4" />
          </button>
          <p className="text-lg text-gray-800">{item.sentence}</p>
        </div>
      ))}
    </div>
  );
}
