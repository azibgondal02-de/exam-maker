import React, { useEffect } from 'react';
import { useTestMaker } from '../../hooks/useTestMaker';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';
import ProfileMenu from '../../components/ProfileMenu';
import logo from '../../assets/logo.png';

const classPalette = [
  { bg: '#e3f2fd', border: '#2196f3', icon: '#1565c0' },
  { bg: '#f3e5f5', border: '#9c27b0', icon: '#6a1b9a' },
  { bg: '#e8f5e9', border: '#4caf50', icon: '#2e7d32' },
  { bg: '#fff3e0', border: '#ff9800', icon: '#e65100' },
  { bg: '#fce4ec', border: '#e91e63', icon: '#880e4f' },
  { bg: '#e0f2f1', border: '#009688', icon: '#004d40' },
  { bg: '#ede7f6', border: '#673ab7', icon: '#311b92' },
  { bg: '#e8eaf6', border: '#3f51b5', icon: '#1a237e' },
  { bg: '#ffebee', border: '#f44336', icon: '#b71c1c' },
  { bg: '#f1f8e9', border: '#8bc34a', icon: '#33691e' },
];

export default function Step2ClassSelect() {
  const { selectedBoard, classes, selectedClass, isLoading, errors, loadClasses, setSelectedClass, goBack, clearError } = useTestMaker();

  useEffect(() => {
    const boardId = selectedBoard?.board_id || localStorage.getItem("board_id");
    if (boardId) loadClasses(boardId);
  }, [selectedBoard]);

  const handleNext = () => {
    if (!selectedClass) { alert('Please select a class'); return; }
    localStorage.setItem("class_id", selectedClass?.class_id);
    localStorage.setItem("class_name", selectedClass?.class_name || '');
    window.location.href = "/test-maker/step-3";
  };

  return (
    <div className="page">
      {/* Logo - click to go home */}
      <div onClick={() => window.location.href = '/test-maker/step-1'}
        style={{ position: 'fixed', top: '-40px', left: '50px', zIndex: 200, cursor: 'pointer' }}>
        <img src={logo} alt="Logo" style={{ height: '245px', width: '200px', objectFit: 'contain' }} />
      </div>

      {/* Profile Button */}
      <ProfileMenu />

      <div className="blob blob1" /><div className="blob blob2" />

      <div className="breadcrumb">
        <span className="bc-item">{selectedBoard?.board_name || 'Board'}</span>
        <i className="ti ti-chevron-right bc-sep" />
        <span className="bc-item bc-active">Select Class</span>
      </div>

      <div className="header">
        <div className="step-badge">Step 02 of 06</div>
        <h1 className="title">Choose Your Class</h1>
        <p className="subtitle">Select the class level to filter curriculum and content</p>
      </div>

      <div className="content">
        {errors.classes && <ErrorAlert message={errors.classes} onClose={() => clearError('classes')} />}

        {isLoading ? <LoadingSpinner message="Loading classes..." /> : (
          <>
            {classes.length > 0 ? (
              <div className="card">
                <div className="card-head">
                  <i className="ti ti-book-2" style={{ color: '#0097a7', fontSize: '18px' }} />
                  <span className="card-head-title">Available Classes</span>
                  <span className="count-badge">{classes.length}</span>
                </div>
                <div className="class-scroll">
                  {classes.map((cls, idx) => {
                    const sel = selectedClass?.class_id === cls.class_id;
                    const c = classPalette[idx % classPalette.length];
                    return (
                      <div key={cls.class_id} onClick={() => setSelectedClass(cls)}
                        className={`class-tile ${sel ? 'tile-selected' : ''}`}
                        style={sel ? { background: `linear-gradient(135deg, ${c.border}, ${c.icon})`, borderColor: c.border, boxShadow: `0 6px 20px ${c.border}44` } : { background: c.bg, borderColor: c.border }}>
                        <i className="ti ti-book-2" style={{ fontSize: '22px', color: sel ? 'white' : c.icon, marginBottom: '6px' }} />
                        <span className="tile-label" style={{ color: sel ? 'white' : c.icon }}>{cls.class_name}</span>
                        {sel && <div className="tile-check"><i className="ti ti-check" /></div>}
                      </div>
                    );
                  })}
                </div>

                {selectedClass && (
                  <div className="sel-banner">
                    <div>
                      <div className="sel-label">Selected Class</div>
                      <div className="sel-name">{selectedClass.class_name}</div>
                    </div>
                    <i className="ti ti-check-circle" style={{ fontSize: '26px', color: '#00bcd4' }} />
                  </div>
                )}
              </div>
            ) : (
              <div className="empty"><i className="ti ti-inbox" /><p>No classes available</p></div>
            )}

            <div className="actions">
              <button onClick={() => window.location.href = '/test-maker/step-1'} className="btn btn-ghost"><i className="ti ti-arrow-left" /> Back</button>
              <button onClick={handleNext} disabled={!selectedClass || isLoading}
                className={`btn btn-primary ${!selectedClass || isLoading ? 'btn-disabled' : ''}`}>
                Next <i className="ti ti-arrow-right" />
              </button>
            </div>
          </>
        )}
      </div>

      <style>{`
        * { box-sizing: border-box; }
        .page { min-height: 100vh; background: #f0f4f8; padding: 20px 16px 40px; font-family: 'Segoe UI', system-ui, sans-serif; position: relative; overflow-x: hidden; }
        .blob { position: fixed; border-radius: 50%; pointer-events: none; z-index: 0; }
        .blob1 { top: -100px; right: -100px; width: 350px; height: 350px; background: radial-gradient(circle, rgba(0,188,212,0.08) 0%, transparent 70%); }
        .blob2 { bottom: -60px; left: -60px; width: 250px; height: 250px; background: radial-gradient(circle, rgba(0,150,136,0.07) 0%, transparent 70%); }
        .breadcrumb { display: flex; align-items: center; justify-content: center; gap: 6px; margin-bottom: 20px; position: relative; z-index: 1; flex-wrap: wrap; }
        .bc-item { padding: 4px 12px; background: rgba(255,255,255,0.7); border-radius: 20px; font-size: 12px; color: #64748b; font-weight: 500; }
        .bc-active { background: white; color: #0097a7; font-weight: 700; box-shadow: 0 2px 8px rgba(0,0,0,0.07); }
        .bc-sep { color: #cbd5e1; font-size: 13px; }
        .header { text-align: center; margin-bottom: 24px; position: relative; z-index: 1; }
        .step-badge { display: inline-flex; padding: 5px 16px; background: linear-gradient(135deg, #00bcd4, #0097a7); color: white; border-radius: 20px; font-size: 12px; font-weight: 700; margin-bottom: 12px; }
        .title { font-size: clamp(22px, 5vw, 36px); font-weight: 800; color: #0f1f35; margin: 0 0 8px; letter-spacing: -0.5px; }
        .subtitle { font-size: clamp(13px, 3vw, 15px); color: #64748b; margin: 0 auto; max-width: 440px; line-height: 1.6; }
        .content { max-width: 900px; margin: 0 auto; position: relative; z-index: 1; }
        .card { background: white; border-radius: 20px; padding: 24px 20px; box-shadow: 0 4px 24px rgba(0,0,0,0.07); margin-bottom: 20px; border: 1px solid rgba(0,0,0,0.04); }
        .card-head { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; padding-bottom: 14px; border-bottom: 1px solid #f0f4f8; }
        .card-head-title { font-size: 14px; font-weight: 700; color: #0f1f35; }
        .count-badge { margin-left: auto; background: #e0f7fa; color: #0097a7; font-size: 12px; font-weight: 700; padding: 3px 10px; border-radius: 12px; }
        .class-scroll { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 16px; }
        .class-tile { position: relative; padding: 14px 12px; min-width: 90px; border-radius: 14px; border: 2px solid #e8eef5; background: white; cursor: pointer; display: flex; flex-direction: column; align-items: center; transition: all 0.22s cubic-bezier(0.34,1.56,0.64,1); -webkit-tap-highlight-color: transparent; min-height: 80px; justify-content: center; }
        .class-tile:active { transform: scale(0.95); }
        .tile-selected { transform: translateY(-3px) scale(1.02); }
        .tile-label { font-size: 12px; font-weight: 700; color: #1a2332; text-align: center; line-height: 1.3; }
        .tile-selected .tile-label { color: white; }
        .tile-check { position: absolute; top: -8px; right: -8px; width: 22px; height: 22px; background: #4caf50; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; box-shadow: 0 2px 8px rgba(76,175,80,0.4); }
        .sel-banner { display: flex; align-items: center; justify-content: space-between; background: linear-gradient(135deg, #e0f7fa, #b2ebf2); border-radius: 12px; padding: 14px 18px; border: 1px solid #80deea; margin-top: 4px; }
        .sel-label { font-size: 11px; font-weight: 700; color: #0097a7; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; }
        .sel-name { font-size: 16px; font-weight: 700; color: #006064; }
        .empty { text-align: center; padding: 60px 20px; color: #94a3b8; }
        .empty i { font-size: 60px; opacity: 0.15; display: block; margin-bottom: 12px; }
        .actions { display: flex; gap: 12px; padding-top: 16px; }
        .btn { flex: 1; padding: 13px 20px; font-size: 14px; font-weight: 700; border: none; border-radius: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s; font-family: inherit; min-height: 48px; -webkit-tap-highlight-color: transparent; }
        .btn-primary { background: linear-gradient(135deg, #00bcd4, #006064); color: white; box-shadow: 0 4px 16px rgba(0,188,212,0.3); }
        .btn-primary:active:not(.btn-disabled) { transform: scale(0.97); }
        .btn-ghost { background: white; color: #64748b; border: 1px solid #e0e7ef; }
        .btn-disabled { opacity: 0.5; cursor: not-allowed; }
        @media (max-width: 480px) {
          .page { padding: 16px 12px 32px; }
          .class-tile { min-width: 78px; padding: 12px 10px; min-height: 72px; }
          .card { padding: 18px 14px; border-radius: 16px; }
        }
      `}</style>
    </div>
  );
}