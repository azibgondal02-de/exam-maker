import React, { useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// ── Eagerly loaded (tiny, needed immediately) ─────────────────────────────────
import LoginPage from './pages/LoginPage';
import TestMaker from './pages/TestMaker';

// ── Lazy loaded (each step is its own JS chunk) ───────────────────────────────
const Step1 = lazy(() => import('./pages/steps/Step1_BoardSelect'));
const Step2 = lazy(() => import('./pages/steps/Step2_ClassSelect'));
const Step3 = lazy(() => import('./pages/steps/Step3_SubjectSelect'));
const Step4 = lazy(() => import('./pages/steps/Step4_TopicSelect'));
const Step5 = lazy(() => import('./pages/steps/Step5_ConfigReview'));
const Step6 = lazy(() => import('./pages/steps/Step6_QuestionSelect'));
const ProfilePage        = lazy(() => import('./pages/ProfilePage'));
const ChangePasswordPage = lazy(() => import('./pages/ChangePasswordPage'));
const AdminPage          = lazy(() => import('./pages/AdminPage'));
const ExpiredPage        = lazy(() => import('./pages/ExpiredPage'));

// ── Minimal full-screen fallback while a chunk loads ─────────────────────────
function PageLoader() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: 'linear-gradient(135deg, #f0f4f8, #e8eef5)',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '44px', height: '44px',
          border: '4px solid #e2e8f0', borderTop: '4px solid #2196f3',
          borderRadius: '50%', margin: '0 auto 16px',
          animation: 'spin 0.8s linear infinite',
        }} />
        <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>Loading...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}

// ── Auth guard ────────────────────────────────────────────────────────────────
function Private({ children }) {
  const token = localStorage.getItem('auth_token');
  const userType = localStorage.getItem('user_type');
  const subStatus = localStorage.getItem('subscription_status');

  if (!token) return <Navigate to="/login" replace />;

  if (userType === 'school_admin' && subStatus === 'expired') {
    return <Navigate to="/expired" replace />;
  }

  return children;
}

function App() {
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    setAuthChecked(true);
  }, []);

  if (!authChecked) return <PageLoader />;

  const isAuthenticated = !!localStorage.getItem('auth_token');

  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public */}
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/test-maker" replace /> : <LoginPage />}
          />

          {/* Protected */}
          <Route path="/test-maker"                 element={<Private><TestMaker /></Private>} />
          <Route path="/test-maker/step-1"          element={<Private><Step1 /></Private>} />
          <Route path="/test-maker/step-2"          element={<Private><Step2 /></Private>} />
          <Route path="/test-maker/step-3"          element={<Private><Step3 /></Private>} />
          <Route path="/test-maker/step-4"          element={<Private><Step4 /></Private>} />
          <Route path="/test-maker/step-5"          element={<Private><Step5 /></Private>} />
          <Route path="/test-maker/step-6"          element={<Private><Step6 /></Private>} />
          <Route path="/test-maker/profile"         element={<Private><ProfilePage /></Private>} />
          <Route path="/test-maker/change-password" element={<Private><ChangePasswordPage /></Private>} />
          <Route path="/expired" element={<ExpiredPage />} />
          <Route path="/admin" element={
            <Private>
              {localStorage.getItem('user_type') === 'admin' ? <AdminPage /> : <Navigate to="/test-maker" replace />}
            </Private>
          } />

          {/* Default — also handles /app.html entry point for local dev */}
          <Route
            path="/"
            element={<Navigate to={isAuthenticated ? '/test-maker' : '/login'} replace />}
          />
          <Route
            path="/app.html"
            element={<Navigate to={isAuthenticated ? '/test-maker' : '/login'} replace />}
          />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;