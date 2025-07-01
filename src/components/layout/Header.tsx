import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, BookOpen, Brain, Trophy, Headphones } from 'lucide-react'; // Add Book for Grammar
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
    <header className="bg-gradient-to-br from-pink-200 via-yellow-200 to-cyan-200 dark:from-pink-800 dark:via-yellow-800 dark:to-cyan-800 shadow-lg border-b border-pink-300 dark:border-pink-700 sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/dashboard" className="flex items-center space-x-2 group">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 bg-gradient-to-br from-pink-300 to-cyan-300 rounded-lg flex items-center justify-center shadow-md"
            >
              <span className="text-white font-bold text-lg">桜</span>
            </motion.div>
            <span className="text-lg font-bold text-gray-800 dark:text-white">SakuraLingua</span>
          </Link>
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <div className={`flex items-center space-x-1 px-3 py-2 rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'text-pink-700 bg-pink-100 dark:text-pink-300 dark:bg-pink-900/30 shadow-md'
                      : 'text-gray-600 dark:text-gray-300 hover:text-pink-700 dark:hover:text-pink-300 hover:bg-gray-100 dark:hover:bg-pink-900/20'
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
                <img src={user.avatar} alt="avatar" className="w-8 h-8 rounded-full border-2 border-white" />
                <span className="text-gray-800 dark:text-white">{user.name}</span>
                <button
                  className="ml-2 px-2 py-1 bg-red-400 text-white rounded hover:bg-red-500"
                  onClick={() => {
                    googleLogout();
                    setUser(null);
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => alert('Google Login Failed')}
              />
            )}
          </div>
          {/* Mobile Hamburger */}
          <button
            className="md:hidden flex items-center px-2 py-1"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Open navigation menu"
          >
            <svg className="w-7 h-7 text-gray-800 dark:text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-gradient-to-br from-pink-200/90 via-yellow-200/90 to-cyan-200/90 dark:from-pink-800/90 dark:via-yellow-800/90 dark:to-cyan-800/90 border-t border-pink-300 dark:border-pink-700 py-2">
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
                    <div className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                      isActive
                        ? 'text-pink-700 bg-pink-100 dark:text-pink-300 dark:bg-pink-900/30 shadow-md'
                        : 'text-gray-600 dark:text-gray-300 hover:text-pink-700 dark:hover:text-pink-300 hover:bg-gray-100 dark:hover:bg-pink-900/20'
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
                    <img src={user.avatar} alt="avatar" className="w-8 h-8 rounded-full border-2 border-white" />
                    <span className="text-gray-800 dark:text-white">{user.name}</span>
                    <button
                      className="ml-2 px-2 py-1 bg-red-400 text-white rounded hover:bg-red-500"
                      onClick={() => {
                        googleLogout();
                        setUser(null);
                        setMobileMenuOpen(false);
                      }}
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <GoogleLogin
                    onSuccess={handleGoogleLogin}
                    onError={() => alert('Google Login Failed')}
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