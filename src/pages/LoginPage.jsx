import React, { useState } from 'react';

const WA_NUMBER = '923040427647';
import API_BASE_URL  from '../services/config';
const API = API_BASE_URL
export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [expired, setExpired] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/identity/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password: password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Login failed');
      }

      if (data.access_token) {
        localStorage.setItem('auth_token', data.access_token);
        localStorage.setItem('user_code', data.user_code || '');
        localStorage.setItem('username', data.username || '');
        localStorage.setItem('user_type', data.user_type || '');
        localStorage.setItem('school_name', data.school_name || '');
        localStorage.setItem('subscription_status', data.subscription_status || 'active');
        localStorage.setItem('subscription_days_left', data.subscription_days_left ?? '');
        localStorage.setItem('subscription_end', data.subscription_end || '');

        if (data.subscription_status === 'expired') {
          setExpired(true);
          setIsLoading(false);
          return;
        }

        window.location.href = '/test-maker';
      } else {
        throw new Error('No token received');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (expired) {
    return (
      <div className="login-container">
        <div className="login-wrapper" style={{ textAlign: 'center', padding: '48px 32px' }}>
          <div style={{ width: '80px', height: '80px', background: '#fff3e0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <i className="ti ti-clock-off" style={{ fontSize: '36px', color: '#f57c00' }}></i>
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#333', margin: '0 0 10px' }}>Subscription Expired</h2>
          <p style={{ fontSize: '14px', color: '#888', margin: '0 0 32px', lineHeight: '1.7' }}>
            Your PaperCraft subscription has ended.<br />
            Contact us on WhatsApp to renew and regain access.
          </p>
          <a
            href={`https://wa.me/${WA_NUMBER}?text=Hi, I want to renew my PaperCraft subscription.`}
            target="_blank"
            rel="noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '13px 28px', background: '#25d366', color: 'white', borderRadius: '10px', fontWeight: '600', fontSize: '15px', textDecoration: 'none' }}
          >
            <i className="ti ti-brand-whatsapp" style={{ fontSize: '18px' }}></i>
            Renew on WhatsApp
          </a>
          <p style={{ marginTop: '24px' }}>
            <button onClick={() => setExpired(false)} style={{ background: 'none', border: 'none', color: '#2196f3', cursor: 'pointer', fontSize: '13px' }}>
              ← Back to login
            </button>
          </p>
        </div>
        <style jsx>{`
          .login-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            padding: 20px;
          }
          .login-wrapper {
            width: 100%;
            max-width: 420px;
            background: white;
            border-radius: 16px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
            padding: 48px 32px;
            animation: slideUp 0.5s ease;
          }
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <div className="login-header">
          {/* P Logo - Dark Mode */}
          <div 
            onClick={() => window.location.href = '/'}
            style={{
              width: '80px',
              height: '80px',
              background: '#0f1f3d',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              cursor: 'pointer',
              margin: '0 auto 20px',
              boxShadow: '0 4px 15px rgba(15, 31, 61, 0.3)',
              overflow: 'hidden'
            }}
          >
            {/* Orange corner triangle */}
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '35px',
              height: '35px',
              background: '#f5a623',
              clipPath: 'polygon(0 0, 100% 0, 100% 100%)'
            }} />
            
            {/* White P */}
            <span style={{
              color: 'white',
              fontSize: '40px',
              fontWeight: 700,
              fontFamily: 'Georgia, "Times New Roman", serif',
              position: 'relative',
              zIndex: 1,
              marginTop: '-4px'
            }}>
              P
            </span>
          </div>
          
          <h1 className="app-title">PaperCraft</h1>
          <p className="app-subtitle">Pakistan's Best Assessment Program</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <h2 className="form-title">Welcome Back</h2>
          <p className="form-subtitle">Sign in to your account to continue</p>

          {error && (
            <div className="alert alert-error">
              <i className="ti ti-alert-circle"></i>
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email or Username</label>
            <div className="input-wrapper">
              <i className="ti ti-mail"></i>
              <input
                type="text"
                placeholder="Enter your email or username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-wrapper">
              <i className="ti ti-lock"></i>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-footer">
            <label className="checkbox-label">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
            <a href="#forgot" className="forgot-link">Forgot password?</a>
          </div>

          <button type="submit" disabled={isLoading} className={`btn-submit ${isLoading ? 'loading' : ''}`}>
            {isLoading ? (
              <><span className="spinner"></span>Signing in...</>
            ) : (
              <><i className="ti ti-login"></i>Sign In</>
            )}
          </button>

          <p className="signup-text">
            Don't have an account?{' '}
            <a href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noreferrer" className="signup-link">
              Contact us
            </a>
          </p>
        </form>
      </div>

      <style jsx>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          padding: 20px;
        }
        .login-wrapper {
          width: 100%;
          max-width: 420px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          padding: 48px 32px;
          animation: slideUp 0.5s ease;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .login-header { text-align: center; margin-bottom: 40px; }
        .app-title { font-size: 28px; font-weight: 600; color: #333; margin: 0 0 8px 0; }
        .app-subtitle { font-size: 13px; color: #999; margin: 0; letter-spacing: 0.5px; }
        .login-form { display: flex; flex-direction: column; gap: 24px; }
        .form-title { font-size: 22px; font-weight: 600; color: #333; margin: 0 0 4px 0; }
        .form-subtitle { font-size: 14px; color: #999; margin: 0 0 20px 0; }
        .alert { padding: 12px 16px; border-radius: 8px; display: flex; align-items: center; gap: 12px; font-size: 14px; }
        .alert-error { background: #ffebee; border: 1px solid #ffcdd2; border-left: 4px solid #f44336; color: #c62828; }
        .alert i { font-size: 18px; flex-shrink: 0; }
        .form-group { display: flex; flex-direction: column; gap: 8px; }
        .form-label { font-size: 14px; font-weight: 500; color: #333; }
        .input-wrapper { position: relative; display: flex; align-items: center; }
        .input-wrapper i { position: absolute; left: 14px; color: #999; font-size: 18px; pointer-events: none; }
        .form-input { width: 100%; padding: 12px 14px 12px 44px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 14px; transition: all 0.3s ease; background: white; }
        .form-input:focus { outline: none; border-color: #2196f3; box-shadow: 0 0 0 4px rgba(33, 150, 243, 0.1); }
        .form-input:disabled { background: #f5f5f5; cursor: not-allowed; opacity: 0.6; }
        .form-footer { display: flex; justify-content: space-between; align-items: center; font-size: 13px; }
        .checkbox-label { display: flex; align-items: center; gap: 6px; color: #666; cursor: pointer; user-select: none; }
        .checkbox-label input { width: 16px; height: 16px; cursor: pointer; }
        .forgot-link { color: #2196f3; text-decoration: none; }
        .forgot-link:hover { color: #1976d2; text-decoration: underline; }
        .btn-submit {
          padding: 12px 16px;
          background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
          color: white; border: none; border-radius: 8px; font-size: 15px;
          font-weight: 600; cursor: pointer; transition: all 0.3s ease;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .btn-submit:hover:not(:disabled) { box-shadow: 0 6px 20px rgba(33, 150, 243, 0.4); transform: translateY(-2px); }
        .btn-submit:disabled { opacity: 0.7; cursor: not-allowed; }
        .spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white; border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .signup-text { text-align: center; font-size: 14px; color: #999; margin: 0; }
        .signup-link { color: #25d366; text-decoration: none; font-weight: 600; }
        .signup-link:hover { text-decoration: underline; }
        @media (max-width: 480px) {
          .login-wrapper { padding: 32px 20px; }
          .form-title { font-size: 20px; }
          .app-title { font-size: 24px; }
        }
      `}</style>
    </div>
  );
}