import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Trophy, Target, TrendingUp, Camera,
  BookOpen, Award, Zap, Smile
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
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      icon: Target,
      label: 'Average Score',
      value: averageScore,
      total: 100,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      suffix: '%'
    },
    {
      icon: Zap,
      label: 'Current Streak',
      value: streak,
      total: 30,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      suffix: ' days'
    },
    {
      icon: BookOpen,
      label: 'Days Active',
      value: activeDays,
      total: 365,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      suffix: ' days'
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

  // Japanese Themed Background with Wave Patterns
  const JapaneseBackground = () => (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="wave" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
            <path d="M0 50 Q25 30 50 50 T100 50" fill="none" stroke="#e0f7fa" strokeWidth="1" opacity="0.2"/>
            <path d="M0 60 Q25 40 50 60 T100 60" fill="none" stroke="#e0f7fa" strokeWidth="1" opacity="0.1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#wave)"/>
      </svg>
    </div>
  );

  return (
    <div className="min-h-screen bg-blue-50 dark:bg-gray-900 relative overflow-hidden">
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
          .hover-scale:hover { transform: scale(1.05); transition: transform 0.3s ease; }
        `}
      </style>
      <JapaneseBackground />
      <motion.div
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-4"
          >
            <Smile className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto" />
          </motion.div>
          <h1 className="text-5xl font-bold text-blue-800 dark:text-blue-200 mb-4">
            Welcome back, {user?.name || "User"}!
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Ready to continue your Japanese learning journey?
          </p>
          <motion.div
            className="mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center px-4 py-2 rounded-lg text-md font-semibold bg-white dark:bg-gray-800 text-blue-800 dark:text-blue-200 shadow-md">
              Current Level: {user?.level || "N5"}
            </span>
          </motion.div>
        </div>

        {/* Profile Section */}
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col sm:flex-row items-center space-y-6 sm:space-y-0 sm:space-x-6">
            <div className="relative">
              <motion.div
                className="w-20 h-20"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover border-2 border-blue-300 dark:border-blue-600"
                  />
                ) : (
                  <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center border-2 border-blue-300 dark:border-blue-600">
                    <User className="w-10 h-10 text-white" />
                  </div>
                )}
                <motion.button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-blue-600 transition-colors"
                  disabled={isUploading}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isUploading ? (
                    <motion.div 
                      className="w-3 h-3 border-2 border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  ) : (
                    <Camera size={14} />
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
              <h2 className="text-2xl font-semibold text-blue-800 dark:text-blue-200">
                {user?.name || "User"}
              </h2>
              <p className="text-md text-gray-600 dark:text-gray-400 mt-2">
                Learning Japanese since {joinDate}
              </p>
              <div className="mt-4 flex flex-wrap gap-3 justify-center sm:justify-start">
                <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-semibold bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 shadow-md">
                  <TrendingUp size={12} className="mr-1" />
                  Active Learner
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-semibold bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 shadow-md">
                  <Award size={12} className="mr-1" />
                  Quiz Master
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 ${stat.bgColor} rounded-full flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
                <div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-semibold text-blue-800 dark:text-blue-200">
                      {stat.value}
                    </span>
                    {stat.suffix && (
                      <span className="text-md text-gray-600 dark:text-gray-400">
                        {stat.suffix}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {stat.label}
                  </p>
                  {stat.total && stat.total > 0 && (
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <motion.div
                          className="h-2 bg-blue-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((stat.value / stat.total) * 100, 100)}%` }}
                          transition={{ duration: 0.5 }}
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
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center space-x-2 mb-6">
            <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h3 className="text-2xl font-semibold text-blue-800 dark:text-blue-200">
              Level Progress
            </h3>
          </div>
          <div className="space-y-4">
            {levelProgress.map((level, index) => (
              <motion.div
                key={level.level}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-blue-300 dark:border-blue-600"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {level.level}
                    </div>
                    <div>
                      <h4 className="text-md font-semibold text-blue-800 dark:text-blue-200">
                        JLPT {level.level} Level
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {level.completed}/{level.total} sets completed
                      </p>
                    </div>
                  </div>
                  <div className="text-lg font-semibold text-blue-800 dark:text-blue-200">
                    {level.percentage}%
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <motion.div
                    className="h-2 bg-blue-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${level.percentage}%` }}
                    transition={{ duration: 0.5, delay: index * 0.2 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}