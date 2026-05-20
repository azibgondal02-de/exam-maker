import React, { useEffect, useState } from 'react';
import { useTestMaker } from '../../hooks/useTestMaker';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';

export default function Step4TopicSelect() {
  const {
    selectedSubject,
    selectedClass,
    chapters,
    selectedTopics,
    isLoading,
    errors,
    loadTopics,
    setSelectedTopics,
    goBack,
    clearError,
  } = useTestMaker();

  const [expandedChapters, setExpandedChapters] = useState({});

  // Controlled exercise question types
  // exercise=1, additional=0, past=2, conceptual=3, examples=4
  const [exerciseTypes, setExerciseTypes] = useState({
    exercise: true,
    additional: true,
    past: false,
    conceptual: false,
    examples: false,
  });

  useEffect(() => {
    const subjectId = selectedSubject?.subject_id || localStorage.getItem("subject_id");
    if (subjectId) {
      loadTopics(subjectId);
    }
  }, [selectedSubject]);

  const toggleChapter = (chapterCode) => {
    setExpandedChapters(prev => ({
      ...prev,
      [chapterCode]: !prev[chapterCode]
    }));
  };

  const toggleTopic = (topic) => {
    const isSelected = selectedTopics.some(t => t.topic_id === topic.topic_id);
    if (isSelected) {
      setSelectedTopics(selectedTopics.filter(t => t.topic_id !== topic.topic_id));
    } else {
      setSelectedTopics([...selectedTopics, topic]);
    }
  };

  const toggleAllTopicsInChapter = (chapter) => {
    const allSelected = chapter.topics.every(t =>
      selectedTopics.some(st => st.topic_id === t.topic_id)
    );
    if (allSelected) {
      const chapterTopicIds = new Set(chapter.topics.map(t => t.topic_id));
      setSelectedTopics(selectedTopics.filter(t => !chapterTopicIds.has(t.topic_id)));
    } else {
      const newTopics = chapter.topics.filter(t =>
        !selectedTopics.some(st => st.topic_id === t.topic_id)
      );
      setSelectedTopics([...selectedTopics, ...newTopics]);
    }
  };

  const handleNext = () => {
    if (selectedTopics.length === 0) {
      alert('Please select at least one topic');
      return;
    }

    // Build exercise_question string from controlled state
    const exerciseMap = [];
    if (exerciseTypes.exercise) exerciseMap.push('1');
    if (exerciseTypes.additional) exerciseMap.push('0');
    if (exerciseTypes.past) exerciseMap.push('2');
    if (exerciseTypes.conceptual) exerciseMap.push('3');
    if (exerciseTypes.examples) exerciseMap.push('4');
    const exerciseQuestion = exerciseMap.length > 0 ? exerciseMap.join(',') : '1';

    // Only save topic IDs from SELECTED topics
    const topicIds = selectedTopics.map(t => t.topic_id).join(',');

    // Only save chapter IDs of chapters that have at least one selected topic
    const selectedChapterIds = chapters
      .filter(ch => ch.topics?.some(t => selectedTopics.some(st => st.topic_id === t.topic_id)))
      .map(c => c.chapter_id)
      .join(',');

    localStorage.setItem('topics', topicIds);
    localStorage.setItem('chapter_ids', selectedChapterIds);
    localStorage.setItem('exercise_question', exerciseQuestion);
    localStorage.setItem('subject_id', selectedSubject?.subject_id || localStorage.getItem('subject_id'));
    localStorage.setItem('class_id', selectedClass?.class_id || localStorage.getItem('class_id'));

    window.location.href = '/test-maker/step-5';
  };

  const colorPalette = [
    { border: '#e91e63', bg: '#fce4ec', text: '#c2185b' },
    { border: '#9c27b0', bg: '#f3e5f5', text: '#7b1fa2' },
    { border: '#673ab7', bg: '#ede7f6', text: '#512da8' },
    { border: '#3f51b5', bg: '#e8eaf6', text: '#283593' },
    { border: '#2196f3', bg: '#e3f2fd', text: '#1565c0' },
    { border: '#009688', bg: '#e0f2f1', text: '#00695c' },
    { border: '#4caf50', bg: '#e8f5e9', text: '#2e7d32' },
    { border: '#ff9800', bg: '#fff3e0', text: '#e65100' },
  ];

  const getChapterColor = (index) => colorPalette[index % colorPalette.length];

  return (
    <div className="step-page">
      <div className="step-header-section">
        <div className="breadcrumb">
          <span className="breadcrumb-item">{selectedSubject?.subject_name}</span>
          <i className="ti ti-chevron-right"></i>
          <span className="breadcrumb-item active">Select Topics</span>
        </div>
        <h1 className="step-heading">
          <span className="step-number">04</span>
          Choose Topics & Chapters
        </h1>
        <p className="step-description">Select the topics you want to include in your test</p>
      </div>

      <div className="step-content">
        {errors.topics && (
          <ErrorAlert message={errors.topics} onClose={() => clearError('topics')} />
        )}

        {isLoading ? (
          <LoadingSpinner message="Loading chapters and topics..." />
        ) : (
          <>
            {chapters.length > 0 ? (
              <>
                <div className="select-all-section">
                  <label className="select-all-label">
                    <input
                      type="checkbox"
                      className="select-all-checkbox"
                      checked={selectedTopics.length > 0 && chapters.every(ch =>
                        ch.topics?.every(t => selectedTopics.some(st => st.topic_id === t.topic_id))
                      )}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTopics(chapters.flatMap(ch => ch.topics || []));
                        } else {
                          setSelectedTopics([]);
                        }
                      }}
                    />
                    <span>Select All Topics</span>
                  </label>
                </div>

                <div className="chapters-list">
                  {chapters.map((chapter, index) => {
                    const color = getChapterColor(index);
                    const isExpanded = expandedChapters[chapter.chapter_code];
                    const allTopicsSelected = chapter.topics?.every(t =>
                      selectedTopics.some(st => st.topic_id === t.topic_id)
                    );

                    return (
                      <div key={chapter.chapter_code} className="chapter-card">
                        <button
                          className="chapter-header"
                          style={{ backgroundColor: color.bg, borderLeftColor: color.border }}
                          onClick={() => toggleChapter(chapter.chapter_code)}
                        >
                          <div className="chapter-checkbox-wrapper">
                            <input
                              type="checkbox"
                              className="chapter-checkbox"
                              checked={allTopicsSelected || false}
                              onChange={() => toggleAllTopicsInChapter(chapter)}
                              onClick={(e) => e.stopPropagation()}
                              style={{ borderColor: color.border, accentColor: color.border }}
                            />
                          </div>
                          <div className="chapter-info">
                            <h3 className="chapter-name" style={{ color: color.text }}>{chapter.chapter_name_en}</h3>
                            {chapter.chapter_name_ur && (
                              <p className="chapter-name-ur" style={{ color: color.text }}>{chapter.chapter_name_ur}</p>
                            )}
                            <p className="chapter-meta">{chapter.topics?.length || 0} topics</p>
                          </div>
                          <div className="expand-icon" style={{ color: color.text }}>
                            <i className="ti ti-chevron-down" style={{
                              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
                              transition: 'transform 0.3s ease'
                            }}></i>
                          </div>
                        </button>

                        {isExpanded && chapter.topics && chapter.topics.length > 0 && (
                          <div className="topics-list">
                            {chapter.topics.map((topic) => {
                              const isSelected = selectedTopics.some(t => t.topic_id === topic.topic_id);
                              return (
                                <div key={topic.topic_id} className="topic-item">
                                  <input
                                    type="checkbox"
                                    className="topic-checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleTopic(topic)}
                                    style={{ accentColor: color.border }}
                                  />
                                  <label className="topic-label" style={{ color: isSelected ? color.border : '#333' }}>
                                    <span>{topic.topic_name_en}</span>
                                    {topic.topic_name_urdu && (
                                      <span style={{ display: 'block', fontSize: '11px', color: isSelected ? color.border : '#999', direction: 'rtl', textAlign: 'right' }}>
                                        {topic.topic_name_urdu}
                                      </span>
                                    )}
                                  </label>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {selectedTopics.length > 0 && (
                  <div className="selected-summary">
                    <div className="summary-content">
                      <p className="summary-label">Selected Topics</p>
                      <h3 className="summary-count">{selectedTopics.length} selected</h3>
                      <div className="selected-tags">
                        {selectedTopics.map((topic) => (
                          <div key={topic.topic_id} className="tag">
                            <span>{topic.topic_name_en || topic.topic_name_urdu}</span>
                            <button onClick={() => toggleTopic(topic)} className="tag-close">✕</button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <i className="ti ti-check-circle"></i>
                  </div>
                )}

                {/* Question Types - CONTROLLED CHECKBOXES */}
                <div className="question-types-section">
                  <h3 className="section-title">Question Level & Types</h3>
                  <p className="section-subtitle">Select the types of questions to include</p>
                  <div className="question-types-grid">

                    <label className="question-type-card">
                      <input type="checkbox" className="type-checkbox"
                        checked={exerciseTypes.exercise}
                        onChange={e => setExerciseTypes(p => ({ ...p, exercise: e.target.checked }))} />
                      <div className="type-content">
                        <i className="ti ti-pencil"></i>
                        <span className="type-name">Exercise Questions</span>
                        <p className="type-desc">Practice questions from chapters</p>
                      </div>
                    </label>

                    <label className="question-type-card">
                      <input type="checkbox" className="type-checkbox"
                        checked={exerciseTypes.additional}
                        onChange={e => setExerciseTypes(p => ({ ...p, additional: e.target.checked }))} />
                      <div className="type-content">
                        <i className="ti ti-file-text"></i>
                        <span className="type-name">Additional Papers</span>
                        <p className="type-desc">Extra question papers</p>
                      </div>
                    </label>

                    <label className="question-type-card">
                      <input type="checkbox" className="type-checkbox"
                        checked={exerciseTypes.past}
                        onChange={e => setExerciseTypes(p => ({ ...p, past: e.target.checked }))} />
                      <div className="type-content">
                        <i className="ti ti-history"></i>
                        <span className="type-name">Past Papers</span>
                        <p className="type-desc">Previous exam questions</p>
                      </div>
                    </label>

                    <label className="question-type-card">
                      <input type="checkbox" className="type-checkbox"
                        checked={exerciseTypes.conceptual}
                        onChange={e => setExerciseTypes(p => ({ ...p, conceptual: e.target.checked }))} />
                      <div className="type-content">
                        <i className="ti ti-lightbulb"></i>
                        <span className="type-name">Conceptual Questions</span>
                        <p className="type-desc">Concept-based problems</p>
                      </div>
                    </label>

                    <label className="question-type-card">
                      <input type="checkbox" className="type-checkbox"
                        checked={exerciseTypes.examples}
                        onChange={e => setExerciseTypes(p => ({ ...p, examples: e.target.checked }))} />
                      <div className="type-content">
                        <i className="ti ti-bulb"></i>
                        <span className="type-name">Exercise Examples</span>
                        <p className="type-desc">Worked examples</p>
                      </div>
                    </label>

                  </div>
                </div>
              </>
            ) : (
              <div className="empty-state">
                <i className="ti ti-inbox"></i>
                <p className="empty-text">No chapters or topics available</p>
              </div>
            )}
          </>
        )}
      </div>

      <div className="step-actions-bottom">
        <button onClick={goBack} className="btn btn-ghost">
          <i className="ti ti-arrow-left"></i>
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={selectedTopics.length === 0 || isLoading}
          className={`btn btn-primary ${selectedTopics.length === 0 || isLoading ? 'disabled' : ''}`}
        >
          Next
          <i className="ti ti-arrow-right"></i>
        </button>
      </div>

      <style jsx>{`
        .step-page { min-height: 100vh; background: linear-gradient(135deg, #f5f7fa 0%, #f0f4f8 100%); padding: 20px; display: flex; flex-direction: column; }
        .step-header-section { max-width: 1000px; width: 100%; margin: 0 auto 32px; text-align: center; }
        .breadcrumb { display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 20px; font-size: 13px; color: #999; flex-wrap: wrap; }
        .breadcrumb-item { padding: 6px 12px; background: rgba(255, 255, 255, 0.6); border-radius: 6px; }
        .breadcrumb-item.active { color: #2196f3; font-weight: 600; background: white; }
        .step-heading { font-size: 36px; font-weight: 700; color: #1a1a1a; margin: 0 0 10px 0; display: flex; align-items: center; justify-content: center; gap: 12px; flex-wrap: wrap; }
        .step-number { display: inline-flex; align-items: center; justify-content: center; width: 52px; height: 52px; background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%); color: white; border-radius: 50%; font-size: 22px; font-weight: 600; }
        .step-description { font-size: 15px; color: #666; margin: 0; }
        .step-content { max-width: 1000px; width: 100%; margin: 0 auto; flex: 1; }
        .chapters-list { display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px; }
        .select-all-section { background: white; border-radius: 10px; padding: 14px 16px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); }
        .select-all-label { display: flex; align-items: center; gap: 10px; cursor: pointer; font-weight: 600; font-size: 14px; color: #2196f3; user-select: none; }
        .select-all-checkbox { width: 20px; height: 20px; cursor: pointer; accent-color: #2196f3; }
        .chapter-card { background: white; border-radius: 10px; border-left: 4px solid; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); }
        .chapter-header { display: flex; align-items: center; gap: 12px; padding: 14px 16px; cursor: pointer; transition: all 0.2s ease; border: none; width: 100%; background: inherit; text-align: left; font-family: inherit; }
        .chapter-header:hover { background-color: rgba(0, 0, 0, 0.02); }
        .chapter-checkbox-wrapper { display: flex; align-items: center; flex-shrink: 0; }
        .chapter-checkbox { width: 20px; height: 20px; cursor: pointer; }
        .chapter-info { flex: 1; text-align: left; min-width: 0; }
        .chapter-name { font-size: 14px; font-weight: 600; margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .chapter-name-ur { font-size: 12px; margin: 2px 0 0 0; direction: rtl; text-align: right; opacity: 0.85; }
        .chapter-meta { font-size: 11px; color: #999; margin: 3px 0 0 0; }
        .expand-icon { display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
        .topics-list { padding: 10px 14px; border-top: 1px solid #f0f0f0; background: #fafafa; display: flex; flex-direction: column; gap: 8px; }
        .topic-item { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 6px; cursor: pointer; transition: all 0.2s ease; }
        .topic-item:hover { background: rgba(0, 0, 0, 0.04); }
        .topic-checkbox { width: 18px; height: 18px; cursor: pointer; flex-shrink: 0; }
        .topic-label { font-size: 13px; font-weight: 500; flex: 1; cursor: pointer; }
        .selected-summary { background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); border: 2px solid #2196f3; border-radius: 10px; padding: 20px; display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 24px; }
        .summary-content { flex: 1; }
        .summary-label { font-size: 12px; font-weight: 700; color: #1565c0; margin: 0 0 6px 0; text-transform: uppercase; }
        .summary-count { font-size: 18px; font-weight: 700; color: #0d47a1; margin: 0 0 12px 0; }
        .selected-tags { display: flex; flex-wrap: wrap; gap: 8px; }
        .tag { display: inline-flex; align-items: center; gap: 6px; background: white; border: 1px solid #2196f3; border-radius: 20px; padding: 6px 12px; font-size: 12px; font-weight: 500; color: #1565c0; }
        .tag-close { background: transparent; border: none; color: #1565c0; cursor: pointer; font-size: 13px; padding: 0; }
        .tag-close:hover { color: #d32f2f; }
        .selected-summary i { font-size: 32px; color: #2196f3; flex-shrink: 0; }
        .question-types-section { background: white; border-radius: 10px; padding: 20px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); margin-bottom: 24px; }
        .section-title { font-size: 16px; font-weight: 700; color: #1a1a1a; margin: 0 0 8px 0; }
        .section-subtitle { font-size: 13px; color: #999; margin: 0 0 16px 0; }
        .question-types-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; }
        .question-type-card { position: relative; background: linear-gradient(135deg, #f5f7fa 0%, #eef2f7 100%); border: 2px solid #e0e0e0; border-radius: 10px; padding: 14px; cursor: pointer; transition: all 0.3s ease; display: flex; flex-direction: column; align-items: center; gap: 8px; text-align: center; }
        .question-type-card:hover { border-color: #2196f3; background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); box-shadow: 0 4px 12px rgba(33, 150, 243, 0.15); }
        .question-type-card:has(input:checked) { background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%); border-color: #2196f3; color: white; }
        .type-checkbox { width: 18px; height: 18px; cursor: pointer; accent-color: #2196f3; }
        .type-content { display: flex; flex-direction: column; align-items: center; gap: 6px; width: 100%; }
        .type-content i { font-size: 24px; color: #2196f3; }
        .question-type-card:has(input:checked) .type-content i { color: white; }
        .type-name { font-size: 13px; font-weight: 600; color: #333; }
        .question-type-card:has(input:checked) .type-name { color: white; }
        .type-desc { font-size: 11px; color: #999; margin: 0; line-height: 1.2; }
        .question-type-card:has(input:checked) .type-desc { color: rgba(255, 255, 255, 0.8); }
        .empty-state { text-align: center; padding: 50px 20px; color: #999; }
        .empty-state i { font-size: 70px; margin-bottom: 16px; opacity: 0.2; }
        .empty-text { margin: 0; font-size: 15px; }
        .step-actions-bottom { max-width: 1000px; width: 100%; margin: 20px auto 0; display: flex; justify-content: space-between; gap: 12px; padding-top: 20px; border-top: 2px solid rgba(0, 0, 0, 0.08); }
        .btn { padding: 12px 24px; font-size: 14px; font-weight: 600; border: none; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; gap: 8px; flex: 1; justify-content: center; }
        .btn-primary { background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%); color: white; box-shadow: 0 3px 10px rgba(33, 150, 243, 0.2); }
        .btn-primary:hover:not(.disabled) { transform: translateY(-2px); box-shadow: 0 5px 14px rgba(33, 150, 243, 0.3); }
        .btn-ghost { background: transparent; color: #999; border: 1px solid rgba(0, 0, 0, 0.1); }
        .btn-ghost:hover:not(.disabled) { background: white; color: #2196f3; border-color: #2196f3; }
        .btn.disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </div>
  );
}