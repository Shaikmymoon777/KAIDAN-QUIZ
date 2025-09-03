import { useEffect, useCallback } from 'react';

export const useSpeechSynthesis = (text: string, lang = 'ja-JP') => {
  const speak = useCallback(() => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.9;
      
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      // Speak the text
      window.speechSynthesis.speak(utterance);
      
      return utterance;
    }
    return null;
  }, [text, lang]);

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return { speak };
};
