import React, { useState } from 'react';
import logo from '../assets/logo.png';
import ProfileMenu from '../components/ProfileMenu';

import API_BASE_URL  from '../services/config';
const API = API_BASE_URL

export default function ChangePasswordPage() {
  const [form, setForm] = useState({ previous_password: '', new_password: '', confirm_password: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPrev, setShowPrev] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const token = localStorage.getItem('auth_token');
  const user_code = localStorage.getItem('user_code');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (form.new_password !== form.confirm_password) {
      setError('New passwords do not match');
      return;
    }
    if (form.new_password.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API}/identity/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          user_code,
          previous_password: form.previous_password,
          new_password: form.new_password,
        }),
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

  return (
    <div style={s.page}>
      {/* Logo */}
      <div onClick={() => window.location.href = '/test-maker/step-1'} style={s.logoWrap}>
        <img src={logo} alt="PaperCraft" style={s.logoImg} />
      </div>

      <ProfileMenu />

      <div style={s.inner}>
        {/* Header */}
        <div style={s.header}>
          <button onClick={() => window.history.back()} style={s.backBtn}>
            <i className="ti ti-arrow-left"></i> Back
          </button>
          <div>
            <h1 style={s.title}>Change Password</h1>
            <p style={s.subtitle}>Update your account password</p>
          </div>
        </div>

        <div style={s.card}>
          <div style={s.cardHead}>
            <i className="ti ti-lock" style={{ fontSize: '18px', color: '#2196f3' }}></i>
            <span style={s.cardTitle}>Password</span>
          </div>

          <form onSubmit={handleSubmit} style={s.form}>
            {/* Current password */}
            <div style={s.formGroup}>
              <label style={s.label}>Current Password</label>
              <div style={s.inputWrap}>
                <input
                  type={showPrev ? 'text' : 'password'}
                  value={form.previous_password}
                  onChange={e => setForm(p => ({ ...p, previous_password: e.target.value }))}
                  placeholder="Enter current password"
                  required
                  style={s.input}
                />
                <button type="button" onClick={() => setShowPrev(p => !p)} style={s.eyeBtn}>
                  <i className={`ti ${showPrev ? 'ti-eye-off' : 'ti-eye'}`} style={{ fontSize: '16px', color: '#94a3b8' }}></i>
                </button>
              </div>
            </div>

            {/* New password */}
            <div style={s.formGroup}>
              <label style={s.label}>New Password</label>
              <div style={s.inputWrap}>
                <input
                  type={showNew ? 'text' : 'password'}
                  value={form.new_password}
                  onChange={e => setForm(p => ({ ...p, new_password: e.target.value }))}
                  placeholder="Enter new password"
                  required
                  style={s.input}
                />
                <button type="button" onClick={() => setShowNew(p => !p)} style={s.eyeBtn}>
                  <i className={`ti ${showNew ? 'ti-eye-off' : 'ti-eye'}`} style={{ fontSize: '16px', color: '#94a3b8' }}></i>
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div style={s.formGroup}>
              <label style={s.label}>Confirm New Password</label>
              <div style={s.inputWrap}>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={form.confirm_password}
                  onChange={e => setForm(p => ({ ...p, confirm_password: e.target.value }))}
                  placeholder="Confirm new password"
                  required
                  style={{
                    ...s.input,
                    borderColor: form.confirm_password && form.new_password !== form.confirm_password ? '#f44336' : '#e2e8f0',
                  }}
                />
                <button type="button" onClick={() => setShowConfirm(p => !p)} style={s.eyeBtn}>
                  <i className={`ti ${showConfirm ? 'ti-eye-off' : 'ti-eye'}`} style={{ fontSize: '16px', color: '#94a3b8' }}></i>
                </button>
              </div>
              {form.confirm_password && form.new_password !== form.confirm_password && (
                <span style={{ fontSize: '12px', color: '#f44336', marginTop: '4px' }}>Passwords do not match</span>
              )}
            </div>

            {error && (
              <div style={s.alertError}>
                <i className="ti ti-alert-circle"></i> {error}
              </div>
            )}
            {success && (
              <div style={s.alertSuccess}>
                <i className="ti ti-check"></i> Password changed successfully
              </div>
            )}

            <div style={s.actions}>
              <button type="button" onClick={() => window.history.back()} style={s.btnGhost}>
                Cancel
              </button>
              <button type="submit" disabled={saving} style={{ ...s.btnPrimary, opacity: saving ? 0.6 : 1 }}>
                {saving ? 'Saving...' : <><i className="ti ti-lock-check"></i> Update Password</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: '#f0f4f8', padding: '24px 16px 60px', fontFamily: "'Segoe UI', system-ui, sans-serif" },
  logoWrap: { position: 'fixed', top: '-40px', left: '50px', zIndex: 200, cursor: 'pointer' },
  logoImg: { height: '245px', width: '200px', objectFit: 'contain' },
  inner: { maxWidth: '520px', margin: '60px auto 0' },
  header: { display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '24px' },
  backBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', background: 'white', border: '1px solid #e0e7ef', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#64748b', flexShrink: 0, fontFamily: 'inherit' },
  title: { fontSize: '24px', fontWeight: '800', color: '#0f1f35', margin: '0 0 4px' },
  subtitle: { fontSize: '14px', color: '#64748b', margin: 0 },
  card: { background: 'white', borderRadius: '14px', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' },
  cardHead: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid #f0f4f8' },
  cardTitle: { fontSize: '15px', fontWeight: '700', color: '#0f1f35' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px' },
  inputWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  input: { width: '100%', padding: '10px 42px 10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '9px', fontSize: '14px', fontFamily: 'inherit', outline: 'none', background: 'white', color: '#0f1f35' },
  eyeBtn: { position: 'absolute', right: '12px', background: 'none', border: 'none', cursor: 'pointer', padding: '0', display: 'flex', alignItems: 'center' },
  alertError: { display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 14px', background: '#ffebee', border: '1px solid #ffcdd2', borderRadius: '8px', color: '#c62828', fontSize: '13px' },
  alertSuccess: { display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 14px', background: '#e8f5e9', border: '1px solid #c8e6c9', borderRadius: '8px', color: '#2e7d32', fontSize: '13px' },
  actions: { display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' },
  btnPrimary: { display: 'flex', alignItems: 'center', gap: '7px', padding: '11px 22px', background: 'linear-gradient(135deg,#2196f3,#1565c0)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' },
  btnGhost: { display: 'flex', alignItems: 'center', gap: '7px', padding: '11px 18px', background: 'white', color: '#64748b', border: '1px solid #e0e7ef', borderRadius: '10px', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit' },
};