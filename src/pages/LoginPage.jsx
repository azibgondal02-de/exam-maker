import React, { useState } from 'react';

const WA_NUMBER = '923040427647';
import API_BASE_URL from '../services/config';
const API = API_BASE_URL;

// ── Expired screen ───────────────────────────────────────────────────────────
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
        <button onClick={onBack} className="lp-back-link">← Back to login</button>
      </div>
      <LPStyles />
    </div>
  );
}

// ── Main login ───────────────────────────────────────────────────────────────
export default function LoginPage() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPwd,  setShowPwd]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [expired,  setExpired]  = useState(false);

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
      if (!res.ok) throw new Error(data.detail || 'Login failed');
      if (data.access_token) {
        localStorage.setItem('auth_token',            data.access_token);
        localStorage.setItem('user_code',             data.user_code             || '');
        localStorage.setItem('username',              data.username              || '');
        localStorage.setItem('user_type',             data.user_type             || '');
        localStorage.setItem('school_name',           data.school_name           || '');
        localStorage.setItem('subscription_status',   data.subscription_status   || 'active');
        localStorage.setItem('subscription_days_left', data.subscription_days_left ?? '');
        localStorage.setItem('subscription_end',      data.subscription_end      || '');
        if (data.subscription_status === 'expired') { setExpired(true); setLoading(false); return; }
        window.location.href = '/test-maker';
      } else throw new Error('No token received');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (expired) return <ExpiredScreen onBack={() => setExpired(false)} />;

  return (
    <div className="lp-root">

      {/* ── Left panel — brand ── */}
      <div className="lp-left">
        {/* Animated grid lines */}
        <div className="lp-grid" aria-hidden="true">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="lp-grid-line lp-grid-h" style={{ top: `${12.5 * i}%`, animationDelay: `${i * 0.15}s` }} />
          ))}
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="lp-grid-line lp-grid-v" style={{ left: `${16.6 * i}%`, animationDelay: `${i * 0.2}s` }} />
          ))}
        </div>

        {/* Glow blob */}
        <div className="lp-blob" aria-hidden="true" />

        {/* Content */}
        <div className="lp-left-content">
          {/* Logo mark */}
          <div className="lp-mark" onClick={() => window.location.href = '/'}>
            <div className="lp-mark-corner" />
            <span className="lp-mark-p">P</span>
          </div>

          <div className="lp-brand-text">
            <h1 className="lp-brand-name">PaperCraft</h1>
            <p className="lp-brand-tagline">Pakistan's Best<br />Assessment Program</p>
          </div>

          {/* Feature pills */}
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

      {/* ── Right panel — form ── */}
      <div className="lp-right">
        <div className="lp-form-wrap">

          {/* Mobile logo */}
          <div className="lp-mobile-brand">
            <div className="lp-mark lp-mark-sm" onClick={() => window.location.href = '/'}>
              <div className="lp-mark-corner" />
              <span className="lp-mark-p" style={{ fontSize: '20px' }}>P</span>
            </div>
            <div>
              <div className="lp-mobile-name">PaperCraft</div>
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
            {/* Email */}
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

            {/* Password */}
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

            {/* Submit */}
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

