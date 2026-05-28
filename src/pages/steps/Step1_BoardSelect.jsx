import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTestMaker } from '../../hooks/useTestMaker';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';
import TopBar from '../../components/TopBar';

const BOARD_THEMES = [
  { name: 'blue',    icon: 'ti-school',      primary: '#2196f3', dark: '#1565c0', light: '#e3f2fd', lighter: '#dbeafe' },
  { name: 'emerald', icon: 'ti-building',    primary: '#10b981', dark: '#047857', light: '#d1fae5', lighter: '#a7f3d0' },
  { name: 'purple',  icon: 'ti-landmark',    primary: '#8b5cf6', dark: '#6d28d9', light: '#ede9fe', lighter: '#ddd6fe' },
  { name: 'amber',   icon: 'ti-certificate', primary: '#f59e0b', dark: '#b45309', light: '#fef3c7', lighter: '#fde68a' },
  { name: 'rose',    icon: 'ti-books',       primary: '#f43f5e', dark: '#be123c', light: '#ffe4e6', lighter: '#fecdd3' },
  { name: 'cyan',    icon: 'ti-bulb',        primary: '#06b6d4', dark: '#0e7490', light: '#cffafe', lighter: '#a5f3fc' },
];
const themeFor = (idx) => BOARD_THEMES[idx % BOARD_THEMES.length];

function useWindowWidth() {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return width;
}

