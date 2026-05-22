import React, { useState, useEffect, useRef } from 'react';

function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const schoolName = localStorage.getItem('school_name') || '';
  const username = localStorage.getItem('username') || 'User';
  const subStatus = localStorage.getItem('subscription_status') || 'active';
  const daysLeft = localStorage.getItem('subscription_days_left') || '';
  const subEnd = localStorage.getItem('subscription_end') || '';
  const initials = (schoolName || username).slice(0, 2).toUpperCase();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const subColor = subStatus === 'expired' ? '#d32f2f' : subStatus === 'expiring_soon' ? '#e65100' : '#2e7d32';
  const subBg   = subStatus === 'expired' ? '#ffebee' : subStatus === 'expiring_soon' ? '#fff3e0' : '#e8f5e9';
  const subIcon = subStatus === 'expired' ? 'ti-circle-x' : subStatus === 'expiring_soon' ? 'ti-clock' : 'ti-circle-check';
  const subLabel = subStatus === 'expired' ? 'Subscription expired' : subStatus === 'expiring_soon' ? `${daysLeft} days remaining` : 'Subscription active';

  return (
    <div ref={ref} style={{ position: 'fixed', top: '40px', right: '36px', zIndex: 200 }}>
      {/* Trigger */}
      <button onClick={() => setOpen(p => !p)} style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '5px 10px 5px 5px', background: 'white',
        border: '1px solid #e0e7ef', borderRadius: '50px',
        cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
      }}>
        <div style={{
          width: '30px', height: '30px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #2196f3, #1565c0)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '11px', fontWeight: '700', color: 'white', flexShrink: 0,
        }}>{initials}</div>
        <span style={{ fontSize: '13px', fontWeight: '600', color: '#334155', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {schoolName || username}
        </span>
        <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: subColor, flexShrink: 0 }} />
        <i className={`ti ti-chevron-${open ? 'up' : 'down'}`} style={{ fontSize: '13px', color: '#94a3b8' }} />
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0,
          width: '240px', background: 'white', border: '1px solid #e0e7ef',
          borderRadius: '14px', boxShadow: '0 8px 30px rgba(0,0,0,0.12)', overflow: 'hidden',
        }}>
          {/* User header */}
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #f0f4f8' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '38px', height: '38px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #2196f3, #1565c0)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '14px', fontWeight: '700', color: 'white', flexShrink: 0,
              }}>{initials}</div>
              <div style={{ minWidth: 0 }}>
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
  );
}

const pmItem = {
  width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
  padding: '9px 12px', background: 'transparent', border: 'none',
  borderRadius: '8px', cursor: 'pointer', fontSize: '13px',
  fontWeight: '500', color: '#334155', textAlign: 'left', fontFamily: 'inherit',
};

export default ProfileMenu;