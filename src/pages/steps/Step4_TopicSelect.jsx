import React, { useEffect, useState } from 'react';
import { useTestMaker } from '../../hooks/useTestMaker';
import LoadingSpinner from '../../components/LoadingSpinner';
import TopBar from '../../components/TopBar';
import ErrorAlert from '../../components/ErrorAlert';

export default function Step4TopicSelect() {
  const { selectedSubject, selectedClass, chapters, selectedTopics, isLoading, errors, loadTopics, setSelectedTopics, goBack, clearError } = useTestMaker();
  const [expandedChapters, setExpandedChapters] = useState({});
  const [exerciseTypes, setExerciseTypes] = useState({ exercise: true, additional: true, past: false, conceptual: false, examples: false });

  useEffect(() => {
    const subjectId = selectedSubject?.subject_id || localStorage.getItem("subject_id");
    if (subjectId) loadTopics(subjectId);
  }, [selectedSubject]);

  // Restore previously selected topics from localStorage when chapters load
  useEffect(() => {
    if (chapters.length > 0 && selectedTopics.length === 0) {
      const savedTopicIds = (localStorage.getItem('topics') || '').split(',').filter(Boolean);
      if (savedTopicIds.length > 0) {
        const allTopics = chapters.flatMap(ch => ch.topics || []);
        const restored = allTopics.filter(t => savedTopicIds.includes(String(t.topic_id)));
        if (restored.length > 0) setSelectedTopics(restored);
      }
    }
  }, [chapters]);

  const toggleChapter = (code) => setExpandedChapters(p => ({ ...p, [code]: !p[code] }));

  const toggleTopic = (topic) => {
    const sel = selectedTopics.some(t => t.topic_id === topic.topic_id);
    setSelectedTopics(sel ? selectedTopics.filter(t => t.topic_id !== topic.topic_id) : [...selectedTopics, topic]);
  };

  const toggleAllInChapter = (chapter) => {
    const allSel = chapter.topics.every(t => selectedTopics.some(st => st.topic_id === t.topic_id));
    if (allSel) {
      const ids = new Set(chapter.topics.map(t => t.topic_id));
      setSelectedTopics(selectedTopics.filter(t => !ids.has(t.topic_id)));
    } else {
      const newT = chapter.topics.filter(t => !selectedTopics.some(st => st.topic_id === t.topic_id));
      setSelectedTopics([...selectedTopics, ...newT]);
    }
  };

  const handleNext = () => {
    if (selectedTopics.length === 0) { alert('Please select at least one topic'); return; }
    const map = [];
    if (exerciseTypes.exercise) map.push('1');
    if (exerciseTypes.additional) map.push('0');
    if (exerciseTypes.past) map.push('2');
    if (exerciseTypes.conceptual) map.push('3');
    if (exerciseTypes.examples) map.push('4');
    const topicIds = selectedTopics.map(t => t.topic_id).join(',');
    const chapterIds = chapters.filter(ch => ch.topics?.some(t => selectedTopics.some(st => st.topic_id === t.topic_id))).map(c => c.chapter_id).join(',');
    localStorage.setItem('topics', topicIds);
    localStorage.setItem('chapter_ids', chapterIds);
    localStorage.setItem('exercise_question', map.length > 0 ? map.join(',') : '1');
    localStorage.setItem('subject_id', selectedSubject?.subject_id || localStorage.getItem('subject_id'));
    localStorage.setItem('class_id', selectedClass?.class_id || localStorage.getItem('class_id'));
    window.location.href = '/test-maker/step-5';
  };

  const palette = [
    { border: '#e91e63', bg: '#fce4ec', text: '#c2185b' },
    { border: '#9c27b0', bg: '#f3e5f5', text: '#7b1fa2' },
    { border: '#673ab7', bg: '#ede7f6', text: '#512da8' },
    { border: '#3f51b5', bg: '#e8eaf6', text: '#283593' },
    { border: '#2196f3', bg: '#e3f2fd', text: '#1565c0' },
    { border: '#009688', bg: '#e0f2f1', text: '#00695c' },
    { border: '#4caf50', bg: '#e8f5e9', text: '#2e7d32' },
    { border: '#ff9800', bg: '#fff3e0', text: '#e65100' },
  ];
  const getColor = (i) => palette[i % palette.length];

  const exTypes = [
    { key: 'exercise', icon: 'ti-pencil', label: 'Exercise Questions', desc: 'Practice from chapters' },
    { key: 'additional', icon: 'ti-file-text', label: 'Additional Papers', desc: 'Extra question papers' },
    { key: 'past', icon: 'ti-history', label: 'Past Papers', desc: 'Previous exam questions' },
    { key: 'conceptual', icon: 'ti-lightbulb', label: 'Conceptual', desc: 'Concept-based problems' },
    { key: 'examples', icon: 'ti-bulb', label: 'Exercise Examples', desc: 'Worked examples' },
  ];

  // ── Select-all helper for question types ──
  const allQTypesSelected = exTypes.every(({ key }) => exerciseTypes[key]);
  const toggleAllQTypes = () => {
    if (allQTypesSelected) {
      // Deselect all
      setExerciseTypes(exTypes.reduce((acc, { key }) => ({ ...acc, [key]: false }), {}));
    } else {
      // Select all
      setExerciseTypes(exTypes.reduce((acc, { key }) => ({ ...acc, [key]: true }), {}));
    }
  };

  return (
    <div className="page">
      <TopBar/>

      <div className="blob blob1" /><div className="blob blob2" />

      {/* Breadcrumb - hidden on mobile */}
      <div className="breadcrumb desktop-only">
        <span className="bc-item">{selectedSubject?.subject_name || 'Subject'}</span>
        <i className="ti ti-chevron-right bc-sep" />
        <span className="bc-item bc-active">Select Topics</span>
      </div>

      <div className="header">
        <div className="step-badge">Step 04 of 06</div>
        <h1 className="title">Choose Topics & Chapters</h1>
        <p className="subtitle">Select topics and question types for your test</p>
      </div>

      <div className="content">
        {errors.topics && <ErrorAlert message={errors.topics} onClose={() => clearError('topics')} />}

        {isLoading ? <LoadingSpinner message="Loading chapters and topics..." /> : (
          <>
            {chapters.length > 0 ? (
              <>
                {/* Select All */}
                <div className="select-all-card">
                  <label className="select-all-label">
                    <input type="checkbox" className="checkbox"
                      checked={selectedTopics.length > 0 && chapters.every(ch => ch.topics?.every(t => selectedTopics.some(st => st.topic_id === t.topic_id)))}
                      onChange={e => e.target.checked ? setSelectedTopics(chapters.flatMap(ch => ch.topics || [])) : setSelectedTopics([])} />
                    <span>Select All Topics</span>
                    <span className="sel-count">{selectedTopics.length} selected</span>
                  </label>
                </div>

                {/* Chapters */}
                <div className="chapters">
                  {chapters.map((chapter, idx) => {
                    const c = getColor(idx);
                    const isExp = expandedChapters[chapter.chapter_code];
                    const allSel = chapter.topics?.every(t => selectedTopics.some(st => st.topic_id === t.topic_id));
                    return (
                      <div key={chapter.chapter_code} className="chapter-card" style={{ borderLeftColor: c.border }}>
                        <button className="chapter-header" style={{ background: c.bg }} onClick={() => toggleChapter(chapter.chapter_code)}>
                          <input type="checkbox" className="checkbox" checked={allSel || false}
                            onChange={() => toggleAllInChapter(chapter)} onClick={e => e.stopPropagation()}
                            style={{ accentColor: c.border }} />
                          <div className="chapter-info">
                            <div className="chapter-name" style={{ color: c.text }}>{chapter.chapter_name_en}</div>
                            {chapter.chapter_name_ur && <div className="chapter-name-ur" style={{ color: c.text }}>{chapter.chapter_name_ur}</div>}
                            <div className="chapter-meta">{chapter.topics?.length || 0} topics</div>
                          </div>
                          <i className="ti ti-chevron-down chapter-arrow" style={{ color: c.text, transform: isExp ? 'rotate(180deg)' : 'none' }} />
                        </button>

                        {isExp && chapter.topics?.length > 0 && (
                          <div className="topics-list">
                            {chapter.topics.map(topic => {
                              const isSel = selectedTopics.some(t => t.topic_id === topic.topic_id);
                              return (
                                <label key={topic.topic_id} className={`topic-item ${isSel ? 'topic-selected' : ''}`} style={{ '--accent': c.border }}>
                                  <input type="checkbox" className="checkbox" checked={isSel} onChange={() => toggleTopic(topic)} style={{ accentColor: c.border }} />
                                  <div>
                                    <div style={{ color: isSel ? c.border : '#334155', fontSize: '13px', fontWeight: '500' }}>{topic.topic_name_en}</div>
                                    {topic.topic_name_urdu && <div style={{ color: isSel ? c.border : '#94a3b8', fontSize: '11px', direction: 'rtl', textAlign: 'right' }}>{topic.topic_name_urdu}</div>}
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Selected Topics Summary */}
                {selectedTopics.length > 0 && (
                  <div className="sel-summary">
                    <div className="sel-summary-header">
                      <i className="ti ti-check-circle" style={{ color: '#2196f3', fontSize: '18px' }} />
                      <span className="sel-summary-title">Selected Topics</span>
                      <span className="sel-summary-count">{selectedTopics.length} selected</span>
                      <button className="sel-clear" onClick={() => setSelectedTopics([])}>Clear all</button>
                    </div>
                    <div className="sel-tags">
                      {selectedTopics.map(topic => (
                        <div key={topic.topic_id} className="sel-tag">
                          <span>{topic.topic_name_en || topic.topic_name_urdu}</span>
                          <button className="tag-x" onClick={() => toggleTopic(topic)}>✕</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Question Types */}
                <div className="qtype-section">
                  <div className="qtype-header">
                    <div className="qtype-icon"><i className="ti ti-adjustments" /></div>
                    <div className="qtype-header-text">
                      <h3 className="qtype-title">Question Types</h3>
                      <p className="qtype-sub">Select which types of questions to include</p>
                    </div>
                    <button type="button" className="qtype-select-all-btn" onClick={toggleAllQTypes}>
                      {allQTypesSelected ? (
                        <>
                          <i className="ti ti-square" /> Deselect All
                        </>
                      ) : (
                        <>
                          <i className="ti ti-checks" /> Select All
                        </>
                      )}
                    </button>
                  </div>
                  <div className="qtype-grid">
                    {exTypes.map(({ key, icon, label, desc }) => (
                      <label key={key} className={`qtype-card ${exerciseTypes[key] ? 'qtype-active' : ''}`}>
                        <input type="checkbox" checked={exerciseTypes[key]} onChange={e => setExerciseTypes(p => ({ ...p, [key]: e.target.checked }))} style={{ display: 'none' }} />
                        <i className={`ti ${icon} qtype-card-icon`} />
                        <span className="qtype-name">{label}</span>
                        <span className="qtype-desc">{desc}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="empty"><i className="ti ti-inbox" /><p>No chapters or topics available</p></div>
            )}
          </>
        )}
      </div>

      <div className="actions">
        <button onClick={() => window.location.href = '/test-maker/step-3'} className="btn btn-ghost"><i className="ti ti-arrow-left" /> Back</button>
        <button onClick={handleNext} disabled={selectedTopics.length === 0 || isLoading}
          className={`btn btn-primary ${selectedTopics.length === 0 || isLoading ? 'btn-disabled' : ''}`}>
          Next <i className="ti ti-arrow-right" />
        </button>
      </div>

      <style>{`
        * { box-sizing: border-box; }
        .page { min-height: 100vh; background: #f0f4f8; padding: 20px 16px 100px; font-family: 'Segoe UI', system-ui, sans-serif; position: relative; overflow-x: hidden; }
        .blob { position: fixed; border-radius: 50%; pointer-events: none; z-index: 0; }
        .blob1 { top: -100px; right: -100px; width: 350px; height: 350px; background: radial-gradient(circle, rgba(33,150,243,0.07) 0%, transparent 70%); }
        .blob2 { bottom: -60px; left: -60px; width: 260px; height: 260px; background: radial-gradient(circle, rgba(33,150,243,0.05) 0%, transparent 70%); }
        
        /* Breadcrumb styles */
        .breadcrumb { display: flex; align-items: center; justify-content: center; gap: 6px; margin-bottom: 18px; position: relative; z-index: 1; flex-wrap: wrap; }
        .bc-item { padding: 4px 12px; background: rgba(255,255,255,0.7); border-radius: 20px; font-size: 12px; color: #64748b; }
        .bc-active { background: white; color: #2196f3; font-weight: 700; box-shadow: 0 2px 8px rgba(0,0,0,0.07); }
        .bc-sep { color: #cbd5e1; font-size: 13px; }
        
        /* Hide breadcrumb on mobile and adjust header spacing */
        @media (max-width: 768px) {
          .desktop-only {
            display: none;
          }
          .page {
            padding: 0 12px 100px;
          }
          .header {
            margin-top: 20px;
            margin-bottom: 22px;
          }
          /* Step badge lifts up to the topbar row on mobile — centered between logo + profile */
          .step-badge {
            position: fixed;
            top: 18px;
            left: 50%;
            transform: translateX(-50%);
            margin-bottom: 0 !important;
            padding: 4px 12px !important;
            font-size: 10px !important;
            letter-spacing: 0.3px;
            z-index: 199;
            box-shadow: 0 2px 8px rgba(33,150,243,0.25);
            white-space: nowrap;
            max-width: calc(100vw - 130px); /* leaves ~65px on each side for logo + profile circle */
            overflow: hidden;
            text-overflow: ellipsis;
          }
          /* Push the title down so it doesn't crash with the now-fixed badge above */
          .header {
            margin-top: 56px;
          }
        }
        
        .header { text-align: center; margin-bottom: 22px; position: relative; z-index: 1; }
        .step-badge { display: inline-flex; padding: 5px 16px; background: linear-gradient(135deg, #2196f3, #1565c0); color: white; border-radius: 20px; font-size: 12px; font-weight: 700; margin-bottom: 12px; }
        .title { font-size: clamp(20px, 5vw, 34px); font-weight: 800; color: #0f1f35; margin: 0 0 8px; letter-spacing: -0.5px; }
        .subtitle { font-size: clamp(13px, 3vw, 15px); color: #64748b; margin: 0 auto; max-width: 440px; }
        .content { max-width: 1000px; margin: 0 auto; position: relative; z-index: 1; }
        .select-all-card { background: white; border-radius: 14px; padding: 14px 18px; margin-bottom: 14px; box-shadow: 0 2px 10px rgba(0,0,0,0.06); }
        .select-all-label { display: flex; align-items: center; gap: 10px; cursor: pointer; font-weight: 700; font-size: 14px; color: #2196f3; user-select: none; }
        .sel-count { margin-left: auto; background: #e3f2fd; color: #1565c0; font-size: 12px; padding: 3px 10px; border-radius: 12px; font-weight: 700; }
        .checkbox { width: 18px; height: 18px; cursor: pointer; accent-color: #2196f3; flex-shrink: 0; }
        .chapters { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 18px; align-items: start; }
        .chapter-card { background: white; border-radius: 14px; border-left: 4px solid; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.05); min-width: 0; }
        .chapter-header { display: flex; align-items: center; gap: 10px; padding: 14px 16px; cursor: pointer; border: none; width: 100%; text-align: left; font-family: inherit; -webkit-tap-highlight-color: transparent; min-height: 52px; }
        .chapter-info { flex: 1; min-width: 0; }
        .chapter-name { font-size: 13px; font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-bottom: 1px; }
        .chapter-name-ur { font-size: 11px; direction: rtl; text-align: right; opacity: 0.8; }
        .chapter-meta { font-size: 11px; color: #94a3b8; margin-top: 2px; }
        .chapter-arrow { font-size: 16px; flex-shrink: 0; transition: transform 0.25s ease; }
        .topics-list { padding: 8px 14px; border-top: 1px solid rgba(0,0,0,0.05); background: #fafbfc; display: flex; flex-direction: column; gap: 4px; }
        .topic-item { display: flex; align-items: flex-start; gap: 10px; padding: 9px 10px; border-radius: 10px; cursor: pointer; transition: background 0.15s; -webkit-tap-highlight-color: transparent; }
        .topic-item:active { background: rgba(0,0,0,0.04); }
        .topic-selected { background: rgba(33,150,243,0.06); }
        .qtype-section { background: white; border-radius: 18px; padding: 20px 16px; box-shadow: 0 2px 10px rgba(0,0,0,0.06); margin-bottom: 16px; }
        .qtype-header { display: flex; align-items: center; gap: 12px; margin-bottom: 18px; flex-wrap: wrap; }
        .qtype-icon { width: 40px; height: 40px; border-radius: 12px; background: linear-gradient(135deg, #2196f3, #1565c0); display: flex; align-items: center; justify-content: center; color: white; font-size: 18px; flex-shrink: 0; }
        .qtype-header-text { flex: 1; min-width: 0; }
        .qtype-title { font-size: 15px; font-weight: 700; color: #0f1f35; margin: 0 0 2px; }
        .qtype-sub { font-size: 12px; color: #94a3b8; margin: 0; }
        .qtype-select-all-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          font-size: 12px;
          font-weight: 700;
          color: #1565c0;
          background: #e3f2fd;
          border: 1px solid #90caf9;
          border-radius: 10px;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.15s ease;
          flex-shrink: 0;
        }
        .qtype-select-all-btn:hover {
          background: #bbdefb;
          border-color: #2196f3;
        }
        .qtype-select-all-btn:active {
          transform: scale(0.96);
        }
        .qtype-select-all-btn i {
          font-size: 14px;
        }
        .qtype-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(150px, 100%), 1fr)); gap: 10px; }
        .qtype-card { border: 2px solid #e8eef5; border-radius: 14px; padding: 16px 12px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 6px; text-align: center; transition: all 0.2s ease; background: #f8fafc; -webkit-tap-highlight-color: transparent; }
        .qtype-card:active { transform: scale(0.96); }
        .qtype-active { background: linear-gradient(135deg, #2196f3, #1565c0); border-color: #2196f3; box-shadow: 0 4px 14px rgba(33,150,243,0.3); }
        .qtype-card-icon { font-size: 22px; color: #2196f3; }
        .qtype-active .qtype-card-icon { color: white; }
        .qtype-name { font-size: 12px; font-weight: 700; color: #334155; }
        .qtype-active .qtype-name { color: white; }
        .qtype-desc { font-size: 10px; color: #94a3b8; line-height: 1.3; }
        .qtype-active .qtype-desc { color: rgba(255,255,255,0.8); }
        .sel-summary { background: linear-gradient(135deg, #e3f2fd, #bbdefb); border: 2px solid #2196f3; border-radius: 14px; padding: 16px; margin-bottom: 16px; }
        .sel-summary-header { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
        .sel-summary-title { font-size: 14px; font-weight: 700; color: #1565c0; }
        .sel-summary-count { background: #2196f3; color: white; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 10px; }
        .sel-clear { margin-left: auto; background: none; border: 1px solid #90caf9; color: #1565c0; font-size: 12px; padding: 3px 10px; border-radius: 8px; cursor: pointer; font-family: inherit; }
        .sel-tags { display: flex; flex-wrap: wrap; gap: 6px; }
        .sel-tag { display: inline-flex; align-items: center; gap: 6px; background: white; border: 1px solid #2196f3; border-radius: 16px; padding: 5px 10px; font-size: 12px; color: #1565c0; font-weight: 500; }
        .tag-x { background: none; border: none; color: #1565c0; cursor: pointer; font-size: 12px; padding: 0; line-height: 1; }
        .empty { text-align: center; padding: 60px 20px; color: #94a3b8; }
        .empty i { font-size: 60px; opacity: 0.15; display: block; margin-bottom: 12px; }
        .actions { position: fixed; bottom: 0; left: 0; right: 0; background: white; border-top: 1px solid #e8eef5; padding: 12px 16px; display: flex; gap: 12px; z-index: 100; box-shadow: 0 -4px 20px rgba(0,0,0,0.08); }
        .btn { flex: 1; padding: 13px 20px; font-size: 14px; font-weight: 700; border: none; border-radius: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s; font-family: inherit; min-height: 48px; -webkit-tap-highlight-color: transparent; }
        .btn-primary { background: linear-gradient(135deg, #2196f3, #1565c0); color: white; box-shadow: 0 4px 16px rgba(33,150,243,0.35); }
        .btn-primary:active:not(.btn-disabled) { transform: scale(0.97); }
        .btn-ghost { background: white; color: #64748b; border: 1px solid #e0e7ef; }
        .btn-disabled { opacity: 0.5; cursor: not-allowed; }
        @media (max-width: 600px) {
          .chapters { grid-template-columns: 1fr; }
        }
        @media (max-width: 480px) {
          .qtype-grid { grid-template-columns: repeat(2, 1fr); }
          .chapter-header { padding: 12px 12px; }
          .topics-list { padding: 6px 10px; }
          .chapters { grid-template-columns: 1fr; }
          .title { font-size: 24px; }
          .subtitle { font-size: 13px; }
        }
      `}</style>
    </div>
  );
}