import { useEffect, useState } from 'react';
import { getScores, Score } from '../api/scores';

export const AdminScores = () => {
  const [scores, setScores] = useState<Score[]>([]);

  useEffect(() => {
    const loadScores = async () => {
      try {
        const data = await getScores();
        setScores(data);
      } catch (error) {
        console.error('Failed to load scores:', error);
      }
    };
    loadScores();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Exam Results</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg overflow-hidden">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="py-3 px-4 text-left">User</th>
              <th className="py-3 px-4 text-center">Score</th>
              <th className="py-3 px-4 text-left">Date</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {scores.map((score) => (
              <tr key={score._id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-4">{score.username}</td>
                <td className="py-3 px-4 text-center">
                  {score.score}/{score.totalQuestions}
                </td>
                <td className="py-3 px-4">
                  {new Date(score.date || '').toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminScores;
