import React, { useEffect, useState } from 'react';
import Logo from '../components/Logo.jsx';
import TopBar from '../components/TopBar.jsx';

import API_BASE_URL from '../services/config';
const API = API_BASE_URL;
const WA_NUMBER = '923040427647';

const PROVINCES = ['Punjab', 'Sindh', 'KPK', 'Balochistan', 'Gilgit-Baltistan', 'AJK', 'Islamabad'];

export default function ProfilePage() {
  const [form,     setForm]     = useState({ school_name: '', owner_name: '', phone_number: '', city: '', province: '' });
  const [original, setOriginal] = useState({});
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [error,    setError]    = useState('');
  const [subStatus, setSubStatus] = useState('');
  const [subEnd,    setSubEnd]    = useState('');
  const [daysLeft,  setDaysLeft]  = useState(null);

  const token = localStorage.getItem('auth_token');

  useEffect(() => {
    setSubStatus(localStorage.getItem('subscription_status') || '');
    setSubEnd(localStorage.getItem('subscription_end') || '');
    setDaysLeft(localStorage.getItem('subscription_days_left') || null);
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res  = await fetch(`${API}/identity/profile`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to load profile');
      const fields = {
        school_name:  data.school_name  || '',
        owner_name:   data.owner_name   || '',
        phone_number: data.phone_number || '',
        city:         data.city         || '',
        province:     data.province     || '',
      };
      setForm(fields);
      setOriginal(fields);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true); setError(''); setSuccess(false);
    try {
      const res  = await fetch(`${API}/identity/profile`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Update failed');
      localStorage.setItem('school_name', form.school_name);
      setOriginal(form);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const isDirty   = JSON.stringify(form) !== JSON.stringify(original);
  const subColor  = subStatus === 'expired' ? '#d32f2f' : subStatus === 'expiring_soon' ? '#f57c00' : '#2e7d32';
  const subBg     = subStatus === 'expired' ? '#ffebee' : subStatus === 'expiring_soon' ? '#fff3e0' : '#e8f5e9';
  const subLabel  = subStatus === 'expired'
    ? 'Expired'
    : subStatus === 'expiring_soon'
      ? `Expiring in ${daysLeft} day${daysLeft == 1 ? '' : 's'}`
      : 'Active';

  return (
    <div className="pp-page">
      <TopBar />

      <div className="pp-inner">

        {/* Header */}
        <div className="pp-header">
          <button onClick={() => window.history.back()} className="pp-back-btn">
            <i className="ti ti-arrow-left" /> Back
          </button>
          <div>
            <h1 className="pp-title">My Profile</h1>
            <p className="pp-subtitle">Update your school information</p>
          </div>
        </div>

        {/* Subscription card */}
        {subStatus && (
          <div className="pp-sub-card" style={{ background: subBg, borderColor: subColor }}>
            <div className="pp-sub-inner">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <i
                  className={`ti ${subStatus === 'active' ? 'ti-circle-check' : 'ti-clock-off'}`}
                  style={{ fontSize: '22px', color: subColor, flexShrink: 0 }}
                />
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: subColor, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Subscription</div>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: subColor }}>{subLabel}</div>
                  {subEnd && (
                    <div style={{ fontSize: '12px', color: subColor, opacity: 0.8 }}>
                      {subStatus === 'expired' ? 'Ended' : 'Ends'} {subEnd}
                    </div>
                  )}
                </div>
              </div>
              {(subStatus === 'expired' || subStatus === 'expiring_soon') && (
                <a
                  href={`https://wa.me/${WA_NUMBER}?text=Hi, I want to renew my PaperCraft subscription.`}
                  target="_blank" rel="noreferrer"
                  className="pp-renew-btn"
                >
                  <i className="ti ti-brand-whatsapp" />
                  {subStatus === 'expired' ? 'Renew now' : 'Renew early'}
                </a>
              )}
            </div>
          </div>
        )}

        {/* Form card */}
        <div className="pp-card">
          <div className="pp-card-head">
            <i className="ti ti-building-community" style={{ fontSize: '18px', color: '#2196f3' }} />
            <span className="pp-card-title">School Information</span>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>Loading...</div>
          ) : (
            <div className="pp-form-grid">
              {[
                { key: 'school_name',  label: 'School Name',              placeholder: 'Enter school name'   },
                { key: 'owner_name',   label: 'Owner / Principal Name',   placeholder: 'Enter owner name'    },
                { key: 'phone_number', label: 'Phone Number',             placeholder: 'e.g. 03001234567'    },
                { key: 'city',         label: 'City',                     placeholder: 'Enter city'          },
              ].map(({ key, label, placeholder }) => (
                <div key={key} className="pp-form-group">
                  <label className="pp-label">{label}</label>
                  <input
                    value={form[key]}
                    onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="pp-input"
                  />
                </div>
              ))}

              {/* Province — full width */}
              <div className="pp-form-group pp-full">
                <label className="pp-label">Province</label>
                <select
                  value={form.province}
                  onChange={e => setForm(p => ({ ...p, province: e.target.value }))}
                  className="pp-input"
                >
                  <option value="">Select province</option>
                  {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
          )}

          {error && (
            <div className="pp-alert pp-alert-error">
              <i className="ti ti-alert-circle" /> {error}
            </div>
          )}
          {success && (
            <div className="pp-alert pp-alert-success">
              <i className="ti ti-check" /> Profile updated successfully
            </div>
          )}

          <div className="pp-actions">
            <button onClick={() => setForm(original)} disabled={!isDirty || saving} className="pp-btn-ghost">
              Discard
            </button>
            <button
              onClick={handleSave}
              disabled={!isDirty || saving || loading}
              className="pp-btn-primary"
              style={{ opacity: !isDirty || saving || loading ? 0.5 : 1 }}
            >
              {saving ? 'Saving...' : <><i className="ti ti-device-floppy" /> Save changes</>}
            </button>
          </div>
        </div>

        {/* Account card */}
        <div className="pp-card">
          <div className="pp-card-head">
            <i className="ti ti-lock" style={{ fontSize: '18px', color: '#2196f3' }} />
            <span className="pp-card-title">Account</span>
          </div>
          <button
            onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
            className="pp-btn-ghost"
            style={{ color: '#d32f2f', borderColor: '#ffcdd2' }}
          >
            <i className="ti ti-logout" /> Sign out
          </button>
        </div>

      </div>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; }

        .pp-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f0f4f8 0%, #e8eef5 100%);
          padding: 24px 20px 60px;
          font-family: 'Segoe UI', system-ui, sans-serif;
        }

        /* Clears the fixed TopBar (64px) */
        .pp-inner {
          max-width: 720px;
          margin: 80px auto 0;
        }

        /* ── Header ── */
        .pp-header {
          display: flex;
          align-items: flex-start;
          gap: '16px';
          margin-bottom: 24px;
          gap: 16px;
        }
        .pp-back-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 9px 16px;
          background: white; border: 1px solid #e0e7ef;
          border-radius: 10px; cursor: pointer;
          font-size: 13px; font-weight: 600; color: #64748b;
          flex-shrink: 0; font-family: inherit;
          white-space: nowrap;
          -webkit-tap-highlight-color: transparent;
        }
        .pp-back-btn:active { background: #f8fafc; }
        .pp-title    { font-size: 24px; font-weight: 800; color: #0f1f35; margin: 0 0 4px; }
        .pp-subtitle { font-size: 14px; color: #64748b; margin: 0; }

        /* ── Subscription card ── */
        .pp-sub-card {
          border: 1.5px solid;
          border-radius: 14px;
          padding: 16px 20px;
          margin-bottom: 16px;
        }
        .pp-sub-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }
        .pp-renew-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 10px 18px;
          background: #25d366; color: white;
          border-radius: 10px; font-weight: 600;
          font-size: 13px; text-decoration: none;
          white-space: nowrap;
          -webkit-tap-highlight-color: transparent;
        }

        /* ── Cards ── */
        .pp-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.06);
          margin-bottom: 16px;
          border: 1px solid rgba(0,0,0,0.04);
        }
        .pp-card-head {
          display: flex; align-items: center; gap: 8px;
          margin-bottom: 20px;
          padding-bottom: 14px;
          border-bottom: 1px solid #f0f4f8;
        }
        .pp-card-title { font-size: 15px; font-weight: 700; color: #0f1f35; }

        /* ── Form ── */
        .pp-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 20px;
        }
        .pp-full { grid-column: span 2; }
        .pp-form-group { display: flex; flex-direction: column; gap: 6px; }
        .pp-label {
          font-size: 12px; font-weight: 700; color: #64748b;
          text-transform: uppercase; letter-spacing: 0.4px;
        }
        .pp-input {
          padding: 10px 14px;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          font-size: 14px; font-family: inherit;
          outline: none; background: white; color: #0f1f35;
          width: 100%;
          transition: border-color 0.15s;
        }
        .pp-input:focus { border-color: #2196f3; }

        /* ── Alerts ── */
        .pp-alert {
          display: flex; align-items: center; gap: 8px;
          padding: 11px 14px; border-radius: 10px;
          font-size: 13px; margin-bottom: 16px;
        }
        .pp-alert-error   { background: #ffebee; border: 1px solid #ffcdd2; color: #c62828; }
        .pp-alert-success { background: #e8f5e9; border: 1px solid #c8e6c9; color: #2e7d32; }

        /* ── Actions ── */
        .pp-actions {
          display: flex; gap: 10px; justify-content: flex-end; flex-wrap: wrap;
        }
        .pp-btn-primary {
          display: flex; align-items: center; gap: 7px;
          padding: 11px 22px;
          background: linear-gradient(135deg, #2196f3, #1565c0);
          color: white; border: none; border-radius: 10px;
          font-size: 14px; font-weight: 700; cursor: pointer;
          font-family: inherit; white-space: nowrap;
          -webkit-tap-highlight-color: transparent;
          transition: box-shadow 0.2s;
        }
        .pp-btn-primary:hover { box-shadow: 0 4px 16px rgba(33,150,243,0.4); }
        .pp-btn-ghost {
          display: flex; align-items: center; gap: 7px;
          padding: 11px 18px;
          background: white; color: #64748b;
          border: 1px solid #e0e7ef; border-radius: 10px;
          font-size: 14px; cursor: pointer;
          font-family: inherit; white-space: nowrap;
          -webkit-tap-highlight-color: transparent;
        }
        .pp-btn-ghost:hover { background: #f8fafc; }

        /* ══════════ TABLET (≤768px) ══════════ */
        @media (max-width: 768px) {
          .pp-page  { padding: 24px 16px 48px; }
          .pp-inner { margin-top: 72px; }
        }

        /* ══════════ MOBILE (≤560px) ══════════ */
        @media (max-width: 560px) {
          .pp-page  { padding: 16px 12px 48px; }
          .pp-inner { margin-top: 68px; }

          /* Stack header vertically */
          .pp-header { flex-direction: column; gap: 10px; margin-bottom: 18px; }
          .pp-title    { font-size: 20px; }
          .pp-subtitle { font-size: 13px; }

          /* Single column form */
          .pp-form-grid { grid-template-columns: 1fr; gap: 12px; }
          .pp-full { grid-column: span 1; }

          /* Card padding tighter */
          .pp-card { padding: 18px 14px; border-radius: 14px; }

          /* Actions stack full-width */
          .pp-actions { flex-direction: column-reverse; }
          .pp-btn-primary,
          .pp-btn-ghost { width: 100%; justify-content: center; }

          /* Renew button full-width on tiny screens */
          .pp-renew-btn { width: 100%; justify-content: center; }
        }

        /* ══════════ TINY (≤380px) ══════════ */
        @media (max-width: 380px) {
          .pp-page { padding: 12px 10px 48px; }
          .pp-back-btn { padding: 8px 12px; font-size: 12px; }
        }
      `}</style>
    </div>
  );
}