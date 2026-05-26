import React, { useEffect } from 'react';
import { useTestMaker } from '../../hooks/useTestMaker';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';
import TopBar from '../../components/TopBar';

// ── Per-board color identity (cycles if more boards than entries) ──
const BOARD_THEMES = [
  { name: 'blue',    icon: 'ti-school',       primary: '#2196f3', dark: '#1565c0', light: '#e3f2fd', lighter: '#dbeafe' },
  { name: 'emerald', icon: 'ti-building',     primary: '#10b981', dark: '#047857', light: '#d1fae5', lighter: '#a7f3d0' },
  { name: 'purple',  icon: 'ti-landmark',     primary: '#8b5cf6', dark: '#6d28d9', light: '#ede9fe', lighter: '#ddd6fe' },
  { name: 'amber',   icon: 'ti-certificate',  primary: '#f59e0b', dark: '#b45309', light: '#fef3c7', lighter: '#fde68a' },
  { name: 'rose',    icon: 'ti-books',        primary: '#f43f5e', dark: '#be123c', light: '#ffe4e6', lighter: '#fecdd3' },
  { name: 'cyan',    icon: 'ti-bulb',         primary: '#06b6d4', dark: '#0e7490', light: '#cffafe', lighter: '#a5f3fc' },
];

const themeFor = (idx) => BOARD_THEMES[idx % BOARD_THEMES.length];

export default function Step1BoardSelect() {
  const { boards, selectedBoard, isLoading, errors, loadBoards, setSelectedBoard, clearError } = useTestMaker();

  useEffect(() => { loadBoards(); }, []);

  const handleBoardSelect = (board) => {
    setSelectedBoard(board);
    localStorage.setItem("board_id", board?.board_id);
    // Navigate instantly with no delay
    window.location.href = "/test-maker/step-2";
  };

  return (
    <div style={s.page}>

      {/* Logo + Profile menu, single import */}
      <TopBar />

      {/* Header */}
      <div style={s.header}>
        <div style={s.badge}>Step 01 of 06</div>
        <h1 style={s.title}>
          <span style={s.num}>01</span>
          Select Your Board
        </h1>
        <p style={s.sub}>Choose your educational board to begin creating the perfect test</p>
      </div>

      {/* Content */}
      <div style={s.content}>
        {errors.boards && <ErrorAlert message={errors.boards} onClose={() => clearError('boards')} />}

        {isLoading ? <LoadingSpinner message="Loading boards..." /> : (
          <>
            {boards.length > 0 ? (
              <div style={s.grid}>
                {boards.map((board, idx) => {
                  const sel = selectedBoard?.board_id === board.board_id;
                  const t = themeFor(idx);
                  return (
                    <div 
                      key={board.board_id} 
                      onClick={() => handleBoardSelect(board)}
                      style={{
                        ...s.card,
                        border: sel ? `2.5px solid ${t.primary}` : '2px solid #e2e8f0',
                        background: sel
                          ? `linear-gradient(135deg, ${t.light}, ${t.lighter})`
                          : 'white',
                        boxShadow: sel
                          ? `0 8px 28px ${hexAlpha(t.primary, 0.22)}`
                          : '0 2px 10px rgba(0,0,0,0.06)',
                        transform: sel ? 'translateY(-4px)' : 'none',
                      }}
                    >
                      {/* Clipped content wrapper */}
                      <div style={s.clippedWrapper}>
                        {/* Top color stripe */}
                        <div style={{
                          ...s.topStripe,
                          background: `linear-gradient(90deg, ${t.primary}, ${t.dark})`,
                          opacity: sel ? 1 : 0.7,
                        }} />

                        {/* Icon */}
                        <div style={{
                          ...s.iconBox,
                          background: sel
                            ? `linear-gradient(135deg, ${t.primary}, ${t.dark})`
                            : `linear-gradient(135deg, ${t.light}, ${t.lighter})`,
                        }}>
                          <i className={`ti ${t.icon}`} style={{ fontSize: '28px', color: sel ? 'white' : t.dark }}></i>
                        </div>
                        <h3 style={{ ...s.cardTitle, color: sel ? t.dark : '#0f172a' }}>{board.board_name}</h3>
                        <p style={{ ...s.cardHint, color: sel ? t.primary : '#94a3b8' }}>
                          {sel ? '✓ Selected' : 'Tap to select'}
                        </p>
                      </div>
                      
                      {/* Check badge - half outside half inside */}
                      {sel && (
                        <div style={s.checkBadge}>
                          <i className="ti ti-check" style={{ fontSize: '14px' }}></i>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={s.empty}>
                <i className="ti ti-inbox" style={{ fontSize: '56px', opacity: 0.15, display: 'block', marginBottom: '12px' }}></i>
                <p style={{ margin: 0, color: '#94a3b8' }}>No boards available</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Helper — convert hex color to rgba with opacity for shadows
function hexAlpha(hex, alpha) {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

const s = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg,#f0f4f8 0%,#e8eef5 100%)',
    padding: '24px 20px 48px',
    fontFamily: "'Segoe UI',system-ui,sans-serif",
  },
  header: { maxWidth: '900px', margin: '72px auto 32px', textAlign: 'center' },
  badge: {
    display: 'inline-flex', alignItems: 'center', padding: '5px 18px',
    background: 'linear-gradient(135deg,#2196f3,#1565c0)', color: 'white',
    borderRadius: '20px', fontSize: '12px', fontWeight: '700', letterSpacing: '0.5px',
    marginBottom: '16px',
  },
  title: {
    fontSize: 'clamp(22px,5vw,38px)', fontWeight: '800', color: '#0f172a',
    margin: '0 0 10px', display: 'flex', alignItems: 'center',
    justifyContent: 'center', gap: '12px', letterSpacing: '-0.5px', flexWrap: 'wrap',
  },
  num: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: '50px', height: '50px', background: 'linear-gradient(135deg,#2196f3,#1565c0)',
    color: 'white', borderRadius: '50%', fontSize: '20px', fontWeight: '800', flexShrink: 0,
  },
  sub: { fontSize: '15px', color: '#64748b', margin: '0 auto', maxWidth: '480px', lineHeight: '1.7' },
  content: { maxWidth: '900px', margin: '0 auto' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '18px',
    marginBottom: '32px',
  },
  card: {
    position: 'relative',
    borderRadius: '18px',
    padding: 0,
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
    WebkitTapHighlightColor: 'transparent',
    overflow: 'visible',
  },
  clippedWrapper: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: '18px',
    padding: '32px 20px 24px',
    background: 'inherit',
  },
  topStripe: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    borderRadius: '18px 18px 0 0',
  },
  iconBox: {
    width: '64px',
    height: '64px',
    borderRadius: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
    transition: 'all 0.25s ease',
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '700',
    margin: '0 0 6px',
  },
  cardHint: {
    fontSize: '12px',
    margin: 0,
    fontWeight: '500',
  },
  checkBadge: {
    position: 'absolute',
    top: '-10px',
    right: '-10px',
    width: '28px',
    height: '28px',
    background: 'linear-gradient(135deg,#22c55e,#16a34a)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    boxShadow: '0 3px 10px rgba(34,197,94,0.4)',
    zIndex: 10,
  },
  empty: {
    textAlign: 'center',
    padding: '60px 20px',
  },
};