import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { UserProvider } from './contexts/usercontext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Dashboard from './pages/Dashboard';
import Quiz from './pages/Quiz';
import Practice from './pages/Practice';
import Ranking from './pages/Ranking';
import Contact from './pages/Contact';

function App() {
  return (
    <AppProvider>
      <GoogleOAuthProvider clientId="448072850807-v01ki6kjc52knlc3o44pvk78f3uvgape.apps.googleusercontent.com">
        <UserProvider>
          <Router>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
              <Header />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Navigate to="/quiz" replace />} />
                  <Route path="/quiz" element={<Quiz />} />
                  <Route path="/practice" element={<Practice />} />
                  <Route path="/ranking" element={<Ranking />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </UserProvider>
      </GoogleOAuthProvider>
    </AppProvider>
  );
}

export default App;