export default function Step1BoardSelect() {
  const navigate = useNavigate();
  const { boards, selectedBoard, isLoading, errors, loadBoards, loadClasses, setSelectedBoard, clearError } = useTestMaker();
  const [hoveredId, setHoveredId] = useState(null);
  const width = useWindowWidth();

  const isMobile = width < 480;
  const isTablet = width < 768;
  const isMedium = width < 1024;

  useEffect(() => { loadBoards(); }, []);

  const handleBoardSelect = (board) => {
    setSelectedBoard(board);
    localStorage.setItem('board_id', board?.board_id);
    // useNavigate — no full page reload, Zustand state survives
    navigate('/test-maker/step-2');
  };

  // Prefetch classes when user hovers a board card (before they click)
  const handleBoardHover = (board) => {
    setHoveredId(board.board_id);
    loadClasses(board.board_id, true); // silent prefetch — no spinner
  };

  const gridCols = isMobile ? 1 : isTablet ? 2 : isMedium ? 3 : 3;

  return (
    <div style={s.page}>
      <TopBar />

      <div style={{
        ...s.header,
        marginTop: isMobile ? '56px' : '72px',
        marginBottom: isMobile ? '20px' : '32px',
        padding: isMobile ? '0 4px' : '0',
      }}>
        <div style={s.badge}>Step 01 of 06</div>
        <h1 style={{
          ...s.title,
          fontSize: isMobile ? '22px' : isTablet ? '28px' : 'clamp(28px, 5vw, 38px)',
          gap: isMobile ? '8px' : '12px',
          flexDirection: isMobile ? 'column' : 'row',
        }}>
          <span style={{
            ...s.num,
            width: isMobile ? '40px' : '50px',
            height: isMobile ? '40px' : '50px',
            fontSize: isMobile ? '16px' : '20px',
          }}>01</span>
          Select Your Board
        </h1>
        <p style={{ ...s.sub, fontSize: isMobile ? '13px' : '15px', padding: isMobile ? '0 8px' : 0 }}>
          Choose your educational board to begin creating the perfect test
        </p>
      </div>

      <div style={{ ...s.content, padding: isMobile ? '0 12px' : '0' }}>
        {errors.boards && <ErrorAlert message={errors.boards} onClose={() => clearError('boards')} />}

        {isLoading ? <LoadingSpinner message="Loading boards..." /> : (
          <>
            {boards.length > 0 ? (
              <div style={{
                ...s.grid,
                gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
                gap: isMobile ? '12px' : '18px',
              }}>
                {boards.map((board, idx) => {
                  const sel     = selectedBoard?.board_id === board.board_id;
                  const hovered = hoveredId === board.board_id && !sel;
                  const t       = themeFor(idx);
                  return (
                    <div
                      key={board.board_id}
                      onClick={() => handleBoardSelect(board)}
                      onMouseEnter={() => handleBoardHover(board)}
                      onMouseLeave={() => setHoveredId(null)}
                      style={{
                        ...s.card,
                        border: sel ? `2.5px solid ${t.primary}` : hovered ? `2px solid ${t.primary}55` : '2px solid #e2e8f0',
                        background: sel ? `linear-gradient(135deg, ${t.light}, ${t.lighter})` : hovered ? `linear-gradient(135deg, ${t.light}55, white)` : 'white',
                        boxShadow: sel ? `0 8px 28px ${hexAlpha(t.primary, 0.22)}` : hovered ? `0 4px 16px ${hexAlpha(t.primary, 0.12)}` : '0 2px 10px rgba(0,0,0,0.06)',
                        transform: sel ? 'translateY(-4px)' : hovered ? 'translateY(-2px)' : 'none',
                      }}
                    >
                      <div style={{ ...s.clippedWrapper, padding: isMobile ? '24px 16px 20px' : '32px 20px 24px' }}>
                        <div style={{ ...s.topStripe, background: `linear-gradient(90deg, ${t.primary}, ${t.dark})`, opacity: sel ? 1 : hovered ? 0.85 : 0.7 }} />
                        <div style={{
                          ...s.iconBox,
                          width: isMobile ? '52px' : '64px', height: isMobile ? '52px' : '64px',
                          borderRadius: isMobile ? '14px' : '18px', marginBottom: isMobile ? '12px' : '16px',
                          background: sel ? `linear-gradient(135deg, ${t.primary}, ${t.dark})` : hovered ? `linear-gradient(135deg, ${t.light}, ${hexAlpha(t.primary, 0.3)})` : `linear-gradient(135deg, ${t.light}, ${t.lighter})`,
                        }}>
                          <i className={`ti ${t.icon}`} style={{ fontSize: isMobile ? '22px' : '28px', color: sel ? 'white' : t.dark }} />
                        </div>
                        <h3 style={{ ...s.cardTitle, fontSize: isMobile ? '14px' : '16px', color: sel ? t.dark : '#0f172a' }}>
                          {board.board_name}
                        </h3>
                        <p style={{ ...s.cardHint, fontSize: isMobile ? '11px' : '12px', color: sel ? t.primary : hovered ? t.primary : '#94a3b8' }}>
                          {sel ? '✓ Selected' : 'Tap to select'}
                        </p>
                      </div>
                      {sel && (
                        <div style={{ ...s.checkBadge, width: isMobile ? '24px' : '28px', height: isMobile ? '24px' : '28px', top: isMobile ? '-8px' : '-10px', right: isMobile ? '-8px' : '-10px' }}>
                          <i className="ti ti-check" style={{ fontSize: isMobile ? '12px' : '14px' }} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={s.empty}>
                <i className="ti ti-inbox" style={{ fontSize: isMobile ? '44px' : '56px', opacity: 0.15, display: 'block', marginBottom: '12px' }} />
                <p style={{ margin: 0, color: '#94a3b8', fontSize: isMobile ? '14px' : '15px' }}>No boards available</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function hexAlpha(hex, alpha) {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

const s = {
  page: { minHeight: '100vh', background: 'linear-gradient(135deg,#f0f4f8 0%,#e8eef5 100%)', padding: '24px 20px 48px', fontFamily: "'Segoe UI', system-ui, sans-serif", boxSizing: 'border-box' },
  header: { maxWidth: '900px', margin: '72px auto 32px', textAlign: 'center', wordBreak: 'break-word', overflowWrap: 'break-word' },
  badge: { display: 'inline-flex', alignItems: 'center', padding: '5px 18px', background: 'linear-gradient(135deg,#2196f3,#1565c0)', color: 'white', borderRadius: '20px', fontSize: '12px', fontWeight: '700', letterSpacing: '0.5px', marginBottom: '16px', alignSelf: 'center' },
  title: { fontSize: 'clamp(22px, 5vw, 38px)', fontWeight: '800', color: '#0f172a', margin: '0 0 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', letterSpacing: '-0.5px', flexWrap: 'wrap', lineHeight: '1.2' },
  num: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '50px', height: '50px', background: 'linear-gradient(135deg,#2196f3,#1565c0)', color: 'white', borderRadius: '50%', fontSize: '20px', fontWeight: '800', flexShrink: 0 },
  sub: { fontSize: '15px', color: '#64748b', margin: '0 auto', maxWidth: '480px', lineHeight: '1.7' },
  content: { maxWidth: '900px', margin: '0 auto' },
  grid: { display: 'grid', gap: '18px', marginBottom: '32px' },
  card: { position: 'relative', borderRadius: '18px', padding: 0, textAlign: 'center', cursor: 'pointer', transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)', WebkitTapHighlightColor: 'transparent', overflow: 'visible', boxSizing: 'border-box', WebkitUserSelect: 'none', userSelect: 'none' },
  clippedWrapper: { position: 'relative', overflow: 'hidden', borderRadius: '18px', background: 'inherit' },
  topStripe: { position: 'absolute', top: 0, left: 0, right: 0, height: '4px', borderRadius: '18px 18px 0 0', transition: 'opacity 0.2s ease' },
  iconBox: { width: '64px', height: '64px', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', transition: 'all 0.25s ease' },
  cardTitle: { fontSize: '16px', fontWeight: '700', margin: '0 0 6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  cardHint: { fontSize: '12px', margin: 0, fontWeight: '500', transition: 'color 0.2s ease' },
  checkBadge: { position: 'absolute', top: '-10px', right: '-10px', width: '28px', height: '28px', background: 'linear-gradient(135deg,#22c55e,#16a34a)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 3px 10px rgba(34,197,94,0.4)', zIndex: 10, transition: 'all 0.2s ease' },
  empty: { textAlign: 'center', padding: '60px 20px' },
};