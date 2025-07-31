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
  icon: JSX.Element;
  videos: Video[];
}

const Listening: React.FC = () => {
  const [selectedLevel, setSelectedLevel] = useState('n5');

  const levels: Level[] = [
    {
      id: 'n5',
      name: 'N5',
      description: 'Beginner Level Listening',
      icon: <Smile className="w-8 h-8" />,
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
      icon: <Smile className="w-8 h-8" />,
      videos: [
        { id: '1', title: 'JLPT N4 Listening Practice 1', url: 'https://www.youtube.com/embed/VIDEO_ID_N4_1' },
        { id: '2', title: 'JLPT N4 Listening Practice 2', url: 'https://www.youtube.com/embed/VIDEO_ID_N4_2' },
      ],
    },
    {
      id: 'n3',
      name: 'N3',
      description: 'Intermediate Level Listening',
      icon: <Smile className="w-8 h-8" />,
      videos: [
        { id: '1', title: 'JLPT N3 Listening Practice 1', url: 'https://www.youtube.com/embed/VIDEO_ID_N3_1' },
        { id: '2', title: 'JLPT N3 Listening Practice 2', url: 'https://www.youtube.com/embed/VIDEO_ID_N3_2' },
      ],
    },
    {
      id: 'n2',
      name: 'N2',
      description: 'Upper Intermediate Listening',
      icon: <Smile className="w-8 h-8" />,
      videos: [
        { id: '1', title: 'JLPT N2 Listening Practice 1', url: 'https://www.youtube.com/embed/VIDEO_ID_N2_1' },
        { id: '2', title: 'JLPT N2 Listening Practice 2', url: 'https://www.youtube.com/embed/VIDEO_ID_N2_2' },
      ],
    },
    {
      id: 'n1',
      name: 'N1',
      description: 'Advanced Level Listening',
      icon: <Smile className="w-8 h-8" />,
      videos: [
        { id: '1', title: 'JLPT N1 Listening Practice 1', url: 'https://www.youtube.com/embed/VIDEO_ID_N1_1' },
        { id: '2', title: 'JLPT N1 Listening Practice 2', url: 'https://www.youtube.com/embed/VIDEO_ID_N1_2' },
      ],
    },
  ];

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
      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="mb-6"
          >
            <Headphones className="w-16 h-16 text-blue-600 dark:text-blue-400 mx-auto animate-wave" />
          </motion.div>
          <motion.h1
            className="text-4xl md:text-5xl font-bold text-blue-900 dark:text-blue-100"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            JLPT Listening Practice
          </motion.h1>
          <motion.p
            className="text-lg text-blue-700 dark:text-blue-300 max-w-3xl mx-auto mt-4"
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
          <h2 className="text-3xl font-bold text-blue-900 dark:text-blue-100 mb-6 text-center">
            Choose Your Level
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {levels.map((level) => {
              const isAvailable = level.id === 'n5';
              return (
                <motion.button
                  key={level.id}
                  whileHover={isAvailable ? { scale: 1.05 } : {}}
                  whileTap={isAvailable ? { scale: 0.95 } : {}}
                  onClick={() => isAvailable && setSelectedLevel(level.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-300 ${
                    selectedLevel === level.id
                      ? 'bg-blue-600 text-white'
                      : isAvailable
                      ? 'bg-blue-100 dark:bg-blue-800 text-blue-900 dark:text-blue-100 hover:bg-blue-200 dark:hover:bg-blue-700'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  }`}
                  disabled={!isAvailable}
                  aria-label={`Select JLPT ${level.name} level`}
                >
                  {level.icon}
                  <span>{level.name}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Video Section */}
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <div className="flex items-center space-x-3 mb-8">
            <motion.div
              whileHover={{ scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <Headphones className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </motion.div>
            <h2 className="text-3xl font-bold text-blue-900 dark:text-blue-100">
              {levels.find((l) => l.id === selectedLevel)?.name} Listening Practice
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {levels.find((l) => l.id === selectedLevel)?.videos.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 + index * 0.07 }}
                whileHover={{ scale: 1.02, boxShadow: '0 10px 20px rgba(0,0,0,0.2)' }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-blue-500"
              >
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
                  {video.title}
                </h3>
                <div className="relative pb-[56.25%]">
                  <iframe
                    src={video.url}
                    title={video.title}
                    className="absolute top-0 left-0 w-full h-full rounded-lg"
                    frameBorder={0}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <p className="text-sm text-blue-600 dark:text-blue-300 mt-4">
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