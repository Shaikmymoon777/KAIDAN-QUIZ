import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { UserProvider } from './contexts/usercontext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import JapaneseBackground from './components/JapaneseBackground';
import Dashboard from './pages/Dashboard';
import Quiz from './pages/Quiz';
import Practice from './pages/Practice';
import Ranking from './pages/Ranking';
import Contact from './pages/Contact';
import Grammer from './pages/Grammer';
import Listening from './pages/listening';
import Vocabulary from './pages/Vocabulary';


function App() {
  return (
    <AppProvider>
      <GoogleOAuthProvider clientId="448072850807-v01ki6kjc52knlc3o44pvk78f3uvgape.apps.googleusercontent.com">
        <UserProvider>
          <Router>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col relative">
              <JapaneseBackground />
              <Header />
              <main className="flex-1 relative z-0">
                <Routes>
                  <Route path="/" element={<Navigate to="/quiz" replace />} />
                  <Route path="/quiz" element={<Quiz />} />
                  <Route path="/practice" element={<Practice />} />
                  <Route path="/grammer" element={<Grammer/>} />
                  <Route path="/listening" element={<Listening />} />
                  <Route path="/ranking" element={<Ranking />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/vocabulary" element={<Vocabulary />} />
                  
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