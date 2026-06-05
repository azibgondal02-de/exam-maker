import React from 'react';

const WA_NUMBER = import.meta.env.VITE_WA_NUMBER || '923287600959';

export default function ExpiredPage() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #f0f4f8, #e8eef5)',
      fontFamily: "'Segoe UI', system-ui, sans-serif", padding: '20px',
    }}>
      <div style={{
        background: 'white', borderRadius: '20px', padding: '48px 36px',
        textAlign: 'center', maxWidth: '420px', width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
      }}>
        <div style={{
          width: '80px', height: '80px', borderRadius: '50%', background: '#fff3e0',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px', fontSize: '36px', color: '#f57c00',
        }}>
          <i className="ti ti-clock-off" />
        </div>
        <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0f1f35', marginBottom: '12px' }}>
          Subscription Expired
        </h2>
        <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.7', marginBottom: '28px' }}>
          Your PaperCraft subscription has ended.<br />
          Contact us on WhatsApp to renew and regain access.
        </p>
        <a
          href={`https://wa.me/${WA_NUMBER}?text=Hi, I want to renew my PaperCraft subscription.`}
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '13px 28px', background: '#25d366', color: 'white',
            borderRadius: '12px', fontWeight: '600', fontSize: '15px',
            textDecoration: 'none', marginBottom: '16px',
          }}
        >
          <i className="ti ti-brand-whatsapp" /> Renew on WhatsApp
        </a>
        <br />
        <button
          onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
          style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '13px', marginTop: '8px' }}
        >
          Back to Sign in
        </button>
      </div>
    </div>
  );
}