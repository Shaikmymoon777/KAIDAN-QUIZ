import React, { useState, useRef, useEffect } from 'react';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis';

export interface SpeakingQuestion {
  id: string;
  sentence: string;
  audioPrompt?: string; // URL to the audio prompt
  hint?: string;
}

interface SpeakingSectionProps {
  questions: SpeakingQuestion[];
  onRecord: (questionId: string, audioBlob: Blob) => Promise<{ audioUrl: string; score: number }>;
  userAnswers: Record<string, {
    audioUrl?: string;
    score?: number;
    isCorrect?: boolean;
    feedback?: string;
  }>;
  currentQuestionIndex: number;
  onAnswerSelect: (questionId: string, answer: { audioUrl: string }, score: number) => void;
  onSubmit: () => void;
  isLastQuestion: boolean;
}

const SpeakingSection: React.FC<SpeakingSectionProps> = ({
  questions,
  onRecord,
  userAnswers,
  currentQuestionIndex,
  onAnswerSelect,
  onSubmit,
  isLastQuestion
}) => {
  const [isRecording, setIsRecording] = useState<string | null>(null);
  const [mediaRecorders, setMediaRecorders] = useState<Record<string, MediaRecorder>>({});
  const [audioChunks, setAudioChunks] = useState<Record<string, BlobPart[]>>({});
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const currentQuestion = questions[currentQuestionIndex];
  const userAnswer = currentQuestion ? userAnswers[currentQuestion.id] : null;
  
  // Use the useSpeechSynthesis hook
  const { speak } = useSpeechSynthesis(currentQuestion?.sentence || '', 'ja-JP');

  const toggleSpeakText = () => {
    if (isSpeaking) {
      // Stop any ongoing speech
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
    } else if (currentQuestion?.sentence) {
      speak();
      setIsSpeaking(true);
    }
  };

  // Clean up speech synthesis when component unmounts or question changes
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [currentQuestionIndex]);

  const startRecording = async (questionId: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      setAudioChunks(prev => ({ ...prev, [questionId]: [] }));
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          setAudioChunks(prev => ({
            ...prev,
            [questionId]: [...(prev[questionId] || []), e.data]
          }));
        }
      };

      mediaRecorder.onstop = async () => {
        const chunks = audioChunks[questionId] || [];
        if (chunks.length > 0) {
          const audioBlob = new Blob(chunks, { type: 'audio/wav' });
          handleRecordComplete(questionId, audioBlob);
        }
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(100); // Collect data every 100ms
      setMediaRecorders(prev => ({ ...prev, [questionId]: mediaRecorder }));
      setIsRecording(questionId);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const handleRecordComplete = async (questionId: string, audioBlob: Blob) => {
    try {
      const { audioUrl, score } = await onRecord(questionId, audioBlob);
      // Notify parent component about the answer and score
      onAnswerSelect(questionId, { audioUrl }, score);
    } catch (error) {
      console.error('Error processing recording:', error);
      // Handle error appropriately
    }
  };

  const stopRecording = (questionId: string) => {
    const mediaRecorder = mediaRecorders[questionId];
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      setIsRecording(null);
    }
  };

  useEffect(() => {
    return () => {
      // Clean up media recorders
      Object.values(mediaRecorders).forEach(recorder => {
        if (recorder.state !== 'inactive') {
          recorder.stop();
          recorder.stream.getTracks().forEach(track => track.stop());
        }
      });
    };
  }, [mediaRecorders]);

  if (!currentQuestion) return null;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">Speaking Practice</h3>
        
        {/* Prompt Section */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-medium text-blue-800">Listen to the prompt:</h4>
            <button
              onClick={toggleSpeakText}
              className={`p-2 rounded-full ${
                isSpeaking ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
              } hover:bg-opacity-80 transition-colors`}
              aria-label={isSpeaking ? 'Stop playing' : 'Play question'}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-6 w-6" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                {isSpeaking ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                )}
              </svg>
            </button>
          </div>
          
          <p className="text-lg mb-2 p-4 bg-white rounded border border-gray-200">
            {currentQuestion.sentence}
          </p>
          
          {currentQuestion.hint && (
            <p className="text-sm text-gray-600 mt-2">
              <span className="font-medium">Hint:</span> {currentQuestion.hint}
            </p>
          )}
        </div>

        {/* Recording Controls */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            {isRecording === currentQuestion.id ? (
              <button
                onClick={() => stopRecording(currentQuestion.id)}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                <span className="w-3 h-3 bg-white rounded-full animate-pulse"></span>
                Stop Recording
              </button>
            ) : (
              <button
                onClick={() => startRecording(currentQuestion.id)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                disabled={isRecording !== null && isRecording !== currentQuestion.id}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                Record Your Answer
              </button>
            )}
            
            <span className="text-sm text-gray-500">
              {isRecording === currentQuestion.id ? 'Recording...' : 'Press to record your answer'}
            </span>
          </div>

          {/* Playback */}
          {userAnswer?.audioUrl && (
            <div className="mt-4 flex flex-col items-center">
              <audio
                src={userAnswer.audioUrl}
                controls
                className="w-full max-w-md mb-2"
                ref={audioRef}
              />
              <div className="flex space-x-2 mt-2">
                <button
                  onClick={() => {
                    if (audioRef.current) {
                      audioRef.current.play();
                    }
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Play
                </button>
                <button
                  onClick={() => {
                    if (audioRef.current) {
                      audioRef.current.pause();
                      audioRef.current.currentTime = 0;
                    }
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                >
                  Stop
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {isLastQuestion && userAnswer?.audioUrl && (
        <div className="mt-6 text-center">
          <button
            onClick={onSubmit}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Submit Exam
          </button>
        </div>
      )}

      {/* Hidden audio element for prompt playback */}
      <audio
        ref={audioRef}
        onEnded={() => setIsSpeaking(false)}
        className="hidden"
      />
    </div>
  );
};

export default SpeakingSection;
