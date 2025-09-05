import React, { useState } from 'react';

interface SectionScore {
  score: number;
  totalQuestions: number;
  percentage: number;
  maxPossible?: number;
  averagePerQuestion?: number;
  rawScore?: number;
}

interface SessionDetails {
  sectionName: string;
  questionsAttempted: number;
  correctAnswers: number;
  incorrectAnswers: number;
  timeSpent?: string;
  accuracy: number;
  pointsEarned: number;
  maxPoints: number;
}

interface ResultsProps {
  scores: {
    vocabulary: SectionScore;
    listening: SectionScore;
    speaking: SectionScore;
  };
  onBackToDashboard: () => void;
}

const Results: React.FC<ResultsProps> = ({ scores, onBackToDashboard }) => {
  const [showDetailedBreakdown, setShowDetailedBreakdown] = useState(false);
  
  const totalScore = scores.vocabulary.score + scores.listening.score + scores.speaking.score;
  const totalQuestions = scores.vocabulary.totalQuestions + 
                        scores.listening.totalQuestions + 
                        scores.speaking.totalQuestions;
  const overallPercentage = Math.round((totalScore / totalQuestions) * 100);

  // Calculate session details for each section
  const getSessionDetails = (): SessionDetails[] => {
    return [
      {
        sectionName: 'Vocabulary',
        questionsAttempted: scores.vocabulary.totalQuestions,
        correctAnswers: scores.vocabulary.score / 4, // 4 points per correct answer
        incorrectAnswers: scores.vocabulary.totalQuestions - (scores.vocabulary.score / 4),
        accuracy: scores.vocabulary.percentage,
        pointsEarned: scores.vocabulary.score,
        maxPoints: scores.vocabulary.totalQuestions * 4,
        timeSpent: '8-12 min' // Estimated based on typical exam flow
      },
      {
        sectionName: 'Listening',
        questionsAttempted: scores.listening.totalQuestions,
        correctAnswers: scores.listening.score / 2, // 2 points per correct answer
        incorrectAnswers: scores.listening.totalQuestions - (scores.listening.score / 2),
        accuracy: scores.listening.percentage,
        pointsEarned: scores.listening.score,
        maxPoints: scores.listening.totalQuestions * 2,
        timeSpent: '5-8 min' // Estimated based on typical exam flow
      },
      {
        sectionName: 'Speaking',
        questionsAttempted: scores.speaking.totalQuestions,
        correctAnswers: Math.round(scores.speaking.score), // Speaking uses 0-5 scale
        incorrectAnswers: 0, // Speaking doesn't have incorrect answers, just scores
        accuracy: scores.speaking.percentage,
        pointsEarned: scores.speaking.score,
        maxPoints: 5,
        timeSpent: '10-15 min' // Estimated based on typical exam flow
      }
    ];
  };

  const sessionDetails = getSessionDetails();

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const renderSectionScore = (
    title: string, 
    score: number, 
    total: number, 
    percentage: number
  ) => (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium">{title}</h3>
        <span className={`font-bold ${getScoreColor(percentage)}`}>
          {percentage}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className={`h-2.5 rounded-full ${getScoreColor(percentage).replace('text-', 'bg-')}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <p className="text-sm text-gray-600 mt-1">
        {score} out of {total} correct
      </p>
    </div>
  );

  const renderDetailedSessionBreakdown = () => (
    <div className="mt-6 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">Detailed Session Breakdown</h3>
        <button
          onClick={() => setShowDetailedBreakdown(!showDetailedBreakdown)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          {showDetailedBreakdown ? 'Hide Details' : 'Show Details'}
        </button>
      </div>
      
      {showDetailedBreakdown && (
        <div className="space-y-4">
          {sessionDetails.map((session, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg border">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-gray-800">{session.sectionName} Session</h4>
                <span className="text-sm text-gray-600">Time: {session.timeSpent}</span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-blue-600">{session.questionsAttempted}</div>
                  <div className="text-gray-600">Questions</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-green-600">{session.correctAnswers}</div>
                  <div className="text-gray-600">Correct</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-red-600">{session.incorrectAnswers}</div>
                  <div className="text-gray-600">Incorrect</div>
                </div>
                <div className="text-center">
                  <div className={`font-semibold ${getScoreColor(session.accuracy)}`}>
                    {Math.round(session.accuracy)}%
                  </div>
                  <div className="text-gray-600">Accuracy</div>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Points Earned:</span>
                  <span className="font-medium">{session.pointsEarned} / {session.maxPoints}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {overallPercentage >= 70 ? 'Congratulations!' : 'Exam Completed'}
        </h2>
        <p className="text-gray-600">
          {overallPercentage >= 70 
            ? 'You have passed the exam!' 
            : 'Keep practicing to improve your score.'}
        </p>
      </div>

      <div className="bg-blue-50 p-6 rounded-lg text-center">
        <div className="text-5xl font-bold text-blue-600 mb-2">
          {overallPercentage}%
        </div>
        <div className="text-gray-600">
          Overall Score
        </div>
        <div className="mt-2 text-sm text-gray-500">
          {totalScore} out of {totalQuestions} questions correct
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium text-gray-700">Section Breakdown</h3>
        {renderSectionScore(
          'Vocabulary', 
          scores.vocabulary.score, 
          scores.vocabulary.totalQuestions,
          scores.vocabulary.percentage
        )}
        {renderSectionScore(
          'Listening', 
          scores.listening.score, 
          scores.listening.totalQuestions,
          scores.listening.percentage
        )}
        {renderSectionScore(
          'Speaking', 
          scores.speaking.score, 
          scores.speaking.totalQuestions,
          scores.speaking.percentage
        )}
      </div>

      {/* Detailed Session Breakdown */}
      {renderDetailedSessionBreakdown()}

      <div className="pt-4">
        <button
          onClick={onBackToDashboard}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default Results;
