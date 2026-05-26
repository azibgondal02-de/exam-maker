import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom';
import { useTestMaker } from '../../hooks/useTestMaker';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';
import TopBar from '../../components/TopBar';
import * as apiService from '../../services/api';

const IMAGE_BASE = 'https://testmaker.pk';

function fixHtml(html) {
  if (!html) return '';
  return html.replace(/src="\/([^"]+)"/g, `src="${IMAGE_BASE}/$1"`);
}

function QuestionText({ statement, description }) {
  const combined = [statement, description].filter(Boolean).join(' ');
  if (!combined) return <span style={{ color: '#999' }}>—</span>;
  return (
    <span
      className="q-modal-content"
      dangerouslySetInnerHTML={{ __html: fixHtml(combined) }}
      style={{ lineHeight: '1.6', fontSize: '13px' }}
    />
  );
}

function OptionsDisplay({ options, language = 'en' }) {
  if (!options || options.length === 0) return null;
  const letters = ['A', 'B', 'C', 'D', 'E'];
  return (
    <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
      {options.map((opt, i) => {
        const optionText = language === 'ur' ? opt.option_ur : opt.option_en;
        if (!optionText) return null;
        return (
          <div key={opt.option_id} style={{
            display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '12px',
            color: opt.is_correct ? '#15803d' : '#374151',
            fontWeight: opt.is_correct ? '600' : 'normal',
            background: opt.is_correct ? '#dcfce7' : 'transparent',
            padding: '2px 6px', borderRadius: '4px'
          }}>
            <span style={{ flexShrink: 0, fontWeight: '700' }}>{letters[i]}.</span>
            <span className="q-modal-content" dangerouslySetInnerHTML={{ __html: fixHtml(optionText) }}
              style={{ direction: language === 'ur' ? 'rtl' : 'ltr', textAlign: language === 'ur' ? 'right' : 'left' }} />
          </div>
        );
      })}
    </div>
  );
}

const QuestionRow = React.memo(function QuestionRow({ q, index, isSelected, onToggle }) {
  return (
    <tr style={{ background: isSelected ? '#eff6ff' : 'white' }}>
      <td style={tdStyle}>
        <input type="checkbox" checked={isSelected} onChange={() => onToggle(q.id)}
          style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#2563eb' }} />
      </td>
      <td style={{ ...tdStyle, color: '#888', fontSize: '12px', width: '40px' }}>{index + 1}</td>
      <td style={{ ...tdStyle, maxWidth: '420px' }}>
        <QuestionText statement={q.statement_en} description={q.description_en} />
        <OptionsDisplay options={q.options} language="en" />
      </td>
      <td style={{ ...tdStyle, maxWidth: '420px', direction: 'rtl', textAlign: 'right' }}>
        <QuestionText statement={q.statement_ur} description={q.description_ur} />
        <OptionsDisplay options={q.options} language="ur" />
      </td>
    </tr>
  );
});

