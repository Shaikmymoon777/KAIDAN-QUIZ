import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, Star, TrendingUp, Calendar, Target } from 'lucide-react';
import { useUser } from '../contexts/usercontext';
import { useApp } from '../contexts/AppContext'; // Add this import

export default function Ranking() {
  const { user } = useUser();
  const { state } = useApp(); // Get global state

  // Use state.quizProgress instead of user?.quizProgress
  const quizProgress = state.quizProgress || { n5: {}, n4: {}, n3: {}, n2: {}, n1: {} };

  const [sortBy, setSortBy] = useState<'score' | 'date'>('score');
  const [filterLevel, setFilterLevel] = useState<string>('all');

  const levels = ['N5', 'N4', 'N3', 'N2', 'N1'];

  // Simulate rankings using current user and some demo users
  const averageScore = Object.values(quizProgress).reduce((total: number, level: any) => {
    const sets = Object.values(level);
    const scores = sets.map((set: any) => set.bestScore).filter((score: number) => score > 0);
    return total + (scores.reduce((sum: number, score: number) => sum + score, 0) / (scores.length || 1));
  }, 0) / (Object.keys(quizProgress).length || 1);

  const demoRankings = [
    {
      id: user?.id || 'you',
      name: user?.name || 'You',
      avatar: user?.avatar || '',
      level: user?.level || 'N5',
      score: Math.round(averageScore || 0),
      date: user?.joinDate || new Date().toISOString(),
    },
    { id: '2', name: 'Alice', avatar: '', level: 'N4', score: 85, date: '2024-06-01' },
    { id: '3', name: 'Bob', avatar: '', level: 'N3', score: 72, date: '2024-05-15' },
    { id: '4', name: 'Charlie', avatar: '', level: 'N5', score: 65, date: '2024-04-20' },
  ];

  const filteredRankings = demoRankings
    .filter(entry => filterLevel === 'all' || entry.level === filterLevel)
    .sort((a, b) => {
      if (sortBy === 'score') {
        return b.score - a.score;
      } else {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <Star className="w-6 h-6 text-gray-300 dark:text-gray-600" />;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-yellow-400 to-yellow-600';
      case 2:
        return 'from-gray-300 to-gray-500';
      case 3:
        return 'from-amber-400 to-amber-600';
      default:
        return 'from-gray-200 to-gray-400';
    }
  };

  const userRank = filteredRankings.findIndex(entry => entry.id === (user?.id || 'you')) + 1;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Global Ranking Board
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See how you stack up against other Japanese learners worldwide. 
            Compete for the top spots and track your progress!
          </p>
        </div>

        {/* User Stats */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg p-8 mb-8 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt="Profile"
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold">
                    {user?.name?.charAt(0).toUpperCase() || 'Y'}
                  </span>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{user?.name || 'You'}</h2>
                <p className="text-white/80">Current Level: {user?.level || 'N5'}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold">{userRank || '-'}</div>
                <div className="text-white/80 text-sm">Global Rank</div>
              </div>
              <div>
                <div className="text-3xl font-bold">{Math.round(averageScore || 0)}%</div>
                <div className="text-white/80 text-sm">Avg Score</div>
              </div>
              <div>
                <div className="text-3xl font-bold">{user?.streak || 0}</div>
                <div className="text-white/80 text-sm">Day Streak</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">
                Filter by Level:
              </label>
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900"
              >
                <option value="all">All Levels</option>
                {levels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">
                Sort by:
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'score' | 'date')}
                className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900"
              >
                <option value="score">Highest Score</option>
                <option value="date">Most Recent</option>
              </select>
            </div>
          </div>
        </div>

        {/* Rankings */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Top Performers
              {filterLevel !== 'all' && ` - ${filterLevel} Level`}
            </h3>
          </div>
          
          <div className="divide-y divide-gray-200">
            {filteredRankings.slice(0, 20).map((entry, index) => {
              const rank = index + 1;
              const isCurrentUser = entry.id === (user?.id || 'you');
              
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-6 hover:bg-gray-50 transition-colors ${
                    isCurrentUser ? 'bg-indigo-50 border-l-4 border-indigo-500' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Rank */}
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getRankColor(rank)} flex items-center justify-center text-white font-bold`}>
                          {rank <= 3 ? getRankIcon(rank) : rank}
                        </div>
                        <div>
                          <h4 className={`font-semibold ${
                            isCurrentUser 
                              ? 'text-indigo-900' 
                              : 'text-gray-900'
                          }`}>
                            {entry.name}
                            {isCurrentUser && (
                              <span className="ml-2 text-sm text-indigo-600">
                                (You)
                              </span>
                            )}
                          </h4>
                          <p className="text-sm text-gray-600">
                            JLPT {entry.level} Level
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <Target className="w-4 h-4 text-indigo-600" />
                          <span className="text-2xl font-bold text-gray-900">
                            {entry.score}%
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Quiz Score
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {new Date(entry.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          Achievement Date
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {rank <= 3 && (
                    <div className="mt-4 flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-green-600 font-medium">
                        Top {rank} Performer
                      </span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
          
          {filteredRankings.length === 0 && (
            <div className="p-12 text-center">
              <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No rankings yet
              </h3>
              <p className="text-gray-600">
                Complete some quizzes to see your ranking here!
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}