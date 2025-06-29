import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, Star, TrendingUp, Calendar, Target } from 'lucide-react';
import { useUser } from '../contexts/usercontext';
import { useApp } from '../contexts/AppContext';

export default function Ranking() {
  const { user } = useUser();
  const { state } = useApp();
  const [sortBy, setSortBy] = useState<'score' | 'date'>('score');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [users, setUsers] = useState<any[]>([]); // Store all users

  const levels = ['N5', 'N4', 'N3', 'N2', 'N1'];

  // Fetch users from backend or local storage
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Attempt to fetch from backend
        const response = await fetch('/api/users');
        if (response.ok) {
          const fetchedUsers = await response.json();
          setUsers(fetchedUsers.filter((u: any) => 
            u.quizProgress && 
            Object.values(u.quizProgress).some((level: any) => 
              Object.values(level).some((set: any) => set.completed)
            )
          ));
        } else {
          throw new Error('Failed to fetch users');
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        // Fallback to local storage
        const localUsers = JSON.parse(localStorage.getItem('users') || '[]');
        setUsers(localUsers.filter((u: any) => 
          u.quizProgress && 
          Object.values(u.quizProgress).some((level: any) => 
            Object.values(level).some((set: any) => set.completed)
          )
        ));
      }
    };
    fetchUsers();
  }, []);

  // Update local storage when current user changes
  useEffect(() => {
    if (user && user.quizProgress) {
      const localUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const updatedUsers = localUsers.filter((u: any) => u.id !== user.id);
      updatedUsers.push({
        id: user.id,
        email: user.email,
        name: user.name || 'Anonymous',
        avatar: user.avatar || '',
        level: user.level || 'N5',
        joinDate: user.joinDate || new Date().toISOString(),
        quizProgress: user.quizProgress || state.quizProgress || { n5: {}, n4: {}, n3: {}, n2: {}, n1: {} },
        streak: user.streak || 0,
      });
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      setUsers(updatedUsers.filter((u: any) => 
        u.quizProgress && 
        Object.values(u.quizProgress).some((level: any) => 
          Object.values(level).some((set: any) => set.completed)
        )
      ));
    }
  }, [user, state.quizProgress]);

  // Calculate average score for a user
  const calculateAverageScore = (progress: any) => {
    const allScores: number[] = [];
    Object.values(progress).forEach((level: any) => {
      const sets = Object.values(level);
      const scores = sets
        .map((set: any) => set.bestScore)
        .filter((score: number) => score > 0);
      allScores.push(...scores);
    });
    return allScores.length > 0
      ? Math.round(allScores.reduce((sum, score) => sum + score, 0) / allScores.length)
      : 0;
  };

  // Generate rankings
  const rankings = users.map(u => ({
    id: u.id,
    name: u.name || 'Anonymous',
    avatar: u.avatar || '',
    level: u.level || 'N5',
    score: calculateAverageScore(u.quizProgress),
    date: u.joinDate || new Date().toISOString(),
  }));

  // Filter and sort rankings
  const filteredRankings = rankings
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
        return <Trophy className="w-6 h-6 text-yellow-500 animate-bounce" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400 animate-pulse" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600 animate-spin-slow" />;
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

  // Japanese Themed Background
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
          @keyframes spin-slow {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .animate-spin-slow { animation: spin-slow 10s linear infinite; }
        `}
      </style>
      <JapaneseBackground />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="max-w-7xl mx-auto px-4 py-8"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-cyan-600 mb-4 animate-wave">
            Global Ninja Ranking Board
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto font-semibold">
            Compete with other Japanese language ninjas worldwide! See where you stand and aim for the top!
          </p>
        </div>

        {/* User Stats */}
        <div className="bg-gradient-to-br from-white/90 to-yellow-200/90 dark:from-gray-800/90 dark:to-yellow-800/90 rounded-3xl shadow-2xl p-8 mb-8 border-4 border-pink-400 dark:border-pink-700">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
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
                <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">{user?.name || 'You'}</h2>
                <p className="text-gray-600 dark:text-gray-300 font-semibold">Current Level: {user?.level || 'N5'}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-6 text-center">
              <div className="bg-gradient-to-r from-pink-200/50 to-yellow-200/50 dark:from-pink-900/50 dark:to-yellow-900/50 rounded-xl p-4 border-2 border-pink-300 dark:border-pink-700">
                <div className="text-3xl font-extrabold text-pink-600 dark:text-pink-400">{userRank || '-'}</div>
                <div className="text-gray-600 dark:text-gray-300 text-sm font-semibold">Global Rank</div>
              </div>
              <div className="bg-gradient-to-r from-cyan-200/50 to-blue-200/50 dark:from-cyan-900/50 dark:to-blue-900/50 rounded-xl p-4 border-2 border-cyan-300 dark:border-cyan-700">
                <div className="text-3xl font-extrabold text-cyan-600 dark:text-cyan-400">{calculateAverageScore(user?.quizProgress || state.quizProgress || { n5: {}, n4: {}, n3: {}, n2: {}, n1: {} })}%</div>
                <div className="text-gray-600 dark:text-gray-300 text-sm font-semibold">Avg Score</div>
              </div>
              <div className="bg-gradient-to-r from-yellow-200/50 to-orange-200/50 dark:from-yellow-900/50 dark:to-orange-900/50 rounded-xl p-4 border-2 border-yellow-300 dark:border-yellow-700">
                <div className="text-3xl font-extrabold text-yellow-600 dark:text-yellow-400">{user?.streak || 0}</div>
                <div className="text-gray-600 dark:text-gray-300 text-sm font-semibold">Day Streak</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gradient-to-br from-white/90 to-cyan-200/90 dark:from-gray-800/90 dark:to-cyan-800/90 rounded-3xl shadow-2xl p-6 mb-8 border-4 border-cyan-400 dark:border-cyan-700">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-extrabold text-gray-700 dark:text-gray-200">
                Filter by Level:
              </label>
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="px-3 py-2 bg-gradient-to-r from-white/50 to-gray-200/50 dark:from-gray-900/50 dark:to-gray-700/50 border-2 border-cyan-300 dark:border-cyan-700 rounded-lg text-gray-900 dark:text-white font-semibold"
              >
                <option value="all">All Levels</option>
                {levels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-4">
              <label className="text-sm font-extrabold text-gray-700 dark:text-gray-200">
                Sort by:
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'score' | 'date')}
                className="px-3 py-2 bg-gradient-to-r from-white/50 to-gray-200/50 dark:from-gray-900/50 dark:to-gray-700/50 border-2 border-cyan-300 dark:border-cyan-700 rounded-lg text-gray-900 dark:text-white font-semibold"
              >
                <option value="score">Highest Score</option>
                <option value="date">Most Recent</option>
              </select>
            </div>
          </div>
        </div>

        {/* Rankings */}
        <div className="bg-gradient-to-br from-white/90 to-purple-200/90 dark:from-gray-800/90 dark:to-purple-800/90 rounded-3xl shadow-2xl overflow-hidden border-4 border-red-400 dark:border-red-700">
          <div className="px-6 py-4 bg-gradient-to-r from-purple-500/50 to-red-500/50 dark:from-purple-900/50 dark:to-red-900/50 border-b-2 border-red-300 dark:border-red-700">
            <h3 className="text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-red-600">
              Top Ninja Performers
              {filterLevel !== 'all' && ` - ${filterLevel} Level`}
            </h3>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredRankings.slice(0, 20).map((entry, index) => {
              const rank = index + 1;
              const isCurrentUser = entry.id === (user?.id || 'you');
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-6 transition-all duration-300 ${
                    isCurrentUser ? 'bg-gradient-to-r from-pink-200/50 to-yellow-200/50 dark:from-pink-900/50 dark:to-yellow-900/50 border-l-4 border-pink-500 dark:border-pink-700' : 'hover:bg-gradient-to-r hover:from-purple-200/30 hover:to-red-200/30 dark:hover:from-purple-900/30 dark:hover:to-red-900/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getRankColor(rank)} flex items-center justify-center shadow-lg`}>
                          {getRankIcon(rank)}
                        </div>
                        <div>
                          <h4 className={`font-extrabold ${
                            isCurrentUser 
                              ? 'text-pink-600 dark:text-pink-400' 
                              : 'text-gray-900 dark:text-white'
                          }`}>
                            {entry.name}
                            {isCurrentUser && (
                              <span className="ml-2 text-sm text-cyan-600 dark:text-cyan-400">
                                (You)
                              </span>
                            )}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300 font-semibold">
                            JLPT {entry.level} Level
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <Target className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                          <span className="text-2xl font-extrabold text-gray-900 dark:text-white">
                            {entry.score}%
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 font-semibold">
                          Quiz Score
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400 animate-pulse" />
                          <span className="text-sm text-gray-600 dark:text-gray-300 font-semibold">
                            {new Date(entry.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Achievement Date
                        </p>
                      </div>
                    </div>
                  </div>
                  {rank <= 3 && (
                    <div className="mt-4 flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-green-500 animate-bounce" />
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
              <Trophy className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4 animate-pulse" />
              <h3 className="text-lg font-extrabold text-gray-900 dark:text-white mb-2">
                No Rankings Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-300 font-semibold">
                Complete some quizzes to see your ranking here!
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}