function QuestionPickerModal({ isOpen, onClose, onDone, questions, loading, title, initialSelected = [] }) {
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState('');
  const [showOnlySelected, setShowOnlySelected] = useState(false);
  const scrollRef = useRef(null);
  const pendingScrollRef = useRef(null);
  const savedScrollRef = useRef(0);

  useEffect(() => {
    if (isOpen) {
      setSelected(initialSelected.length > 0 ? [...initialSelected] : []);
      setSearch('');
      setShowOnlySelected(false);
      savedScrollRef.current = 0;
    }
  }, [isOpen]);

  useLayoutEffect(() => {
    if (pendingScrollRef.current !== null && scrollRef.current) {
      scrollRef.current.scrollTop = pendingScrollRef.current;
      pendingScrollRef.current = null;
    }
  });

  useEffect(() => {
    if (showOnlySelected && selected.length === 0) setShowOnlySelected(false);
  }, [selected.length, showOnlySelected]);

  const toggle = React.useCallback((id) => {
    if (scrollRef.current) pendingScrollRef.current = scrollRef.current.scrollTop;
    setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
    if (document.activeElement && document.activeElement.tagName === 'INPUT') document.activeElement.blur();
  }, []);

  const togglePillFilter = () => {
    if (selected.length === 0) return;
    if (!showOnlySelected) {
      savedScrollRef.current = scrollRef.current ? scrollRef.current.scrollTop : 0;
      setShowOnlySelected(true);
      pendingScrollRef.current = 0;
    } else {
      setShowOnlySelected(false);
      pendingScrollRef.current = savedScrollRef.current;
    }
  };

  if (!isOpen) return null;

  const filtered = search.trim() === '' ? questions : questions.filter(q => {
    const s = search.toLowerCase();
    return (q.statement_en || '').toLowerCase().includes(s) ||
           (q.statement_ur || '').includes(search) ||
           (q.description_en || '').toLowerCase().includes(s);
  });

  const visible = showOnlySelected ? filtered.filter(q => selected.includes(q.id)) : filtered;
  const toggleAll = () => setSelected(
    visible.length > 0 && visible.every(q => selected.includes(q.id))
      ? selected.filter(id => !visible.find(q => q.id === id))
      : [...new Set([...selected, ...visible.map(q => q.id)])]
  );

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }} onClick={onClose}>
      <div style={{ background: 'white', borderRadius: '10px', width: '100%', maxWidth: '920px', maxHeight: '84vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', margin: 0, flex: 1 }}>{title}</h3>
          <button type="button" onClick={togglePillFilter} disabled={selected.length === 0}
            style={{ background: showOnlySelected ? '#1d4ed8' : '#dbeafe', color: showOnlySelected ? 'white' : '#1d4ed8', fontWeight: '700', fontSize: '13px', padding: '5px 12px', borderRadius: '20px', border: 'none', cursor: selected.length === 0 ? 'not-allowed' : 'pointer', opacity: selected.length === 0 ? 0.55 : 1, display: 'inline-flex', alignItems: 'center', gap: '6px', transition: 'all 0.15s ease', fontFamily: 'inherit' }}>
            {selected.length} selected
            <span style={{ fontSize: '10px', lineHeight: 1 }}>{showOnlySelected ? '▴' : '▾'}</span>
          </button>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#6b7280' }}>✕</button>
        </div>
        <div style={{ padding: '10px 20px', borderBottom: '1px solid #f0f0f0' }}>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search questions..."
            style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '13px', outline: 'none', fontFamily: 'inherit' }} autoFocus />
        </div>
        <div ref={scrollRef} style={{ overflowY: 'auto', flex: 1 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Loading questions...</div>
          ) : visible.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>{showOnlySelected ? 'No selected questions to show' : 'No questions found'}</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr>
                  <th style={thStyle}><input type="checkbox" checked={visible.length > 0 && visible.every(q => selected.includes(q.id))} onChange={toggleAll} /></th>
                  <th style={thStyle}>#</th>
                  <th style={{ ...thStyle, textAlign: 'left' }}>English</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>اردو</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((q, i) => (
                  <QuestionRow key={q.id} q={q} index={i} isSelected={selected.includes(q.id)} onToggle={toggle} />
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

const thStyle = { position: 'sticky', top: 0, background: '#f8fafc', padding: '10px 14px', textAlign: 'left', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0', fontSize: '12px' };
const tdStyle = { padding: '10px 14px', borderBottom: '1px solid #f1f5f9', verticalAlign: 'top' };

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
      setDropPos({ top: rect.bottom + window.scrollY + 4, left: rect.left + window.scrollX });
    }
    setOpen(!open);
  };

  const toggle = (code, e) => {
    if (e) e.stopPropagation();
    onChange(value.includes(code) ? value.filter(x => x !== code) : [...value, code]);
  };

  const getChapterName = (chapter) => chapter.chapter_name_en || chapter.chapter_name_urdu || chapter.chapter_code;
  const label = value.length === 0 ? 'All Chapters' : `${value.length} chapter${value.length > 1 ? 's' : ''}`;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          btnRef.current && !btnRef.current.contains(event.target)) setOpen(false);
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  const dropdown = open ? (
    <div ref={dropdownRef} style={{ position: 'absolute', top: dropPos.top, left: dropPos.left, background: 'white', border: '1px solid #d1d5db', borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)', zIndex: 99999, minWidth: '260px', maxHeight: '280px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', borderRadius: '8px 8px 0 0' }}>
        <span style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>Select Chapters</span>
        <button onClick={() => setOpen(false)} style={{ background: '#e2e8f0', border: 'none', borderRadius: '4px', cursor: 'pointer', color: '#64748b', fontSize: '12px', padding: '2px 8px', fontWeight: '600' }}>✕ Close</button>
      </div>
      <div style={{ padding: '6px 12px', borderBottom: '1px solid #f0f0f0' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0', cursor: 'pointer', fontSize: '12px', fontWeight: '600', color: value.length === 0 ? '#1d4ed8' : '#64748b' }}>
          <input type="checkbox" checked={value.length === 0} onChange={() => onChange([])} style={{ accentColor: '#2563eb', width: '14px', height: '14px', cursor: 'pointer' }} />
          All Chapters
        </label>
      </div>
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {chapters.map(ch => {
          const isChecked = value.includes(ch.chapter_code);
          return (
            <label key={ch.chapter_code} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '7px 12px', cursor: 'pointer', fontSize: '12px', color: '#374151', background: isChecked ? '#eff6ff' : 'transparent', borderBottom: '1px solid #f8fafc' }}>
              <input type="checkbox" checked={isChecked} onChange={(e) => { e.stopPropagation(); toggle(ch.chapter_code); }} style={{ marginTop: '2px', accentColor: '#2563eb', flexShrink: 0, width: '14px', height: '14px', cursor: 'pointer' }} />
              <span>{getChapterName(ch)}</span>
            </label>
          );
        })}
      </div>
    </div>
  ) : null;

  return (
    <div style={{ display: 'inline-block' }}>
      <button ref={btnRef} type="button" onClick={handleOpen}
        style={{ padding: '5px 10px', border: '1px solid #d1d5db', borderRadius: '5px', fontSize: '12px', cursor: 'pointer', background: 'white', whiteSpace: 'nowrap', minWidth: '130px', textAlign: 'left', color: value.length > 0 ? '#1d4ed8' : '#374151', fontWeight: value.length > 0 ? '600' : 'normal' }}>
        {label} ▾
      </button>
      {typeof document !== 'undefined' && open ? ReactDOM.createPortal(dropdown, document.body) : null}
    </div>
  );
}

// ─── VALIDATION 1: Count input that blocks values over total_available ────────
function CountInput({ value, totalAvailable, readOnly, onChange }) {
  const [localError, setLocalError] = useState('');

  const handleChange = (e) => {
    const num = parseInt(e.target.value) || 0;
    if (totalAvailable != null && num > totalAvailable) {
      setLocalError(`Max ${totalAvailable} available`);
      // Still clamp to the max instead of storing invalid value
      onChange(totalAvailable);
    } else {
      setLocalError('');
      onChange(num);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <input
          type="number" min="0" max={totalAvailable ?? 9999}
          value={value} readOnly={readOnly}
          onChange={handleChange}
          style={{
            ...numInputStyle,
            borderColor: localError ? '#ef4444' : '#d1d5db',
            boxShadow: localError ? '0 0 0 2px rgba(239,68,68,0.15)' : 'none',
          }}
        />
        {totalAvailable != null && (
          <span style={{ fontSize: '11px', color: localError ? '#ef4444' : '#94a3b8', fontWeight: localError ? '700' : 'normal' }}>
            /{totalAvailable}
          </span>
        )}
      </div>
      {localError && (
        <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: '600', whiteSpace: 'nowrap' }}>
          ⚠ {localError}
        </span>
      )}
    </div>
  );
}

