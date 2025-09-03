import React from 'react';

interface SectionScore {
  score: number;
  totalQuestions: number;
  percentage: number;
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
  const totalScore = scores.vocabulary.score + scores.listening.score + scores.speaking.score;
  const totalQuestions = scores.vocabulary.totalQuestions + 
                        scores.listening.totalQuestions + 
                        scores.speaking.totalQuestions;
  const overallPercentage = Math.round((totalScore / totalQuestions) * 100);

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
