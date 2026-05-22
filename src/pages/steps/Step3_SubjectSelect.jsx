import React, { useEffect, useMemo } from 'react';
import logo from '../../assets/logo.png';
import { useTestMaker } from '../../hooks/useTestMaker';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';

export default function Step3SubjectSelect() {
  const { selectedClass, subjects, selectedSubject, isLoading, errors, loadSubjects, setSelectedSubject, goBack, clearError } = useTestMaker();

  useEffect(() => {
    const classId = selectedClass?.class_id || localStorage.getItem("class_id");
    if (classId) loadSubjects(classId);
  }, [selectedClass]);

  const { newSubjects, oldSubjects } = useMemo(() => ({
    newSubjects: subjects.filter(s => s.old_subject === 0),
    oldSubjects: subjects.filter(s => s.old_subject === 1),
  }), [subjects]);

  const palette = [
    { bg: '#fce4ec', border: '#e91e63', text: '#880e4f' },
    { bg: '#f3e5f5', border: '#9c27b0', text: '#4a148c' },
    { bg: '#ede7f6', border: '#673ab7', text: '#311b92' },
    { bg: '#e8eaf6', border: '#3f51b5', text: '#1a237e' },
    { bg: '#e3f2fd', border: '#2196f3', text: '#0d47a1' },
    { bg: '#e0f2f1', border: '#009688', text: '#004d40' },
    { bg: '#e8f5e9', border: '#4caf50', text: '#1b5e20' },
    { bg: '#fff3e0', border: '#ff9800', text: '#bf360c' },
    { bg: '#ffebee', border: '#f44336', text: '#b71c1c' },
    { bg: '#f1f8e9', border: '#8bc34a', text: '#33691e' },
  ];

  const getColor = (i) => palette[i % palette.length];

  const handleSelectSubject = (subject) => {
    setSelectedSubject(subject);
    localStorage.setItem("subject_id", subject.subject_id);
    localStorage.setItem("subject_name", subject.subject_name || '');
  };

  const handleNext = () => {
    if (!selectedSubject) { alert('Please select a subject'); return; }
    localStorage.setItem("subject_id", selectedSubject?.subject_id);
    localStorage.setItem("subject_name", selectedSubject?.subject_name || '');
    // Clear old step5 config so new subject starts fresh
    localStorage.removeItem('step5_config');
    localStorage.removeItem('step5_chapters');
    localStorage.removeItem('topics');
    localStorage.removeItem('chapter_ids');
    localStorage.removeItem('exercise_question');
    window.location.href = "/test-maker/step-4";
  };

  const SubjectBtn = ({ subject, isSelected, colorIndex }) => {
    const c = getColor(colorIndex);
    return (
      <button onClick={() => handleSelectSubject(subject)}
        className={`subj-btn ${isSelected ? 'subj-selected' : ''}`}
        style={isSelected ? { background: `linear-gradient(135deg, ${c.border}, ${c.text})`, borderColor: c.border } : { background: c.bg, borderColor: c.border }}>
        <i className="ti ti-book" style={{ fontSize: '22px', color: isSelected ? 'white' : c.border }} />
        <span className="subj-name" style={{ color: isSelected ? 'white' : c.text }}>{subject.subject_name}</span>
        {isSelected && <div className="subj-check"><i className="ti ti-check" /></div>}
      </button>
    );
  };

  const Section = ({ title, badge, subjects: list, offset = 0 }) => (
    <div className="section">
      <div className="section-head">
        <div className={`badge ${badge}`}>{title === 'Latest' ? '⭐' : '📚'}</div>
        <div>
          <h2 className="section-title">{title} Curriculum</h2>
          <span className="section-count">{list.length} subjects</span>
        </div>
      </div>
      <div className="subj-grid">
        {list.map((s, i) => (
          <SubjectBtn key={s.subject_id} subject={s} isSelected={selectedSubject?.subject_id === s.subject_id} colorIndex={i + offset} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="page">
      {/* Logo - click to go home */}
      <div onClick={() => window.location.href = '/test-maker/step-1'}
        style={{ position: 'fixed', top: '-40px', left: '50px', zIndex: 200, cursor: 'pointer' }}>
        <img src={logo} alt="Logo" style={{ height: '245px', width: '200px', objectFit: 'contain' }} />
      </div>


      <div className="blob blob1" /><div className="blob blob2" />

      <div className="breadcrumb">
        <span className="bc-item">{selectedClass?.class_name || 'Class'}</span>
        <i className="ti ti-chevron-right bc-sep" />
        <span className="bc-item bc-active">Select Subject</span>
      </div>

      <div className="header">
        <div className="step-badge">Step 03 of 06</div>
        <h1 className="title">Choose Your Subject</h1>
        <p className="subtitle">Select from new or old curriculum subjects</p>
      </div>

      <div className="content">
        {errors.subjects && <ErrorAlert message={errors.subjects} onClose={() => clearError('subjects')} />}

        {isLoading ? <LoadingSpinner message="Loading subjects..." /> : (
          <>
            {subjects.length > 0 ? (
              <>
                {newSubjects.length > 0 && <Section title="Latest" badge="badge-new" subjects={newSubjects} offset={0} />}
                {oldSubjects.length > 0 && <Section title="Previous" badge="badge-old" subjects={oldSubjects} offset={newSubjects.length} />}
              </>
            ) : (
              <div className="empty"><i className="ti ti-inbox" /><p>No subjects available</p></div>
            )}

            {selectedSubject && (
              <div className="sel-bar">
                <div>
                  <div className="sel-label">Selected Subject</div>
                  <div className="sel-name">{selectedSubject.subject_name}</div>
                  <div className="sel-type">{selectedSubject.old_subject === 1 ? '📚 Old Curriculum' : '⭐ New Curriculum'}</div>
                </div>
                <i className="ti ti-check-circle" style={{ fontSize: '28px', color: '#673ab7', flexShrink: 0 }} />
              </div>
            )}

            <div className="actions">
              <button onClick={() => window.location.href = '/test-maker/step-2'} className="btn btn-ghost"><i className="ti ti-arrow-left" /> Back</button>
              <button onClick={handleNext} disabled={!selectedSubject || isLoading}
                className={`btn btn-primary ${!selectedSubject || isLoading ? 'btn-disabled' : ''}`}>
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
        .blob1 { top: -100px; right: -100px; width: 350px; height: 350px; background: radial-gradient(circle, rgba(103,58,183,0.07) 0%, transparent 70%); }
        .blob2 { bottom: -60px; left: -60px; width: 260px; height: 260px; background: radial-gradient(circle, rgba(233,30,99,0.05) 0%, transparent 70%); }
        .breadcrumb { display: flex; align-items: center; justify-content: center; gap: 6px; margin-bottom: 18px; position: relative; z-index: 1; flex-wrap: wrap; }
        .bc-item { padding: 4px 12px; background: rgba(255,255,255,0.7); border-radius: 20px; font-size: 12px; color: #64748b; font-weight: 500; }
        .bc-active { background: white; color: #673ab7; font-weight: 700; box-shadow: 0 2px 8px rgba(0,0,0,0.07); }
        .bc-sep { color: #cbd5e1; font-size: 13px; }
        .header { text-align: center; margin-bottom: 24px; position: relative; z-index: 1; }
        .step-badge { display: inline-flex; padding: 5px 16px; background: linear-gradient(135deg, #673ab7, #512da8); color: white; border-radius: 20px; font-size: 12px; font-weight: 700; margin-bottom: 12px; }
        .title { font-size: clamp(22px, 5vw, 36px); font-weight: 800; color: #0f1f35; margin: 0 0 8px; letter-spacing: -0.5px; }
        .subtitle { font-size: clamp(13px, 3vw, 15px); color: #64748b; margin: 0 auto; max-width: 440px; line-height: 1.6; }
        .content { max-width: 1000px; margin: 0 auto; position: relative; z-index: 1; }
        .section { background: white; border-radius: 18px; padding: 20px 16px; margin-bottom: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid rgba(0,0,0,0.04); }
        .section-head { display: flex; align-items: center; gap: 12px; margin-bottom: 18px; padding-bottom: 14px; border-bottom: 1px solid #f0f4f8; }
        .badge { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
        .badge-new { background: linear-gradient(135deg, #43a047, #2e7d32); box-shadow: 0 3px 10px rgba(67,160,71,0.3); }
        .badge-old { background: linear-gradient(135deg, #2196f3, #1565c0); box-shadow: 0 3px 10px rgba(33,150,243,0.3); }
        .section-title { font-size: 15px; font-weight: 700; color: #0f1f35; margin: 0 0 2px; }
        .section-count { font-size: 12px; color: #94a3b8; }
        .subj-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(120px, 45%), 1fr)); gap: 10px; }
        .subj-btn { position: relative; border: 2px solid; border-radius: 14px; padding: 14px 10px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 6px; font-family: inherit; min-height: 90px; justify-content: flex-start; transition: all 0.22s cubic-bezier(0.34,1.56,0.64,1); -webkit-tap-highlight-color: transparent; word-break: break-word; }
        .subj-btn:active { transform: scale(0.96); }
        .subj-selected { box-shadow: 0 8px 24px rgba(0,0,0,0.18); transform: translateY(-4px); }
        .subj-name { font-size: 11px; font-weight: 600; text-align: center; line-height: 1.35; word-break: break-word; white-space: normal; width: 100%; }
        .subj-check { position: absolute; top: -8px; right: -8px; width: 22px; height: 22px; background: linear-gradient(135deg, #43a047, #2e7d32); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; box-shadow: 0 2px 8px rgba(67,160,71,0.4); }
        .sel-bar { background: linear-gradient(135deg, #f3e5f5, #ede7f6); border: 2px solid #673ab7; border-radius: 14px; padding: 16px 18px; display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 20px; }
        .sel-label { font-size: 11px; font-weight: 700; color: #673ab7; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; }
        .sel-name { font-size: 16px; font-weight: 700; color: #4a148c; margin-bottom: 2px; }
        .sel-type { font-size: 12px; color: #7b1fa2; }
        .empty { text-align: center; padding: 60px 20px; color: #94a3b8; }
        .empty i { font-size: 60px; opacity: 0.15; display: block; margin-bottom: 12px; }
        .actions { display: flex; gap: 12px; padding-top: 16px; }
        .btn { flex: 1; padding: 13px 20px; font-size: 14px; font-weight: 700; border: none; border-radius: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s; font-family: inherit; min-height: 48px; -webkit-tap-highlight-color: transparent; }
        .btn-primary { background: linear-gradient(135deg, #673ab7, #4527a0); color: white; box-shadow: 0 4px 16px rgba(103,58,183,0.3); }
        .btn-primary:active:not(.btn-disabled) { transform: scale(0.97); }
        .btn-ghost { background: white; color: #64748b; border: 1px solid #e0e7ef; }
        .btn-disabled { opacity: 0.5; cursor: not-allowed; }
        @media (max-width: 480px) {
          .page { padding: 16px 12px 32px; }
          .section { padding: 16px 12px; border-radius: 14px; }
          .subj-grid { grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 8px; }
          .subj-btn { min-height: 84px; padding: 12px 8px; }
          .subj-name { font-size: 11px; }
        }
      `}</style>
    </div>
  );
}