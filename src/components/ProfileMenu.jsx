import React, { useState, useEffect, useRef } from 'react';

function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const ref = useRef(null);
  const hoverTimerRef = useRef(null);

  const schoolName = localStorage.getItem('school_name') || '';
  const username   = localStorage.getItem('username') || 'User';
  const subStatus  = localStorage.getItem('subscription_status') || 'active';
  const daysLeft   = localStorage.getItem('subscription_days_left') || '';
  const subEnd     = localStorage.getItem('subscription_end') || '';

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

  // Click-outside to close
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const subColor = subStatus === 'expired' ? '#d32f2f' : subStatus === 'expiring_soon' ? '#e65100' : '#2e7d32';
  const subBg    = subStatus === 'expired' ? '#ffebee' : subStatus === 'expiring_soon' ? '#fff3e0' : '#e8f5e9';
  const subIcon  = subStatus === 'expired' ? 'ti-circle-x' : subStatus === 'expiring_soon' ? 'ti-clock' : 'ti-circle-check';
  const subLabel = subStatus === 'expired' ? 'Subscription expired' : subStatus === 'expiring_soon' ? `${daysLeft} days remaining` : 'Subscription active';

  const handleMouseEnter = () => { if (isTouch) return; clearTimeout(hoverTimerRef.current); setOpen(true); };
  const handleMouseLeave = () => { if (isTouch) return; hoverTimerRef.current = setTimeout(() => setOpen(false), 200); };
  const handleClick      = () => { if (isTouch) setOpen(p => !p); };

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
          position: relative;
          font-family: 'Segoe UI', system-ui, sans-serif;
          padding: 0; outline: none;
        }
        .pm-avatar:hover { transform: scale(1.06); box-shadow: 0 5px 20px rgba(33,150,243,0.5); }
        .pm-avatar:focus-visible { box-shadow: 0 0 0 3px rgba(33,150,243,0.35), 0 3px 14px rgba(33,150,243,0.35); }
        .pm-status-dot {
          position: absolute; bottom: -1px; right: -1px;
          width: 11px; height: 11px; border-radius: 50%; border: 2px solid white;
        }
        /* Dropdown anchored to the right edge of the avatar wrapper */
        .pm-dropdown {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          width: 260px;
          background: white;
          border: 1px solid #e0e7ef;
          border-radius: 14px;
          box-shadow: 0 12px 36px rgba(0,0,0,0.14);
          overflow: hidden;
          animation: pm-fade-in 0.18s ease-out;
          z-index: 300;
        }
        @media (max-width: 380px) {
          .pm-dropdown { width: calc(100vw - 28px); }
        }
        @keyframes pm-fade-in {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Relative wrapper — dropdown anchors to this, not to the viewport */}
      <div
        ref={ref}
        style={{ position: 'relative' }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <button
          className="pm-avatar"
          onClick={handleClick}
          aria-label="Profile menu"
          aria-expanded={open}
        >
          {initials}
          <span className="pm-status-dot" style={{ background: subColor }} />
        </button>

        {open && (
          <div className="pm-dropdown">
            {/* User header */}
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #f0f4f8' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  background: 'linear-gradient(135deg,#2196f3,#1565c0)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '14px', fontWeight: '700', color: 'white', flexShrink: 0,
                }}>{initials}</div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f1f35', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {schoolName || username}
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>@{username}</div>
                </div>
              </div>
            </div>

            {/* Subscription row */}
            <div style={{ padding: '10px 16px', borderBottom: '1px solid #f0f4f8', background: subBg }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <i className={`ti ${subIcon}`} style={{ fontSize: '14px', color: subColor }} />
                  <span style={{ fontSize: '12px', fontWeight: '600', color: subColor }}>{subLabel}</span>
                </div>
                {subEnd && <span style={{ fontSize: '11px', color: subColor, opacity: 0.7 }}>{subEnd}</span>}
              </div>
            </div>

            {/* Menu items */}
            <div style={{ padding: '6px' }}>
              <button onClick={() => { setOpen(false); window.location.href = '/test-maker/profile'; }} style={pmItem}>
                <i className="ti ti-user" style={{ fontSize: '15px', color: '#64748b' }} /> My Profile
              </button>
              <button onClick={() => { setOpen(false); window.location.href = '/test-maker/change-password'; }} style={pmItem}>
                <i className="ti ti-lock" style={{ fontSize: '15px', color: '#64748b' }} /> Change Password
              </button>
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
          </div>
        )}
      </div>
    </>
  );
}

const pmItem = {
  width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
  padding: '9px 12px', background: 'transparent', border: 'none',
  borderRadius: '8px', cursor: 'pointer', fontSize: '13px',
  fontWeight: '500', color: '#334155', textAlign: 'left', fontFamily: 'inherit',
};

export default ProfileMenu;