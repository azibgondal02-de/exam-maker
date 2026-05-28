import React from 'react';

/**
 * PaperCraft Logo — matches the landing page wordmark.
 *
 * variant:
 *   'default' — used inside TopBar (flows with layout, NOT fixed)
 *   'inline'  — medium size for inline use (forms, modals)
 *   'navbar'  — compact size for dark toolbars (Step 6 sticky bar etc.)
 *
 * onClick: optional override (default = navigate to /test-maker/step-1)
 * style:   optional style overrides merged into container
 * theme:   'light' (default) or 'dark' (light text for dark toolbars)
 */
export default function Logo({ variant = 'default', onClick, style = {}, theme = 'light' }) {

  const sizes = {
    default: { mark: 32, text: 16, gap: 10 },
    inline:  { mark: 36, text: 18, gap: 8  },
    navbar:  { mark: 28, text: 15, gap: 7  },
  };

  const s = sizes[variant] || sizes.default;

  const NAVY       = '#0f1f3d';
  const ORANGE     = '#f5a623';
  const ORANGE_DEEP = '#e8920a';
  const TEXT       = theme === 'dark' ? '#ffffff' : '#0f1f3d';

  const triSize = Math.round(s.mark * 0.31);

  // ── No position:fixed here anymore. TopBar owns the layout/positioning. ──
  const containerStyle = {
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: s.gap + 'px',
    textDecoration: 'none',
    userSelect: 'none',
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    ...style,
  };

  const markStyle = {
    width:        s.mark + 'px',
    height:       s.mark + 'px',
    background:   NAVY,
    borderRadius: Math.max(Math.round(s.mark * 0.22), 6) + 'px',
    display:      'flex',
    alignItems:   'center',
    justifyContent: 'center',
    position:     'relative',
    overflow:     'hidden',
    flexShrink:   0,
  };

  const cornerStyle = {
    position:    'absolute',
    top:         0,
    right:       0,
    width:       0,
    height:      0,
    borderStyle: 'solid',
    borderWidth: `0 ${triSize}px ${triSize}px 0`,
    borderColor: `transparent ${ORANGE} transparent transparent`,
  };

  const pStyle = {
    color:      'white',
    fontSize:   Math.round(s.mark * 0.5) + 'px',
    fontWeight: 700,
    fontFamily: 'Georgia, "Times New Roman", serif',
    position:   'relative',
    zIndex:     1,
    lineHeight: 1,
  };

  const wordStyle = {
    fontSize:      s.text + 'px',
    fontWeight:    600,
    color:         TEXT,
    letterSpacing: '-0.2px',
    lineHeight:    1,
  };

  const accentStyle = {
    color:      ORANGE_DEEP,
    fontWeight: 700,
  };

  return (
    <div
      onClick={onClick || (() => { window.location.href = '/test-maker/step-1'; })}
      style={containerStyle}
      role="button"
      aria-label="PaperCraft — go to home"
    >
      <div style={markStyle}>
        <span style={cornerStyle} />
        <span style={pStyle}>P</span>
      </div>
      <span style={wordStyle}>
        Paper<b style={accentStyle}>Craft</b>
      </span>
    </div>
  );
}