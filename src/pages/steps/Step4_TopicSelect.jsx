import React, { useEffect, useState } from 'react';
import { useTestMaker } from '../../hooks/useTestMaker';
import LoadingSpinner from '../../components/LoadingSpinner';
import TopBar from '../../components/TopBar';
import ErrorAlert from '../../components/ErrorAlert';

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
  { key: 'exercise',   icon: 'ti-pencil',    label: 'Exercise Questions', desc: 'Practice from chapters' },
  { key: 'additional', icon: 'ti-file-text', label: 'Additional Papers',  desc: 'Extra question papers' },
  { key: 'past',       icon: 'ti-history',   label: 'Past Papers',        desc: 'Previous exam questions' },
  { key: 'conceptual', icon: 'ti-lightbulb', label: 'Conceptual',         desc: 'Concept-based problems' },
  { key: 'examples',   icon: 'ti-bulb',      label: 'Exercise Examples',  desc: 'Worked examples' },
];

export default function Step4TopicSelect() {
  const {
    selectedSubject, selectedClass, chapters, selectedTopics,
    isLoading, errors, loadTopics, setSelectedTopics, clearError,
  } = useTestMaker();

  const [expandedChapters, setExpandedChapters] = useState({});
  const [exerciseTypes, setExerciseTypes] = useState({
    exercise: true, additional: true, past: false, conceptual: false, examples: false,
  });

  useEffect(() => {
    const subjectId = selectedSubject?.subject_id || localStorage.getItem('subject_id');
    if (subjectId) loadTopics(subjectId);
  }, [selectedSubject]);

  // Restore previously selected topics from localStorage
  useEffect(() => {
    if (chapters.length > 0 && selectedTopics.length === 0) {
      const savedIds = (localStorage.getItem('topics') || '').split(',').filter(Boolean);
      if (savedIds.length > 0) {
        const allTopics = chapters.flatMap(ch => ch.topics || []);
        const restored = allTopics.filter(t => savedIds.includes(String(t.topic_id)));
        if (restored.length > 0) setSelectedTopics(restored);
      }
    }
  }, [chapters]);

  const toggleChapter  = (code) => setExpandedChapters(p => ({ ...p, [code]: !p[code] }));

  const toggleTopic = (topic) => {
    const sel = selectedTopics.some(t => t.topic_id === topic.topic_id);
    setSelectedTopics(sel
      ? selectedTopics.filter(t => t.topic_id !== topic.topic_id)
      : [...selectedTopics, topic]
    );
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

  const allQTypesSelected = exTypes.every(({ key }) => exerciseTypes[key]);
  const toggleAllQTypes   = () =>
    setExerciseTypes(exTypes.reduce((acc, { key }) => ({ ...acc, [key]: !allQTypesSelected }), {}));

  const handleNext = () => {
    if (selectedTopics.length === 0) { alert('Please select at least one topic'); return; }
    const map = [];
    if (exerciseTypes.exercise)   map.push('1');
    if (exerciseTypes.additional) map.push('0');
    if (exerciseTypes.past)       map.push('2');
    if (exerciseTypes.conceptual) map.push('3');
    if (exerciseTypes.examples)   map.push('4');
    const topicIds   = selectedTopics.map(t => t.topic_id).join(',');
    const chapterIds = chapters
      .filter(ch => ch.topics?.some(t => selectedTopics.some(st => st.topic_id === t.topic_id)))
      .map(c => c.chapter_id).join(',');
    localStorage.setItem('topics',            topicIds);
    localStorage.setItem('chapter_ids',       chapterIds);
    localStorage.setItem('exercise_question', map.length > 0 ? map.join(',') : '1');
    localStorage.setItem('subject_id',        selectedSubject?.subject_id || localStorage.getItem('subject_id'));
    localStorage.setItem('class_id',          selectedClass?.class_id     || localStorage.getItem('class_id'));
    window.location.href = '/test-maker/step-5';
  };

  const allTopicsSelected =
    chapters.length > 0 &&
    chapters.every(ch => ch.topics?.every(t => selectedTopics.some(st => st.topic_id === t.topic_id)));

  return (
    <div className="s4-page">
      <TopBar />

      <div className="s4-blob s4-blob1" />
      <div className="s4-blob s4-blob2" />

      {/* Breadcrumb — desktop only */}
      <div className="s4-breadcrumb">
        <span className="s4-bc-item">{selectedSubject?.subject_name || 'Subject'}</span>
        <i className="ti ti-chevron-right s4-bc-sep" />
        <span className="s4-bc-item s4-bc-active">Select Topics</span>
      </div>

      {/* Header */}
      <div className="s4-header">
        <div className="s4-step-badge">Step 04 of 06</div>
        <h1 className="s4-title">
          <span className="s4-num">04</span>
          Choose Topics & Chapters
        </h1>
        <p className="s4-subtitle">Select topics and question types for your test</p>
      </div>

      {/* Scrollable content */}
      <div className="s4-content">
        {errors.topics && (
          <ErrorAlert message={errors.topics} onClose={() => clearError('topics')} />
        )}

        {isLoading ? (
          <LoadingSpinner message="Loading chapters and topics..." />
        ) : (
          <>
            {chapters.length > 0 ? (
              <>
                {/* Select All */}
                <div className="s4-select-all-card">
                  <label className="s4-select-all-label">
                    <input
                      type="checkbox"
                      className="s4-checkbox"
                      checked={allTopicsSelected}
                      onChange={e =>
                        setSelectedTopics(e.target.checked ? chapters.flatMap(ch => ch.topics || []) : [])
                      }
                    />
                    <span>Select All Topics</span>
                    <span className="s4-sel-count">{selectedTopics.length} selected</span>
                  </label>
                </div>

                {/* Chapters */}
                <div className="s4-chapters">
                  {chapters.map((chapter, idx) => {
                    const c     = getColor(idx);
                    const isExp = expandedChapters[chapter.chapter_code];
                    const allSel = chapter.topics?.every(t =>
                      selectedTopics.some(st => st.topic_id === t.topic_id)
                    );
                    return (
                      <div
                        key={chapter.chapter_code}
                        className="s4-chapter-card"
                        style={{ borderLeftColor: c.border }}
                      >
                        <button
                          className="s4-chapter-header"
                          style={{ background: c.bg }}
                          onClick={() => toggleChapter(chapter.chapter_code)}
                        >
                          <input
                            type="checkbox"
                            className="s4-checkbox"
                            checked={allSel || false}
                            onChange={() => toggleAllInChapter(chapter)}
                            onClick={e => e.stopPropagation()}
                            style={{ accentColor: c.border }}
                          />
                          <div className="s4-chapter-info">
                            <div className="s4-chapter-name" style={{ color: c.text }}>
                              {chapter.chapter_name_en}
                            </div>
                            {chapter.chapter_name_ur && (
                              <div className="s4-chapter-name-ur" style={{ color: c.text }}>
                                {chapter.chapter_name_ur}
                              </div>
                            )}
                            <div className="s4-chapter-meta">
                              {chapter.topics?.length || 0} topics
                            </div>
                          </div>
                          <i
                            className="ti ti-chevron-down s4-chapter-arrow"
                            style={{
                              color:     c.text,
                              transform: isExp ? 'rotate(180deg)' : 'none',
                            }}
                          />
                        </button>

                        {isExp && chapter.topics?.length > 0 && (
                          <div className="s4-topics-list">
                            {chapter.topics.map(topic => {
                              const isSel = selectedTopics.some(t => t.topic_id === topic.topic_id);
                              return (
                                <label
                                  key={topic.topic_id}
                                  className={`s4-topic-item ${isSel ? 's4-topic-sel' : ''}`}
                                >
                                  <input
                                    type="checkbox"
                                    className="s4-checkbox"
                                    checked={isSel}
                                    onChange={() => toggleTopic(topic)}
                                    style={{ accentColor: c.border }}
                                  />
                                  <div style={{ minWidth: 0 }}>
                                    <div style={{
                                      color:      isSel ? c.border : '#334155',
                                      fontSize:   '13px',
                                      fontWeight: '500',
                                      wordBreak:  'break-word',
                                    }}>
                                      {topic.topic_name_en}
                                    </div>
                                    {topic.topic_name_urdu && (
                                      <div style={{
                                        color:     isSel ? c.border : '#94a3b8',
                                        fontSize:  '11px',
                                        direction: 'rtl',
                                        textAlign: 'right',
                                      }}>
                                        {topic.topic_name_urdu}
                                      </div>
                                    )}
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
                  <div className="s4-sel-summary">
                    <div className="s4-sel-summary-header">
                      <i className="ti ti-check-circle" style={{ color: '#2196f3', fontSize: '18px' }} />
                      <span className="s4-sel-summary-title">Selected Topics</span>
                      <span className="s4-sel-summary-count">{selectedTopics.length}</span>
                      <button className="s4-sel-clear" onClick={() => setSelectedTopics([])}>
                        Clear all
                      </button>
                    </div>
                    <div className="s4-sel-tags">
                      {selectedTopics.map(topic => (
                        <div key={topic.topic_id} className="s4-sel-tag">
                          <span>{topic.topic_name_en || topic.topic_name_urdu}</span>
                          <button className="s4-tag-x" onClick={() => toggleTopic(topic)}>✕</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Question Types */}
                <div className="s4-qtype-section">
                  <div className="s4-qtype-header">
                    <div className="s4-qtype-icon">
                      <i className="ti ti-adjustments" />
                    </div>
                    <div className="s4-qtype-header-text">
                      <h3 className="s4-qtype-title">Question Types</h3>
                      <p className="s4-qtype-sub">Select which types of questions to include</p>
                    </div>
                    <button
                      type="button"
                      className="s4-qtype-select-all-btn"
                      onClick={toggleAllQTypes}
                    >
                      <i className={`ti ${allQTypesSelected ? 'ti-square' : 'ti-checks'}`} />
                      {allQTypesSelected ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                  <div className="s4-qtype-grid">
                    {exTypes.map(({ key, icon, label, desc }) => (
                      <label
                        key={key}
                        className={`s4-qtype-card ${exerciseTypes[key] ? 's4-qtype-active' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={exerciseTypes[key]}
                          onChange={e => setExerciseTypes(p => ({ ...p, [key]: e.target.checked }))}
                          style={{ display: 'none' }}
                        />
                        <i className={`ti ${icon} s4-qtype-card-icon`} />
                        <span className="s4-qtype-name">{label}</span>
                        <span className="s4-qtype-desc">{desc}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="s4-empty">
                <i className="ti ti-inbox" />
                <p>No chapters or topics available</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Sticky bottom action bar */}
      <div className="s4-actions">
        <button
          onClick={() => window.location.href = '/test-maker/step-3'}
          className="s4-btn s4-btn-ghost"
        >
          <i className="ti ti-arrow-left" /> Back
        </button>
        <button
          onClick={handleNext}
          disabled={selectedTopics.length === 0 || isLoading}
          className={`s4-btn s4-btn-primary ${selectedTopics.length === 0 || isLoading ? 's4-btn-disabled' : ''}`}
        >
          Next <i className="ti ti-arrow-right" />
        </button>
      </div>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; }

        /* ── Page shell ── */
        .s4-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f0f4f8 0%, #e8eef5 100%);
          padding: 24px 20px 48px;
          font-family: 'Segoe UI', system-ui, sans-serif;
          position: relative;
          overflow-x: hidden;
        }

        /* ── Blobs ── */
        .s4-blob { position: fixed; border-radius: 50%; pointer-events: none; z-index: 0; }
        .s4-blob1 { top: -100px; right: -100px; width: 350px; height: 350px; background: radial-gradient(circle, rgba(33,150,243,0.07) 0%, transparent 70%); }
        .s4-blob2 { bottom: -60px; left: -60px;  width: 260px; height: 260px; background: radial-gradient(circle, rgba(33,150,243,0.05) 0%, transparent 70%); }

        /* ── Breadcrumb ── */
        .s4-breadcrumb {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-top: 80px;
          margin-bottom: 16px;
          position: relative;
          z-index: 1;
          flex-wrap: wrap;
        }
        .s4-bc-item { padding: 4px 12px; background: rgba(255,255,255,0.7); border-radius: 20px; font-size: 12px; color: #64748b; font-weight: 500; }
        .s4-bc-active { background: white; color: #2196f3; font-weight: 700; box-shadow: 0 2px 8px rgba(0,0,0,0.07); }
        .s4-bc-sep { color: #cbd5e1; font-size: 13px; }

        /* ── Header ── */
        .s4-header {
          text-align: center;
          margin-bottom: 24px;
          position: relative;
          z-index: 1;
        }
        .s4-step-badge {
          display: inline-flex;
          padding: 5px 18px;
          background: linear-gradient(135deg, #2196f3, #1565c0);
          color: white;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.5px;
          margin-bottom: 16px;
        }
        .s4-title {
          font-size: clamp(20px, 5vw, 36px);
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          letter-spacing: -0.5px;
          flex-wrap: wrap;
          line-height: 1.2;
        }
        .s4-num {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 50px; height: 50px;
          background: linear-gradient(135deg, #2196f3, #1565c0);
          color: white;
          border-radius: 50%;
          font-size: 20px;
          font-weight: 800;
          flex-shrink: 0;
        }
        .s4-subtitle {
          font-size: 15px;
          color: #64748b;
          margin: 0 auto;
          max-width: 440px;
          line-height: 1.7;
        }

        /* ── Content wrapper ── */
        .s4-content { max-width: 1000px; margin: 0 auto; position: relative; z-index: 1; }

        /* ── Select-all card ── */
        .s4-select-all-card {
          background: white;
          border-radius: 14px;
          padding: 14px 18px;
          margin-bottom: 14px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.06);
        }
        .s4-select-all-label {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          font-weight: 700;
          font-size: 14px;
          color: #2196f3;
          user-select: none;
        }
        .s4-sel-count {
          margin-left: auto;
          background: #e3f2fd;
          color: #1565c0;
          font-size: 12px;
          padding: 3px 10px;
          border-radius: 12px;
          font-weight: 700;
        }
        .s4-checkbox { width: 18px; height: 18px; cursor: pointer; accent-color: #2196f3; flex-shrink: 0; }

        /* ── Chapters grid ── */
        .s4-chapters {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-bottom: 18px;
          align-items: start;
        }
        .s4-chapter-card {
          background: white;
          border-radius: 14px;
          border-left: 4px solid;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          min-width: 0;
        }
        .s4-chapter-header {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 16px;
          cursor: pointer;
          border: none;
          width: 100%;
          text-align: left;
          font-family: inherit;
          -webkit-tap-highlight-color: transparent;
          min-height: 52px;
        }
        .s4-chapter-info { flex: 1; min-width: 0; }
        .s4-chapter-name {
          font-size: 13px;
          font-weight: 700;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          margin-bottom: 1px;
        }
        .s4-chapter-name-ur { font-size: 11px; direction: rtl; text-align: right; opacity: 0.8; }
        .s4-chapter-meta   { font-size: 11px; color: #94a3b8; margin-top: 2px; }
        .s4-chapter-arrow  { font-size: 16px; flex-shrink: 0; transition: transform 0.25s ease; }

        /* ── Topics list ── */
        .s4-topics-list {
          padding: 8px 14px;
          border-top: 1px solid rgba(0,0,0,0.05);
          background: #fafbfc;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .s4-topic-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 9px 10px;
          border-radius: 10px;
          cursor: pointer;
          transition: background 0.15s;
          -webkit-tap-highlight-color: transparent;
        }
        .s4-topic-item:active { background: rgba(0,0,0,0.04); }
        .s4-topic-sel { background: rgba(33,150,243,0.06); }

        /* ── Selected summary ── */
        .s4-sel-summary {
          background: linear-gradient(135deg, #e3f2fd, #bbdefb);
          border: 2px solid #2196f3;
          border-radius: 14px;
          padding: 16px;
          margin-bottom: 16px;
        }
        .s4-sel-summary-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 10px;
          flex-wrap: wrap;
        }
        .s4-sel-summary-title { font-size: 14px; font-weight: 700; color: #1565c0; }
        .s4-sel-summary-count {
          background: #2196f3;
          color: white;
          font-size: 11px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 10px;
        }
        .s4-sel-clear {
          margin-left: auto;
          background: none;
          border: 1px solid #90caf9;
          color: #1565c0;
          font-size: 12px;
          padding: 3px 10px;
          border-radius: 8px;
          cursor: pointer;
          font-family: inherit;
        }
        .s4-sel-tags { display: flex; flex-wrap: wrap; gap: 6px; }
        .s4-sel-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: white;
          border: 1px solid #2196f3;
          border-radius: 16px;
          padding: 5px 10px;
          font-size: 12px;
          color: #1565c0;
          font-weight: 500;
          max-width: 100%;
          word-break: break-word;
        }
        .s4-tag-x {
          background: none; border: none;
          color: #1565c0; cursor: pointer;
          font-size: 12px; padding: 0; line-height: 1;
          flex-shrink: 0;
        }

        /* ── Question types ── */
        .s4-qtype-section {
          background: white;
          border-radius: 18px;
          padding: 20px 16px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.06);
          margin-bottom: 16px;
        }
        .s4-qtype-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 18px;
          flex-wrap: wrap;
        }
        .s4-qtype-icon {
          width: 40px; height: 40px;
          border-radius: 12px;
          background: linear-gradient(135deg, #2196f3, #1565c0);
          display: flex; align-items: center; justify-content: center;
          color: white; font-size: 18px; flex-shrink: 0;
        }
        .s4-qtype-header-text { flex: 1; min-width: 0; }
        .s4-qtype-title { font-size: 15px; font-weight: 700; color: #0f1f35; margin: 0 0 2px; }
        .s4-qtype-sub  { font-size: 12px; color: #94a3b8; margin: 0; }
        .s4-qtype-select-all-btn {
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
          white-space: nowrap;
        }
        .s4-qtype-select-all-btn:hover  { background: #bbdefb; border-color: #2196f3; }
        .s4-qtype-select-all-btn:active { transform: scale(0.96); }
        .s4-qtype-select-all-btn i { font-size: 14px; }
        .s4-qtype-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 10px;
        }
        .s4-qtype-card {
          border: 2px solid #e8eef5;
          border-radius: 14px;
          padding: 16px 12px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          text-align: center;
          transition: all 0.2s ease;
          background: #f8fafc;
          -webkit-tap-highlight-color: transparent;
          user-select: none;
        }
        .s4-qtype-card:active { transform: scale(0.96); }
        .s4-qtype-active {
          background: linear-gradient(135deg, #2196f3, #1565c0);
          border-color: #2196f3;
          box-shadow: 0 4px 14px rgba(33,150,243,0.3);
        }
        .s4-qtype-card-icon { font-size: 22px; color: #2196f3; }
        .s4-qtype-active .s4-qtype-card-icon { color: white; }
        .s4-qtype-name { font-size: 12px; font-weight: 700; color: #334155; }
        .s4-qtype-active .s4-qtype-name { color: white; }
        .s4-qtype-desc { font-size: 10px; color: #94a3b8; line-height: 1.3; }
        .s4-qtype-active .s4-qtype-desc { color: rgba(255,255,255,0.8); }

        /* ── Empty state ── */
        .s4-empty { text-align: center; padding: 60px 20px; color: #94a3b8; }
        .s4-empty i { font-size: 56px; opacity: 0.15; display: block; margin-bottom: 12px; }

        /* ── Inline action bar (matches Step 5 pattern) ── */
        .s4-actions {
          max-width: 1000px;
          width: 100%;
          margin: 24px auto 0;
          display: flex;
          gap: 12px;
          padding-top: 20px;
          border-top: 2px solid rgba(0,0,0,0.07);
        }
        .s4-btn {
          flex: 1;
          padding: 13px 24px;
          font-size: 14px;
          font-weight: 700;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s;
          font-family: inherit;
          min-height: 48px;
          -webkit-tap-highlight-color: transparent;
        }
        .s4-btn-primary {
          background: linear-gradient(135deg, #2196f3, #1565c0);
          color: white;
          box-shadow: 0 4px 16px rgba(33,150,243,0.35);
        }
        .s4-btn-primary:hover:not(.s4-btn-disabled) { box-shadow: 0 6px 22px rgba(33,150,243,0.45); }
        .s4-btn-primary:active:not(.s4-btn-disabled) { transform: scale(0.97); }
        .s4-btn-ghost {
          background: white;
          color: #64748b;
          border: 1px solid #e0e7ef;
          flex: 0 0 auto;
          padding: 13px 28px;
        }
        .s4-btn-ghost:hover { background: #f8fafc; }
        .s4-btn-disabled { opacity: 0.5; cursor: not-allowed; }

        /* ── Tablet (≤768px) ── */
        @media (max-width: 768px) {
          .s4-breadcrumb { display: none; }
          .s4-header { margin-top: 72px; }
          .s4-page { padding: 24px 16px 40px; }
          .s4-actions { padding-top: 16px; }
        }

        /* ── Mobile (≤600px) — single column chapters ── */
        @media (max-width: 600px) {
          .s4-chapters { grid-template-columns: 1fr; }
        }

        /* ── Mobile (≤480px) ── */
        @media (max-width: 480px) {
          .s4-page { padding: 16px 12px 32px; }
          .s4-header { margin-top: 68px; margin-bottom: 20px; }
          .s4-num { width: 40px; height: 40px; font-size: 16px; }
          .s4-title { font-size: 20px; gap: 8px; }
          .s4-subtitle { font-size: 13px; padding: 0 8px; }
          .s4-chapter-header { padding: 12px; gap: 8px; }
          .s4-chapter-name { font-size: 12px; }
          .s4-topics-list { padding: 6px 10px; }
          .s4-qtype-grid { grid-template-columns: repeat(2, 1fr); }
          .s4-qtype-card { padding: 14px 10px; }
          .s4-btn-ghost { padding: 13px 20px; }
        }

        /* ── Desktop: header sits right below breadcrumb, no extra top margin ── */
        @media (min-width: 769px) {
          .s4-header { margin-top: 0; }
        }
      `}</style>
    </div>
  );
}