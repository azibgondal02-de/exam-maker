import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { useTestMaker } from '../../hooks/useTestMaker';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';
import * as apiService from '../../services/api';

const IMAGE_BASE = 'https://testmaker.pk';

function fixHtml(html) {
  if (!html) return '';
  return html.replace(/src="\/([^"]+)"/g, `src="${IMAGE_BASE}/$1"`);
}

// Combine statement + description for display
function QuestionText({ statement, description }) {
  const combined = [statement, description].filter(Boolean).join(' ');
  if (!combined) return <span style={{ color: '#999' }}>—</span>;
  return (
    <span
      dangerouslySetInnerHTML={{ __html: fixHtml(combined) }}
      style={{ lineHeight: '1.8', fontSize: '13px' }}
    />
  );
}

// Render MCQ options
// Render MCQ options - show both languages if available
// Render MCQ options - shows only specified language
// Render MCQ options - shows only specified language
function OptionsDisplay({ options, language = 'en' }) {
    if (!options || options.length === 0) return null;
    const letters = ['A', 'B', 'C', 'D', 'E'];
    return (
      <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
        {options.map((opt, i) => {
          const optionText = language === 'ur' ? opt.option_ur : opt.option_en;
          if (!optionText) return null; // Skip if this language doesn't exist
          
          return (
            <div key={opt.option_id} style={{
              display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '12px',
              color: opt.is_correct ? '#15803d' : '#374151',
              fontWeight: opt.is_correct ? '600' : 'normal',
              background: opt.is_correct ? '#dcfce7' : 'transparent',
              padding: '2px 6px', borderRadius: '4px'
            }}>
              <span style={{ flexShrink: 0, fontWeight: '700' }}>{letters[i]}.</span>
              <span 
                dangerouslySetInnerHTML={{ __html: fixHtml(optionText) }}
                style={{ 
                  direction: language === 'ur' ? 'rtl' : 'ltr',
                  textAlign: language === 'ur' ? 'right' : 'left'
                }}
              />
            </div>
          );
        })}
      </div>
    );
}
  
