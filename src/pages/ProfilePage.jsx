import React, { useEffect, useState } from 'react';
import logo from '../assets/logo.png';

const API = 'http://localhost:8000';
const WA_NUMBER = '923040427647';

const PROVINCES = ['Punjab', 'Sindh', 'KPK', 'Balochistan', 'Gilgit-Baltistan', 'AJK', 'Islamabad'];

export default function ProfilePage() {
  const [form, setForm] = useState({ school_name: '', owner_name: '', phone_number: '', city: '', province: '' });
  const [original, setOriginal] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [subStatus, setSubStatus] = useState('');
  const [subEnd, setSubEnd] = useState('');
  const [daysLeft, setDaysLeft] = useState(null);

  const token = localStorage.getItem('auth_token');

  useEffect(() => {
    setSubStatus(localStorage.getItem('subscription_status') || '');
    setSubEnd(localStorage.getItem('subscription_end') || '');
    setDaysLeft(localStorage.getItem('subscription_days_left') || null);
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API}/identity/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to load profile');
      const fields = { school_name: data.school_name || '', owner_name: data.owner_name || '', phone_number: data.phone_number || '', city: data.city || '', province: data.province || '' };
      setForm(fields);
      setOriginal(fields);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess(false);
    try {
      const res = await fetch(`${API}/identity/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Update failed');
      // Update localStorage school_name
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

  const isDirty = JSON.stringify(form) !== JSON.stringify(original);

  const subColor = subStatus === 'expired' ? '#d32f2f' : subStatus === 'expiring_soon' ? '#f57c00' : '#2e7d32';
  const subBg = subStatus === 'expired' ? '#ffebee' : subStatus === 'expiring_soon' ? '#fff3e0' : '#e8f5e9';
  const subLabel = subStatus === 'expired' ? 'Expired' : subStatus === 'expiring_soon' ? `Expiring in ${daysLeft} day${daysLeft == 1 ? '' : 's'}` : 'Active';

  return (
    <div style={s.page}>
      {/* Logo - click to go home */}
      <div onClick={() => window.location.href = '/test-maker/step-1'}
        style={{ position: 'fixed', top: '-40px', left: '50px', zIndex: 200, cursor: 'pointer' }}>
        <img src={logo} alt="Logo" style={{ height: '245px', width: '200px', objectFit: 'contain' }} />
      </div>

      <div style={s.inner}>
        {/* Header */}
        <div style={s.header}>
          <button onClick={() => window.history.back()} style={s.backBtn}>
            <i className="ti ti-arrow-left"></i> Back
          </button>
          <div>
            <h1 style={s.title}>My Profile</h1>
            <p style={s.subtitle}>Update your school information</p>
          </div>
        </div>

        {/* Subscription card */}
        {subStatus && (
          <div style={{ ...s.subCard, background: subBg, borderColor: subColor }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <i className={`ti ${subStatus === 'active' ? 'ti-circle-check' : 'ti-clock-off'}`} style={{ fontSize: '20px', color: subColor }}></i>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: subColor, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Subscription</div>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: subColor }}>{subLabel}</div>
                  {subEnd && <div style={{ fontSize: '12px', color: subColor, opacity: 0.8 }}>{subStatus === 'expired' ? 'Ended' : 'Ends'} {subEnd}</div>}
                </div>
              </div>
              {(subStatus === 'expired' || subStatus === 'expiring_soon') && (
                <a href={`https://wa.me/${WA_NUMBER}?text=Hi, I want to renew my PaperCraft subscription.`} target="_blank" rel="noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 18px', background: '#25d366', color: 'white', borderRadius: '8px', fontWeight: '600', fontSize: '13px', textDecoration: 'none' }}>
                  <i className="ti ti-brand-whatsapp"></i>
                  {subStatus === 'expired' ? 'Renew now' : 'Renew early'}
                </a>
              )}
            </div>
          </div>
        )}

        {/* Form card */}
        <div style={s.card}>
          <div style={s.cardHead}>
            <i className="ti ti-building-community" style={{ fontSize: '18px', color: '#2196f3' }}></i>
            <span style={s.cardTitle}>School Information</span>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>Loading...</div>
          ) : (
            <div style={s.formGrid}>
              <div style={s.formGroup}>
                <label style={s.label}>School Name</label>
                <input value={form.school_name} onChange={e => setForm(p => ({ ...p, school_name: e.target.value }))}
                  placeholder="Enter school name" style={s.input} />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Owner / Principal Name</label>
                <input value={form.owner_name} onChange={e => setForm(p => ({ ...p, owner_name: e.target.value }))}
                  placeholder="Enter owner name" style={s.input} />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Phone Number</label>
                <input value={form.phone_number} onChange={e => setForm(p => ({ ...p, phone_number: e.target.value }))}
                  placeholder="e.g. 03001234567" style={s.input} />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>City</label>
                <input value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))}
                  placeholder="Enter city" style={s.input} />
              </div>
              <div style={{ ...s.formGroup, gridColumn: 'span 2' }}>
                <label style={s.label}>Province</label>
                <select value={form.province} onChange={e => setForm(p => ({ ...p, province: e.target.value }))} style={s.input}>
                  <option value="">Select province</option>
                  {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
          )}

          {error && (
            <div style={s.alertError}>
              <i className="ti ti-alert-circle"></i> {error}
            </div>
          )}
          {success && (
            <div style={s.alertSuccess}>
              <i className="ti ti-check"></i> Profile updated successfully
            </div>
          )}

          <div style={s.actions}>
            <button onClick={() => setForm(original)} disabled={!isDirty || saving} style={s.btnGhost}>
              Discard changes
            </button>
            <button onClick={handleSave} disabled={!isDirty || saving || loading} style={{ ...s.btnPrimary, opacity: !isDirty || saving || loading ? 0.5 : 1 }}>
              {saving ? 'Saving...' : <><i className="ti ti-device-floppy"></i> Save changes</>}
            </button>
          </div>
        </div>

        {/* Account card */}
        <div style={s.card}>
          <div style={s.cardHead}>
            <i className="ti ti-lock" style={{ fontSize: '18px', color: '#2196f3' }}></i>
            <span style={s.cardTitle}>Account</span>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
              style={{ ...s.btnGhost, color: '#d32f2f', borderColor: '#ffcdd2' }}>
              <i className="ti ti-logout"></i> Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: '#f0f4f8', padding: '24px 16px 60px', fontFamily: "'Segoe UI', system-ui, sans-serif" },
  logoWrap: { position: 'fixed', top: '12px', left: '16px', zIndex: 200, cursor: 'pointer' },
  logoImg: { height: '44px', width: 'auto', objectFit: 'contain' },
  inner: { maxWidth: '720px', margin: '60px auto 0' },
  header: { display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '24px' },
  backBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', background: 'white', border: '1px solid #e0e7ef', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#64748b', flexShrink: 0, fontFamily: 'inherit' },
  title: { fontSize: '24px', fontWeight: '800', color: '#0f1f35', margin: '0 0 4px' },
  subtitle: { fontSize: '14px', color: '#64748b', margin: 0 },
  subCard: { border: '1.5px solid', borderRadius: '12px', padding: '16px 20px', marginBottom: '16px' },
  card: { background: 'white', borderRadius: '14px', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', marginBottom: '16px' },
  cardHead: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid #f0f4f8' },
  cardTitle: { fontSize: '15px', fontWeight: '700', color: '#0f1f35' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px' },
  input: { padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '9px', fontSize: '14px', fontFamily: 'inherit', outline: 'none', background: 'white', color: '#0f1f35' },
  alertError: { display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 14px', background: '#ffebee', border: '1px solid #ffcdd2', borderRadius: '8px', color: '#c62828', fontSize: '13px', marginBottom: '16px' },
  alertSuccess: { display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 14px', background: '#e8f5e9', border: '1px solid #c8e6c9', borderRadius: '8px', color: '#2e7d32', fontSize: '13px', marginBottom: '16px' },
  actions: { display: 'flex', gap: '10px', justifyContent: 'flex-end' },
  btnPrimary: { display: 'flex', alignItems: 'center', gap: '7px', padding: '11px 22px', background: 'linear-gradient(135deg,#2196f3,#1565c0)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' },
  btnGhost: { display: 'flex', alignItems: 'center', gap: '7px', padding: '11px 18px', background: 'white', color: '#64748b', border: '1px solid #e0e7ef', borderRadius: '10px', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit' },
};