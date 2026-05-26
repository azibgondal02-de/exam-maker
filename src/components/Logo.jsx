// components/Logo.jsx
import React from 'react';

/**
 * PaperCraft Logo — matches the landing page wordmark.
 *
 * Visual: [navy square with white "P" + orange corner fold] + "Paper" / "Craft"
 *
 * variant:
 *   'default' — large fixed-position logo for step pages (top-left)
 *   'inline'  — medium size for inline use (e.g. forms, modals)
 *   'navbar'  — compact size for dark toolbars (Step 6 sticky bar etc.)
 *
 * onClick: optional override (default = navigate to /test-maker/step-1)
 * style:   optional style overrides merged into container
 * theme:   'light' (default — dark text on transparent bg) or 'dark' (light text for dark toolbars)
 */
export default function Logo({ variant = 'default', onClick, style = {}, theme = 'light' }) {

  // Size mapping per variant: [mark size in px, text size in px, gap in px]
  // 'default' matches the landing page nav logo exactly (32 / 16 / 10)
  const sizes = {
    default: { mark: 32, text: 16, gap: 10 },
    inline:  { mark: 36, text: 18, gap: 8  },
    navbar:  { mark: 28, text: 15, gap: 7  },
  };

  // Position/layout per variant
  const positions = {
    default: {
      position: 'fixed',
      top: '25px',
      left: '40px',
      zIndex: 200,
    },
    inline:  {},
    navbar:  {},
  };

  const s = sizes[variant] || sizes.default;
  const pos = positions[variant] || {};

  // Colors — landing page uses navy + orange. Light/dark themes adapt the wordmark text color.
  const NAVY = '#0f1f3d';
  const ORANGE = '#f5a623';
  const ORANGE_DEEP = '#e8920a';
  const TEXT = theme === 'dark' ? '#ffffff' : '#0f1f3d';

  // Corner triangle is sized relative to the mark for crispness across sizes
  const triSize = Math.round(s.mark * 0.31);

  const containerStyle = {
    ...pos,
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
    width: s.mark + 'px',
    height: s.mark + 'px',
    background: NAVY,
    borderRadius: Math.max(Math.round(s.mark * 0.22), 6) + 'px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    flexShrink: 0,
  };

  // Orange triangle in top-right corner (CSS border trick — paints a perfect right triangle)
  const cornerStyle = {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderWidth: `0 ${triSize}px ${triSize}px 0`,
    borderColor: `transparent ${ORANGE} transparent transparent`,
  };

  const pStyle = {
    color: 'white',
    fontSize: Math.round(s.mark * 0.5) + 'px',
    fontWeight: 700,
    fontFamily: 'Georgia, "Times New Roman", serif',
    position: 'relative',
    zIndex: 1,
    lineHeight: 1,
  };

  const wordStyle = {
    fontSize: s.text + 'px',
    fontWeight: 600,
    color: TEXT,
    letterSpacing: '-0.2px',
    lineHeight: 1,
  };

  const accentStyle = {
    color: ORANGE_DEEP,
    fontWeight: 700,
  };

  return (
    <div
      onClick={onClick || (() => { window.location.href = '/test-maker/step-1'; })}
      style={containerStyle}
      role="button"
      aria-label="PaperCraft — go to home"
    >
      {/* Mark — navy rounded square with white "P" + orange corner */}
      <div style={markStyle}>
        <span style={cornerStyle} />
        <span style={pStyle}>P</span>
      </div>

      {/* Wordmark — Paper + Craft */}
      <span style={wordStyle}>
        Paper<b style={accentStyle}>Craft</b>
      </span>
    </div>
  );
}