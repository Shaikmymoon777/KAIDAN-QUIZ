import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import VocabularySection from '../components/exam/VocabularySection';
import ListeningSection from '../components/exam/ListeningSection';
import SpeakingSection from '../components/exam/SpeakingSection';
import { saveScore } from '../api/scores';
import { 
  UserAnswer, 
  ExamSection, 
  ExamScores,
  SpeakingAnswer,
  ListeningAnswer,
  VocabularyAnswer} from '../types/exam';
import vocabularyQuestions from '../data/vocab/vocabulary.json';
import listeningData from '../data/vocab/listening.json';
import speakingQuestions from '../data/vocab/speaking.json';

const EXAM_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

const Exam: React.FC = () => {
  const { user } = useAuth();
  
  // State
  const [currentSection, setCurrentSection] = useState<ExamSection>('vocabulary');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(EXAM_DURATION);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [, setError] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [sectionsCompleted, setSectionsCompleted] = useState<Record<ExamSection, boolean>>({
    vocabulary: false,
    listening: false,
    speaking: false,
    results: false
  });
  
  // Initialize user answers state
  const [userAnswers, setUserAnswers] = useState<Record<string, UserAnswer>>({});
  const [, setScores] = useState<ExamScores | null>(null);

  // Extract listening questions from the listening data
  const listeningQuestions = listeningData.stories.flatMap(story => 
    story.questions.map(q => ({
      ...q,
      story: story.story,
      title: story.title,
      id: `listening-${story.title}-${q.q}`.replace(/\s+/g, '-')
    }))
  );

  // Get first 10 vocabulary questions
  const limitedVocabQuestions = vocabularyQuestions.vocabulary.slice(0, 10);

  // Get first 5 speaking questions
  const limitedSpeakingQuestions = speakingQuestions.slice(0, 5);

  // Handle answer selection
  const handleAnswerSelect = async (questionId: string, answer: any, isCorrect: boolean | number) => {
    if (isSubmitting || isComplete) return;

    let newAnswer: UserAnswer;

    if (currentSection === 'speaking') {
      // For speaking, isCorrect is actually the score (0-10)
      const score = typeof isCorrect === 'number' ? isCorrect : 0;
      newAnswer = {
        section: 'speaking',
        questionId: questionId.toString(),
        timestamp: new Date().toISOString(),
        audioUrl: answer.audioUrl,
        score,
        isCorrect: score >= 5 // Consider 5/10 as passing
      } as SpeakingAnswer;
    } else if (currentSection === 'listening') {
      newAnswer = {
        answer,
        isCorrect: Boolean(isCorrect),
        section: 'listening',
        questionId: questionId.toString(),
        timestamp: new Date().toISOString()
      } as ListeningAnswer;
    } else {
      // vocabulary
      newAnswer = {
        answer,
        isCorrect: Boolean(isCorrect),
        section: 'vocabulary',
        questionId: questionId.toString(),
        timestamp: new Date().toISOString()
      } as VocabularyAnswer;
    }

    const newAnswers = {
      ...userAnswers,
      [questionId]: newAnswer
    };

    setUserAnswers(newAnswers);

    // Count how many speaking questions have been answered
    const answeredSpeakingQuestions = Object.values(newAnswers).filter(
      answer => answer?.section === 'speaking'
    ).length;

    // Submit after 5 speaking questions are answered
    if (currentSection === 'speaking' && answeredSpeakingQuestions >= 5) {
      setIsSubmitting(true);
      try {
        await submitSpeakingResults();
        setShowSuccessMessage(true);
        setIsComplete(true); // Mark exam as complete
        setCurrentSection('results'); // Navigate to results
      } catch (err) {
        setError('Failed to submit. Please try again.');
        setIsSubmitting(false);
      }
    }
  };

  // Handle speaking recording submission

  const submitSpeakingResults = async () => {
    try {
      const userId = user?.id || 'anonymous';
      const username = user?.email?.split('@')[0] || 'anonymous';
      
      // Get all speaking answers
      const speakingAnswers = Object.entries(userAnswers)
        .filter(([_, answer]) => answer?.section === 'speaking')
        .map(([questionId, answer]) => ({
          questionId,
          audioUrl: (answer as SpeakingAnswer)?.audioUrl,
          score: 0, // This would be set by your evaluation service
          feedback: '' // This would be provided by your evaluation service
        }));

      // In a real app, you would send the audio to your backend for evaluation
      // For now, we'll simulate a perfect score for demonstration
      const score = speakingAnswers.length; // 1 point per question for demo
      const totalQuestions = speakingQuestions.length;
      const percentage = Math.round((score / totalQuestions) * 100);

      const scores: ExamScores = {
        speaking: {
          score,
          totalQuestions,
          percentage
        },
        vocabulary: {
          score: 0,
          totalQuestions: 0,
          percentage: 0
        },
        listening: {
          score: 0,
          totalQuestions: 0,
          percentage: 0
        },
        score: 0,
        total: undefined,
        details: undefined
      };

      const scoreData = {
        userId,
        username,
        scores,
        date: new Date().toISOString(),
        speakingResponses: speakingAnswers // Include the speaking responses
      };

      // Save to backend
      await saveScore(userId, scores, scoreData);
      
      // Mark speaking section as completed
      setSectionsCompleted(prev => ({
        ...prev,
        speaking: true
      }));
      
      // Redirect to sakuralingua.com after a short delay
      setTimeout(() => {
        window.location.href = 'https://sakuralingua.com';
      }, 1500);
      
    } catch (error) {
      console.error('Error submitting speaking results:', error);
      setError('Failed to submit speaking results. Please try again.');
    }
  };

  const handleSectionComplete = async () => {
    setSectionsCompleted(prev => ({
      ...prev,
      [currentSection]: true
    }));

    // Move to next section or complete exam
    if (currentSection === 'vocabulary') {
      setCurrentSection('listening');
      setCurrentQuestionIndex(0);
    } else if (currentSection === 'listening') {
      setCurrentSection('speaking');
      setCurrentQuestionIndex(0);
    } else {
      // Speaking section completed
      await submitSpeakingResults();
      setShowSuccessMessage(true);
      setIsComplete(true);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      const calculatedScores = calculateScores();
      setScores(calculatedScores);
      if (user?.id) {
        await saveScore(
          user.id,
          calculatedScores,
          {
            userId: user.id,
            username: user.email || 'Anonymous',
            scores: calculatedScores,
            date: new Date().toISOString()
          }
        );
      }
      setIsComplete(true);
    } catch (error) {
      setError('Failed to submit exam. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate scores
  const calculateScores = (): ExamScores => {
    // Calculate scores for each section
    const vocabAnswers = Object.values(userAnswers).filter(
      (answer): answer is VocabularyAnswer => answer.section === 'vocabulary'
    );
    const listeningAnswers = Object.values(userAnswers).filter(
      (answer): answer is ListeningAnswer => answer.section === 'listening'
    );
    const speakingAnswers = Object.values(userAnswers).filter(
      (answer): answer is SpeakingAnswer => answer.section === 'speaking'
    );

    // Calculate section scores
    const vocabScore = vocabAnswers.reduce((acc, curr) => acc + (curr.isCorrect ? 1 : 0), 0);
    const listeningScore = listeningAnswers.reduce((acc, curr) => acc + (curr.isCorrect ? 1 : 0), 0);
    const speakingScore = speakingAnswers.reduce((acc, curr) => acc + (curr.score || 0), 0);

    // Calculate totals
    const totalVocab = limitedVocabQuestions.length;
    const totalListening = listeningQuestions.length;
    const totalSpeaking = limitedSpeakingQuestions.length;

    // Calculate percentages (speaking is out of 10 per question)
    const vocabPercentage = totalVocab > 0 ? Math.round((vocabScore / totalVocab) * 100) : 0;
    const listeningPercentage = totalListening > 0 ? Math.round((listeningScore / totalListening) * 100) : 0;
    const speakingPercentage = totalSpeaking > 0 ? Math.round((speakingScore / (totalSpeaking * 10)) * 100) : 0;

    // Calculate overall score (weighted average if needed)
    const totalScore = vocabScore + listeningScore + speakingScore;
    const maxPossibleScore = totalVocab + totalListening + (totalSpeaking * 10);
    const overallPercentage = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;

    return {
      score: overallPercentage,
      total: maxPossibleScore,
      details: {
        score: totalScore,
        total: maxPossibleScore,
        percentage: overallPercentage
      },
      vocabulary: {
        score: vocabScore,
        totalQuestions: totalVocab,
        percentage: vocabPercentage
      },
      listening: {
        score: listeningScore,
        totalQuestions: totalListening,
        percentage: listeningPercentage
      },
      speaking: {
        score: speakingScore,
        totalQuestions: totalSpeaking,
        percentage: speakingPercentage,
        // Include additional speaking metrics if needed
        maxPossible: totalSpeaking * 10,
        averagePerQuestion: totalSpeaking > 0 ? speakingScore / totalSpeaking : 0
      }
    };
  };

  // Format time (MM:SS)
  const formatTime = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Timer effect
  useEffect(() => {
    if (timeRemaining <= 0 || isComplete) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1000) {
          clearInterval(timer);
          handleComplete();
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, isComplete]);

  // Handle recording for speaking section
  const handleRecord = async (_questionId: string, audioBlob: Blob): Promise<{ audioUrl: string; score: number }> => {
    try {
      // In a real app, you would upload the audio to a server here
      // For now, we'll simulate a response
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Simulate a score (0-10) - in a real app, this would come from a speech recognition service
      const score = Math.floor(Math.random() * 11); // Random score between 0-10
      
      return { audioUrl, score };
    } catch (error) {
      console.error('Error processing recording:', error);
      throw error;
    }
  };

  // Render current section
  const renderCurrentSection = () => {
    switch (currentSection) {
      case 'vocabulary':
        const currentVocabQuestion = limitedVocabQuestions[currentQuestionIndex];
        const vocabAnswer = userAnswers[currentVocabQuestion?.id] as { answer?: string | number } | undefined;
        
        return (
          <VocabularySection
            questions={limitedVocabQuestions}
            currentQuestionIndex={currentQuestionIndex}
            selectedAnswer={vocabAnswer?.answer?.toString() ?? null}
            onAnswerSelect={(questionId, answer, correctAnswer) => {
              handleAnswerSelect(
                questionId.toString(), 
                answer.toString(), 
                answer.toString() === correctAnswer
              );
            }}
          />
        );
      
      case 'listening':
        const currentListeningQuestion = listeningQuestions[currentQuestionIndex];
        const listeningAnswer = userAnswers[currentListeningQuestion?.id] as { answer?: number } | undefined;
        
        return (
          <ListeningSection
            questions={listeningQuestions}
            currentQuestionIndex={currentQuestionIndex}
            selectedAnswer={listeningAnswer?.answer ?? null}
            onAnswerSelect={(questionId, answerIndex, isCorrect) => {
              handleAnswerSelect(
                questionId.toString(),
                answerIndex,
                isCorrect
              );
            }}
            story={{
              title: listeningQuestions[currentQuestionIndex]?.title || '',
              content: listeningQuestions[currentQuestionIndex]?.story || ''
            }}
          />
        );
      
      case 'speaking':
        return (
          <SpeakingSection
            questions={limitedSpeakingQuestions}
            currentQuestionIndex={currentQuestionIndex}
            onRecord={handleRecord}
            userAnswers={userAnswers}
            onAnswerSelect={handleAnswerSelect}
          />
        );
      
      default:
        return null;
    }
  };

  // Render navigation buttons
  const renderNavigation = () => {
    if (isComplete) return null; // Don't show navigation if exam is complete

    const currentQuestions = {
      vocabulary: limitedVocabQuestions,
      listening: listeningQuestions,
      speaking: limitedSpeakingQuestions,
      results: []
    }[currentSection] || [];

    const isLastQuestion = currentQuestionIndex === Math.max(0, currentQuestions.length - 1);

    return (
      <div className="flex justify-between mt-8">
        <button
          onClick={() => {
            if (currentQuestionIndex > 0) {
              setCurrentQuestionIndex(prev => prev - 1);
            } else if (currentSection === 'listening') {
              setCurrentSection('vocabulary');
              setCurrentQuestionIndex(limitedVocabQuestions.length - 1);
            } else if (currentSection === 'speaking') {
              setCurrentSection('listening');
              setCurrentQuestionIndex(listeningQuestions.length - 1);
            }
          }}
          disabled={currentQuestionIndex === 0 && currentSection === 'vocabulary' || isSubmitting}
          className="px-4 py-2 bg-gray-300 rounded-lg disabled:opacity-50"
        >
          Previous
        </button>
        
        <button
          onClick={async () => {
            if (isLastQuestion) {
              if (currentSection === 'speaking') {
                setIsSubmitting(true);
                try {
                  await submitSpeakingResults();
                  setShowSuccessMessage(true);
                  setIsComplete(true);
                } catch (err) {
                  setError('Failed to submit. Please try again.');
                  setIsSubmitting(false);
                }
              } else {
                handleSectionComplete();
              }
            } else {
              setCurrentQuestionIndex(prev => prev + 1);
            }
          }}
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
        >
          {isLastQuestion ? 'Submit Exam' : 'Next'}
        </button>
      </div>
    );
  };

  if (isComplete) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold text-green-600 mb-4">
            Exam Submitted Successfully!
          </h2>
          <p className="text-gray-600">
            Thank you for completing the exam. You will be redirected shortly...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {(['vocabulary', 'listening', 'speaking', 'results'] as const).map((section) => (
            <div key={section} className="text-center">
              <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-1 ${
                (sectionsCompleted[section] || currentSection === section)
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {section === 'vocabulary' ? 'V' : section === 'listening' ? 'L' : section === 'speaking' ? 'S' : 'R'}
              </div>
              <span className="text-sm capitalize">{section}</span>
            </div>
          ))}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
            style={{
              width: `${(Object.values(sectionsCompleted).filter(Boolean).length / 4) * 100}%`
            }}
          ></div>
        </div>
      </div>

      {/* Section Title */}
      <h2 className="text-2xl font-bold mb-6 capitalize">
        {currentSection} Section
        {['listening', 'speaking', 'results'].includes(currentSection) && (
          <span className="ml-2 text-sm text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
            {sectionsCompleted.vocabulary ? '✓' : ''}
            {currentSection === 'speaking' && sectionsCompleted.listening ? '✓' : ''}
            {currentSection === 'results' && sectionsCompleted.speaking ? '✓' : ''}
          </span>
        )}
      </h2>

      {/* Success Message */}
      {showSuccessMessage && currentSection === 'speaking' && (
        <p className="mb-6 text-green-600 font-semibold">
          Successfully completed, thank you!
        </p>
      )}

      {/* Current Section Content */}
      <div className="mb-8">
        {renderCurrentSection()}
      </div>

      {/* Navigation */}
      {renderNavigation()}

      {/* Timer */}
      <div className="fixed bottom-4 right-4 bg-white p-3 rounded-lg shadow-lg">
        <div className="text-center">
          <div className="text-sm text-gray-600">Time Remaining</div>
          <div className="text-2xl font-mono">{formatTime(timeRemaining)}</div>
        </div>
      </div>
    </div>
  );
};

export default Exam;