function QuestionPickerModal({ isOpen, onClose, onDone, questions, loading, title }) {
    const [selected, setSelected] = useState([]);
    useEffect(() => { if (isOpen) setSelected([]); }, [isOpen]);
    if (!isOpen) return null;
  
    const toggle = (id) => setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
    const toggleAll = () => setSelected(selected.length === questions.length ? [] : questions.map(q => q.id));
  
    return (
      <div style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: '20px'
      }} onClick={onClose}>
        <div style={{
          background: 'white', borderRadius: '10px', width: '100%',
          maxWidth: '920px', maxHeight: '84vh', display: 'flex',
          flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }} onClick={e => e.stopPropagation()}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '600', margin: 0, flex: 1 }}>{title}</h3>
            <span style={{ background: '#dbeafe', color: '#1d4ed8', fontWeight: '700', fontSize: '13px', padding: '3px 10px', borderRadius: '20px' }}>
              {selected.length} selected
            </span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#6b7280' }}>✕</button>
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Loading questions...</div>
            ) : questions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>No questions found</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr>
                    <th style={thStyle}><input type="checkbox" checked={selected.length === questions.length && questions.length > 0} onChange={toggleAll} /></th>
                    <th style={thStyle}>#</th>
                    <th style={{ ...thStyle, textAlign: 'left' }}>English</th>
                    <th style={{ ...thStyle, textAlign: 'right' }}>اردو</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map((q, i) => (
                    <tr key={q.id} style={{ background: selected.includes(q.id) ? '#eff6ff' : 'white' }}>
                      <td style={tdStyle}><input type="checkbox" checked={selected.includes(q.id)} onChange={() => toggle(q.id)} /></td>
                      <td style={{ ...tdStyle, color: '#888', fontSize: '12px', width: '40px' }}>{i + 1}</td>
                      <td style={{ ...tdStyle, maxWidth: '360px', wordBreak: 'break-word' }}>
                        <QuestionText statement={q.statement_en} description={q.description_en} />
                        <OptionsDisplay options={q.options} language="en" />
                      </td>
                      <td style={{ ...tdStyle, maxWidth: '360px', wordBreak: 'break-word', direction: 'rtl', textAlign: 'right' }}>
                        <QuestionText statement={q.statement_ur} description={q.description_ur} />
                        <OptionsDisplay options={q.options} language="ur" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div style={{ padding: '12px 20px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button onClick={onClose} style={{ padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', background: 'white' }}>Cancel</button>
            <button onClick={() => onDone(selected)} style={{ padding: '8px 18px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
              Done ({selected.length})
            </button>
          </div>
        </div>
      </div>
    );
}

const thStyle = {
  position: 'sticky', top: 0, background: '#f8fafc',
  padding: '10px 14px', textAlign: 'left', fontWeight: '600',
  color: '#475569', borderBottom: '1px solid #e2e8f0', fontSize: '12px'
};
const tdStyle = { padding: '10px 14px', borderBottom: '1px solid #f1f5f9', verticalAlign: 'top' };

// ─── Chapter Multi-Select ────────────────────────────────────────────────────
// Chapter Multi-Select using chapter_code instead of chapter_id
function ChapterMultiSelect({ chapters, value = [], onChange }) {
    const [open, setOpen] = useState(false);
    const [dropPos, setDropPos] = useState({ top: 0, left: 0 });
    const btnRef = React.useRef(null);
    const dropdownRef = React.useRef(null);
  
    const handleOpen = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (btnRef.current) {
        const rect = btnRef.current.getBoundingClientRect();
        setDropPos({ 
          top: rect.bottom + window.scrollY + 4, 
          left: rect.left + window.scrollX 
        });
      }
      setOpen(!open);
    };
  
    const toggle = (code, e) => {
      if (e) e.stopPropagation();
      const next = value.includes(code) ? value.filter(x => x !== code) : [...value, code];
      onChange(next);
    };
  
    const toggleAll = (e) => {
      if (e) e.stopPropagation();
      onChange([]);
    };
  
    const getChapterName = (chapter) => {
      return chapter.chapter_name_en || chapter.chapter_name_urdu || chapter.chapter_code;
    };
  
    const label = value.length === 0 ? 'All Chapters' : `${value.length} chapter${value.length > 1 ? 's' : ''}`;
  
    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target) && 
            btnRef.current && !btnRef.current.contains(event.target)) {
          setOpen(false);
        }
      };
      if (open) {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
      }
    }, [open]);
  
    const dropdown = open ? (
      <div
        ref={dropdownRef}
        style={{
          position: 'absolute', 
          top: dropPos.top, 
          left: dropPos.left,
          background: 'white', 
          border: '1px solid #d1d5db', 
          borderRadius: '8px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)', 
          zIndex: 99999,
          minWidth: '260px', 
          maxHeight: '280px', 
          display: 'flex', 
          flexDirection: 'column'
        }}
      >
        {/* Header with close button */}
        <div style={{ 
          padding: '8px 12px', 
          borderBottom: '1px solid #f0f0f0', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          background: '#f8fafc',
          borderRadius: '8px 8px 0 0'
        }}>
          <span style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>
            Select Chapters
          </span>
          <button
            onClick={() => setOpen(false)}
            style={{ background: '#e2e8f0', border: 'none', borderRadius: '4px', cursor: 'pointer', color: '#64748b', fontSize: '12px', padding: '2px 8px', fontWeight: '600' }}
          >
            ✕ Close
          </button>
        </div>
  
        {/* All Chapters option */}
        <div style={{ padding: '6px 12px', borderBottom: '1px solid #f0f0f0' }}>
          <label style={{ 
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '4px 0', cursor: 'pointer', fontSize: '12px',
            fontWeight: '600', color: value.length === 0 ? '#1d4ed8' : '#64748b'
          }}>
            <input
              type="checkbox"
              checked={value.length === 0}
              onChange={toggleAll}
              style={{ accentColor: '#2563eb', width: '14px', height: '14px', cursor: 'pointer' }}
            />
            All Chapters
          </label>
        </div>
  
        {/* Chapter list */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {chapters.map(ch => {
            const isChecked = value.includes(ch.chapter_code);
            const displayName = getChapterName(ch);
            return (
              <label
                key={ch.chapter_code}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '8px',
                  padding: '7px 12px', cursor: 'pointer', fontSize: '12px',
                  color: '#374151',
                  background: isChecked ? '#eff6ff' : 'transparent',
                  borderBottom: '1px solid #f8fafc'
                }}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => {
                    e.stopPropagation();
                    toggle(ch.chapter_code);
                  }}
                  style={{ marginTop: '2px', accentColor: '#2563eb', flexShrink: 0, width: '14px', height: '14px', cursor: 'pointer' }}
                />
                <span>{displayName}</span>
              </label>
            );
          })}
        </div>
      </div>
    ) : null;
  
    return (
      <div style={{ display: 'inline-block' }}>
        <button 
          ref={btnRef} 
          type="button" 
          onClick={handleOpen}
          style={{
            padding: '5px 10px', border: '1px solid #d1d5db', borderRadius: '5px',
            fontSize: '12px', cursor: 'pointer', background: 'white',
            whiteSpace: 'nowrap', minWidth: '130px', textAlign: 'left',
            color: value.length > 0 ? '#1d4ed8' : '#374151',
            fontWeight: value.length > 0 ? '600' : 'normal'
          }}
        >
          {label} ▾
        </button>
        {typeof document !== 'undefined' && open
          ? ReactDOM.createPortal(dropdown, document.body)
          : null}
      </div>
    );
  }


