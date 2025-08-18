import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, BookOpen, Brain, Trophy, Headphones, ClipboardList } from 'lucide-react';
import { GoogleLogin, googleLogout } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useUser } from '../../contexts/usercontext';
import { useState } from 'react';

export default function Header() {
  const location = useLocation();
  const { user, setUser } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: User },
    { path: '/quiz', label: 'Quiz', icon: BookOpen },
    { path: '/practice', label: 'Practice', icon: Brain },
    { path: '/grammer', label: 'Grammar', icon: BookOpen },
    { path: '/listening', label: 'Listening', icon: Headphones },
    { path: '/exams', label: 'Exams', icon: ClipboardList },
    { path: '/ranking', label: 'Ranking', icon: Trophy },
  ];

  const handleGoogleLogin = (credentialResponse: any) => {
    if (credentialResponse.credential) {
      const decoded: any = jwtDecode(credentialResponse.credential);
      setUser({
        name: decoded.name,
        email: decoded.email,
        avatar: decoded.picture,
      });
    }
  };

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
                '--end-x': `${endX}%`,
                '--rotation': `${type.rotation}deg`,
              } as React.CSSProperties}
            >
              {type.emoji}
            </div>
          );
        })}
        <style>
          {`
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
          `}
        </style>
      </div>
    );
  };

  return (
    <header className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 shadow-lg border-b border-blue-300 dark:border-blue-600 sticky top-0 z-50">
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
          .hover-scale:hover { transform: scale(1.05); transition: transform 0.3s ease; }
          .no-select {
            user-select: none;
            -webkit-user-select: none;
            -ms-user-select: none;
            -moz-user-select: none;
          }
        `}
      </style>
      <JapaneseBackground />
      <CherryBlossoms />
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/dashboard" className="flex items-center space-x-2 group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 bg-blue-500 dark:bg-blue-600 rounded-lg flex items-center justify-center shadow-md"
            >
              <span className="text-white font-bold text-lg">桜</span>
            </motion.div>
            <span className="text-lg font-bold text-blue-800 dark:text-blue-200">SakuraLingua</span>
          </Link>
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/30 shadow-md'
                        : 'text-gray-600 dark:text-gray-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="font-medium">{item.label}</span>
                  </motion.div>
                </Link>
              );
            })}
          </div>
          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <img
                  src={user.avatar}
                  alt="avatar"
                  className="w-8 h-8 rounded-full border-2 border-blue-300 dark:border-blue-600"
                />
                <span className="text-blue-800 dark:text-blue-200">{user.name}</span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="ml-2 px-2 py-1 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                  onClick={() => {
                    googleLogout();
                    setUser(null);
                  }}
                >
                  Logout
                </motion.button>
              </>
            ) : (
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => alert('Google Login Failed')}
                text="signin_with"
                shape="rectangular"
                theme="outline"
              />
            )}
          </div>
          {/* Mobile Hamburger */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="md:hidden flex items-center px-2 py-1 text-blue-700 dark:text-blue-300"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Open navigation menu"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </motion.button>
        </div>
        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-white dark:bg-gray-800 border-t border-blue-300 dark:border-blue-600 py-2"
          >
            <div className="flex flex-col space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                        isActive
                          ? 'text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/30 shadow-md'
                          : 'text-gray-600 dark:text-gray-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                      }`}
                    >
                      <Icon size={18} />
                      <span className="font-medium">{item.label}</span>
                    </motion.div>
                  </Link>
                );
              })}
              <div className="flex items-center gap-2 px-4 py-2">
                {user ? (
                  <>
                    <img
                      src={user.avatar}
                      alt="avatar"
                      className="w-8 h-8 rounded-full border-2 border-blue-300 dark:border-blue-600"
                    />
                    <span className="text-blue-800 dark:text-blue-200">{user.name}</span>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="ml-2 px-2 py-1 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                      onClick={() => {
                        googleLogout();
                        setUser(null);
                        setMobileMenuOpen(false);
                      }}
                    >
                      Logout
                    </motion.button>
                  </>
                ) : (
                  <GoogleLogin
                    onSuccess={handleGoogleLogin}
                    onError={() => alert('Google Login Failed')}
                    text="signin_with"
                    shape="rectangular"
                    theme="outline"
                  />
                )}
              </div>
            </div>
          </motion.div>
        )}
      </nav>
    </header>
  );
}