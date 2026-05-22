import React, { useEffect } from 'react';
import { useTestMaker } from '../../hooks/useTestMaker';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';
import logo from '../../assets/logo.png';

export default function Step1BoardSelect() {
  const { boards, selectedBoard, isLoading, errors, loadBoards, setSelectedBoard, clearError } = useTestMaker();

  useEffect(() => { loadBoards(); }, []);

  const handleNext = () => {
    if (!selectedBoard) { alert('Please select a board'); return; }
    localStorage.setItem("board_id", selectedBoard?.board_id);
    window.location.href = "/test-maker/step-2";
  };

  return (
    <div style={s.page}>

      {/* Logo */}
      <div onClick={() => window.location.href = '/test-maker/step-1'}
        style={{ position: 'fixed', top: '-40px', left: '50px', zIndex: 200, cursor: 'pointer' }}>
        <img src={logo} alt="Logo" style={{ height: '245px', width: '200px', objectFit: 'contain' }} />
      </div>

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
                  return (
                    <div key={board.board_id} onClick={() => setSelectedBoard(board)}
                      style={{
                        ...s.card,
                        border: sel ? '2.5px solid #2196f3' : '2px solid #e2e8f0',
                        background: sel ? 'linear-gradient(135deg,#e3f2fd,#dbeafe)' : 'white',
                        boxShadow: sel ? '0 8px 28px rgba(33,150,243,0.2)' : '0 2px 10px rgba(0,0,0,0.06)',
                        transform: sel ? 'translateY(-4px)' : 'none',
                      }}>
                      {/* Icon */}
                      <div style={{
                        ...s.iconBox,
                        background: sel ? 'linear-gradient(135deg,#2196f3,#1565c0)' : 'linear-gradient(135deg,#e3f2fd,#bfdbfe)',
                      }}>
                        <i className="ti ti-school" style={{ fontSize: '28px', color: sel ? 'white' : '#2196f3' }}></i>
                      </div>
                      <h3 style={{ ...s.cardTitle, color: sel ? '#1565c0' : '#0f172a' }}>{board.board_name}</h3>
                      <p style={{ ...s.cardHint, color: sel ? '#1976d2' : '#94a3b8' }}>
                        {sel ? '✓ Selected' : 'Tap to select'}
                      </p>
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

            <div style={s.actions}>
              <button disabled style={s.btnGhost}>
                <i className="ti ti-arrow-left"></i> Back
              </button>
              <button onClick={handleNext} disabled={!selectedBoard || isLoading}
                style={{ ...s.btnPrimary, opacity: !selectedBoard || isLoading ? 0.5 : 1 }}>
                Next <i className="ti ti-arrow-right"></i>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg,#f0f4f8 0%,#e8eef5 100%)',
    padding: '24px 20px 48px',
    fontFamily: "'Segoe UI',system-ui,sans-serif",
  },
  // logoBox: {
  //   position: 'fixed', 
  //   top: '20px', 
  //   left: '24px', 
  //   zIndex: 200,
  //   background: 'white',
  //   borderRadius: '12px',
  //   padding: '8px 16px',
  //   boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
  //   cursor: 'pointer',
  //   display: 'flex', 
  //   alignItems: 'center',
  //   transition: 'all 0.2s ease',
  //   ':hover': {
  //     transform: 'translateY(-2px)',
  //     boxShadow: '0 4px 16px rgba(0,0,0,0.12)'
  //   }
  // },
  // logoImg: { 
  //   height: '35px', 
  //   width: 'auto', 
  //   objectFit: 'contain', 
  //   display: 'block' 
  // },
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
    position: 'relative', borderRadius: '18px', padding: '32px 20px 24px',
    textAlign: 'center', cursor: 'pointer',
    transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
    WebkitTapHighlightColor: 'transparent',
  },
  iconBox: {
    width: '64px', height: '64px', borderRadius: '18px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 16px', transition: 'all 0.25s ease',
  },
  cardTitle: { fontSize: '16px', fontWeight: '700', margin: '0 0 6px' },
  cardHint: { fontSize: '12px', margin: 0, fontWeight: '500' },
  checkBadge: {
    position: 'absolute', top: '-10px', right: '-10px',
    width: '28px', height: '28px',
    background: 'linear-gradient(135deg,#22c55e,#16a34a)',
    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'white', boxShadow: '0 3px 10px rgba(34,197,94,0.4)',
  },
  empty: { textAlign: 'center', padding: '60px 20px' },
  actions: {
    display: 'flex', justifyContent: 'space-between', gap: '12px',
    paddingTop: '24px', borderTop: '1px solid #e2e8f0',
  },
  btnPrimary: {
    padding: '13px 32px', fontSize: '14px', fontWeight: '700',
    background: 'linear-gradient(135deg,#2196f3,#1565c0)', color: 'white',
    border: 'none', borderRadius: '12px', cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: '8px',
    boxShadow: '0 4px 16px rgba(33,150,243,0.35)', minHeight: '48px',
    fontFamily: 'inherit',
  },
  btnGhost: {
    padding: '13px 32px', fontSize: '14px', fontWeight: '700',
    background: 'white', color: '#94a3b8',
    border: '1px solid #e2e8f0', borderRadius: '12px', cursor: 'not-allowed',
    display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.5, minHeight: '48px',
    fontFamily: 'inherit',
  },
};