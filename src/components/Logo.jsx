import React from 'react';
import logoImg from '../assets/logo.png';

export default function Logo({ variant = 'default', onClick, style = {}, theme = 'light' }) {

  const sizes = {
    default: { height: 36, gap: 4 },
    inline:  { height: 40, gap: 4 },
    navbar:  { height: 30, gap: 3 },
  };

  const s = sizes[variant] || sizes.default;
  const TEXT = theme === 'dark' ? '#ffffff' : '#0f1f3d';
  const ORANGE_DEEP = '#e8920a';

  return (
    <div
      onClick={onClick || (() => { window.location.href = '/test-maker/step-1'; })}
      style={{
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: s.gap + 'px',
        textDecoration: 'none',
        userSelect: 'none',
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        ...style,
      }}
      role="button"
      aria-label="PaperCraft — go to home"
    >
      <img
        src={logoImg}
        alt="PaperCraft"
        style={{ height: s.height + 'px', width: 'auto', flexShrink: 0 }}
      />
      <span style={{ fontSize: s.height * 0.44 + 'px', fontWeight: 600, color: TEXT, letterSpacing: '-0.2px', lineHeight: 1 }}>
        Paper <b style={{ color: ORANGE_DEEP, fontWeight: 700 }}>Craft</b>
      </span>
    </div>
  );
}