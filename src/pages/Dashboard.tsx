import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Trophy, Target, Calendar, TrendingUp, Camera,
  BookOpen, Award, Zap,
  Smile
} from 'lucide-react';
import { useUser } from '../contexts/usercontext';
import { useApp } from '../contexts/AppContext';
import axios from 'axios';

export default function Dashboard() {
  const { user, setUser } = useUser();
  const { state, dispatch } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [streak, setStreak] = useState(0);
  const [activeDays, setActiveDays] = useState(0);

  useEffect(() => {
    // Fetch user stats
    const fetchUserStats = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/user-stats/${user?.id}`, {
          headers: { Authorization: `Bearer ${user?.token || ''}` },
        });
        setStreak(response.data.streak);
        setActiveDays(response.data.activeDays);
      } catch (err) {
        console.error('Error fetching user stats:', err);
        setStreak(0);
        setActiveDays(0);
      }
    };

    // Fetch quiz progress
    const fetchQuizProgress = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/quiz-progress/${user?.id}`);
        dispatch({ type: 'UPDATE_QUIZ_PROGRESS', payload: response.data });
      } catch (err) {
        console.error('Error fetching quiz progress:', err);
      }
    };

    if (user?.id) {
      fetchUserStats();
      fetchQuizProgress();
    }
  }, [user, dispatch]);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0]) {
      const file = files[0];
      setIsUploading(true);
      const reader = new FileReader();
      reader.onload = async (e) => {
        const avatar = e.target?.result;
        try {
          await axios.post(`http://localhost:5000/api/user/${user.id}/avatar`, { avatar }, {
            headers: { Authorization: `Bearer ${user?.token || ''}` },
          });
          setUser({ ...user, avatar });
        } catch (err) {
          console.error('Error updating avatar:', err);
        }
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const quizProgress = state.quizProgress || { n5: {}, n4: {}, n3: {}, n2: {}, n1: {} };

  const totalQuizzes = Object.values(quizProgress).reduce(
    (total, level) => total + Object.values(level).length, 0
  );

  const completedQuizzes = Object.values(quizProgress).reduce(
    (total, level) => total + Object.values(level).filter((set) => set.completed).length, 0
  );

  const allScores = Object.values(quizProgress).flatMap(
    (level) => Object.values(level).map((set) => set.bestScore).filter((score) => score > 0)
  );
  const averageScore = allScores.length > 0
    ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
    : 0;

  const stats = [
    {
      icon: Trophy,
      label: 'Quizzes Completed',
      value: completedQuizzes,
      total: totalQuizzes,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-200/50',
      gradient: 'from-yellow-400 to-yellow-600'
    },
    {
      icon: Target,
      label: 'Average Score',
      value: averageScore,
      total: 100,
      color: 'text-blue-400',
      bgColor: 'bg-blue-200/50',
      suffix: '%',
      gradient: 'from-blue-400 to-blue-600'
    },
    {
      icon: Zap,
      label: 'Current Streak',
      value: streak,
      total: 30,
      color: 'text-orange-400',
      bgColor: 'bg-orange-200/50',
      suffix: ' days',
      gradient: 'from-orange-400 to-orange-600'
    },
    {
      icon: Calendar,
      label: 'Days Active',
      value: activeDays,
      total: 365,
      color: 'text-green-400',
      bgColor: 'bg-green-200/50',
      suffix: ' days',
      gradient: 'from-green-400 to-green-600'
    }
  ];

  const levels = ['N5', 'N4', 'N3', 'N2', 'N1'];
  const levelProgress = levels.map(level => {
    const progress = quizProgress[level.toLowerCase()] || {};
    const completed = Object.values(progress).filter((set) => set.completed).length;
    const total = 7;
    return { level, completed, total, percentage: Math.round((completed / total) * 100) };
  });

  const joinDate =
    user?.joinDate && !isNaN(new Date(user.joinDate).getTime())
      ? new Date(user.joinDate).toLocaleDateString()
      : new Date().toLocaleDateString();

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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12">
            <div>
              <motion.h1
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-cyan-600 mb-4 flex items-center gap-2 animate-wave"
              >
                <Smile className="w-12 h-12 text-pink-600 dark:text-pink-400" />
                Welcome back, {user?.name || "User"}!
              </motion.h1>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-xl text-gray-100 dark:text-gray-200"
              >
                Ready to continue your Japanese learning journey?
              </motion.p>
            </div>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-4 sm:mt-0"
            >
              <span className="inline-flex items-center px-6 py-3 rounded-full text-lg font-bold bg-gradient-to-r from-pink-500 to-cyan-500 text-white shadow-2xl">
                Current Level: {user?.level || "N5"}
              </span>
            </motion.div>
          </div>

          {/* Profile Section */}
          <motion.div
            className="bg-gradient-to-br from-white/90 to-yellow-200/90 dark:bg-gradient-to-br dark:from-gray-800/90 dark:to-yellow-800/90 rounded-3xl shadow-2xl p-8 mb-12 border-4 border-pink-400 dark:border-pink-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <div className="flex flex-col sm:flex-row items-center space-y-6 sm:space-y-0 sm:space-x-6">
              <div className="relative">
                <motion.div className="w-24 h-24" whileHover={{ scale: 1.1, rotate: 5 }}>
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-4 border-pink-400 dark:border-pink-700"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gradient-to-r from-pink-500 to-cyan-500 rounded-full flex items-center justify-center border-4 border-pink-400 dark:border-pink-700">
                      <User className="w-12 h-12 text-white" />
                    </div>
                  )}
                  <motion.button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-pink-500 to-cyan-500 hover:from-pink-600 hover:to-cyan-600 text-white rounded-full flex items-center justify-center shadow-2xl transition-colors duration-300"
                    disabled={isUploading}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isUploading ? (
                      <motion.div 
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                    ) : (
                      <Camera size={16} />
                    )}
                  </motion.button>
                </motion.div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <motion.h2
                  className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-cyan-600"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.9 }}
                >
                  {user?.name || "User"}
                </motion.h2>
                <p className="text-lg text-gray-800 dark:text-gray-100 mt-2">
                  Learning Japanese since {joinDate}
                </p>
                <div className="mt-4 flex flex-wrap gap-3 justify-center sm:justify-start">
                  <motion.span
                    className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-2xl"
                    whileHover={{ scale: 1.1, rotate: 3 }}
                  >
                    <TrendingUp size={14} className="mr-2" />
                    Active Learner
                  </motion.span>
                  <motion.span
                    className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-blue-400 to-blue-600 text-white shadow-2xl"
                    whileHover={{ scale: 1.1, rotate: 3 }}
                  >
                    <Award size={14} className="mr-2" />
                    Quiz Master
                  </motion.span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  className="bg-gradient-to-br from-white/90 to-yellow-200/90 dark:bg-gradient-to-br dark:from-gray-800/90 dark:to-yellow-800/90 rounded-3xl shadow-2xl p-6 border-4 border-pink-400 dark:border-pink-700"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.7 + index * 0.1 }}
                  whileHover={{ scale: 1.1, rotate: 4, boxShadow: "0 15px 30px rgba(0,0,0,0.3)" }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <motion.div
                      className={`w-12 h-12 ${stat.bgColor} rounded-full flex items-center justify-center`}
                      whileHover={{ scale: 1.15, rotate: 8 }}
                    >
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </motion.div>
                  </div>
                  <div>
                    <div className="flex items-baseline space-x-2">
                      <motion.span
                        className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-cyan-600"
                        whileHover={{ scale: 1.1 }}
                      >
                        {stat.value}
                      </motion.span>
                      {stat.suffix && (
                        <span className="text-lg text-gray-800 dark:text-gray-100">
                          {stat.suffix}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-800 dark:text-gray-100 mt-2">
                      {stat.label}
                    </p>
                    {stat.total && stat.total > 0 && (
                      <div className="mt-4">
                        <div className="w-full bg-white/30 dark:bg-gray-700/30 rounded-full h-3">
                          <motion.div
                            className={`h-3 bg-gradient-to-r ${stat.gradient} rounded-full`}
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((stat.value / stat.total) * 100, 100)}%` }}
                            transition={{ duration: 1 }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Level Progress */}
          <motion.div 
            className="bg-gradient-to-br from-white/90 to-yellow-200/90 dark:bg-gradient-to-br dark:from-gray-800/90 dark:to-yellow-800/90 rounded-3xl shadow-2xl p-8 border-4 border-pink-400 dark:border-pink-700"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <div className="flex items-center space-x-3 mb-8">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 10 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <BookOpen className="w-8 h-8 text-pink-600 dark:text-pink-400 animate-pulse" />
              </motion.div>
              <h3 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-cyan-600">
                Level Progress
              </h3>
            </div>
            
            <div className="space-y-6">
              {levelProgress.map((level, index) => (
                <motion.div
                  key={level.level}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.9 + index * 0.1 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                  className="flex items-center space-x-4 p-6 bg-gradient-to-r from-pink-300 to-yellow-300 dark:from-pink-700 dark:to-yellow-700 rounded-3xl border-2 border-pink-400 dark:border-pink-600"
                >
                  <div className="flex-shrink-0">
                    <motion.span 
                      className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-pink-500 to-cyan-500 text-white rounded-full font-bold shadow-2xl"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      {level.level}
                    </motion.span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-gray-900 dark:text-white text-lg">
                        JLPT {level.level} Level
                      </span>
                      <span className="text-sm text-gray-800 dark:text-gray-100">
                        {level.completed}/{level.total} sets completed
                      </span>
                    </div>
                    <div className="w-full bg-white/30 dark:bg-gray-700/30 rounded-full h-3">
                      <motion.div
                        className="h-3 bg-gradient-to-r from-pink-500 to-cyan-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${level.percentage}%` }}
                        transition={{ duration: 1, delay: 1 + index * 0.2 }}
                      />
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-gray-800 dark:text-gray-100">
                        Progress
                      </span>
                      <motion.span 
                        className="text-sm font-bold text-yellow-400 dark:text-yellow-300"
                        whileHover={{ scale: 1.1 }}
                      >
                        {level.percentage}%
                      </motion.span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}