import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, Star, TrendingUp, Calendar, Target } from 'lucide-react';
import { useUser } from '../contexts/usercontext';
import { useApp } from '../contexts/AppContext';

// Japanese Themed Background with Sakura Petal Animations
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

export default function Ranking() {
  const { user } = useUser();
  const { state } = useApp();

  const quizProgress = state.quizProgress || { n5: {}, n4: {}, n3: {}, n2: {}, n1: {} };
  const [sortBy, setSortBy] = useState<'score' | 'date'>('score');
  const [filterLevel, setFilterLevel] = useState<string>('all');

  const levels = ['N5', 'N4', 'N3', 'N2', 'N1'];

  // Calculate average score
  const averageScore = Object.values(quizProgress).reduce((total: number, level: any) => {
    const sets = Object.values(level);
    const scores = sets.map((set: any) => set.bestScore).filter((score: number) => score > 0);
    return total + (scores.reduce((sum: number, score: number) => sum + score, 0) / (scores.length || 1));
  }, 0) / (Object.keys(quizProgress).length || 1);

  // Demo rankings
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
      if (sortBy === 'score') return b.score - a.score;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-400 animate-pulse" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-300 animate-pulse" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-500 animate-pulse" />;
      default:
        return <Star className="w-6 h-6 text-gray-400 animate-pulse" />;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-br from-yellow-400 to-yellow-600';
      case 2:
        return 'bg-gradient-to-br from-gray-300 to-gray-500';
      case 3:
        return 'bg-gradient-to-br from-amber-400 to-amber-600';
      default:
        return 'bg-gradient-to-br from-gray-200 to-gray-400';
    }
  };

  const userRank = filteredRankings.findIndex(entry => entry.id === (user?.id || 'you')) + 1;

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
        `}
      </style>
      <JapaneseBackground />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          {/* Header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0.8, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="mb-6"
            >
              <Trophy className="w-16 h-16 text-yellow-400 mx-auto animate-wave" />
            </motion.div>
            <motion.h1
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-cyan-600 mb-4"
            >
              Global Ranking Board
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl text-gray-100 dark:text-gray-200 max-w-3xl mx-auto"
            >
              See how you stack up against other Japanese learners worldwide. Compete for the top spots and track your progress!
            </motion.p>
          </div>

          {/* User Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="bg-gradient-to-br from-white/90 to-yellow-200/90 dark:bg-gradient-to-br dark:from-gray-800/90 dark:to-yellow-800/90 rounded-3xl shadow-2xl p-8 mb-8 border-4 border-pink-400 dark:border-pink-700"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center space-x-4 mb-4 md:mb-0">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-cyan-500 rounded-full flex items-center justify-center">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt="Profile"
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-extrabold text-white">
                      {user?.name?.charAt(0).toUpperCase() || 'Y'}
                    </span>
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-cyan-600">
                    {user?.name || 'You'}
                  </h2>
                  <p className="text-gray-100 dark:text-gray-200 text-base">
                    Current Level: {user?.level || 'N5'}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-6 text-center">
                <div className="bg-gradient-to-r from-gray-200/50 to-gray-300/50 dark:from-gray-700/50 dark:to-gray-600/50 rounded-2xl p-4">
                  <div className="text-2xl font-extrabold text-pink-500 dark:text-pink-300">{userRank || '-'}</div>
                  <div className="text-sm text-gray-100 dark:text-gray-200">Global Rank</div>
                </div>
                <div className="bg-gradient-to-r from-gray-200/50 to-gray-300/50 dark:from-gray-700/50 dark:to-gray-600/50 rounded-2xl p-4">
                  <div className="text-2xl font-extrabold text-cyan-500 dark:text-cyan-300">{Math.round(averageScore || 0)}%</div>
                  <div className="text-sm text-gray-100 dark:text-gray-200">Avg Score</div>
                </div>
                <div className="bg-gradient-to-r from-gray-200/50 to-gray-300/50 dark:from-gray-700/50 dark:to-gray-600/50 rounded-2xl p-4">
                  <div className="text-2xl font-extrabold text-green-500 dark:text-green-300">{user?.streak || 0}</div>
                  <div className="text-sm text-gray-100 dark:text-gray-200">Day Streak</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="bg-gradient-to-br from-white/90 to-yellow-200/90 dark:bg-gradient-to-br dark:from-gray-800/90 dark:to-yellow-800/90 rounded-3xl shadow-2xl p-6 mb-8 border-4 border-pink-400 dark:border-pink-700"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <label className="text-base font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-cyan-600">
                  Filter by Level:
                </label>
                <select
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value)}
                  className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-pink-300 to-yellow-300 dark:from-pink-700 dark:to-yellow-700 border-2 border-pink-400 dark:border-pink-600 rounded-full text-gray-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="all">All Levels</option>
                  {levels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <label className="text-base font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-cyan-600">
                  Sort by:
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'score' | 'date')}
                  className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-pink-300 to-yellow-300 dark:from-pink-700 dark:to-yellow-700 border-2 border-pink-400 dark:border-pink-600 rounded-full text-gray-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="score">Highest Score</option>
                  <option value="date">Most Recent</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Rankings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="bg-gradient-to-br from-white/90 to-yellow-200/90 dark:bg-gradient-to-br dark:from-gray-800/90 dark:to-yellow-800/90 rounded-3xl shadow-2xl overflow-hidden border-4 border-pink-400 dark:border-pink-700"
          >
            <div className="px-6 py-4 bg-gradient-to-r from-gray-200/50 to-gray-300/50 dark:from-gray-700/50 dark:to-gray-600/50 border-b border-pink-400 dark:border-pink-700">
              <h3 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-cyan-600">
                Top Performers {filterLevel !== 'all' && ` - ${filterLevel} Level`}
              </h3>
            </div>
            <div className="divide-y divide-pink-200 dark:divide-pink-700">
              {filteredRankings.slice(0, 20).map((entry, index) => {
                const rank = index + 1;
                const isCurrentUser = entry.id === (user?.id || 'you');
                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, type: "spring", stiffness: 200 }}
                    className={`p-6 hover:bg-gradient-to-br hover:from-pink-200/90 hover:to-yellow-100/90 dark:hover:bg-gradient-to-br dark:hover:from-gray-700/90 dark:hover:to-yellow-700/90 transition-colors ${
                      isCurrentUser
                        ? 'bg-gradient-to-br from-pink-300/90 to-yellow-300/90 dark:bg-gradient-to-br dark:from-pink-800/90 dark:to-yellow-800/90 border-l-4 border-pink-600 dark:border-pink-500'
                        : 'bg-gradient-to-br from-white to-yellow-100 dark:from-gray-900 dark:to-yellow-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getRankColor(rank)}`}>
                            {getRankIcon(rank)}
                          </div>
                          <div>
                            <h4 className={`text-lg font-extrabold ${
                              isCurrentUser 
                                ? 'text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-cyan-600'
                                : 'text-gray-900 dark:text-yellow-200'
                            }`}>
                              {entry.name}
                              {isCurrentUser && (
                                <span className="ml-2 text-sm text-yellow-400 dark:text-yellow-300">
                                  (You)
                                </span>
                              )}
                            </h4>
                            <p className="text-sm text-gray-700 dark:text-yellow-200">
                              JLPT {entry.level} Level
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Target className="w-5 h-5 text-pink-600 dark:text-pink-400 animate-pulse" />
                            <span className="text-xl font-extrabold text-yellow-600 dark:text-yellow-300">
                              {entry.score}%
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-yellow-200">
                            Quiz Score
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Calendar className="w-5 h-5 text-gray-700 dark:text-yellow-200 animate-pulse" />
                            <span className="text-sm text-gray-700 dark:text-yellow-200">
                              {new Date(entry.date).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-xs text-gray-700 dark:text-yellow-200">
                            Achievement Date
                          </p>
                        </div>
                      </div>
                    </div>
                    {rank <= 3 && (
                      <div className="mt-4 flex items-center space-x-2">
                        <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400 animate-pulse" />
                        <span className="text-sm text-green-600 dark:text-green-400 font-extrabold">
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
                <Trophy className="w-16 h-16 text-gray-100 dark:text-gray-200 mx-auto mb-4 animate-pulse" />
                <h3 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-cyan-600 mb-2">
                  No rankings yet
                </h3>
                <p className="text-gray-100 dark:text-gray-200">
                  Complete some quizzes to see your ranking here!
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}