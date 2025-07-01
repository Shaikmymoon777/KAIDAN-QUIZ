import { useState } from 'react';
import { motion } from 'framer-motion';
import { Headphones, Smile } from 'lucide-react';

interface Video {
  id: string;
  title: string;
  url: string;
}

interface Level {
  id: string;
  name: string;
  description: string;
  color: string;
  emoji: string;
  videos: Video[];
}

const Listening: React.FC = () => {
  const [selectedLevel, setSelectedLevel] = useState('n5');

  const levels: Level[] = [
    {
      id: 'n5',
      name: 'N5',
      description: 'Beginner Level Listening',
      color: 'from-green-400 to-green-600',
      emoji: '🌱',
      videos: [
        { id: '1', title: 'JLPT N5 Listening Practice #1', url: 'https://www.youtube.com/embed/ewHktqEnxTQ' },
        { id: '2', title: 'JLPT N5 Listening Practice #2', url: 'https://www.youtube.com/embed/YBAJDQ_zDJg' },
        { id: '3', title: 'JLPT N5 Listening Practice #3', url: 'https://www.youtube.com/embed/f9xIi2z5RVk' },
        { id: '4', title: 'JLPT N5 Listening Practice #4', url: 'https://www.youtube.com/embed/0e0duD8_LFE' },
        { id: '5', title: 'JLPT N5 Listening Practice #5', url: 'https://www.youtube.com/embed/sY7L5cfCWno' },
        { id: '6', title: 'JLPT N5 Listening Practice #6', url: 'https://www.youtube.com/embed/CQ82yk3BC6c' },
        { id: '7', title: 'JLPT N5 Listening Practice #7', url: 'https://www.youtube.com/embed/SAaWBv630nI' },
        { id: '8', title: 'JLPT N5 Listening Practice #8', url: 'https://www.youtube.com/embed/7HfHdb5J3f4' },
        { id: '9', title: 'JLPT N5 Listening Practice #9', url: 'https://www.youtube.com/embed/TYn4OgknPDc' },
        { id: '10', title: 'JLPT N5 Listening Practice #10', url: 'https://www.youtube.com/embed/k1Bw564_WBY' },
        { id: '11', title: 'JLPT N5 Listening Practice #11', url: 'https://www.youtube.com/embed/pjHy2h8oKf8' },
        { id: '12', title: 'JLPT N5 Listening Practice #12', url: 'https://www.youtube.com/embed/1z3-CWWA20Y' },
      ],
    },
    {
      id: 'n4',
      name: 'N4',
      description: 'Elementary Level Listening',
      color: 'from-blue-400 to-blue-600',
      emoji: '📘',
      videos: [
        { id: '1', title: 'JLPT N4 Listening Practice 1', url: 'https://www.youtube.com/embed/VIDEO_ID_N4_1' },
        { id: '2', title: 'JLPT N4 Listening Practice 2', url: 'https://www.youtube.com/embed/VIDEO_ID_N4_2' },
      ],
    },
    {
      id: 'n3',
      name: 'N3',
      description: 'Intermediate Level Listening',
      color: 'from-yellow-400 to-yellow-600',
      emoji: '🌟',
      videos: [
        { id: '1', title: 'JLPT N3 Listening Practice 1', url: 'https://www.youtube.com/embed/VIDEO_ID_N3_1' },
        { id: '2', title: 'JLPT N3 Listening Practice 2', url: 'https://www.youtube.com/embed/VIDEO_ID_N3_2' },
      ],
    },
    {
      id: 'n2',
      name: 'N2',
      description: 'Upper Intermediate Listening',
      color: 'from-orange-400 to-orange-600',
      emoji: '🔥',
      videos: [
        { id: '1', title: 'JLPT N2 Listening Practice 1', url: 'https://www.youtube.com/embed/VIDEO_ID_N2_1' },
        { id: '2', title: 'JLPT N2 Listening Practice 2', url: 'https://www.youtube.com/embed/VIDEO_ID_N2_2' },
      ],
    },
    {
      id: 'n1',
      name: 'N1',
      description: 'Advanced Level Listening',
      color: 'from-red-400 to-red-600',
      emoji: '🧠',
      videos: [
        { id: '1', title: 'JLPT N1 Listening Practice 1', url: 'https://www.youtube.com/embed/VIDEO_ID_N1_1' },
        { id: '2', title: 'JLPT N1 Listening Practice 2', url: 'https://www.youtube.com/embed/VIDEO_ID_N1_2' },
      ],
    },
  ];

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
      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="mb-6"
          >
            <Smile className="w-16 h-16 text-pink-600 dark:text-pink-400 mx-auto animate-wave" />
          </motion.div>
          <motion.h1
            className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-cyan-600 mb-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            JLPT Listening Practice
          </motion.h1>
          <motion.p
            className="text-2xl text-gray-100 dark:text-gray-200 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Improve your Japanese listening skills with curated JLPT level-specific videos. Select a level to get started.
          </motion.p>
        </div>

        {/* Level Selection */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-cyan-600 mb-6 text-center">
            Choose Your Level
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {levels.map((level) => {
              const isAvailable = level.id === 'n5';
              return (
                <motion.button
                  key={level.id}
                  whileHover={isAvailable ? { scale: 1.1, rotate: 4, boxShadow: "0 15px 30px rgba(0,0,0,0.3)" } : {}}
                  whileTap={isAvailable ? { scale: 0.95 } : {}}
                  onClick={() => isAvailable && setSelectedLevel(level.id)}
                  className={`p-6 rounded-3xl shadow-2xl text-center transition-all duration-300 relative border-4 ${
                    selectedLevel === level.id
                      ? 'bg-gradient-to-br from-white/90 to-yellow-200/90 dark:bg-gradient-to-br dark:from-gray-800/90 dark:to-yellow-800/90 border-yellow-400 dark:border-yellow-700'
                      : isAvailable
                      ? 'bg-gradient-to-br from-pink-300 to-yellow-300 dark:from-pink-700 dark:to-yellow-700 border-pink-400 dark:border-pink-600 hover:bg-gradient-to-br hover:from-pink-400 hover:to-yellow-400 dark:hover:from-pink-600 dark:hover:to-yellow-600'
                      : 'bg-gradient-to-br from-gray-200/50 to-gray-300/50 dark:from-gray-700/50 dark:to-gray-600/50 border-gray-300 dark:border-gray-600 cursor-not-allowed opacity-70'
                  }`}
                  disabled={!isAvailable}
                >
                  <motion.div
                    className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${level.color} flex items-center justify-center text-3xl animate-wave`}
                    whileHover={isAvailable ? { scale: 1.15, rotate: 8 } : {}}
                  >
                    {level.emoji}
                  </motion.div>
                  <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-1">
                    JLPT {level.name}
                  </h3>
                  <p className="text-sm text-gray-100 dark:text-gray-200">
                    {level.description}
                  </p>
                  {!isAvailable && (
                    <p className="text-xs text-gray-100 dark:text-gray-200 mt-2 absolute bottom-2 left-0 right-0">
                      Coming Soon!
                    </p>
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Video Section */}
        <motion.div
          className="bg-gradient-to-br from-white/90 to-yellow-200/90 dark:bg-gradient-to-br dark:from-gray-800/90 dark:to-yellow-800/90 rounded-3xl shadow-2xl p-8 border-4 border-pink-400 dark:border-pink-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <div className="flex items-center space-x-3 mb-8">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 10 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Headphones className="w-8 h-8 text-pink-600 dark:text-pink-400 animate-pulse" />
            </motion.div>
            <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-cyan-600">
              {levels.find((l) => l.id === selectedLevel)?.name} Listening Practice
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {levels.find((l) => l.id === selectedLevel)?.videos.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 + index * 0.07 }}
                whileHover={{ scale: 1.02, boxShadow: "0 15px 30px rgba(0,0,0,0.3)" }}
                className="p-6 bg-gradient-to-br from-pink-300 to-yellow-300 dark:from-pink-700 dark:to-yellow-700 rounded-3xl border-2 border-pink-400 dark:border-pink-600"
              >
                <h3 className="text-lg font-extrabold text-gray-900 dark:text-white mb-4">
                  {video.title}
                </h3>
                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                  <iframe
                    src={video.url}
                    title={video.title}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                    frameBorder={0}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <p className="text-sm text-gray-100 dark:text-gray-200 mt-4">
                  Practice your {levels.find((l) => l.id === selectedLevel)?.name} listening skills with this video.
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Listening;