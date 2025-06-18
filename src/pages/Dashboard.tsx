import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Trophy, Target, Calendar, TrendingUp, Camera,
  BookOpen, Award, Zap
} from 'lucide-react';
import { useUser } from '../contexts/usercontext';

export default function Dashboard() {
  const { user, setUser } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        setUser({ ...user, avatar: e.target?.result as string });
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const quizProgress = user?.quizProgress || { n5: {}, n4: {}, n3: {}, n2: {}, n1: {} };
  const totalQuizzes = Object.values(quizProgress).reduce((total: number, level: any) => 
    total + Object.values(level).length, 0
  );
  const completedQuizzes = Object.values(quizProgress).reduce((total: number, level: any) => 
    total + Object.values(level).filter((set: any) => set.completed).length, 0
  );
  const averageScore = Object.values(quizProgress).reduce((total: number, level: any) => {
    const scores = Object.values(level).map((set: any) => set.bestScore).filter((score: number) => score > 0);
    return total + (scores.reduce((sum: number, score: number) => sum + score, 0) / (scores.length || 1));
  }, 0) / (Object.keys(quizProgress).length || 1);

  const stats = [
    {
      icon: Trophy,
      label: 'Quizzes Completed',
      value: completedQuizzes,
      total: totalQuizzes,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      gradient: 'from-yellow-400 to-yellow-600'
    },
    {
      icon: Target,
      label: 'Average Score',
      value: Math.round(averageScore || 0),
      total: 100,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      suffix: '%',
      gradient: 'from-blue-400 to-blue-600'
    },
    {
      icon: Zap,
      label: 'Current Streak',
      value: user?.streak || 0,
      total: 30,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      suffix: ' days',
      gradient: 'from-orange-400 to-orange-600'
    },
    {
      icon: Calendar,
      label: 'Days Active',
      value: user?.joinDate ? Math.floor((Date.now() - new Date(user.joinDate).getTime()) / (1000 * 60 * 60 * 24)) : 0,
      total: 365,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      suffix: ' days',
      gradient: 'from-green-400 to-green-600'
    }
  ];

  const levels = ['N5', 'N4', 'N3', 'N2', 'N1'];
  const levelProgress = levels.map(level => {
    const progress = quizProgress[level.toLowerCase()] || {};
    const completed = Object.values(progress).filter((set: any) => set.completed).length;
    const total = 7;
    return { level, completed, total, percentage: Math.round((completed / total) * 100) };
  });

  const joinDate =
    user?.joinDate && !isNaN(new Date(user.joinDate).getTime())
      ? new Date(user.joinDate).toLocaleDateString()
      : new Date().toLocaleDateString();

  console.log('quizProgress:', quizProgress);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        {/* Header */}
        <motion.div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
          <div>
            <motion.h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.name || "User"}!
            </motion.h1>
            <p className="text-gray-600 mt-1">
              Ready to continue your Japanese learning journey?
            </p>
          </div>
          <motion.div className="mt-4 sm:mt-0">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 shadow-lg">
              Current Level: {user?.level || "N5"}
            </span>
          </motion.div>
        </motion.div>

        {/* Profile Section */}
        <motion.div className="bg-white rounded-xl shadow-lg p-6 mb-8 hover:shadow-xl transition-shadow duration-300">
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="relative">
              <motion.div className="w-24 h-24 relative">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-indigo-100 shadow-lg"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center border-4 border-indigo-100 shadow-lg">
                    <User className="w-12 h-12 text-white" />
                  </div>
                )}
                <motion.button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 w-8 h-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center shadow-lg transition-colors duration-300"
                  disabled={isUploading}
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
              <motion.h2 className="text-2xl font-bold text-gray-900">
                {user?.name || "User"}
              </motion.h2>
              <p className="text-gray-600">
                Learning Japanese since {joinDate}
              </p>
              <div className="mt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
                <motion.span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <TrendingUp size={12} className="mr-1" />
                  Active Learner
                </motion.span>
                <motion.span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <Award size={12} className="mr-1" />
                  Quiz Master
                </motion.span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <motion.div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </motion.div>
                </div>
                <div>
                  <div className="flex items-baseline space-x-1">
                    <motion.span className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </motion.span>
                    {stat.suffix && (
                      <span className="text-sm text-gray-500">
                        {stat.suffix}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {stat.label}
                  </p>
                  {stat.total && stat.total > 0 && (
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <motion.div
                          className={`h-2 rounded-full bg-gradient-to-r ${stat.gradient}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((stat.value / stat.total) * 100, 100)}%` }}
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
          className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <div className="flex items-center space-x-3 mb-6">
            <motion.div
              whileHover={{ rotate: 10, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <BookOpen className="w-6 h-6 text-indigo-600" />
            </motion.div>
            <h3 className="text-xl font-bold text-gray-900">
              Level Progress
            </h3>
          </div>
          
          <div className="space-y-4">
            {levelProgress.map((level, index) => (
              <motion.div
                key={level.level}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.9 + index * 0.1 }}
                whileHover={{ scale: 1.02, x: 5 }}
                className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-indigo-50 transition-all duration-300"
              >
                <div className="flex-shrink-0">
                  <motion.span 
                    className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 text-indigo-600 rounded-lg font-bold shadow-lg"
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    {level.level}
                  </motion.span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-900">
                      JLPT {level.level} Level
                    </span>
                    <span className="text-sm text-gray-600">
                      {level.completed}/{level.total} sets completed
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <motion.div
                      className="h-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${level.percentage}%` }}
                      transition={{ duration: 1, delay: 1 + index * 0.2 }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-500">
                      Progress
                    </span>
                    <motion.span 
                      className="text-xs font-medium text-indigo-600"
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
  );
}