// ─── Select Questions Cell ───────────────────────────────────────────────────
function SelectCell({ qt, sectionKey, rowIndex, rowData, onChange, onPickQuestions, chapters }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [loadingQ, setLoadingQ] = useState(false);

  const handleChange = async (val) => {
    onChange(sectionKey, rowIndex, 'selection', val);
    if (val === 'pick') {
      setLoadingQ(true);
      setPickerOpen(true);
      // Pass the raw chapter_ids array - handlePickQuestions decides what to do
      const qs = await onPickQuestions(qt.type_id, rowData.chapter_codes || []);
      setQuestions(qs);
      setLoadingQ(false);
    }
  };

  const handleDone = (ids) => {
    onChange(sectionKey, rowIndex, 'picked_ids', ids);
    onChange(sectionKey, rowIndex, 'count', ids.length);
    setPickerOpen(false);
  };

  return (
    <>
      <select value={rowData.selection || 'random'} onChange={e => handleChange(e.target.value)} className="sel-input">
        <option value="random">Random Questions</option>
        <option value="pick">Pick Questions</option>
      </select>
      <QuestionPickerModal
        isOpen={pickerOpen}
        onClose={() => { setPickerOpen(false); onChange(sectionKey, rowIndex, 'selection', 'random'); }}
        onDone={handleDone}
        questions={questions}
        loading={loadingQ}
        title={qt.name}
      />
    </>
  );
}

