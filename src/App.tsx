import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { UserProvider } from './contexts/usercontext';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Dashboard from './pages/Dashboard';
import Quiz from './pages/Quiz';
import Practice from './pages/Practice';
import Ranking from './pages/Ranking';
import Contact from './pages/Contact';
import Grammer from './pages/Grammer';
import Listening from './pages/listening';
import Exam from './pages/exam';
import Home from './pages/home';
import Admin from './pages/admin';
import Auth from './pages/Auth';
import AdminScores from './pages/AdminScores';

function App() {
  return (
    <AppProvider>
      <GoogleOAuthProvider clientId="448072850807-v01ki6kjc52knlc3o44pvk78f3uvgape.apps.googleusercontent.com">
        <UserProvider>
          <Router>
            <AuthProvider>
              <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
                <Header />
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<Navigate to="/home" replace />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/quiz" element={<Quiz />} />
                    <Route path="/practice" element={<Practice />} />
                    <Route path="/grammer" element={<Grammer/>} />
                    <Route path="/listening" element={<Listening />} />
                    <Route path="/ranking" element={<Ranking />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/login" element={<Auth />} />
                    <Route
                      path="/exam"
                      element={
                        <ProtectedRoute>
                          <Exam />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/scores"
                      element={
                        <ProtectedRoute>
                          <AdminScores />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="*" element={<Auth />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            </AuthProvider>
          </Router>
        </UserProvider>
      </GoogleOAuthProvider>
    </AppProvider>
  );
}

export default App;