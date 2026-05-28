import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTestMaker } from '../../hooks/useTestMaker';
import LoadingSpinner from '../../components/LoadingSpinner';
import TopBar from '../../components/TopBar';
import ErrorAlert from '../../components/ErrorAlert';

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

export default function Step3SubjectSelect() {
  const navigate = useNavigate();
  const {
    selectedClass, subjects, selectedSubject,
    isLoading, errors, loadSubjects, loadTopics, setSelectedSubject, setSelectedTopics, clearError,
  } = useTestMaker();

  useEffect(() => {
    const classId = selectedClass?.class_id || localStorage.getItem('class_id');
    if (classId) loadSubjects(classId);
  }, [selectedClass]);

  const { newSubjects, oldSubjects } = useMemo(() => ({
    newSubjects: subjects.filter(s => s.old_subject === 0),
    oldSubjects: subjects.filter(s => s.old_subject === 1),
  }), [subjects]);

  const handleSelectSubject = (subject) => {
    setSelectedSubject(subject);
    setSelectedTopics([]);   // clear previous subject's selected topics
    localStorage.setItem('subject_id', subject.subject_id);
    localStorage.setItem('subject_name', subject.subject_name || '');
    localStorage.removeItem('step5_config');
    localStorage.removeItem('step5_chapters');
    localStorage.removeItem('topics');
    localStorage.removeItem('chapter_ids');
    localStorage.removeItem('exercise_question');
    navigate('/test-maker/step-4');
  };

  // Prefetch topics when user hovers a subject button
  const handleSubjectHover = (subject) => {
    loadTopics(subject.subject_id, true); // silent prefetch — no spinner
  };

  const SubjectBtn = ({ subject, isSelected, colorIndex }) => {
    const c = getColor(colorIndex);
    return (
      <button
        onClick={() => handleSelectSubject(subject)}
        onMouseEnter={() => handleSubjectHover(subject)}
        className={`s3-subj-btn ${isSelected ? 's3-subj-sel' : ''}`}
        style={isSelected
          ? { background: `linear-gradient(135deg, ${c.border}, ${c.text})`, borderColor: c.border }
          : { background: c.bg, borderColor: c.border }
        }
      >
        <i className="ti ti-book" style={{ fontSize: '22px', color: isSelected ? 'white' : c.border }} />
        <span className="s3-subj-name" style={{ color: isSelected ? 'white' : c.text }}>
          {subject.subject_name}
        </span>
        {isSelected && <div className="s3-subj-check"><i className="ti ti-check" /></div>}
      </button>
    );
  };

  const Section = ({ title, badge, subjects: list, offset = 0 }) => (
    <div className="s3-section">
      <div className="s3-section-head">
        <div className={`s3-badge ${badge}`}>{title === 'Latest' ? '⭐' : '📚'}</div>
        <div>
          <h2 className="s3-section-title">{title} Curriculum</h2>
          <span className="s3-section-count">{list.length} subject{list.length !== 1 ? 's' : ''}</span>
        </div>
      </div>
      <div className="s3-subj-grid">
        {list.map((s, i) => (
          <SubjectBtn
            key={s.subject_id}
            subject={s}
            isSelected={selectedSubject?.subject_id === s.subject_id}
            colorIndex={i + offset}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="s3-page">
      <TopBar />

      <div className="s3-blob s3-blob1" />
      <div className="s3-blob s3-blob2" />

      <div className="s3-breadcrumb">
        <span className="s3-bc-item">{selectedClass?.class_name || 'Class'}</span>
        <i className="ti ti-chevron-right s3-bc-sep" />
        <span className="s3-bc-item s3-bc-active">Select Subject</span>
      </div>

      <div className="s3-header">
        <div className="s3-step-badge">Step 03 of 06</div>
        <h1 className="s3-title">
          <span className="s3-num">03</span>
          Choose Your Subject
        </h1>
        <p className="s3-subtitle">Select from new or old curriculum subjects</p>
      </div>

      <div className="s3-content">
        {errors.subjects && (
          <ErrorAlert message={errors.subjects} onClose={() => clearError('subjects')} />
        )}

        {isLoading ? (
          <LoadingSpinner message="Loading subjects..." />
        ) : (
          <>
            {subjects.length > 0 ? (
              <>
                {newSubjects.length > 0 && <Section title="Latest" badge="s3-badge-new" subjects={newSubjects} offset={0} />}
                {oldSubjects.length > 0 && <Section title="Previous" badge="s3-badge-old" subjects={oldSubjects} offset={newSubjects.length} />}
              </>
            ) : (
              <div className="s3-empty">
                <i className="ti ti-inbox" />
                <p>No subjects available</p>
              </div>
            )}

            <div className="s3-actions">
              <button onClick={() => navigate('/test-maker/step-2')} className="s3-btn-back">
                <i className="ti ti-arrow-left" /> Back
              </button>
            </div>
          </>
        )}
      </div>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        .s3-page { min-height: 100vh; background: linear-gradient(135deg, #f0f4f8 0%, #e8eef5 100%); padding: 24px 20px 48px; font-family: 'Segoe UI', system-ui, sans-serif; position: relative; overflow-x: hidden; }
        .s3-blob { position: fixed; border-radius: 50%; pointer-events: none; z-index: 0; }
        .s3-blob1 { top: -100px; right: -100px; width: 350px; height: 350px; background: radial-gradient(circle, rgba(103,58,183,0.07) 0%, transparent 70%); }
        .s3-blob2 { bottom: -60px; left: -60px; width: 260px; height: 260px; background: radial-gradient(circle, rgba(233,30,99,0.05) 0%, transparent 70%); }
        .s3-breadcrumb { display: flex; align-items: center; justify-content: center; gap: 6px; margin-top: 80px; margin-bottom: 16px; position: relative; z-index: 1; flex-wrap: wrap; }
        .s3-bc-item { padding: 4px 12px; background: rgba(255,255,255,0.7); border-radius: 20px; font-size: 12px; color: #64748b; font-weight: 500; }
        .s3-bc-active { background: white; color: #673ab7; font-weight: 700; box-shadow: 0 2px 8px rgba(0,0,0,0.07); }
        .s3-bc-sep { color: #cbd5e1; font-size: 13px; }
        .s3-header { text-align: center; margin-bottom: 28px; position: relative; z-index: 1; }
        .s3-step-badge { display: inline-flex; padding: 5px 18px; background: linear-gradient(135deg, #673ab7, #512da8); color: white; border-radius: 20px; font-size: 12px; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 16px; }
        .s3-title { font-size: clamp(22px, 5vw, 38px); font-weight: 800; color: #0f172a; margin: 0 0 10px; display: flex; align-items: center; justify-content: center; gap: 12px; letter-spacing: -0.5px; flex-wrap: wrap; line-height: 1.2; }
        .s3-num { display: inline-flex; align-items: center; justify-content: center; width: 50px; height: 50px; background: linear-gradient(135deg, #673ab7, #512da8); color: white; border-radius: 50%; font-size: 20px; font-weight: 800; flex-shrink: 0; }
        .s3-subtitle { font-size: 15px; color: #64748b; margin: 0 auto; max-width: 440px; line-height: 1.7; }
        .s3-content { max-width: 1000px; margin: 0 auto; position: relative; z-index: 1; }
        .s3-section { background: white; border-radius: 20px; padding: 22px 20px; margin-bottom: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid rgba(0,0,0,0.04); }
        .s3-section-head { display: flex; align-items: center; gap: 12px; margin-bottom: 18px; padding-bottom: 14px; border-bottom: 1px solid #f0f4f8; }
        .s3-badge { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
        .s3-badge-new { background: linear-gradient(135deg, #43a047, #2e7d32); box-shadow: 0 3px 10px rgba(67,160,71,0.3); }
        .s3-badge-old { background: linear-gradient(135deg, #2196f3, #1565c0); box-shadow: 0 3px 10px rgba(33,150,243,0.3); }
        .s3-section-title { font-size: 15px; font-weight: 700; color: #0f1f35; margin: 0 0 2px; }
        .s3-section-count { font-size: 12px; color: #94a3b8; }
        .s3-subj-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 10px; }
        .s3-subj-btn { position: relative; border: 2px solid; border-radius: 14px; padding: 14px 10px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 6px; font-family: inherit; min-height: 90px; justify-content: flex-start; transition: all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1); -webkit-tap-highlight-color: transparent; user-select: none; width: 100%; }
        .s3-subj-btn:active { transform: scale(0.96); }
        .s3-subj-sel { box-shadow: 0 8px 24px rgba(0,0,0,0.18); transform: translateY(-4px); }
        .s3-subj-name { font-size: 11px; font-weight: 600; text-align: center; line-height: 1.35; word-break: break-word; white-space: normal; width: 100%; }
        .s3-subj-check { position: absolute; top: -8px; right: -8px; width: 22px; height: 22px; background: linear-gradient(135deg, #43a047, #2e7d32); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; box-shadow: 0 2px 8px rgba(67,160,71,0.4); }
        .s3-empty { text-align: center; padding: 60px 20px; color: #94a3b8; }
        .s3-empty i { font-size: 56px; opacity: 0.15; display: block; margin-bottom: 12px; }
        .s3-actions { display: flex; justify-content: center; padding-top: 16px; }
        .s3-btn-back { background: linear-gradient(135deg, #673ab7, #512da8); color: white; padding: 13px 48px; font-size: 14px; font-weight: 700; border: none; border-radius: 12px; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; transition: all 0.2s; font-family: inherit; min-height: 48px; box-shadow: 0 4px 16px rgba(103,58,183,0.3); letter-spacing: 0.3px; -webkit-tap-highlight-color: transparent; }
        .s3-btn-back:hover { box-shadow: 0 6px 22px rgba(103,58,183,0.45); transform: translateY(-1px); }
        .s3-btn-back:active { transform: scale(0.97); }
        @media (max-width: 768px) { .s3-breadcrumb { display: none; } .s3-header { margin-top: 72px; } .s3-page { padding: 24px 16px 40px; } .s3-subj-grid { grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); } }
        @media (max-width: 480px) { .s3-page { padding: 16px 12px 32px; } .s3-header { margin-top: 68px; margin-bottom: 20px; } .s3-num { width: 40px; height: 40px; font-size: 16px; } .s3-title { font-size: 22px; gap: 8px; } .s3-subtitle { font-size: 13px; padding: 0 8px; } .s3-section { padding: 16px 12px; border-radius: 16px; } .s3-subj-grid { grid-template-columns: repeat(auto-fill, minmax(88px, 1fr)); gap: 8px; } .s3-subj-btn { min-height: 84px; padding: 12px 8px; } .s3-btn-back { padding: 13px 32px; width: 100%; justify-content: center; } }
        @media (min-width: 769px) { .s3-header { margin-top: 0; } }
      `}</style>
    </div>
  );
}