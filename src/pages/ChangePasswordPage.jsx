import React, { useState } from 'react';
import TopBar from '../components/TopBar';

import API_BASE_URL from '../services/config';
const API = API_BASE_URL;

export default function ChangePasswordPage() {
  const [form, setForm] = useState({ previous_password: '', new_password: '', confirm_password: '' });
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState('');
  const [success,     setSuccess]     = useState(false);
  const [showPrev,    setShowPrev]    = useState(false);
  const [showNew,     setShowNew]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const token     = localStorage.getItem('auth_token');
  const user_code = localStorage.getItem('user_code');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(false);
    if (form.new_password !== form.confirm_password) { setError('New passwords do not match'); return; }
    if (form.new_password.length < 6) { setError('New password must be at least 6 characters'); return; }
    setSaving(true);
    try {
      const res  = await fetch(`${API}/identity/reset-password`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ user_code, previous_password: form.previous_password, new_password: form.new_password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to change password');
      setSuccess(true);
      setForm({ previous_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const passwordMismatch = form.confirm_password && form.new_password !== form.confirm_password;

  const fields = [
    { key: 'previous_password', label: 'Current Password',      placeholder: 'Enter current password',  show: showPrev,    toggle: () => setShowPrev(p => !p) },
    { key: 'new_password',      label: 'New Password',          placeholder: 'Enter new password',       show: showNew,     toggle: () => setShowNew(p => !p) },
    { key: 'confirm_password',  label: 'Confirm New Password',  placeholder: 'Confirm new password',     show: showConfirm, toggle: () => setShowConfirm(p => !p) },
  ];

  return (
    <div className="cp-page">
      <TopBar />

      <div className="cp-inner">

        {/* Header */}
        <div className="cp-header">
          <button onClick={() => window.history.back()} className="cp-back-btn">
            <i className="ti ti-arrow-left" /> Back
          </button>
          <div>
            <h1 className="cp-title">Change Password</h1>
            <p className="cp-subtitle">Update your account password</p>
          </div>
        </div>

        {/* Card */}
        <div className="cp-card">
          <div className="cp-card-head">
            <i className="ti ti-lock" style={{ fontSize: '18px', color: '#2196f3' }} />
            <span className="cp-card-title">Password</span>
          </div>

          <form onSubmit={handleSubmit} className="cp-form">
            {fields.map(({ key, label, placeholder, show, toggle }) => (
              <div key={key} className="cp-form-group">
                <label className="cp-label">{label}</label>
                <div className="cp-input-wrap">
                  <input
                    type={show ? 'text' : 'password'}
                    value={form[key]}
                    onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                    placeholder={placeholder}
                    required
                    className="cp-input"
                    style={key === 'confirm_password' && passwordMismatch
                      ? { borderColor: '#f44336' }
                      : undefined
                    }
                  />
                  <button type="button" onClick={toggle} className="cp-eye-btn" aria-label="Toggle visibility">
                    <i className={`ti ${show ? 'ti-eye-off' : 'ti-eye'}`} style={{ fontSize: '16px', color: '#94a3b8' }} />
                  </button>
                </div>
                {key === 'confirm_password' && passwordMismatch && (
                  <span className="cp-mismatch">Passwords do not match</span>
                )}
              </div>
            ))}

            {error && (
              <div className="cp-alert cp-alert-error">
                <i className="ti ti-alert-circle" /> {error}
              </div>
            )}
            {success && (
              <div className="cp-alert cp-alert-success">
                <i className="ti ti-check" /> Password changed successfully
              </div>
            )}

            <div className="cp-actions">
              <button type="button" onClick={() => window.history.back()} className="cp-btn-ghost">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="cp-btn-primary" style={{ opacity: saving ? 0.6 : 1 }}>
                {saving ? 'Saving...' : <><i className="ti ti-lock-check" /> Update Password</>}
              </button>
            </div>
          </form>
        </div>

      </div>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; }

        .cp-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f0f4f8 0%, #e8eef5 100%);
          padding: 24px 20px 60px;
          font-family: 'Segoe UI', system-ui, sans-serif;
        }

        /* Clears the 64px fixed TopBar */
        .cp-inner {
          max-width: 520px;
          margin: 80px auto 0;
        }

        /* ── Header ── */
        .cp-header {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 24px;
        }
        .cp-back-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 9px 16px;
          background: white; border: 1px solid #e0e7ef;
          border-radius: 10px; cursor: pointer;
          font-size: 13px; font-weight: 600; color: #64748b;
          flex-shrink: 0; font-family: inherit;
          white-space: nowrap;
          -webkit-tap-highlight-color: transparent;
        }
        .cp-back-btn:active { background: #f8fafc; }
        .cp-title    { font-size: 24px; font-weight: 800; color: #0f1f35; margin: 0 0 4px; }
        .cp-subtitle { font-size: 14px; color: #64748b; margin: 0; }

        /* ── Card ── */
        .cp-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.06);
          border: 1px solid rgba(0,0,0,0.04);
        }
        .cp-card-head {
          display: flex; align-items: center; gap: 8px;
          margin-bottom: 20px;
          padding-bottom: 14px;
          border-bottom: 1px solid #f0f4f8;
        }
        .cp-card-title { font-size: 15px; font-weight: 700; color: #0f1f35; }

        /* ── Form ── */
        .cp-form       { display: flex; flex-direction: column; gap: 16px; }
        .cp-form-group { display: flex; flex-direction: column; gap: 6px; }
        .cp-label {
          font-size: 12px; font-weight: 700; color: #64748b;
          text-transform: uppercase; letter-spacing: 0.4px;
        }
        .cp-input-wrap { position: relative; display: flex; align-items: center; }
        .cp-input {
          width: 100%;
          padding: 11px 44px 11px 14px;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          font-size: 14px; font-family: inherit;
          outline: none; background: white; color: #0f1f35;
          transition: border-color 0.15s;
        }
        .cp-input:focus { border-color: #2196f3; }
        .cp-eye-btn {
          position: absolute; right: 12px;
          background: none; border: none; cursor: pointer;
          padding: 0; display: flex; align-items: center;
          -webkit-tap-highlight-color: transparent;
        }
        .cp-mismatch { font-size: 12px; color: #f44336; margin-top: 2px; }

        /* ── Alerts ── */
        .cp-alert {
          display: flex; align-items: center; gap: 8px;
          padding: 11px 14px; border-radius: 10px; font-size: 13px;
        }
        .cp-alert-error   { background: #ffebee; border: 1px solid #ffcdd2; color: #c62828; }
        .cp-alert-success { background: #e8f5e9; border: 1px solid #c8e6c9; color: #2e7d32; }

        /* ── Actions ── */
        .cp-actions {
          display: flex; gap: 10px;
          justify-content: flex-end;
          margin-top: 4px;
          flex-wrap: wrap;
        }
        .cp-btn-primary {
          display: flex; align-items: center; gap: 7px;
          padding: 11px 22px;
          background: linear-gradient(135deg, #2196f3, #1565c0);
          color: white; border: none; border-radius: 10px;
          font-size: 14px; font-weight: 700; cursor: pointer;
          font-family: inherit; white-space: nowrap;
          -webkit-tap-highlight-color: transparent;
          transition: box-shadow 0.2s;
        }
        .cp-btn-primary:hover { box-shadow: 0 4px 16px rgba(33,150,243,0.4); }
        .cp-btn-ghost {
          display: flex; align-items: center; gap: 7px;
          padding: 11px 18px;
          background: white; color: #64748b;
          border: 1px solid #e0e7ef; border-radius: 10px;
          font-size: 14px; cursor: pointer;
          font-family: inherit; white-space: nowrap;
          -webkit-tap-highlight-color: transparent;
        }
        .cp-btn-ghost:hover { background: #f8fafc; }

        /* ══════════ TABLET (≤768px) ══════════ */
        @media (max-width: 768px) {
          .cp-page  { padding: 24px 16px 48px; }
          .cp-inner { margin-top: 72px; }
        }

        /* ══════════ MOBILE (≤480px) ══════════ */
        @media (max-width: 480px) {
          .cp-page  { padding: 16px 12px 48px; }
          .cp-inner { margin-top: 68px; }

          /* Stack header */
          .cp-header { flex-direction: column; gap: 10px; margin-bottom: 18px; }
          .cp-title    { font-size: 20px; }
          .cp-subtitle { font-size: 13px; }

          /* Card padding tighter */
          .cp-card { padding: 18px 14px; border-radius: 14px; }

          /* Buttons stack full-width */
          .cp-actions { flex-direction: column-reverse; }
          .cp-btn-primary,
          .cp-btn-ghost { width: 100%; justify-content: center; }
        }

        /* ══════════ TINY (≤380px) ══════════ */
        @media (max-width: 380px) {
          .cp-page { padding: 12px 10px 48px; }
          .cp-back-btn { padding: 8px 12px; font-size: 12px; }
        }
      `}</style>
    </div>
  );
}