// ─── Short Questions Board Pattern Row ──────────────────────────────────────
function ShortQRow({ section, rowIndex, rowData, onChange, onRemove, canRemove, onPickQuestions, chapters }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [loadingQ, setLoadingQ] = useState(false);
  const qt = section.question_types[0];

  const handleChange = async (val) => {
    onChange(section.key, rowIndex, 'selection', val);
    if (val === 'pick') {
      setLoadingQ(true);
      setPickerOpen(true);
      // Pass the raw chapter_ids array - handlePickQuestions decides what to do
      const qs = await onPickQuestions(qt.type_id, rowData.chapter_codes || []);
      setQuestions(qs);
      setLoadingQ(false);
    }
  };

  const handleDone = (ids) => {
    onChange(section.key, rowIndex, 'picked_ids', ids);
    onChange(section.key, rowIndex, 'count', ids.length);
    setPickerOpen(false);
  };

  return (
    <>
      <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
        <td style={tdStyle}>{qt.name}</td>
        <td style={tdStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <input type="number" min="0" max={qt.total_available}
              value={rowData.count || 0}
              readOnly={rowData.selection === 'pick'}
              onChange={e => onChange(section.key, rowIndex, 'count', parseInt(e.target.value) || 0)}
              style={numInputStyle}
            />
            {qt.total_available != null && <span style={{ fontSize: '11px', color: '#94a3b8' }}>/{qt.total_available}</span>}
          </div>
        </td>
        <td style={tdStyle}>
          <ChapterMultiSelect
            chapters={chapters}
            value={rowData.chapter_codes || []}
            onChange={val => onChange(section.key, rowIndex, 'chapter_codes', val)}
          />
        </td>
        <td style={tdStyle}>
          <input type="number" min="0" value={rowData.solve || ''}
            onChange={e => onChange(section.key, rowIndex, 'solve', e.target.value)}
            style={numInputStyle} placeholder="Any"
          />
        </td>
        <td style={tdStyle}>
          <select value={rowData.selection || 'random'} onChange={e => handleChange(e.target.value)} className="sel-input">
            <option value="random">Random</option>
            <option value="pick">Pick</option>
          </select>
        </td>
        <td style={tdStyle}>
          <input type="number" min="0" value={rowData.marks || ''}
            onChange={e => onChange(section.key, rowIndex, 'marks', parseInt(e.target.value) || 0)}
            style={numInputStyle}
          />
        </td>
        <td style={tdStyle}>
          {canRemove && (
            <button onClick={() => onRemove(section.key, rowIndex)}
              style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '4px', width: '28px', height: '28px', cursor: 'pointer', fontSize: '18px', fontWeight: '700' }}>
              −
            </button>
          )}
        </td>
      </tr>
      <QuestionPickerModal
        isOpen={pickerOpen}
        onClose={() => { setPickerOpen(false); onChange(section.key, rowIndex, 'selection', 'random'); }}
        onDone={handleDone}
        questions={questions}
        loading={loadingQ}
        title={qt.name}
      />
    </>
  );
}

