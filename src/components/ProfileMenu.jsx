import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../services/config';

// Profile data is cached here for the lifetime of the browser session.
// This prevents a /identity/profile API call on every step-page mount.
const PROFILE_CACHE_KEY = '_cache_profile';
const PROFILE_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

function getCachedProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_CACHE_KEY);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > PROFILE_CACHE_TTL) {
      localStorage.removeItem(PROFILE_CACHE_KEY);
      return null;
    }
    return data;
  } catch { return null; }
}

function setCachedProfile(data) {
  try {
    localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify({ data, ts: Date.now() }));
  } catch { /* storage full */ }
}

// In-flight dedup: if multiple ProfileMenu instances mount at the same time
// (e.g. React StrictMode double-render) only one HTTP request is made.
let _profileInflight = null;

function fetchProfileOnce(token) {
  if (_profileInflight) return _profileInflight;
  _profileInflight = fetch(`${API_BASE_URL}/identity/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then(r => r.json())
    .finally(() => { _profileInflight = null; });
  return _profileInflight;
}

function ProfileMenu() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const [schoolLogo, setSchoolLogo] = useState(localStorage.getItem('school_logo') || '');
  const ref = useRef(null);
  const hoverTimerRef = useRef(null);

  const username = localStorage.getItem('username') || 'User';
  const [subStatus, setSubStatus] = useState('active');
  const [daysLeft, setDaysLeft]   = useState('');
  const [subEnd, setSubEnd]       = useState('');
  const [schoolName, setSchoolName] = useState(localStorage.getItem('school_name') || '');

  const buildInitials = () => {
    const src = (schoolName || username || 'U').trim();
    const words = src.split(/\s+/).filter(Boolean);
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return 'U';
  };
  const initials = buildInitials();

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia)
      setIsTouch(window.matchMedia('(pointer: coarse)').matches);
  }, []);

  // Fetch profile — uses cache so only ONE real HTTP request per 10 minutes,
  // regardless of how many step pages (and therefore TopBar/ProfileMenu mounts) the user visits.
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    const cached = getCachedProfile();
    if (cached) {
      // Populate state from cache instantly — no network call
      applyProfileData(cached);
      return;
    }

    fetchProfileOnce(token)
      .then(data => {
        if (data && !data.detail) {
          setCachedProfile(data);
          applyProfileData(data);
        }
      })
      .catch(() => {});
  }, []);

  const applyProfileData = (data) => {
    if (data.school_logo) {
      setSchoolLogo(data.school_logo);
      localStorage.setItem('school_logo', data.school_logo);
    }
    if (data.school_name) setSchoolName(data.school_name);
    if (data.subscription_status) setSubStatus(data.subscription_status);
    if (data.subscription_end)    setSubEnd(data.subscription_end);
    setDaysLeft(String(data.subscription_days_left ?? ''));
    // Also store subscription info in localStorage so other components can read it
    localStorage.setItem('subscription_status',   data.subscription_status   || '');
    localStorage.setItem('subscription_end',       data.subscription_end       || '');
    localStorage.setItem('subscription_days_left', String(data.subscription_days_left ?? ''));
    if (data.school_name) localStorage.setItem('school_name', data.school_name);
  };

  // Click-outside to close
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target) && !e.target.closest('.pm-sheet'))
        setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const subColor = subStatus === 'expired' ? '#d32f2f' : subStatus === 'expiring_soon' ? '#e65100' : '#2e7d32';
  const subBg    = subStatus === 'expired' ? '#ffebee' : subStatus === 'expiring_soon' ? '#fff3e0' : '#e8f5e9';
  const subIcon  = subStatus === 'expired' ? 'ti-circle-x' : subStatus === 'expiring_soon' ? 'ti-clock' : 'ti-circle-check';
  const subLabel = subStatus === 'expired' ? 'Subscription expired'
                 : subStatus === 'expiring_soon' ? `${daysLeft} days remaining`
                 : 'Subscription active';

  const handleMouseEnter = () => {
    if (isTouch || window.innerWidth <= 768) return;
    clearTimeout(hoverTimerRef.current);
    setOpen(true);
  };
  const handleMouseLeave = () => {
    if (isTouch || window.innerWidth <= 768) return;
    hoverTimerRef.current = setTimeout(() => setOpen(false), 200);
  };
  const handleClick = () => setOpen(p => !p);
  const goTo = (path) => { setOpen(false); navigate(path); };

  const avatarContent = schoolLogo ? (
    <img src={schoolLogo} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
  ) : initials;

  const menuAvatarContent = schoolLogo ? (
    <img src={schoolLogo} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
  ) : initials;

  const menuContent = (
    <>
      <div style={{ padding: '14px 16px', borderBottom: '1px solid #f0f4f8' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%',
            background: 'linear-gradient(135deg,#2196f3,#1565c0)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px', fontWeight: '700', color: 'white', flexShrink: 0,
            overflow: 'hidden',
          }}>
            {menuAvatarContent}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f1f35', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {schoolName || username}
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>@{username}</div>
          </div>
          <button onClick={() => setOpen(false)} className="pm-close-btn">✕</button>
        </div>
      </div>

      <div style={{ padding: '10px 16px', borderBottom: '1px solid #f0f4f8', background: subBg }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <i className={`ti ${subIcon}`} style={{ fontSize: '14px', color: subColor }} />
            <span style={{ fontSize: '12px', fontWeight: '600', color: subColor }}>{subLabel}</span>
          </div>
          {subEnd && <span style={{ fontSize: '11px', color: subColor, opacity: 0.7 }}>{subEnd}</span>}
        </div>
      </div>

      <div style={{ padding: '6px' }}>
        <button onClick={() => goTo('/test-maker/profile')} style={pmItem}>
          <i className="ti ti-user" style={{ fontSize: '15px', color: '#64748b' }} /> My Profile
        </button>
        <button onClick={() => goTo('/test-maker/change-password')} style={pmItem}>
          <i className="ti ti-lock" style={{ fontSize: '15px', color: '#64748b' }} /> Change Password
        </button>
        {localStorage.getItem('user_type') === 'admin' && (
          <button onClick={() => goTo('/admin')} style={pmItem}>
            <i className="ti ti-users" style={{ fontSize: '15px', color: '#2196f3' }} /> User Management
          </button>
        )}
        {(subStatus === 'expired' || subStatus === 'expiring_soon') && (
          <a
            href="https://wa.me/923040427647?text=Hi, I want to renew my PaperCraft subscription."
            target="_blank" rel="noreferrer"
            style={{ ...pmItem, color: '#25d366', textDecoration: 'none', display: 'flex' }}>
            <i className="ti ti-brand-whatsapp" style={{ fontSize: '15px', color: '#25d366' }} /> Renew subscription
          </a>
        )}
        <div style={{ borderTop: '1px solid #f0f4f8', margin: '4px 0' }} />
        <button onClick={() => { localStorage.clear(); window.location.href = '/login'; }} style={{ ...pmItem, color: '#ef4444' }}>
          <i className="ti ti-logout" style={{ fontSize: '15px', color: '#ef4444' }} /> Sign out
        </button>
      </div>
    </>
  );

  return (
    <>
      <style>{`
        .pm-avatar {
          width: 40px; height: 40px; border-radius: 50%;
          background: linear-gradient(135deg, #2196f3, #1565c0);
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 700; color: white;
          border: 2px solid white;
          box-shadow: 0 3px 14px rgba(33,150,243,0.35);
          cursor: pointer; flex-shrink: 0;
          transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s ease;
          position: relative; font-family: 'Segoe UI', system-ui, sans-serif;
          padding: 0; outline: none; overflow: hidden;
        }
        .pm-avatar:hover  { transform: scale(1.06); box-shadow: 0 5px 20px rgba(33,150,243,0.5); }
        .pm-avatar:active { transform: scale(0.96); }
        .pm-status-dot {
          position: absolute; bottom: -1px; right: -1px;
          width: 11px; height: 11px; border-radius: 50%; border: 2px solid white;
          pointer-events: none;
        }
        .pm-dropdown {
          position: absolute; top: calc(100% + 10px); right: 0;
          width: 260px; background: white;
          border: 1px solid #e0e7ef; border-radius: 14px;
          box-shadow: 0 12px 36px rgba(0,0,0,0.14);
          overflow: hidden; animation: pm-fade-in 0.18s ease-out; z-index: 300;
        }
        @keyframes pm-fade-in {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .pm-close-btn {
          display: none; background: #f1f5f9; border: none; border-radius: 50%;
          width: 28px; height: 28px; cursor: pointer;
          font-size: 13px; color: #64748b; flex-shrink: 0;
          align-items: center; justify-content: center;
        }
        .pm-backdrop {
          display: none; position: fixed; inset: 0;
          background: rgba(0,0,0,0.45); z-index: 400; align-items: flex-end;
        }
        .pm-sheet {
          background: white; border-radius: 20px 20px 0 0; width: 100%;
          padding-bottom: calc(16px + env(safe-area-inset-bottom));
          animation: pm-slideup 0.26s cubic-bezier(0.34,1.1,0.64,1); overflow: hidden;
        }
        .pm-sheet-handle {
          width: 36px; height: 4px; border-radius: 2px;
          background: #d1d5db; margin: 10px auto 4px;
        }
        @keyframes pm-slideup {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
        @media (max-width: 768px) {
          .pm-dropdown  { display: none !important; }
          .pm-backdrop  { display: flex; }
          .pm-close-btn { display: flex; }
        }
      `}</style>

      <div
        ref={ref}
        style={{ position: 'relative' }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <button className="pm-avatar" onClick={handleClick} aria-label="Profile menu" aria-expanded={open}>
          {avatarContent}
          <span className="pm-status-dot" style={{ background: subColor }} />
        </button>
        {open && <div className="pm-dropdown">{menuContent}</div>}
      </div>

      {open && (
        <div className="pm-backdrop" onClick={() => setOpen(false)}>
          <div className="pm-sheet" onClick={e => e.stopPropagation()}>
            <div className="pm-sheet-handle" />
            {menuContent}
          </div>
        </div>
      )}
    </>
  );
}

const pmItem = {
  width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
  padding: '11px 16px', background: 'transparent', border: 'none',
  borderRadius: '10px', cursor: 'pointer', fontSize: '14px',
  fontWeight: '500', color: '#334155', textAlign: 'left', fontFamily: 'inherit',
  WebkitTapHighlightColor: 'transparent',
};

export default ProfileMenu;