import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, Star, TrendingUp, Calendar, Target } from 'lucide-react';
import { useUser } from '../contexts/usercontext';
import { useApp } from '../contexts/AppContext';
import { User } from '../types';

// Japanese Themed Background with Wave and Sakura Petal Animations
const JapaneseBackground = () => (
  <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
    <div className="absolute inset-0">
      <svg className="absolute bottom-0 w-full h-24 text-blue-200 dark:text-blue-900" viewBox="0 0 1440 100" preserveAspectRatio="none">
        <path
          d="M0,60 C200,80 300,20 500,40 C700,60 900,20 1100,40 C1300,60 1440,20 1440,60 L1440,100 L0,100 Z"
          fill="currentColor"
          className="animate-wave"
        />
      </svg>
      <svg className="absolute bottom-0 w-full h-32 text-blue-300 dark:text-blue-800" viewBox="0 0 1440 100" preserveAspectRatio="none">
        <path
          d="M0,40 C150,60 350,10 550,30 C750,50 950,10 1150,30 C1350,50 1440,10 1440,40 L1440,100 L0,100 Z"
          fill="currentColor"
          className="animate-wave animation-delay-2s"
        />
      </svg>
    </div>
    <div className="sakura-petal left-[10%] top-[-10%]"></div>
    <div className="sakura-petal left-[30%] top-[-20%] animation-delay-2s"></div>
    <div className="sakura-petal left-[50%] top-[-15%] animation-delay-4s"></div>
    <div className="sakura-petal left-[70%] top-[-25%] animation-delay-6s"></div>
    <div className="sakura-petal left-[90%] top-[-10%] animation-delay-8s"></div>
  </div>
);

interface RankingEntry {
  id: string;
  name: string;
  avatar: string;
  level: string;
  score: number;
  date: string;
}