// ─── Long Question Part ──────────────────────────────────────────────────────
function LongPart({ part, questionTypes, partData, onChange, onPickQuestions, chapters }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [loadingQ, setLoadingQ] = useState(false);

  const selectedTypeId = partData.type_id || (questionTypes[0]?.type_id);
  const selectedQt = questionTypes.find(qt => qt.type_id === Number(selectedTypeId)) || questionTypes[0];

  const handleSelectionChange = async (val) => {
    onChange('selection', val);
    if (val === 'pick') {
      setLoadingQ(true);
      setPickerOpen(true);
      const qs = await onPickQuestions(selectedTypeId, partData.chapter_ids || []);
      setQuestions(qs);
      setLoadingQ(false);
    }
  };

  return (
    <>
      <div style={{ borderTop: '1px solid #bfdbfe', paddingTop: '12px', marginTop: '12px' }}>
        <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e40af', marginBottom: '10px' }}>Part {part}:</div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          {/* Question Type - now shows all types if multiple */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={labelStyle}>Question Type</label>
            <select
              value={partData.type_id || questionTypes[0]?.type_id || ''}
              onChange={e => onChange('type_id', Number(e.target.value))}
              className="sel-input"
            >
              {questionTypes.map(qt => (
                <option key={qt.type_id} value={qt.type_id}>{qt.name}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={labelStyle}>Chapters</label>
            <ChapterMultiSelect
              chapters={chapters}
              value={partData.chapter_ids || []}
              onChange={val => onChange('chapter_ids', val)}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={labelStyle}>Select Type</label>
            <select value={partData.selection || 'random'} onChange={e => handleSelectionChange(e.target.value)} className="sel-input">
              <option value="random">Random</option>
              <option value="pick">Pick</option>
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={labelStyle}>Marks</label>
            <input type="number" min="0" value={partData.marks || ''}
              onChange={e => onChange('marks', parseInt(e.target.value) || 0)}
              style={numInputStyle}
            />
          </div>
        </div>
      </div>
      <QuestionPickerModal
        isOpen={pickerOpen}
        onClose={() => { setPickerOpen(false); onChange('selection', 'random'); }}
        onDone={(ids) => { onChange('picked_ids', ids); setPickerOpen(false); }}
        questions={questions}
        loading={loadingQ}
        title={`Part ${part} — ${selectedQt?.name}`}
      />
    </>
  );
}

const labelStyle = { fontSize: '11px', fontWeight: '600', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.4px' };
const numInputStyle = { width: '75px', padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: '5px', fontSize: '13px', textAlign: 'center' };

// ─── Main Component ──────────────────────────────────────────────────────────
export default function Step5ConfigReview() {
  const { selectedSubject, loadPaperConfig, loadQuestions } = useTestMaker();
  const [apiData, setApiData] = useState(null);
  const [configLoading, setConfigLoading] = useState(true);
  const [configError, setConfigError] = useState('');
  const [chapters, setChapters] = useState([]);
  const [sectionRows, setSectionRows] = useState({});
  const [longBlocks, setLongBlocks] = useState({});

  useEffect(() => {
    const subjectId = selectedSubject?.subject_id || localStorage.getItem('subject_id');
    if (subjectId && subjectId !== 'undefined' && subjectId !== 'null') {
      fetchConfig(subjectId);
      fetchChapters(subjectId);
    } else {
      setConfigError('Subject not found. Please go back and select a subject.');
      setConfigLoading(false);
    }
  }, []);

  const fetchConfig = async (subjectId) => {
    try {
      setConfigLoading(true);
      const data = await loadPaperConfig(subjectId);
      setApiData(data);
      initState(data.sections || []);
    } catch (err) {
      setConfigError(err.message || 'Failed to load configuration');
    } finally {
      setConfigLoading(false);
    }
  };

  const fetchChapters = async (subjectId) => {
    try {
      const data = await apiService.fetchChapters(subjectId);
      setChapters(data.data || []);
    } catch (err) {
      console.error('Chapters error:', err);
    }
  };

  const initState = (sections) => {
    // Restore saved state when coming back from Step 6
    try {
      const saved = localStorage.getItem('step5_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.sectionRows && Object.keys(parsed.sectionRows).length > 0) {
          setSectionRows(parsed.sectionRows);
          setLongBlocks(parsed.longBlocks || {});
          return;
        }
      }
    } catch (e) {}

    // Fresh init
    const rows = {};
    const longs = {};
    sections.forEach(s => {
      if (s.key === 'long_question_according_to_board_pattern') {
        const parts = {};
        (s.config?.parts || ['A', 'B']).forEach(p => { parts[p] = { type_id: s.question_types[0]?.type_id }; });
        longs[s.key] = [{ choice: '', parts }];
      } else if (s.key === 'short_questions_according_to_board_pattern') {
        rows[s.key] = [{ count: 0, chapter_codes: [], solve: '', marks: '', selection: 'random', picked_ids: [] }];
      } else {
        rows[s.key] = s.question_types.map(qt => ({ type_id: qt.type_id, count: 0, chapter_ids: [], solve: '', marks: '', selection: 'random', picked_ids: [] }));
      }
    });
    setSectionRows(rows);
    setLongBlocks(longs);
  };

  const handlePickQuestions = async (typeId, selectedChapterCodes) => {
    try {
      const classId = localStorage.getItem('class_id') || '';
      const exerciseQuestion = localStorage.getItem('exercise_question') || '1,0,2,3,4';
      
      let finalChapterIds = '';
      let finalTopics = '';
      
      if (selectedChapterCodes && selectedChapterCodes.length > 0) {
        // User selected specific chapters in Step5 dropdown (using chapter_code)
        // Convert chapter_code to chapter_id for API
        const selectedChapterIds = [];
        const selectedTopics = [];
        
        chapters.forEach(chapter => {
          if (selectedChapterCodes.includes(chapter.chapter_code)) {
            // Get the numeric chapter_id for API
            if (chapter.chapter_id) {
              selectedChapterIds.push(chapter.chapter_id);
            }
            // Get all topics from this chapter
            if (chapter.topics && chapter.topics.length > 0) {
              selectedTopics.push(...chapter.topics);
            }
          }
        });
        
        finalChapterIds = selectedChapterIds.join(',');
        finalTopics = [...new Set(selectedTopics)].join(',');
      } else {
        // No specific chapters selected -> use Step4 selections
        finalChapterIds = localStorage.getItem('chapter_ids') || '';
        finalTopics = localStorage.getItem('topics') || '';
      }
      
      const data = await loadQuestions({
        class_id: parseInt(classId) || 0,
        chapter_ids: finalChapterIds,
        topics: finalTopics,
        exercise_ids: '',
        exercise_question: exerciseQuestion,
        type_id: typeId
      });
      return data || [];
    } catch (err) {
      console.error('Questions error:', err);
      return [];
    }
  };

  const handleRowChange = (sectionKey, rowIndex, field, value) => {
    setSectionRows(prev => {
      const rows = [...(prev[sectionKey] || [])];
      rows[rowIndex] = { ...rows[rowIndex], [field]: value };
      return { ...prev, [sectionKey]: rows };
    });
  };

  const handleAddRow = (sectionKey) => {
    setSectionRows(prev => ({
      ...prev,
      [sectionKey]: [...(prev[sectionKey] || []), { count: 0, chapter_ids: [], solve: '', marks: '', selection: 'random', picked_ids: [] }]
    }));
  };

  const handleRemoveRow = (sectionKey, rowIndex) => {
    setSectionRows(prev => {
      const rows = [...(prev[sectionKey] || [])];
      rows.splice(rowIndex, 1);
      return { ...prev, [sectionKey]: rows };
    });
  };

  const handleBlockChange = (sectionKey, blockIndex, field, value) => {
    setLongBlocks(prev => {
      const blocks = JSON.parse(JSON.stringify(prev[sectionKey] || []));
      if (field.startsWith('parts.')) {
        const [, part, sub] = field.split('.');
        if (!blocks[blockIndex].parts) blocks[blockIndex].parts = {};
        if (!blocks[blockIndex].parts[part]) blocks[blockIndex].parts[part] = {};
        blocks[blockIndex].parts[part][sub] = value;
      } else {
        blocks[blockIndex][field] = value;
      }
      return { ...prev, [sectionKey]: blocks };
    });
  };

  const handleAddBlock = (sectionKey, section) => {
    const parts = {};
    (section.config?.parts || ['A', 'B']).forEach(p => { parts[p] = { type_id: section.question_types[0]?.type_id }; });
    setLongBlocks(prev => ({
      ...prev,
      [sectionKey]: [...(prev[sectionKey] || []), { choice: '', parts }]
    }));
  };

  const handleRemoveBlock = (sectionKey, blockIndex) => {
    setLongBlocks(prev => {
      const blocks = [...(prev[sectionKey] || [])];
      blocks.splice(blockIndex, 1);
      return { ...prev, [sectionKey]: blocks };
    });
  };

  if (configLoading) return <LoadingSpinner message="Loading paper configuration..." />;

  const sections = apiData?.sections || [];
  const totalDataset = apiData?.total_dataset_questions;

  return (
    <div className="step-page">
      {/* Header */}
      <div style={{ maxWidth: '1100px', width: '100%', margin: '0 auto 24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px', fontSize: '13px', color: '#999' }}>
          <span style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.6)', borderRadius: '6px' }}>
            {selectedSubject?.subject_name || 'Subject'}
          </span>
          <i className="ti ti-chevron-right"></i>
          <span style={{ padding: '4px 10px', background: 'white', color: '#2563eb', fontWeight: '600', borderRadius: '6px' }}>Paper Config</span>
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1a1a1a', margin: '0 0 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '44px', height: '44px', background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: 'white', borderRadius: '50%', fontSize: '18px', fontWeight: '700' }}>05</span>
          Select Number of Questions
        </h1>
        {totalDataset && (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ background: '#dbeafe', border: '1px solid #93c5fd', borderRadius: '8px', padding: '10px 28px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#1e40af', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Dataset Questions</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#1d4ed8' }}>{totalDataset.toLocaleString()}</div>
            </div>
          </div>
        )}
      </div>

      <div style={{ maxWidth: '1100px', width: '100%', margin: '0 auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {configError && <ErrorAlert message={configError} onClose={() => setConfigError('')} />}

        {sections.map(section => {
          const isLong = section.key === 'long_question_according_to_board_pattern';
          const isShortBoard = section.key === 'short_questions_according_to_board_pattern';

          // ── Long Question Section ──
          if (isLong) {
            return (
              <div key={section.key} style={cardStyle}>
                <div style={headerStyle}>
                  <i className="ti ti-info-circle"></i>
                  <span>{section.title}</span>
                </div>
                <div style={{ padding: '16px 20px 20px' }}>
                  {(longBlocks[section.key] || []).map((block, bi) => (
                    <div key={bi} style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', marginBottom: '16px', padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '600', color: '#1e40af' }}>
                          <label>Solve (Choice):</label>
                          <select value={block.choice || ''} onChange={e => handleBlockChange(section.key, bi, 'choice', e.target.value)} className="sel-input">
                            <option value="">Select</option>
                            {(section.config?.choice_options || [1, 2]).map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                        {(longBlocks[section.key] || []).length > 1 && (
                          <button onClick={() => handleRemoveBlock(section.key, bi)}
                            style={{ marginLeft: 'auto', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '4px', padding: '5px 12px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
                            Remove
                          </button>
                        )}
                      </div>
                      {(section.config?.parts || ['A', 'B']).map(part => (
                        <LongPart
                          key={part}
                          part={part}
                          questionTypes={section.question_types}
                          partData={block.parts?.[part] || {}}
                          onChange={(field, val) => handleBlockChange(section.key, bi, `parts.${part}.${field}`, val)}
                          onPickQuestions={handlePickQuestions}
                          chapters={chapters}
                        />
                      ))}
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                    <button onClick={() => handleAddBlock(section.key, section)}
                      style={{ background: '#1e40af', color: 'white', border: 'none', borderRadius: '6px', padding: '8px 18px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                      + Add another long question
                    </button>
                  </div>
                </div>
              </div>
            );
          }

          // ── Short Questions Board Pattern ──
          if (isShortBoard) {
            return (
              <div key={section.key} style={cardStyle}>
                <div style={headerStyle}>
                  <i className="ti ti-info-circle"></i>
                  <span>{section.title}</span>
                  <button onClick={() => handleAddRow(section.key)}
                    style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)', color: 'white', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
                    + Add Row
                  </button>
                </div>
                <div style={{ overflowX: 'auto', overflowY: 'visible' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr>
                        {['Question Type', 'Count', 'Chapters', 'Solve', 'Select Questions', 'Marks', ''].map((h, i) => (
                          <th key={i} style={{ background: '#f8fafc', padding: '10px 14px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '12px', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(sectionRows[section.key] || []).map((row, i) => (
                        <ShortQRow
                          key={i}
                          section={section}
                          rowIndex={i}
                          rowData={row}
                          onChange={handleRowChange}
                          onRemove={handleRemoveRow}
                          canRemove={(sectionRows[section.key] || []).length > 1}
                          onPickQuestions={handlePickQuestions}
                          chapters={chapters}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          }

          // ── Regular Sections (Objective, Subjective Without Board Pattern) ──
          const rows = sectionRows[section.key] || [];
          return (
            <div key={section.key} style={cardStyle}>
              <div style={headerStyle}>
                {section.order > 1 && <i className="ti ti-info-circle"></i>}
                <span>{section.title}</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr>
                      {['#', 'Question Type', 'Number of Questions', 'Select Questions', ...(section.has_solve_field ? ['Solve'] : []), 'Marks'].map((h, i) => (
                        <th key={i} style={{ background: '#f8fafc', padding: '10px 14px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '12px', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {section.question_types.map((qt, i) => (
                      <tr key={qt.type_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '10px 14px', color: '#64748b', fontSize: '12px', width: '36px' }}>{i + 1}</td>
                        <td style={{ padding: '10px 14px', fontWeight: '500', color: '#334155', minWidth: '180px' }}>{qt.name}</td>
                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <input type="number" min="0" max={qt.total_available || 9999}
                              value={(rows[i] || {}).count || 0}
                              readOnly={(rows[i] || {}).selection === 'pick'}
                              onChange={e => handleRowChange(section.key, i, 'count', parseInt(e.target.value) || 0)}
                              style={numInputStyle}
                            />
                            {qt.total_available != null && <span style={{ fontSize: '11px', color: '#94a3b8' }}>/{qt.total_available}</span>}
                          </div>
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <SelectCell
                            qt={qt}
                            sectionKey={section.key}
                            rowIndex={i}
                            rowData={rows[i] || {}}
                            onChange={handleRowChange}
                            onPickQuestions={handlePickQuestions}
                            chapters={chapters}
                          />
                        </td>
                        {section.has_solve_field && (
                          <td style={{ padding: '10px 14px' }}>
                            <input type="number" min="0"
                              value={(rows[i] || {}).solve || ''}
                              onChange={e => handleRowChange(section.key, i, 'solve', parseInt(e.target.value) || 0)}
                              style={numInputStyle} placeholder="Any"
                            />
                          </td>
                        )}
                        <td style={{ padding: '10px 14px' }}>
                          <input type="number" min="0"
                            value={(rows[i] || {}).marks || ''}
                            onChange={e => handleRowChange(section.key, i, 'marks', parseInt(e.target.value) || 0)}
                            style={numInputStyle}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Actions */}
      <div style={{ maxWidth: '1100px', width: '100%', margin: '20px auto 0', display: 'flex', gap: '12px', paddingTop: '20px', borderTop: '2px solid rgba(0,0,0,0.08)' }}>
        <button onClick={() => window.location.href = '/test-maker/step-4'}
          style={{ flex: 1, padding: '12px 24px', fontSize: '14px', fontWeight: '600', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', cursor: 'pointer', background: 'transparent', color: '#999', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}>
          <i className="ti ti-arrow-left"></i> Back
        </button>
        <button onClick={() => {
          const step5Config = { sections: apiData?.sections || [], sectionRows, longBlocks };
          localStorage.setItem('step5_config', JSON.stringify(step5Config));
          localStorage.setItem('step5_chapters', JSON.stringify(chapters));
          window.location.href = '/test-maker/step-6';
        }}
          style={{ flex: 1, padding: '12px 24px', fontSize: '14px', fontWeight: '600', border: 'none', borderRadius: '8px', cursor: 'pointer', background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: 'white', boxShadow: '0 3px 10px rgba(37,99,235,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          Next <i className="ti ti-arrow-right"></i>
        </button>
      </div>

      <style>{`
        .step-page { min-height:100vh; background:linear-gradient(135deg,#f5f7fa 0%,#f0f4f8 100%); padding:20px; display:flex; flex-direction:column; }
        .sel-input { padding:6px 8px; border:1px solid #d1d5db; border-radius:5px; font-size:13px; cursor:pointer; background:white; }
        .sel-input:focus { outline:none; border-color:#2563eb; }
        .q-modal-table img { max-width:200px; height:auto; }
      `}</style>
    </div>
  );
}

const cardStyle = { background: 'white', borderRadius: '8px', overflow: 'visible', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', position: 'relative' };
const headerStyle = { background: '#2563eb', color: 'white', padding: '12px 20px', fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '8px 8px 0 0' };