// ── Styles component ─────────────────────────────────────────────────────────
function LPStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');

      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

      /* ── Root ── */
      .lp-root {
        min-height: 100vh;
        display: flex;
        font-family: 'DM Sans', 'Segoe UI', system-ui, sans-serif;
        background: #0a1628;
      }

      /* ══════════ LEFT PANEL ══════════ */
      .lp-left {
        flex: 0 0 46%;
        background: #0f1f3d;
        position: relative;
        overflow: hidden;
        display: flex;
        align-items: center;
        padding: 60px 52px;
      }

      /* Animated grid */
      .lp-grid { position: absolute; inset: 0; }
      .lp-grid-line {
        position: absolute;
        background: rgba(255,255,255,0.04);
        animation: lp-grid-fade 1.2s ease forwards;
        opacity: 0;
      }
      .lp-grid-h { left: 0; right: 0; height: 1px; }
      .lp-grid-v { top: 0; bottom: 0; width: 1px; }
      @keyframes lp-grid-fade {
        from { opacity: 0; }
        to   { opacity: 1; }
      }

      /* Glow blob */
      .lp-blob {
        position: absolute;
        width: 420px; height: 420px;
        background: radial-gradient(circle, rgba(245,166,35,0.12) 0%, transparent 70%);
        top: -80px; right: -80px;
        border-radius: 50%;
        animation: lp-pulse 4s ease-in-out infinite;
      }
      @keyframes lp-pulse {
        0%, 100% { transform: scale(1);   opacity: 1; }
        50%       { transform: scale(1.1); opacity: 0.7; }
      }

      /* Left content */
      .lp-left-content {
        position: relative;
        z-index: 1;
        display: flex;
        flex-direction: column;
        gap: 32px;
      }

      /* Logo mark */
      .lp-mark {
        width: 64px; height: 64px;
        background: white;
        border-radius: 16px;
        display: flex; align-items: center; justify-content: center;
        position: relative; overflow: hidden;
        cursor: pointer;
        box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        animation: lp-drop 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards;
        flex-shrink: 0;
      }
      .lp-mark-sm { width: 44px; height: 44px; border-radius: 11px; animation: none; }
      @keyframes lp-drop {
        from { transform: translateY(-20px); opacity: 0; }
        to   { transform: translateY(0);     opacity: 1; }
      }
      .lp-mark-corner {
        position: absolute; top: 0; right: 0;
        width: 0; height: 0; border-style: solid;
        border-width: 0 20px 20px 0;
        border-color: transparent #f5a623 transparent transparent;
      }
      .lp-mark-sm .lp-mark-corner {
        border-width: 0 14px 14px 0;
      }
      .lp-mark-p {
        color: #0f1f3d; font-size: 32px; font-weight: 700;
        font-family: 'Playfair Display', Georgia, serif;
        position: relative; z-index: 1;
      }

      /* Brand text */
      .lp-brand-text { animation: lp-rise 0.7s 0.2s ease both; }
      @keyframes lp-rise {
        from { transform: translateY(16px); opacity: 0; }
        to   { transform: translateY(0);    opacity: 1; }
      }
      .lp-brand-name {
        font-family: 'Playfair Display', Georgia, serif;
        font-size: clamp(32px, 4vw, 44px);
        font-weight: 800;
        color: white;
        line-height: 1.1;
        letter-spacing: -0.5px;
      }
      .lp-brand-tagline {
        font-size: 15px;
        color: rgba(255,255,255,0.5);
        margin-top: 10px;
        line-height: 1.7;
        font-weight: 400;
      }

      /* Feature pills */
      .lp-pills { display: flex; flex-direction: column; gap: 10px; }
      .lp-pill {
        display: inline-flex; align-items: center; gap: 8px;
        padding: 8px 14px;
        background: rgba(255,255,255,0.06);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 20px;
        color: rgba(255,255,255,0.75);
        font-size: 13px; font-weight: 500;
        width: fit-content;
        animation: lp-rise 0.6s ease both;
      }
      .lp-pill i { color: #f5a623; font-size: 14px; }

      /* Footer */
      .lp-left-footer {
        font-size: 13px; color: rgba(255,255,255,0.4);
        display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
      }
      .lp-wa-inline {
        color: #25d366; text-decoration: none; font-weight: 600;
        display: inline-flex; align-items: center; gap: 4px;
      }
      .lp-wa-inline:hover { text-decoration: underline; }

      /* ══════════ RIGHT PANEL ══════════ */
      .lp-right {
        flex: 1;
        background: white;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 48px 40px;
        position: relative;
      }
      /* Subtle top-right decoration */
      .lp-right::before {
        content: '';
        position: absolute;
        top: 0; right: 0;
        width: 200px; height: 200px;
        background: radial-gradient(circle at top right, rgba(245,166,35,0.06), transparent 70%);
        pointer-events: none;
      }

      .lp-form-wrap {
        width: 100%;
        max-width: 380px;
        animation: lp-rise 0.5s 0.1s ease both;
      }

      /* Mobile brand (hidden on desktop) */
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

      /* Form header */
      .lp-form-header { margin-bottom: 28px; }
      .lp-form-title {
        font-family: 'Playfair Display', Georgia, serif;
        font-size: 28px; font-weight: 800; color: #0f1f3d;
        letter-spacing: -0.3px; margin-bottom: 6px;
      }
      .lp-form-subtitle { font-size: 14px; color: #94a3b8; }

      /* Alert */
      .lp-alert {
        display: flex; align-items: center; gap: 10px;
        padding: 12px 16px; margin-bottom: 20px;
        background: #ffebee; border: 1px solid #ffcdd2;
        border-left: 4px solid #f44336;
        border-radius: 10px; color: #c62828; font-size: 13px;
      }
      .lp-alert i { font-size: 16px; flex-shrink: 0; }

      /* Form */
      .lp-form { display: flex; flex-direction: column; gap: 20px; }
      .lp-field { display: flex; flex-direction: column; gap: 7px; }
      .lp-label {
        font-size: 12px; font-weight: 600; color: #64748b;
        text-transform: uppercase; letter-spacing: 0.5px;
      }
      .lp-input-wrap { position: relative; display: flex; align-items: center; }
      .lp-input-icon {
        position: absolute; left: 14px;
        font-size: 16px; color: #94a3b8;
        pointer-events: none;
      }
      .lp-input {
        width: 100%;
        padding: 13px 44px 13px 42px;
        border: 1.5px solid #e2e8f0;
        border-radius: 12px;
        font-size: 14px; font-family: inherit;
        color: #0f1f3d; background: #f8fafc;
        outline: none;
        transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
      }
      .lp-input:focus {
        border-color: #0f1f3d;
        background: white;
        box-shadow: 0 0 0 4px rgba(15,31,61,0.06);
      }
      .lp-input:disabled { opacity: 0.5; cursor: not-allowed; }
      .lp-eye-btn {
        position: absolute; right: 14px;
        background: none; border: none; cursor: pointer;
        color: #94a3b8; font-size: 16px; padding: 0;
        display: flex; align-items: center;
        -webkit-tap-highlight-color: transparent;
      }
      .lp-eye-btn:hover { color: #64748b; }

      /* Submit */
      .lp-submit {
        width: 100%; padding: 14px;
        background: #0f1f3d;
        color: white; border: none; border-radius: 12px;
        font-size: 15px; font-weight: 600; font-family: inherit;
        cursor: pointer;
        display: flex; align-items: center; justify-content: center; gap: 8px;
        transition: background 0.2s, box-shadow 0.2s, transform 0.15s;
        position: relative; overflow: hidden;
        margin-top: 4px;
        -webkit-tap-highlight-color: transparent;
      }
      .lp-submit::after {
        content: '';
        position: absolute; inset: 0;
        background: linear-gradient(135deg, rgba(245,166,35,0.15), transparent);
        opacity: 0; transition: opacity 0.2s;
      }
      .lp-submit:hover:not(:disabled) {
        background: #1a2f52;
        box-shadow: 0 8px 24px rgba(15,31,61,0.35);
        transform: translateY(-1px);
      }
      .lp-submit:hover::after { opacity: 1; }
      .lp-submit:active:not(:disabled) { transform: scale(0.98); }
      .lp-submit:disabled { opacity: 0.6; cursor: not-allowed; }
      .lp-submit-loading { background: #1a2f52; }

      /* Spinner */
      .lp-spinner {
        width: 16px; height: 16px;
        border: 2px solid rgba(255,255,255,0.3);
        border-top-color: white; border-radius: 50%;
        animation: lp-spin 0.7s linear infinite;
        flex-shrink: 0;
      }
      @keyframes lp-spin { to { transform: rotate(360deg); } }

      /* Contact */
      .lp-contact-text {
        font-size: 13px; color: #94a3b8;
        margin-top: 24px;
        display: flex; align-items: center; justify-content: center;
        gap: 6px; flex-wrap: wrap;
      }
      .lp-contact-link {
        color: #25d366; font-weight: 600; text-decoration: none;
        display: inline-flex; align-items: center; gap: 4px;
      }
      .lp-contact-link:hover { text-decoration: underline; }

      /* ══════════ EXPIRED SCREEN ══════════ */
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
        /* Stack panels */
        .lp-root { flex-direction: column; background: white; }

        /* Hide left panel */
        .lp-left { display: none; }

        /* Right takes full screen */
        .lp-right {
          flex: 1;
          padding: 40px 24px 48px;
          align-items: flex-start;
          padding-top: 52px;
        }
        .lp-right::before { display: none; }

        /* Show mobile brand */
        .lp-mobile-brand { display: flex; }

        .lp-form-wrap { max-width: 100%; }
        .lp-form-title { font-size: 24px; }
      }

      @media (max-width: 480px) {
        .lp-right { padding: 36px 20px 40px; }
        .lp-expired-wrap { padding: 40px 24px; margin: 24px; }
      }
    `}</style>
  );
}