import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, BookOpen, Brain, Trophy, Headphones } from 'lucide-react';
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

  return (
    <header className="bg-blue-50 dark:bg-gray-900 shadow-md border-b border-blue-200 dark:border-blue-800 sticky top-0 z-50">
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
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="sakura-petal left-[10%] top-[-10%]"></div>
        <div className="sakura-petal left-[30%] top-[-20%] animation-delay-2s"></div>
        <div className="sakura-petal left-[50%] top-[-15%] animation-delay-4s"></div>
        <div className="sakura-petal left-[70%] top-[-25%] animation-delay-6s"></div>
        <div className="sakura-petal left-[90%] top-[-10%] animation-delay-8s"></div>
        <svg className="absolute bottom-0 w-full h-16 text-blue-200 dark:text-blue-900" viewBox="0 0 1440 100" preserveAspectRatio="none">
          <path
            d="M0,60 C200,80 300,20 500,40 C700,60 900,20 1100,40 C1300,60 1440,20 1440,60 L1440,100 L0,100 Z"
            fill="currentColor"
            className="animate-wave"
          />
        </svg>
      </div>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/dashboard" className="flex items-center space-x-2 group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 bg-blue-500 dark:bg-blue-700 rounded-lg flex items-center justify-center shadow-md"
            >
              <span className="text-white font-bold text-lg">桜</span>
            </motion.div>
            <span className="text-lg font-bold text-blue-900 dark:text-blue-100">SakuraLingua</span>
          </Link>
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <div className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all duration-300 ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-800 hover:bg-blue-200 dark:hover:bg-blue-700'
                  }`}>
                    <Icon size={18} />
                    <span className="font-medium">{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>
          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <img src={user.avatar} alt="Profile avatar" className="w-8 h-8 rounded-full border-2 border-blue-500 dark:border-blue-700" />
                <span className="text-blue-900 dark:text-blue-100">{user.name}</span>
                <button
                  className="ml-2 px-2 py-1 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600"
                  onClick={() => {
                    googleLogout();
                    setUser(null);
                  }}
                  aria-label="Log out"
                >
                  Logout
                </button>
              </>
            ) : (
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => alert('Google Login Failed')}
                shape="circle"
                theme="filled_blue"
              />
            )}
          </div>
          {/* Mobile Hamburger */}
          <button
            className="md:hidden flex items-center px-2 py-1"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            <svg className="w-7 h-7 text-blue-900 dark:text-blue-100" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-blue-50 dark:bg-gray-900 border-t border-blue-200 dark:border-blue-800 py-2">
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
                    <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-800 hover:bg-blue-200 dark:hover:bg-blue-700'
                    }`}>
                      <Icon size={18} />
                      <span className="font-medium">{item.label}</span>
                    </div>
                  </Link>
                );
              })}
              <div className="flex items-center gap-2 px-4 py-2">
                {user ? (
                  <>
                    <img src={user.avatar} alt="Profile avatar" className="w-8 h-8 rounded-full border-2 border-blue-500 dark:border-blue-700" />
                    <span className="text-blue-900 dark:text-blue-100">{user.name}</span>
                    <button
                      className="ml-2 px-2 py-1 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600"
                      onClick={() => {
                        googleLogout();
                        setUser(null);
                        setMobileMenuOpen(false);
                      }}
                      aria-label="Log out"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <GoogleLogin
                    onSuccess={handleGoogleLogin}
                    onError={() => alert('Google Login Failed')}
                    shape="circle"
                    theme="filled_blue"
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}