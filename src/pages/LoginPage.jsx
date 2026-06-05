import React, { useState } from 'react';
import logoImg from '../assets/logo.png';

const WA_NUMBER = import.meta.env.VITE_WA_NUMBER || '923287600959';
import API_BASE_URL from '../services/config';
const API = API_BASE_URL;

function ExpiredScreen({ onBack }) {
  return (
    <div className="lp-root">
      <div className="lp-expired-wrap">
        <div className="lp-expired-icon">
          <i className="ti ti-clock-off" />
        </div>
        <h2 className="lp-expired-title">Subscription Expired</h2>
        <p className="lp-expired-body">
          Your PaperCraft subscription has ended.<br />
          Contact us on WhatsApp to renew and regain access.
        </p>
        <a
          href={`https://wa.me/${WA_NUMBER}?text=Hi, I want to renew my PaperCraft subscription.`}
          target="_blank" rel="noreferrer"
          className="lp-wa-btn"
        >
          <i className="ti ti-brand-whatsapp" /> Renew on WhatsApp
        </a>
        <button onClick={onBack} className="lp-back-link">Back to login</button>
      </div>
      <LPStyles />
    </div>
  );
}

export default function LoginPage() {
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [showPwd,     setShowPwd]     = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');
  const [expired,     setExpired]     = useState(false);
  const [deactivated, setDeactivated] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res  = await fetch(`${API}/identity/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ username: email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.detail === 'Account deactivated') {
          setDeactivated(true);
          setLoading(false);
          return;
        }
        throw new Error(data.detail || 'Login failed');
      }
      if (data.access_token) {
        localStorage.setItem('auth_token', data.access_token);
        localStorage.setItem('user_code',  data.user_code  || '');
        localStorage.setItem('username',   data.username   || '');
        localStorage.setItem('user_type',  data.user_type  || '');
        localStorage.setItem('school_name', data.school_name  || '');
        if (data.subscription_status === 'expired') { setExpired(true); setLoading(false); return; }
        window.location.href = data.user_type === 'admin' ? '/admin' : '/test-maker';
      } else throw new Error('No token received');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (expired) return <ExpiredScreen onBack={() => setExpired(false)} />;

  if (deactivated) return (
    <div className="lp-root">
      <div className="lp-expired-wrap">
        <div className="lp-expired-icon" style={{ background: '#ffebee', color: '#d32f2f' }}>
          <i className="ti ti-lock-off" />
        </div>
        <h2 className="lp-expired-title">Account Deactivated</h2>
        <p className="lp-expired-body">
          Your account has been deactivated.<br />
          Please contact us on WhatsApp to reactivate your account.
        </p>
        <a
          href={`https://wa.me/${WA_NUMBER}?text=Hi, my PaperCraft account has been deactivated. Please help me reactivate it.`}
          target="_blank" rel="noreferrer"
          className="lp-wa-btn"
        >
          <i className="ti ti-brand-whatsapp" /> Contact on WhatsApp
        </a>
        <button onClick={() => setDeactivated(false)} className="lp-back-link">Back to login</button>
      </div>
      <LPStyles />
    </div>
  );

  return (
    <div className="lp-root">

      {/* ── Left panel — light (logo + branding) ── */}
      <div className="lp-left">
        <div className="lp-grid" aria-hidden="true">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="lp-grid-line lp-grid-h" style={{ top: `${12.5 * i}%`, animationDelay: `${i * 0.15}s` }} />
          ))}
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="lp-grid-line lp-grid-v" style={{ left: `${16.6 * i}%`, animationDelay: `${i * 0.2}s` }} />
          ))}
        </div>
        <div className="lp-blob" aria-hidden="true" />
        <div className="lp-left-content">

          <div onClick={() => window.location.href = '/'} style={{ cursor: 'pointer' }}>
            <img src={logoImg} alt="PaperCraft" style={{ height: '80px', width: 'auto' }} />
          </div>

          <div className="lp-brand-text">
            <h1 className="lp-brand-name">Paper Craft</h1>
            <p className="lp-brand-tagline">Pakistan's Best<br />Assessment Program</p>
          </div>

          <div className="lp-pills">
            {['Smart Paper Generation', 'Board-Pattern Tests', 'Bilingual Support'].map((f, i) => (
              <div key={f} className="lp-pill" style={{ animationDelay: `${0.6 + i * 0.15}s` }}>
                <i className="ti ti-check" /> {f}
              </div>
            ))}
          </div>

          <p className="lp-left-footer">
            Need access?{' '}
            <a href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noreferrer" className="lp-wa-inline">
              <i className="ti ti-brand-whatsapp" /> Contact us
            </a>
          </p>
        </div>
      </div>

      {/* ── Right panel — dark (form) ── */}
      <div className="lp-right">
        <div className="lp-form-wrap">

          {/* Mobile logo */}
          <div className="lp-mobile-brand">
            <div onClick={() => window.location.href = '/'} style={{ cursor: 'pointer' }}>
              <img src={logoImg} alt="PaperCraft" style={{ height: '44px', width: 'auto' }} />
            </div>
            <div>
              <div className="lp-mobile-name">Paper Craft</div>
              <div className="lp-mobile-sub">Pakistan's Best Assessment Program</div>
            </div>
          </div>

          <div className="lp-form-header">
            <h2 className="lp-form-title">Welcome back</h2>
            <p className="lp-form-subtitle">Sign in to your account to continue</p>
          </div>

          {error && (
            <div className="lp-alert">
              <i className="ti ti-alert-circle" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="lp-form">
            <div className="lp-field">
              <label className="lp-label">Email or Username</label>
              <div className="lp-input-wrap">
                <i className="ti ti-user lp-input-icon" />
                <input
                  type="text"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your username"
                  required
                  disabled={loading}
                  className="lp-input"
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="lp-field">
              <label className="lp-label">Password</label>
              <div className="lp-input-wrap">
                <i className="ti ti-lock lp-input-icon" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                  className="lp-input"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(p => !p)}
                  className="lp-eye-btn"
                  aria-label="Toggle password visibility"
                >
                  <i className={`ti ${showPwd ? 'ti-eye-off' : 'ti-eye'}`} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`lp-submit ${loading ? 'lp-submit-loading' : ''}`}
            >
              {loading ? (
                <><span className="lp-spinner" /> Signing in...</>
              ) : (
                <><i className="ti ti-login" /> Sign In</>
              )}
            </button>
          </form>

          <p className="lp-contact-text">
            Don't have an account?{' '}
            <a href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noreferrer" className="lp-contact-link">
              <i className="ti ti-brand-whatsapp" /> Contact us on WhatsApp
            </a>
          </p>
        </div>
      </div>

      <LPStyles />
    </div>
  );
}

function LPStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');

      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

      .lp-root {
        min-height: 100vh;
        display: flex;
        font-family: 'DM Sans', 'Segoe UI', system-ui, sans-serif;
        background: #0f1f3d;
      }

      /* ══════════ LEFT PANEL — light ══════════ */
      .lp-left {
        flex: 0 0 46%;
        background: #f0f4f8;
        position: relative;
        overflow: hidden;
        display: flex;
        align-items: center;
        padding: 60px 52px;
      }

      .lp-grid { position: absolute; inset: 0; }
      .lp-grid-line {
        position: absolute;
        background: rgba(15,31,61,0.05);
        animation: lp-grid-fade 1.2s ease forwards;
        opacity: 0;
      }
      .lp-grid-h { left: 0; right: 0; height: 1px; }
      .lp-grid-v { top: 0; bottom: 0; width: 1px; }
      @keyframes lp-grid-fade { from { opacity: 0; } to { opacity: 1; } }

      .lp-blob {
        position: absolute;
        width: 420px; height: 420px;
        background: radial-gradient(circle, rgba(245,166,35,0.15) 0%, transparent 70%);
        top: -80px; right: -80px;
        border-radius: 50%;
        animation: lp-pulse 4s ease-in-out infinite;
      }
      @keyframes lp-pulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.1); opacity: 0.7; }
      }

      .lp-left-content {
        position: relative;
        z-index: 1;
        display: flex;
        flex-direction: column;
        gap: 32px;
      }

      .lp-brand-text { animation: lp-rise 0.7s 0.2s ease both; }
      @keyframes lp-rise {
        from { transform: translateY(16px); opacity: 0; }
        to   { transform: translateY(0);    opacity: 1; }
      }
      .lp-brand-name {
        font-family: 'Playfair Display', Georgia, serif;
        font-size: clamp(32px, 4vw, 44px);
        font-weight: 800;
        color: #0f1f3d;
        line-height: 1.1;
        letter-spacing: -0.5px;
      }
      .lp-brand-tagline {
        font-size: 15px;
        color: #64748b;
        margin-top: 10px;
        line-height: 1.7;
        font-weight: 400;
      }

      .lp-pills { display: flex; flex-direction: column; gap: 10px; }
      .lp-pill {
        display: inline-flex; align-items: center; gap: 8px;
        padding: 8px 14px;
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 20px;
        color: #334155;
        font-size: 13px; font-weight: 500;
        width: fit-content;
        animation: lp-rise 0.6s ease both;
        box-shadow: 0 1px 4px rgba(0,0,0,0.06);
      }
      .lp-pill i { color: #f5a623; font-size: 14px; }

      .lp-left-footer {
        font-size: 13px; color: #94a3b8;
        display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
      }
      .lp-wa-inline {
        color: #25d366; text-decoration: none; font-weight: 600;
        display: inline-flex; align-items: center; gap: 4px;
      }
      .lp-wa-inline:hover { text-decoration: underline; }

      /* ══════════ RIGHT PANEL — dark ══════════ */
      .lp-right {
        flex: 1;
        background: #0f1f3d;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 48px 40px;
        position: relative;
      }
      .lp-right::before {
        content: '';
        position: absolute;
        top: 0; right: 0;
        width: 200px; height: 200px;
        background: radial-gradient(circle at top right, rgba(245,166,35,0.08), transparent 70%);
        pointer-events: none;
      }

      .lp-form-wrap {
        width: 100%;
        max-width: 380px;
        animation: lp-rise 0.5s 0.1s ease both;
      }

      .lp-mobile-brand {
        display: none;
        align-items: center; gap: 12px;
        margin-bottom: 32px;
      }
      .lp-mobile-name {
        font-family: 'Playfair Display', Georgia, serif;
        font-size: 22px; font-weight: 800; color: #0f1f3d;
      }
      .lp-mobile-sub { font-size: 12px; color: #94a3b8; margin-top: 2px; }

      .lp-form-header { margin-bottom: 28px; }
      .lp-form-title {
        font-family: 'Playfair Display', Georgia, serif;
        font-size: 28px; font-weight: 800; color: white;
        letter-spacing: -0.3px; margin-bottom: 6px;
      }
      .lp-form-subtitle { font-size: 14px; color: rgba(255,255,255,0.5); }

      .lp-alert {
        display: flex; align-items: center; gap: 10px;
        padding: 12px 16px; margin-bottom: 20px;
        background: rgba(255,77,77,0.15); border: 1px solid rgba(255,77,77,0.3);
        border-left: 4px solid #f44336;
        border-radius: 10px; color: #ff8a80; font-size: 13px;
      }
      .lp-alert i { font-size: 16px; flex-shrink: 0; }

      .lp-form { display: flex; flex-direction: column; gap: 20px; }
      .lp-field { display: flex; flex-direction: column; gap: 7px; }
      .lp-label {
        font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.6);
        text-transform: uppercase; letter-spacing: 0.5px;
      }
      .lp-input-wrap { position: relative; display: flex; align-items: center; }
      .lp-input-icon {
        position: absolute; left: 14px;
        font-size: 16px; color: rgba(255,255,255,0.3);
        pointer-events: none;
      }
      .lp-input {
        width: 100%;
        padding: 13px 44px 13px 42px;
        border: 1.5px solid rgba(255,255,255,0.15);
        border-radius: 12px;
        font-size: 14px; font-family: inherit;
        color: white; background: rgba(255,255,255,0.08);
        outline: none;
        transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
      }
      .lp-input::placeholder { color: rgba(255,255,255,0.3); }
      .lp-input:focus {
        border-color: #f5a623;
        background: rgba(255,255,255,0.12);
        box-shadow: 0 0 0 4px rgba(245,166,35,0.12);
      }
      .lp-input:disabled { opacity: 0.5; cursor: not-allowed; }
      .lp-eye-btn {
        position: absolute; right: 14px;
        background: none; border: none; cursor: pointer;
        color: rgba(255,255,255,0.4); font-size: 16px; padding: 0;
        display: flex; align-items: center;
        -webkit-tap-highlight-color: transparent;
      }
      .lp-eye-btn:hover { color: rgba(255,255,255,0.7); }

      .lp-submit {
        width: 100%; padding: 14px;
        background: #f5a623;
        color: #0f1f3d; border: none; border-radius: 12px;
        font-size: 15px; font-weight: 700; font-family: inherit;
        cursor: pointer;
        display: flex; align-items: center; justify-content: center; gap: 8px;
        transition: background 0.2s, box-shadow 0.2s, transform 0.15s;
        position: relative; overflow: hidden;
        margin-top: 4px;
        -webkit-tap-highlight-color: transparent;
      }
      .lp-submit:hover:not(:disabled) {
        background: #e8920a;
        box-shadow: 0 8px 24px rgba(245,166,35,0.4);
        transform: translateY(-1px);
      }
      .lp-submit:active:not(:disabled) { transform: scale(0.98); }
      .lp-submit:disabled { opacity: 0.6; cursor: not-allowed; }
      .lp-submit-loading { background: #e8920a; }

      .lp-spinner {
        width: 16px; height: 16px;
        border: 2px solid rgba(15,31,61,0.3);
        border-top-color: #0f1f3d; border-radius: 50%;
        animation: lp-spin 0.7s linear infinite;
        flex-shrink: 0;
      }
      @keyframes lp-spin { to { transform: rotate(360deg); } }

      .lp-contact-text {
        font-size: 13px; color: rgba(255,255,255,0.4);
        margin-top: 24px;
        display: flex; align-items: center; justify-content: center;
        gap: 6px; flex-wrap: wrap;
      }
      .lp-contact-link {
        color: #25d366; font-weight: 600; text-decoration: none;
        display: inline-flex; align-items: center; gap: 4px;
      }
      .lp-contact-link:hover { text-decoration: underline; }

      /* ══════════ EXPIRED / DEACTIVATED SCREEN ══════════ */
      .lp-expired-wrap {
        margin: auto;
        background: white; border-radius: 20px;
        padding: 52px 40px; text-align: center;
        max-width: 420px; width: 100%;
        box-shadow: 0 20px 60px rgba(0,0,0,0.25);
        animation: lp-rise 0.5s ease both;
      }
      .lp-expired-icon {
        width: 80px; height: 80px; border-radius: 50%;
        background: #fff3e0;
        display: flex; align-items: center; justify-content: center;
        margin: 0 auto 20px; font-size: 36px; color: #f57c00;
      }
      .lp-expired-title {
        font-family: 'Playfair Display', Georgia, serif;
        font-size: 24px; font-weight: 800; color: #0f1f3d; margin-bottom: 12px;
      }
      .lp-expired-body {
        font-size: 14px; color: #64748b; line-height: 1.7; margin-bottom: 28px;
      }
      .lp-wa-btn {
        display: inline-flex; align-items: center; gap: 8px;
        padding: 13px 28px; background: #25d366;
        color: white; border-radius: 12px;
        font-weight: 600; font-size: 15px; text-decoration: none;
        transition: box-shadow 0.2s, transform 0.15s;
      }
      .lp-wa-btn:hover { box-shadow: 0 6px 20px rgba(37,211,102,0.4); transform: translateY(-1px); }
      .lp-back-link {
        display: block; margin-top: 20px;
        background: none; border: none;
        color: #94a3b8; cursor: pointer;
        font-size: 13px; font-family: inherit;
      }
      .lp-back-link:hover { color: #0f1f3d; }

      /* ══════════ RESPONSIVE ══════════ */
      @media (max-width: 768px) {
        .lp-root { flex-direction: column; background: white; }
        .lp-left { display: none; }
        .lp-right {
          flex: 1;
          background: white;
          padding: 40px 24px 48px;
          align-items: flex-start;
          padding-top: 52px;
        }
        .lp-right::before { display: none; }
        .lp-mobile-brand { display: flex; }
        .lp-form-wrap { max-width: 100%; }
        .lp-form-title { font-size: 24px; color: #0f1f3d; }
        .lp-form-subtitle { color: #94a3b8; }
        .lp-label { color: #64748b; }
        .lp-input {
          border-color: #e2e8f0;
          background: #f8fafc;
          color: #0f1f3d;
        }
        .lp-input::placeholder { color: #94a3b8; }
        .lp-input:focus { border-color: #0f1f3d; box-shadow: 0 0 0 4px rgba(15,31,61,0.06); background: white; }
        .lp-input-icon { color: #94a3b8; }
        .lp-eye-btn { color: #94a3b8; }
        .lp-submit { background: #0f1f3d; color: white; }
        .lp-submit:hover:not(:disabled) { background: #1a2f52; box-shadow: 0 8px 24px rgba(15,31,61,0.35); }
        .lp-spinner { border-color: rgba(255,255,255,0.3); border-top-color: white; }
        .lp-contact-text { color: #94a3b8; }
        .lp-alert { background: #ffebee; border-color: #ffcdd2; color: #c62828; }
      }

      @media (max-width: 480px) {
        .lp-right { padding: 36px 20px 40px; }
        .lp-expired-wrap { padding: 40px 24px; margin: 24px; }
      }
    `}</style>
  );
}