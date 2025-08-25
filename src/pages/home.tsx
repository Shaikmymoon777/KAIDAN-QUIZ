import { motion } from 'framer-motion';
import { BookOpen, Star, Target, Smile, Play, CheckCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

declare module 'react' {
  interface StyleHTMLAttributes<T> extends React.HTMLAttributes<T> {
    jsx?: boolean;
    global?: boolean;
  }
}

// Japanese Themed Background with Wave Patterns
const JapaneseBackground = () => (
  <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
    <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="wave" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
          <path d="M0 50 Q25 30 50 50 T100 50" fill="none" stroke="#e0f7fa" strokeWidth="1" opacity="0.2" />
          <path d="M0 60 Q25 40 50 60 T100 60" fill="none" stroke="#e0f7fa" strokeWidth="1" opacity="0.1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#wave)" />
    </svg>
  </div>
);

// Cherry Blossom Animation Component
const CherryBlossoms = () => {
  const blossomTypes = [
    { emoji: '🌸', size: 1.0, speed: 1.0, rotation: 360 },
    { emoji: '🌸', size: 0.8, speed: 1.2, rotation: -360 },
    { emoji: '🌸', size: 1.2, speed: 0.8, rotation: 180 },
  ];

  return (
    <div className="cherry-blossom-container absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(25)].map((_, i) => {
        const type = blossomTypes[Math.floor(Math.random() * blossomTypes.length)];
        const startX = Math.random() * 100;
        const endX = startX + (Math.random() * 20 - 10);
        const delay = Math.random() * 10;
        const duration = 15 + Math.random() * 20;
        const size = 8 + Math.random() * 12;
        const opacity = 0.2 + Math.random() * 0.6;

        return (
          <div
            key={i}
            className="cherry-blossom"
            style={{
              left: `${startX}%`,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
              fontSize: `${size}px`,
              opacity: opacity,
              ['--end-x' as string]: `${endX}%`,
              ['--rotation' as string]: `${type.rotation}deg`,
            }}
          >
            {type.emoji}
          </div>
        );
      })}
      <style>{`
        .cherry-blossom {
          position: absolute;
          top: -50px;
          z-index: 0;
          animation: falling linear infinite;
          pointer-events: none;
          will-change: transform;
          filter: drop-shadow(0 0 2px rgba(255, 192, 203, 0.5));
        }

        @keyframes falling {
          0% {
            transform: translateY(-10vh) translateX(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.8;
          }
          90% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(100vh) translateX(calc(var(--end-x) - 50%)) rotate(var(--rotation));
            opacity: 0;
          }
        }
        
        .gradient-border {
          background: linear-gradient(45deg, #3b82f6, #6366f1, #8b5cf6);
          padding: 2px;
          border-radius: 16px;
        }
        
        .gradient-border-content {
          background: white;
          border-radius: 14px;
          padding: 1.5rem;
        }
        
        .floating {
          animation: float 3s ease-in-out infinite;
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </div>
  );
};

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 relative overflow-hidden"
      style={{
        backgroundImage: `url('https://images.pexels.com/photos/46253/mt-fuji-sea-of-clouds-sunrise-46253.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundBlendMode: 'overlay',
      }}
    >
      <JapaneseBackground />
      <CherryBlossoms />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-100 to-indigo-200 drop-shadow-2xl"
          >
            SakuraLingua
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl text-white/90 max-w-2xl mx-auto font-medium drop-shadow-lg"
          >
            Master Japanese with interactive JLPT practice and comprehensive study tools
          </motion.p>
        </motion.div>

        {/* Main Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 max-w-5xl mx-auto"
        >
          {/* Exam Preparation */}
          <motion.div
            whileHover={{ scale: 1.05, rotateY: 5 }}
            whileTap={{ scale: 0.95 }}
            className="gradient-border cursor-pointer group"
            onClick={() => navigate('/exam')}
          >
            <div className="gradient-border-content h-full bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-700 text-center hover:shadow-2xl transition-all duration-300">
              <div className="relative mb-4">
                <img 
                  src="https://images.pexels.com/photos/159844/cellular-education-classroom-159844.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop" 
                  alt="Exam Preparation" 
                  className="w-full h-32 object-cover rounded-lg mb-4"
                />
                <div className="absolute inset-0 bg-blue-600 opacity-20 rounded-lg"></div>
                <BookOpen className="absolute top-2 right-2 w-8 h-8 text-white drop-shadow-lg" />
              </div>
              <h3 className="text-2xl font-bold text-blue-800 dark:text-blue-200 mb-3">
                JLPT Exams
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
                Full practice exams designed to match real JLPT format
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg"
              >
                <Play size={18} />
                <span>Start Exam</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </div>
          </motion.div>

          {/* Admin Dashboard */}
          <motion.div
            whileHover={{ scale: 1.05, rotateY: 5 }}
            whileTap={{ scale: 0.95 }}
            className="gradient-border cursor-pointer group"
          >
            <div className="gradient-border-content h-full bg-gradient-to-br from-white to-indigo-50 dark:from-gray-800 dark:to-gray-700 text-center hover:shadow-2xl transition-all duration-300">
              <div className="relative mb-4">
                <img 
                  src="https://images.pexels.com/photos/590016/pexels-photo-590016.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop" 
                  alt="Admin Dashboard" 
                  className="w-full h-32 object-cover rounded-lg mb-4"
                />
                <div className="absolute inset-0 bg-indigo-600 opacity-20 rounded-lg"></div>
                <Star className="absolute top-2 right-2 w-8 h-8 text-white drop-shadow-lg" />
              </div>
              <h3 className="text-2xl font-bold text-blue-800 dark:text-blue-200 mb-3">
                Admin
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
                Track progress and manage your learning journey
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/admin')}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full font-semibold hover:shadow-lg transition-all duration-300 flex items-center mx-auto"
              >
                <span>Go to Admin</span>
                <ArrowRight className="ml-2 w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>

          {/* Practice Quizzes */}
          <motion.div
            whileHover={{ scale: 1.05, rotateY: 5 }}
            whileTap={{ scale: 0.95 }}
            className="gradient-border cursor-pointer group"
            onClick={() => window.location.href = 'https://sakuralingua.com'}
          >
            <div className="gradient-border-content h-full bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-gray-700 text-center hover:shadow-2xl transition-all duration-300">
              <div className="relative mb-4">
                <img 
                  src="https://images.pexels.com/photos/1181271/pexels-photo-1181271.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop" 
                  alt="Practice Quizzes" 
                  className="w-full h-32 object-cover rounded-lg mb-4"
                />
                <div className="absolute inset-0 bg-purple-600 opacity-20 rounded-lg"></div>
                <Target className="absolute top-2 right-2 w-8 h-8 text-white drop-shadow-lg" />
              </div>
              <h3 className="text-2xl font-bold text-blue-800 dark:text-blue-200 mb-3">
                Practice Now
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
                Interactive quizzes for vocabulary, grammar & reading
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-purple-700 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg"
              >
                <Target size={18} />
                <span>Start Practice</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </div>
          </motion.div>

          {/* Vocabulary Exam */}
          <motion.div
            whileHover={{ scale: 1.05, rotateY: 5 }}
            whileTap={{ scale: 0.95 }}
            className="gradient-border cursor-pointer group"
            onClick={() => navigate('/vocabulary-exam')}
          >
            <div className="gradient-border-content h-full bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-700 text-center hover:shadow-2xl transition-all duration-300">
              <div className="relative mb-4">
                <img 
                  src="https://images.pexels.com/photos/2133/man-person-people-emotions.jpg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop" 
                  alt="Vocabulary Exam" 
                  className="w-full h-32 object-cover mb-4"
                />
                <div className="absolute inset-0 bg-purple-600 opacity-20 rounded-lg"></div>
                <BookOpen className="absolute top-2 right-2 w-8 h-8 text-white drop-shadow-lg" />
              </div>
              <h3 className="text-2xl font-bold text-purple-800 dark:text-purple-200 mb-3">
                Vocabulary Test
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
                Test your Japanese vocabulary knowledge with this quick quiz
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-purple-700 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg"
              >
                <Play size={18} />
                <span>Start Test</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </div>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          {[
            { icon: Target, title: "Goal-Oriented", desc: "JLPT-focused learning path" },
            { icon: Smile, title: "Interactive", desc: "Engaging quiz experience" },
            { icon: BookOpen, title: "Comprehensive", desc: "All language skills covered" },
            { icon: CheckCircle, title: "Progress Tracking", desc: "Monitor your improvement" }
          ].map((feature, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05, y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 + index * 0.1 }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <feature.icon className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="text-center bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-2xl"
        >
          <h2 className="text-3xl font-bold mb-4">Ready to Master Japanese?</h2>
          <p className="text-blue-100 mb-6 text-lg">
            Join thousands of learners on their journey to JLPT success
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:bg-blue-50 transition-colors shadow-lg"
          >
            Get Started Today
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default LandingPage;