// ─── VALIDATION 2a: Solve dropdown (for short board questions) ────────────────
// Uses a dropdown so user literally cannot pick a value exceeding count.
// Auto-populates when count changes via the effect in the parent call.
function SolveDropdown({ count, value, onChange }) {
  const max = parseInt(count) || 0;
  const options = [];
  for (let i = 1; i <= max; i++) options.push(i);

  return (
    <select
      value={value || max || ''}
      onChange={e => onChange(parseInt(e.target.value) || 0)}
      className="sel-input"
      disabled={max === 0}
      style={{ minWidth: '70px', opacity: max === 0 ? 0.5 : 1 }}
    >
      {max === 0 && <option value="">—</option>}
      {options.map(n => <option key={n} value={n}>{n}</option>)}
    </select>
  );
}

// ─── VALIDATION 2b: Solve input (for regular sections with has_solve_field) ───
// Auto-populates on count change; shows inline error if user types over the max.
function SolveInput({ count, value, onChange }) {
  const [error, setError] = useState('');
  const max = parseInt(count) || 0;

  // Auto-populate: if solve is 0 or exceeds new max, reset it to max
  useEffect(() => {
    if (max > 0) {
      const current = parseInt(value) || 0;
      if (current === 0 || current > max) {
        onChange(max);
        setError('');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [max]);

  const handleChange = (e) => {
    const num = parseInt(e.target.value) || 0;
    if (max > 0 && num > max) {
      setError(`Max ${max}`);
    } else {
      setError('');
      onChange(num);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <input
        type="number" min="0" max={max || 9999}
        value={value || ''}
        onChange={handleChange}
        placeholder={max ? String(max) : 'Any'}
        style={{
          ...numInputStyle,
          borderColor: error ? '#ef4444' : '#d1d5db',
          boxShadow: error ? '0 0 0 2px rgba(239,68,68,0.15)' : 'none',
        }}
      />
      {error && <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: '600' }}>⚠ {error}</span>}
    </div>
  );
}

function SelectCell({ qt, sectionKey, rowIndex, rowData, onChange, onPickQuestions, chapters }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [loadingQ, setLoadingQ] = useState(false);

  const handleChange = (val) => {
    onChange(sectionKey, rowIndex, 'selection', val);
    if (val === 'pick') {
      setPickerOpen(true);
      setLoadingQ(true);
      onPickQuestions(qt.type_id, rowData.chapter_codes || []).then(qs => {
        setQuestions(qs);
        setLoadingQ(false);
      });
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
      <QuestionPickerModal isOpen={pickerOpen}
        onClose={() => { setPickerOpen(false); onChange(sectionKey, rowIndex, 'selection', 'random'); }}
        onDone={handleDone} questions={questions} loading={loadingQ} title={qt.name}
        initialSelected={rowData.picked_ids || []} />
    </>
  );
}

function ShortQRow({ section, rowIndex, rowData, onChange, onRemove, canRemove, onPickQuestions, chapters }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [loadingQ, setLoadingQ] = useState(false);
  const qt = section.question_types[0];

  const handleChange = (val) => {
    onChange(section.key, rowIndex, 'selection', val);
    if (val === 'pick') {
      setPickerOpen(true);
      setLoadingQ(true);
      onPickQuestions(qt.type_id, rowData.chapter_codes || []).then(qs => {
        setQuestions(qs);
        setLoadingQ(false);
      });
    }
  };

  const handleDone = (ids) => {
    onChange(section.key, rowIndex, 'picked_ids', ids);
    onChange(section.key, rowIndex, 'count', ids.length);
    setPickerOpen(false);
  };

  // VALIDATION 2: auto-populate solve when count changes
  const handleCountChange = (val) => {
    onChange(section.key, rowIndex, 'count', val);
    const currentSolve = parseInt(rowData.solve) || 0;
    if (currentSolve === 0 || currentSolve > val) {
      onChange(section.key, rowIndex, 'solve', val);
    }
  };

  return (
    <>
      <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
        <td style={tdStyle}>{qt.name}</td>
        {/* Validation 1 */}
        <td style={tdStyle}>
          <CountInput
            value={rowData.count || 0}
            totalAvailable={qt.total_available}
            readOnly={rowData.selection === 'pick'}
            onChange={handleCountChange}
          />
        </td>
        <td style={tdStyle}>
          <ChapterMultiSelect chapters={chapters} value={rowData.chapter_codes || []}
            onChange={val => onChange(section.key, rowIndex, 'chapter_codes', val)} />
        </td>
        {/* Validation 2: dropdown for short board */}
        <td style={tdStyle}>
          <SolveDropdown
            count={rowData.count || 0}
            value={rowData.solve}
            onChange={val => onChange(section.key, rowIndex, 'solve', val)}
          />
        </td>
        <td style={tdStyle}>
          <select value={rowData.selection || 'random'} onChange={e => handleChange(e.target.value)} className="sel-input">
            <option value="random">Random</option>
            <option value="pick">Pick</option>
          </select>
        </td>
        <td style={tdStyle}>
          <input type="number" min="0" value={rowData.marks || ''} onChange={e => onChange(section.key, rowIndex, 'marks', parseInt(e.target.value) || 0)} style={numInputStyle} />
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
      <QuestionPickerModal isOpen={pickerOpen}
        onClose={() => { setPickerOpen(false); onChange(section.key, rowIndex, 'selection', 'random'); }}
        onDone={handleDone} questions={questions} loading={loadingQ} title={qt.name}
        initialSelected={rowData.picked_ids || []} />
    </>
  );
}

// ─── VALIDATION 3: LongPart — marks field with red highlight if hasError ──────
function LongPart({ part, questionTypes, partData, onChange, onPickQuestions, chapters, hasError }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [loadingQ, setLoadingQ] = useState(false);

  const selectedTypeId = partData.type_id || (questionTypes[0]?.type_id);
  const selectedQt = questionTypes.find(qt => qt.type_id === Number(selectedTypeId)) || questionTypes[0];

  const handleSelectionChange = (val) => {
    onChange('selection', val);
    if (val === 'pick') {
      setPickerOpen(true);
      setLoadingQ(true);
      onPickQuestions(selectedTypeId, partData.chapter_ids || []).then(qs => {
        setQuestions(qs);
        setLoadingQ(false);
      });
    }
  };

  return (
    <>
      <div style={{ borderTop: '1px solid #bfdbfe', paddingTop: '12px', marginTop: '12px' }}>
        <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e40af', marginBottom: '10px' }}>Part {part}:</div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={labelStyle}>Question Type</label>
            <select value={partData.type_id || questionTypes[0]?.type_id || ''} onChange={e => onChange('type_id', Number(e.target.value))} className="sel-input">
              {questionTypes.map(qt => <option key={qt.type_id} value={qt.type_id}>{qt.name}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={labelStyle}>Chapters</label>
            <ChapterMultiSelect chapters={chapters} value={partData.chapter_ids || []} onChange={val => onChange('chapter_ids', val)} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={labelStyle}>Select Type</label>
            <select value={partData.selection || 'random'} onChange={e => handleSelectionChange(e.target.value)} className="sel-input">
              <option value="random">Random</option>
              <option value="pick">Pick</option>
            </select>
          </div>
          {/* Validation 3: red highlight when marks missing */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ ...labelStyle, color: hasError ? '#dc2626' : '#475569' }}>
              Marks {hasError && <span style={{ color: '#dc2626' }}>*</span>}
            </label>
            <input
              type="number" min="0"
              value={partData.marks || ''}
              onChange={e => onChange('marks', parseInt(e.target.value) || 0)}
              placeholder={hasError ? 'Required' : ''}
              style={{
                ...numInputStyle,
                borderColor: hasError ? '#ef4444' : '#d1d5db',
                boxShadow: hasError ? '0 0 0 3px rgba(239,68,68,0.2)' : 'none',
                animation: hasError ? 'shake 0.4s ease' : 'none',
              }}
            />
            {hasError && (
              <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: '600', whiteSpace: 'nowrap' }}>
                ⚠ Marks required
              </span>
            )}
          </div>
        </div>
      </div>
      <QuestionPickerModal isOpen={pickerOpen}
        onClose={() => { setPickerOpen(false); onChange('selection', 'random'); }}
        onDone={(ids) => { onChange('picked_ids', ids); setPickerOpen(false); }}
        questions={questions} loading={loadingQ} title={`Part ${part} — ${selectedQt?.name}`}
        initialSelected={partData.picked_ids || []} />
    </>
  );
}

const labelStyle = { fontSize: '11px', fontWeight: '600', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.4px' };
const numInputStyle = { width: '75px', padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: '5px', fontSize: '13px', textAlign: 'center', transition: 'border-color 0.15s, box-shadow 0.15s' };

export default function Step5ConfigReview() {
  const { selectedSubject, loadPaperConfig, loadQuestions } = useTestMaker();
  const [apiData, setApiData] = useState(null);
  const [configLoading, setConfigLoading] = useState(true);
  const [configError, setConfigError] = useState('');
  const [chapters, setChapters] = useState([]);
  const [sectionRows, setSectionRows] = useState({});
  const [longBlocks, setLongBlocks] = useState({});
  const [longSectionChoices, setLongSectionChoices] = useState({});
  // Validation 3 state
  const [longMarksErrors, setLongMarksErrors] = useState({});
  const [showValidationBanner, setShowValidationBanner] = useState(false);

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
    try {
      const saved = localStorage.getItem('step5_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.sectionRows && Object.keys(parsed.sectionRows).length > 0) {
          setSectionRows(parsed.sectionRows);
          setLongBlocks(parsed.longBlocks || {});
          setLongSectionChoices(parsed.longSectionChoices || {});
          return;
        }
      }
    } catch (e) {}
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
        const selectedChapterIds = [];
        const selectedTopics = [];
        chapters.forEach(chapter => {
          if (selectedChapterCodes.includes(chapter.chapter_code)) {
            if (chapter.chapter_id) selectedChapterIds.push(chapter.chapter_id);
            if (chapter.topics && chapter.topics.length > 0) selectedTopics.push(...chapter.topics);
          }
        });
        finalChapterIds = selectedChapterIds.join(',');
        finalTopics = [...new Set(selectedTopics)].join(',');
      } else {
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
    // Clear mark error for this field when user fills it in
    if (field.endsWith('.marks')) {
      const part = field.split('.')[1];
      setLongMarksErrors(prev => {
        const next = { ...prev };
        delete next[`${sectionKey}-${blockIndex}-${part}`];
        return next;
      });
    }
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
      setLongSectionChoices(p => {
        const current = parseInt(p[sectionKey]) || 0;
        if (current > blocks.length) return { ...p, [sectionKey]: blocks.length > 0 ? String(blocks.length) : '' };
        return p;
      });
      return { ...prev, [sectionKey]: blocks };
    });
  };

  // ─── VALIDATION 3: check before navigating ───────────────────────────────────
  const validateAndProceed = () => {
    const sections = apiData?.sections || [];
    const errors = {};
    let hasErrors = false;

    sections.forEach(section => {
      if (section.key === 'long_question_according_to_board_pattern') {
        const blocks = longBlocks[section.key] || [];
        const parts = section.config?.parts || ['A', 'B'];
        blocks.forEach((block, bi) => {
          // If ANY part in this block has marks set, ALL parts must have marks
          const anyHasMarks = parts.some(p => parseInt(block.parts?.[p]?.marks) > 0);
          if (anyHasMarks) {
            parts.forEach(p => {
              if (!(parseInt(block.parts?.[p]?.marks) > 0)) {
                errors[`${section.key}-${bi}-${p}`] = true;
                hasErrors = true;
              }
            });
          }
        });
      }
    });

    setLongMarksErrors(errors);

    if (hasErrors) {
      setShowValidationBanner(true);
      setTimeout(() => {
        const el = document.querySelector('[data-marks-error="true"]');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 80);
      return;
    }

    setShowValidationBanner(false);
    const step5Config = { sections, sectionRows, longBlocks, longSectionChoices };
    localStorage.setItem('step5_config', JSON.stringify(step5Config));
    localStorage.setItem('step5_chapters', JSON.stringify(chapters));
    window.location.href = '/test-maker/step-6';
  };

  if (configLoading) return <LoadingSpinner message="Loading paper configuration..." />;

  const sections = apiData?.sections || [];
  const totalDataset = apiData?.total_dataset_questions;

  return (
    <div className="step-page">
      <TopBar />

      <div className="bc-wrap desktop-only">
        <span className="bc-pill">{selectedSubject?.subject_name || 'Subject'}</span>
        <i className="ti ti-chevron-right bc-sep"></i>
        <span className="bc-pill bc-active">Paper Config</span>
      </div>

      <div className="s5-header">
        <div className="step-badge">Step 05 of 06</div>
        <h1 className="s5-title">Select Questions</h1>
        {totalDataset && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '14px' }}>
            <div style={{ background: '#dbeafe', border: '1px solid #93c5fd', borderRadius: '8px', padding: '10px 28px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#1e40af', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Dataset Questions</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#1d4ed8' }}>{totalDataset.toLocaleString()}</div>
            </div>
          </div>
        )}
      </div>

      <div style={{ maxWidth: '1100px', width: '100%', margin: '0 auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {configError && <ErrorAlert message={configError} onClose={() => setConfigError('')} />}

        {/* Validation 3: top error banner */}
        {showValidationBanner && (
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>⚠️</span>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#991b1b' }}>Incomplete marks in long questions</div>
              <div style={{ fontSize: '12px', color: '#b91c1c', marginTop: '2px' }}>
                If any part has marks filled, all parts of that long question must have marks. Please complete the highlighted fields.
              </div>
            </div>
            <button onClick={() => setShowValidationBanner(false)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#991b1b', fontSize: '16px', padding: '0 4px' }}>✕</button>
          </div>
        )}

        {sections.map(section => {
          const isLong = section.key === 'long_question_according_to_board_pattern';
          const isShortBoard = section.key === 'short_questions_according_to_board_pattern';

          if (isLong) {
            const blockCount = (longBlocks[section.key] || []).length;
            const currentChoice = longSectionChoices[section.key] || '';
            const maxChoice = Math.max(blockCount, 0);
            const choiceOptions = [];
            for (let i = 1; i <= maxChoice; i++) choiceOptions.push(i);

            return (
              <div key={section.key} style={cardStyle}>
                <div style={headerStyle}>
                  <i className="ti ti-info-circle"></i>
                  <span>{section.title}</span>
                </div>
                <div style={{ padding: '16px 20px 20px' }}>
                  <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '8px', padding: '12px 14px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <i className="ti ti-list-check" style={{ fontSize: '18px', color: '#b45309', flexShrink: 0 }}></i>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#92400e' }}>Students must attempt any</span>
                    <select value={currentChoice} onChange={e => setLongSectionChoices(prev => ({ ...prev, [section.key]: e.target.value }))} className="sel-input" style={{ minWidth: '80px' }} disabled={blockCount === 0}>
                      <option value="">All</option>
                      {choiceOptions.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#92400e' }}>out of {blockCount} long question{blockCount !== 1 ? 's' : ''}</span>
                    {blockCount === 0 && <span style={{ fontSize: '11px', color: '#b45309', fontStyle: 'italic', marginLeft: 'auto' }}>Add long questions below to enable</span>}
                  </div>

                  {(longBlocks[section.key] || []).map((block, bi) => {
                    const blockHasAnyError = Object.keys(longMarksErrors).some(k => k.startsWith(`${section.key}-${bi}-`));
                    return (
                      <div key={bi}
                        data-marks-error={blockHasAnyError ? 'true' : 'false'}
                        style={{
                          background: '#eff6ff',
                          border: `1px solid ${blockHasAnyError ? '#fca5a5' : '#bfdbfe'}`,
                          borderRadius: '8px', marginBottom: '16px', padding: '16px',
                          transition: 'border-color 0.2s, box-shadow 0.2s',
                          boxShadow: blockHasAnyError ? '0 0 0 3px rgba(239,68,68,0.08)' : 'none'
                        }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                          <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e40af' }}>Long Question {bi + 1}</div>
                          {blockHasAnyError && (
                            <span style={{ fontSize: '11px', color: '#dc2626', fontWeight: '600', background: '#fee2e2', padding: '2px 8px', borderRadius: '10px' }}>
                              ⚠ Fill all marks
                            </span>
                          )}
                          {(longBlocks[section.key] || []).length > 1 && (
                            <button onClick={() => handleRemoveBlock(section.key, bi)}
                              style={{ marginLeft: 'auto', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '4px', padding: '5px 12px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
                              Remove
                            </button>
                          )}
                        </div>
                        {(section.config?.parts || ['A', 'B']).map(part => (
                          <LongPart key={part} part={part} questionTypes={section.question_types}
                            partData={block.parts?.[part] || {}}
                            onChange={(field, val) => handleBlockChange(section.key, bi, `parts.${part}.${field}`, val)}
                            onPickQuestions={handlePickQuestions} chapters={chapters}
                            hasError={!!longMarksErrors[`${section.key}-${bi}-${part}`]} />
                        ))}
                      </div>
                    );
                  })}

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
                        <ShortQRow key={i} section={section} rowIndex={i} rowData={row}
                          onChange={handleRowChange} onRemove={handleRemoveRow}
                          canRemove={(sectionRows[section.key] || []).length > 1}
                          onPickQuestions={handlePickQuestions} chapters={chapters} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          }

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
                        {/* Validation 1 + auto-populate solve */}
                        <td style={{ padding: '10px 14px' }}>
                          <CountInput
                            value={(rows[i] || {}).count || 0}
                            totalAvailable={qt.total_available}
                            readOnly={(rows[i] || {}).selection === 'pick'}
                            onChange={val => {
                              handleRowChange(section.key, i, 'count', val);
                              // Validation 2: auto-populate solve
                              if (section.has_solve_field) {
                                const currentSolve = parseInt((rows[i] || {}).solve) || 0;
                                if (currentSolve === 0 || currentSolve > val) {
                                  handleRowChange(section.key, i, 'solve', val);
                                }
                              }
                            }}
                          />
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <SelectCell qt={qt} sectionKey={section.key} rowIndex={i}
                            rowData={rows[i] || {}} onChange={handleRowChange}
                            onPickQuestions={handlePickQuestions} chapters={chapters} />
                        </td>
                        {/* Validation 2: Solve with cap validation */}
                        {section.has_solve_field && (
                          <td style={{ padding: '10px 14px' }}>
                            <SolveInput
                              count={(rows[i] || {}).count || 0}
                              value={(rows[i] || {}).solve}
                              onChange={val => handleRowChange(section.key, i, 'solve', val)}
                            />
                          </td>
                        )}
                        <td style={{ padding: '10px 14px' }}>
                          <input type="number" min="0" value={(rows[i] || {}).marks || ''}
                            onChange={e => handleRowChange(section.key, i, 'marks', parseInt(e.target.value) || 0)}
                            style={numInputStyle} />
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

      <div style={{ maxWidth: '1100px', width: '100%', margin: '20px auto 0', display: 'flex', gap: '12px', paddingTop: '20px', borderTop: '2px solid rgba(0,0,0,0.08)' }}>
        <button onClick={() => window.location.href = '/test-maker/step-4'}
          style={{ flex: 1, padding: '12px 24px', fontSize: '14px', fontWeight: '600', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', cursor: 'pointer', background: 'transparent', color: '#999', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}>
          <i className="ti ti-arrow-left"></i> Back
        </button>
        {/* Validation 3: Next triggers validateAndProceed */}
        <button onClick={validateAndProceed}
          style={{ flex: 1, padding: '12px 24px', fontSize: '14px', fontWeight: '600', border: 'none', borderRadius: '8px', cursor: 'pointer', background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: 'white', boxShadow: '0 3px 10px rgba(37,99,235,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          Next <i className="ti ti-arrow-right"></i>
        </button>
      </div>

      <style>{`
        .step-page { min-height:100vh; background:linear-gradient(135deg,#f5f7fa 0%,#f0f4f8 100%); padding:20px; display:flex; flex-direction:column; }
        .sel-input { padding:6px 8px; border:1px solid #d1d5db; border-radius:5px; font-size:13px; cursor:pointer; background:white; }
        .sel-input:focus { outline:none; border-color:#2563eb; }
        .q-modal-table img { max-width:200px; height:auto; }
        .q-modal-content img { vertical-align: middle; display: inline-block; max-width: 100%; height: auto; }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-4px); }
          40% { transform: translateX(4px); }
          60% { transform: translateX(-3px); }
          80% { transform: translateX(3px); }
        }

        .bc-wrap { display: flex; align-items: center; justify-content: center; gap: 8px; margin: 0 auto 16px; max-width: 1100px; width: 100%; font-size: 13px; color: #999; }
        .bc-pill { padding: 4px 10px; background: rgba(255,255,255,0.6); border-radius: 6px; font-size: 13px; color: #64748b; }
        .bc-active { background: white; color: #2563eb; font-weight: 600; }
        .bc-sep { color: #cbd5e1; font-size: 13px; }

        .s5-header { max-width: 1100px; width: 100%; margin: 0 auto 24px; text-align: center; }
        .step-badge { display: inline-flex; align-items: center; padding: 5px 16px; background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; border-radius: 20px; font-size: 12px; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 12px; }
        .s5-title { font-size: 28px; font-weight: 700; color: #1a1a1a; margin: 0; letter-spacing: -0.5px; }

        @media (max-width: 768px) {
          .desktop-only { display: none; }
          .step-page { padding: 0 12px 20px; }
          .step-badge { position: fixed; top: 18px; left: 50%; transform: translateX(-50%); margin-bottom: 0 !important; padding: 4px 12px !important; font-size: 10px !important; letter-spacing: 0.3px; z-index: 199; box-shadow: 0 2px 8px rgba(37,99,235,0.25); white-space: nowrap; max-width: calc(100vw - 130px); overflow: hidden; text-overflow: ellipsis; }
          .s5-header { margin-top: 70px; margin-bottom: 20px; }
          .s5-title { font-size: 22px; }
        }
      `}</style>
    </div>
  );
}

const cardStyle = { background: 'white', borderRadius: '8px', overflow: 'visible', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', position: 'relative' };
const headerStyle = { background: '#2563eb', color: 'white', padding: '12px 20px', fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '8px 8px 0 0' };