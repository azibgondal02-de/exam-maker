import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTestMaker } from '../../hooks/useTestMaker';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';
import TopBar from '../../components/TopBar';

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
  const navigate = useNavigate();
  const {
    selectedBoard, classes, selectedClass,
    isLoading, errors, loadClasses, loadSubjects, setSelectedClass, setSelectedSubject, setSelectedTopics, clearError,
  } = useTestMaker();

  useEffect(() => {
    const boardId = selectedBoard?.board_id || localStorage.getItem('board_id');
    if (boardId) loadClasses(boardId);
  }, [selectedBoard]);

  const handleClassSelect = (cls) => {
    setSelectedClass(cls);
    setSelectedSubject(null);   // clear downstream selections
    setSelectedTopics([]);
    localStorage.setItem('class_id', cls?.class_id);
    localStorage.setItem('class_name', cls?.class_name || '');
    navigate('/test-maker/step-3');
  };

  // Prefetch subjects when user hovers a class tile
  const handleClassHover = (cls) => {
    loadSubjects(cls.class_id, true); // silent prefetch — no spinner
  };

  return (
    <div className="s2-page">
      <TopBar />

      <div className="s2-blob s2-blob1" />
      <div className="s2-blob s2-blob2" />

      <div className="s2-breadcrumb">
        <span className="s2-bc-item">{selectedBoard?.board_name || 'Board'}</span>
        <i className="ti ti-chevron-right s2-bc-sep" />
        <span className="s2-bc-item s2-bc-active">Select Class</span>
      </div>

      <div className="s2-header">
        <div className="s2-step-badge">Step 02 of 06</div>
        <h1 className="s2-title">
          <span className="s2-num">02</span>
          Choose Your Class
        </h1>
        <p className="s2-subtitle">Select the class level to filter curriculum and content</p>
      </div>

      <div className="s2-content">
        {errors.classes && (
          <ErrorAlert message={errors.classes} onClose={() => clearError('classes')} />
        )}

        {isLoading ? (
          <LoadingSpinner message="Loading classes..." />
        ) : (
          <>
            {classes.length > 0 ? (
              <div className="s2-card">
                <div className="s2-card-head">
                  <i className="ti ti-book-2" style={{ color: '#0097a7', fontSize: '18px' }} />
                  <span className="s2-card-head-title">Available Classes</span>
                  <span className="s2-count-badge">{classes.length}</span>
                </div>

                <div className="s2-tile-grid">
                  {classes.map((cls, idx) => {
                    const sel = selectedClass?.class_id === cls.class_id;
                    const c   = classPalette[idx % classPalette.length];
                    return (
                      <div
                        key={cls.class_id}
                        onClick={() => handleClassSelect(cls)}
                        onMouseEnter={() => handleClassHover(cls)}
                        className={`s2-tile ${sel ? 's2-tile-sel' : ''}`}
                        style={sel
                          ? { background: `linear-gradient(135deg, ${c.border}, ${c.icon})`, borderColor: c.border, boxShadow: `0 6px 20px ${c.border}44` }
                          : { background: c.bg, borderColor: c.border }
                        }
                      >
                        <i className="ti ti-book-2" style={{ fontSize: '22px', color: sel ? 'white' : c.icon, marginBottom: '6px' }} />
                        <span className="s2-tile-label" style={{ color: sel ? 'white' : c.icon }}>
                          {cls.class_name}
                        </span>
                        {sel && <div className="s2-tile-check"><i className="ti ti-check" /></div>}
                      </div>
                    );
                  })}
                </div>

                {selectedClass && (
                  <div className="s2-sel-banner">
                    <div>
                      <div className="s2-sel-label">Selected Class</div>
                      <div className="s2-sel-name">{selectedClass.class_name}</div>
                    </div>
                    <i className="ti ti-check-circle" style={{ fontSize: '26px', color: '#00bcd4' }} />
                  </div>
                )}
              </div>
            ) : (
              <div className="s2-empty">
                <i className="ti ti-inbox" />
                <p>No classes available</p>
              </div>
            )}

            <div className="s2-actions">
              <button onClick={() => navigate('/test-maker/step-1')} className="s2-btn-back">
                <i className="ti ti-arrow-left" /> Back
              </button>
            </div>
          </>
        )}
      </div>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        .s2-page { min-height: 100vh; background: linear-gradient(135deg, #f0f4f8 0%, #e8eef5 100%); padding: 24px 20px 48px; font-family: 'Segoe UI', system-ui, sans-serif; position: relative; overflow-x: hidden; }
        .s2-blob { position: fixed; border-radius: 50%; pointer-events: none; z-index: 0; }
        .s2-blob1 { top: -100px; right: -100px; width: 350px; height: 350px; background: radial-gradient(circle, rgba(0,188,212,0.08) 0%, transparent 70%); }
        .s2-blob2 { bottom: -60px; left: -60px; width: 250px; height: 250px; background: radial-gradient(circle, rgba(0,150,136,0.07) 0%, transparent 70%); }
        .s2-breadcrumb { display: flex; align-items: center; justify-content: center; gap: 6px; margin-top: 80px; margin-bottom: 16px; position: relative; z-index: 1; flex-wrap: wrap; }
        .s2-bc-item { padding: 4px 12px; background: rgba(255,255,255,0.7); border-radius: 20px; font-size: 12px; color: #64748b; font-weight: 500; }
        .s2-bc-active { background: white; color: #0097a7; font-weight: 700; box-shadow: 0 2px 8px rgba(0,0,0,0.07); }
        .s2-bc-sep { color: #cbd5e1; font-size: 13px; }
        .s2-header { text-align: center; margin-bottom: 28px; position: relative; z-index: 1; }
        .s2-step-badge { display: inline-flex; padding: 5px 18px; background: linear-gradient(135deg, #00bcd4, #0097a7); color: white; border-radius: 20px; font-size: 12px; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 16px; }
        .s2-title { font-size: clamp(22px, 5vw, 38px); font-weight: 800; color: #0f172a; margin: 0 0 10px; display: flex; align-items: center; justify-content: center; gap: 12px; letter-spacing: -0.5px; flex-wrap: wrap; line-height: 1.2; }
        .s2-num { display: inline-flex; align-items: center; justify-content: center; width: 50px; height: 50px; background: linear-gradient(135deg, #00bcd4, #0097a7); color: white; border-radius: 50%; font-size: 20px; font-weight: 800; flex-shrink: 0; }
        .s2-subtitle { font-size: 15px; color: #64748b; margin: 0 auto; max-width: 440px; line-height: 1.7; }
        .s2-content { max-width: 900px; margin: 0 auto; position: relative; z-index: 1; }
        .s2-card { background: white; border-radius: 20px; padding: 24px 20px; box-shadow: 0 4px 24px rgba(0,0,0,0.07); margin-bottom: 20px; border: 1px solid rgba(0,0,0,0.04); }
        .s2-card-head { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; padding-bottom: 14px; border-bottom: 1px solid #f0f4f8; }
        .s2-card-head-title { font-size: 14px; font-weight: 700; color: #0f1f35; }
        .s2-count-badge { margin-left: auto; background: #e0f7fa; color: #0097a7; font-size: 12px; font-weight: 700; padding: 3px 10px; border-radius: 12px; }
        .s2-tile-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(90px, 1fr)); gap: 10px; margin-bottom: 16px; }
        .s2-tile { position: relative; padding: 14px 10px; border-radius: 14px; border: 2px solid #e8eef5; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 80px; transition: all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1); -webkit-tap-highlight-color: transparent; user-select: none; }
        .s2-tile:active { transform: scale(0.95); }
        .s2-tile-sel { transform: translateY(-3px) scale(1.02); }
        .s2-tile-label { font-size: 12px; font-weight: 700; text-align: center; line-height: 1.3; word-break: break-word; }
        .s2-tile-check { position: absolute; top: -8px; right: -8px; width: 22px; height: 22px; background: #4caf50; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; box-shadow: 0 2px 8px rgba(76,175,80,0.4); }
        .s2-sel-banner { display: flex; align-items: center; justify-content: space-between; background: linear-gradient(135deg, #e0f7fa, #b2ebf2); border-radius: 12px; padding: 14px 18px; border: 1px solid #80deea; margin-top: 4px; gap: 12px; }
        .s2-sel-label { font-size: 11px; font-weight: 700; color: #0097a7; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; }
        .s2-sel-name { font-size: 16px; font-weight: 700; color: #006064; }
        .s2-empty { text-align: center; padding: 60px 20px; color: #94a3b8; }
        .s2-empty i { font-size: 56px; opacity: 0.15; display: block; margin-bottom: 12px; }
        .s2-actions { display: flex; justify-content: center; padding-top: 16px; }
        .s2-btn-back { background: linear-gradient(135deg, #00bcd4, #0097a7); color: white; padding: 13px 48px; font-size: 14px; font-weight: 700; border: none; border-radius: 12px; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; transition: all 0.2s; font-family: inherit; min-height: 48px; box-shadow: 0 4px 16px rgba(0,188,212,0.3); letter-spacing: 0.3px; -webkit-tap-highlight-color: transparent; }
        .s2-btn-back:hover { box-shadow: 0 6px 22px rgba(0,188,212,0.45); transform: translateY(-1px); }
        .s2-btn-back:active { transform: scale(0.97); }
        @media (max-width: 768px) { .s2-breadcrumb { display: none; } .s2-header { margin-top: 72px; } .s2-page { padding: 24px 16px 40px; } }
        @media (max-width: 480px) { .s2-page { padding: 16px 12px 32px; } .s2-header { margin-top: 68px; margin-bottom: 20px; } .s2-num { width: 40px; height: 40px; font-size: 16px; } .s2-title { font-size: 22px; gap: 8px; } .s2-subtitle { font-size: 13px; padding: 0 8px; } .s2-card { padding: 18px 14px; border-radius: 16px; } .s2-tile-grid { grid-template-columns: repeat(auto-fill, minmax(76px, 1fr)); gap: 8px; } .s2-tile { min-height: 72px; padding: 12px 8px; } .s2-tile-label { font-size: 11px; } .s2-sel-name { font-size: 14px; } .s2-btn-back { padding: 13px 32px; width: 100%; justify-content: center; } }
        @media (min-width: 769px) { .s2-header { margin-top: 0; } }
      `}</style>
    </div>
  );
}