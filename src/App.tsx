import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import LoginRegister from './pages/LoginRegister';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import PublicLanding from './pages/PublicLanding';
import About from './pages/About';
import Games from './pages/Games';
import Help from './pages/Help';
import Blog from './pages/Blog';
import ProtectedRoute from './components/ProtectedRoute';
import ConnectionStatus from './components/ConnectionStatus';
import { MobileBottomNavigation } from './components/MobileBottomNavigation';
import { initializeAdSenseSystem } from './lib/adSenseSystem';
import { useUser } from './context/UserContext';

function App() {
  useEffect(() => {
    // Initialize the new AdSense Guard System
    initializeAdSenseSystem();
  }, []);

  const { authUser, loading } = useUser();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading GameGoUp...</div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-900">
        <ConnectionStatus />
        <Routes>
          <Route path="/" element={
            authUser ? (
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            ) : (
              <PublicLanding />
            )
          } />
          <Route path="/login" element={<LoginRegister />} />
          <Route path="/about" element={<About />} />
          <Route path="/games" element={<Games />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/help" element={<Help />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
        </Routes>
        <MobileBottomNavigation />
      </div>
    </Router>
  );
}

export default App;
