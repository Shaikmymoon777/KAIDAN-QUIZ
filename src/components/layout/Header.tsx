import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, BookOpen, Brain, Trophy, Mail } from 'lucide-react';
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
    { path: '/ranking', label: 'Ranking', icon: Trophy },
    { path: '/contact', label: 'Contact', icon: Mail },
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
    <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/dashboard" className="flex items-center space-x-2 group">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg"
            >
              <span className="text-white font-bold text-lg">日本語</span>
            </motion.div>
            <span className="text-lg font-bold text-gray-800">Kaidan Quiz</span>
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
                      ? 'text-indigo-600 bg-indigo-50 shadow-md'
                      : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
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
                <img src={user.avatar} alt="avatar" className="w-8 h-8 rounded-full" />
                <span>{user.name}</span>
                <button
                  className="ml-2 px-2 py-1 bg-red-500 text-white rounded"
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
            <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 py-2">
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
                        ? 'text-indigo-600 bg-indigo-50 shadow-md'
                        : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
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
                    <img src={user.avatar} alt="avatar" className="w-8 h-8 rounded-full" />
                    <span>{user.name}</span>
                    <button
                      className="ml-2 px-2 py-1 bg-red-500 text-white rounded"
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