export default function Ranking() {
  const { user } = useUser();
  const { state } = useApp();
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [sortBy, setSortBy] = useState<'score' | 'date'>('score');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const levels = ['N5', 'N4', 'N3', 'N2', 'N1'];
  const apiBaseUrl = 'http://localhost:5000/api/users'; // Adjust if deployed

  // Calculate average score from quizProgress (fallback if API fails)
  const quizProgress = state.quizProgress || { n5: {}, n4: {}, n3: {}, n2: {}, n1: {} };
  const averageScore = Object.values(quizProgress).reduce((total: number, level: any) => {
    const sets = Object.values(level);
    const scores = sets.map((set: any) => set.bestScore).filter((score: number) => score > 0);
    return total + (scores.reduce((sum: number, score: number) => sum + score, 0) / (scores.length || 1));
  }, 0) / (Object.keys(quizProgress).length || 1);

  // Fetch rankings from backend
  useEffect(() => {
    const fetchRankings = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${apiBaseUrl}/rankings`);
        if (!response.ok) throw new Error('Failed to fetch rankings');
        const data = await response.json();
        // Map backend data to frontend format
        const mappedRankings: RankingEntry[] = data.map((user: User) => ({
          id: user.id,
          name: user.name || user.username,
          avatar: user.avatar || '',
          level: user.level,
          score: Math.round(user.averageScore || 0),
          date: user.joinDate,
        }));
        // Ensure current user is included if logged in
        if (user && !mappedRankings.some(entry => entry.id === user.id)) {
          mappedRankings.push({
            id: user.id,
            name: user.name || 'You',
            avatar: user.avatar || '',
            level: String(user.level || 'N5'),
            score: Math.round(averageScore || 0),
            date: user.joinDate || new Date().toISOString(),
          });
        }
        setRankings(mappedRankings);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRankings();
  }, [user, averageScore, apiBaseUrl]);

  // Filter and sort rankings
  const filteredRankings = rankings
    .filter(entry => filterLevel === 'all' || entry.level === filterLevel)
    .sort((a, b) => {
      if (sortBy === 'score') return b.score - a.score;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-300" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-500" />;
      default:
        return <Star className="w-6 h-6 text-gray-400" />;
    }
  };

  const userRank = filteredRankings.findIndex(entry => entry.id === (user?.id || 'you')) + 1;

  return (
    <div className="min-h-screen bg-blue-50 dark:bg-gray-900 relative overflow-hidden">
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
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="mb-6"
            >
              <Trophy className="w-16 h-16 text-blue-600 dark:text-blue-400 mx-auto animate-wave" />
            </motion.div>
            <motion.h1
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl md:text-5xl font-bold text-blue-900 dark:text-blue-100 mb-4"
            >
              Global Ranking Board
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-lg text-blue-700 dark:text-blue-300 max-w-3xl mx-auto"
            >
              See how you stack up against other Japanese learners worldwide. Compete for the top spots and track your progress!
            </motion.p>
          </div>

          {/* Loading and Error States */}
          {loading && (
            <div className="text-center text-blue-700 dark:text-blue-300 text-lg mb-8">
              Loading rankings...
            </div>
          )}
          {error && (
            <div className="text-center text-red-500 dark:text-red-400 text-lg mb-8">
              Error: {error}
            </div>
          )}

          {/* User Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-8"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center space-x-4 mb-4 md:mb-0">
                <div className="w-16 h-16 bg-blue-500 dark:bg-blue-700 rounded-full flex items-center justify-center">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt="Profile"
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-white">
                      {user?.name?.charAt(0).toUpperCase() || 'Y'}
                    </span>
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {user?.name || 'You'}
                  </h2>
                  <p className="text-blue-600 dark:text-blue-300 text-base">
                    Current Level: {user?.level || 'N5'}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-6 text-center">
                <div className="bg-blue-100 dark:bg-blue-800 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{userRank || '-'}</div>
                  <div className="text-sm text-blue-600 dark:text-blue-300">Global Rank</div>
                </div>
                <div className="bg-blue-100 dark:bg-blue-800 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{Math.round(averageScore || 0)}%</div>
                  <div className="text-sm text-blue-600 dark:text-blue-300">Avg Score</div>
                </div>
                <div className="bg-blue-100 dark:bg-blue-800 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{user?.streak || 0}</div>
                  <div className="text-sm text-blue-600 dark:text-blue-300">Day Streak</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <label className="text-base font-bold text-blue-900 dark:text-blue-100">
                  Filter by Level:
                </label>
                <select
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value)}
                  className="w-full sm:w-auto px-4 py-2 bg-blue-100 dark:bg-blue-800 border-2 border-blue-500 dark:border-blue-600 rounded-lg text-blue-900 dark:text-blue-100 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Filter by JLPT level"
                >
                  <option value="all">All Levels</option>
                  {levels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <label className="text-base font-bold text-blue-900 dark:text-blue-100">
                  Sort by:
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'score' | 'date')}
                  className="w-full sm:w-auto px-4 py-2 bg-blue-100 dark:bg-blue-800 border-2 border-blue-500 dark:border-blue-600 rounded-lg text-blue-900 dark:text-blue-100 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Sort rankings"
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
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-blue-200 dark:border-blue-700">
              <h3 className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                Top Performers {filterLevel !== 'all' && ` - ${filterLevel} Level`}
              </h3>
            </div>
            <div className="divide-y divide-blue-200 dark:divide-blue-700">
              {filteredRankings.slice(0, 20).map((entry, index) => {
                const rank = index + 1;
                const isCurrentUser = entry.id === (user?.id || 'you');
                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, type: "spring", stiffness: 200 }}
                    className={`p-6 transition-colors ${
                      isCurrentUser
                        ? 'bg-blue-100 dark:bg-blue-800 border-l-4 border-blue-500'
                        : 'bg-white dark:bg-gray-800'
                    }`}
                    whileHover={{ scale: 1.02, boxShadow: '0 10px 20px rgba(0,0,0,0.2)' }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-100 dark:bg-blue-800">
                            {getRankIcon(rank)}
                          </div>
                          <div>
                            <h4 className={`text-lg font-semibold ${
                              isCurrentUser 
                                ? 'text-blue-900 dark:text-blue-100'
                                : 'text-blue-700 dark:text-blue-300'
                            }`}>
                              {entry.name}
                              {isCurrentUser && (
                                <span className="ml-2 text-sm text-blue-600 dark:text-blue-400">
                                  (You)
                                </span>
                              )}
                            </h4>
                            <p className="text-sm text-blue-600 dark:text-blue-300">
                              JLPT {entry.level} Level
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            <span className="text-xl font-bold text-blue-900 dark:text-blue-100">
                              {entry.score}%
                            </span>
                          </div>
                          <p className="text-sm text-blue-600 dark:text-blue-300">
                            Quiz Score
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            <span className="text-sm text-blue-600 dark:text-blue-300">
                              {new Date(entry.date).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-xs text-blue-600 dark:text-blue-300">
                            Join Date
                          </p>
                        </div>
                      </div>
                    </div>
                    {rank <= 3 && (
                      <div className="mt-4 flex items-center space-x-2">
                        <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm text-blue-600 dark:text-blue-400 font-semibold">
                          Top {rank} Performer
                        </span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
            {filteredRankings.length === 0 && !loading && (
              <div className="p-12 text-center">
                <Trophy className="w-16 h-16 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-2">
                  No rankings yet
                </h3>
                <p className="text-blue-600 dark:text-blue-300">
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