import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import LoginPage from './pages/LoginPage';
import TestMaker from './pages/TestMaker';
import Step1_BoardSelect from './pages/steps/Step1_BoardSelect';
import Step2_ClassSelect from './pages/steps/Step2_ClassSelect';
import Step3_SubjectSelect from './pages/steps/Step3_SubjectSelect';
import Step4_TopicSelect from './pages/steps/Step4_TopicSelect';
import Step5_ConfigReview from './pages/steps/Step5_ConfigReview';
import Step6_QuestionSelect from './pages/steps/Step6_QuestionSelect';
import ProfilePage from './pages/ProfilePage';
import ChangePasswordPage from './pages/ChangePasswordPage'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    setIsAuthenticated(!!token);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f8f9fa' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '50px', height: '50px', border: '4px solid #f0f0f0', borderTop: '4px solid #2196f3', borderRadius: '50%', margin: '0 auto 20px', animation: 'spin 1s linear infinite' }}></div>
          <p style={{ color: '#999', fontSize: '15px' }}>Loading...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/test-maker" replace /> : <LoginPage />} />
        <Route path="/test-maker" element={isAuthenticated ? <TestMaker /> : <Navigate to="/login" replace />} />
        <Route path="/test-maker/step-1" element={isAuthenticated ? <Step1_BoardSelect /> : <Navigate to="/login" replace />} />
        <Route path="/test-maker/step-2" element={isAuthenticated ? <Step2_ClassSelect /> : <Navigate to="/login" replace />} />
        <Route path="/test-maker/step-3" element={isAuthenticated ? <Step3_SubjectSelect /> : <Navigate to="/login" replace />} />
        <Route path="/test-maker/step-4" element={isAuthenticated ? <Step4_TopicSelect /> : <Navigate to="/login" replace />} />
        <Route path="/test-maker/step-5" element={isAuthenticated ? <Step5_ConfigReview /> : <Navigate to="/login" replace />} />
        <Route path="/test-maker/step-6" element={isAuthenticated ? <Step6_QuestionSelect /> : <Navigate to="/login" replace />} />
        <Route path="/test-maker/profile" element={isAuthenticated ? <ProfilePage /> : <Navigate to="/login" replace />} />
        <Route path="/test-maker/change-password" element={isAuthenticated ? <ChangePasswordPage /> : <Navigate to="/login" replace />} />
        <Route path="/" element={<Navigate to={isAuthenticated ? "/test-maker" : "/login"} replace />} />
      </Routes>
    </Router>
  );
}

export default App;