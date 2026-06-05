import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactDOM from 'react-dom';
import { useTestMaker } from '../../hooks/useTestMaker';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';
import TopBar from '../../components/TopBar';
import * as apiService from '../../services/api';

const IMAGE_BASE = 'https://testmaker.pk';

function fixHtml(html) {
  if (!html) return '';
  // Fix image paths
  let fixed = html.replace(/src="\/([^"]+)"/g, `src="${IMAGE_BASE}/$1"`);
  
  // Fix malformed table tags (replace % with > and fix closing tags)
  fixed = fixed.replace(/&gt;/g, '>');
  fixed = fixed.replace(/&lt;/g, '<');
  fixed = fixed.replace(/&quot;/g, '"');
  fixed = fixed.replace(/&amp;/g, '&');
  
  // Fix unclosed or malformed table tags
  fixed = fixed.replace(/<table([^>]*)>/gi, '<table$1 style="border-collapse: collapse; width: 100%; margin: 10px 0;">');
  fixed = fixed.replace(/<th/gi, '<th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2; text-align: center; font-weight: bold;"');
  fixed = fixed.replace(/<td/gi, '<td style="border: 1px solid #ddd; padding: 8px; text-align: center;"');
  fixed = fixed.replace(/<tr/gi, '<tr style="border: 1px solid #ddd;"');
  
  // Fix any malformed % signs in table cells
  fixed = fixed.replace(/٪/g, '%');
  
  return fixed;
}

function QuestionText({ statement, description }) {
  const combined = [statement, description].filter(Boolean).join(' ');
  if (!combined) return <span style={{ color: '#999' }}>—</span>;
  return (
    <span
      className="s5-q-content"
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
            padding: '2px 6px', borderRadius: '4px',
          }}>
            <span style={{ flexShrink: 0, fontWeight: '700' }}>{letters[i]}.</span>
            <span
              className="s5-q-content"
              dangerouslySetInnerHTML={{ __html: fixHtml(optionText) }}
              style={{ direction: language === 'ur' ? 'rtl' : 'ltr', textAlign: language === 'ur' ? 'right' : 'left' }}
            />
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
      <td style={{ ...tdStyle, maxWidth: '380px' }}>
        <QuestionText statement={q.statement_en} description={q.description_en} />
        <OptionsDisplay options={q.options} language="en" />
      </td>
      <td style={{ ...tdStyle, maxWidth: '380px', direction: 'rtl', textAlign: 'right' }}>
        <QuestionText statement={q.statement_ur} description={q.description_ur} />
        <OptionsDisplay options={q.options} language="ur" />
      </td>
    </tr>
  );
});

function QuestionPickerModal({ isOpen, onClose, onDone, questions, loading, title, initialSelected = [] }) {
  const [selected, setSelected] = useState([]);
  const [search, setSearch]     = useState('');
  const [showOnlySelected, setShowOnlySelected] = useState(false);
  const scrollRef        = useRef(null);
  const pendingScrollRef = useRef(null);
  const savedScrollRef   = useRef(0);

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
    if (document.activeElement?.tagName === 'INPUT') document.activeElement.blur();
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

  const filtered = search.trim() === ''
    ? questions
    : questions.filter(q => {
        const s = search.toLowerCase();
        return (q.statement_en || '').toLowerCase().includes(s) ||
               (q.statement_ur || '').includes(search) ||
               (q.description_en || '').toLowerCase().includes(s);
      });

  const visible   = showOnlySelected ? filtered.filter(q => selected.includes(q.id)) : filtered;
  const toggleAll = () => setSelected(
    visible.length > 0 && visible.every(q => selected.includes(q.id))
      ? selected.filter(id => !visible.find(q => q.id === id))
      : [...new Set([...selected, ...visible.map(q => q.id)])]
  );

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }} onClick={onClose}>
      <div style={{ background: 'white', borderRadius: '12px', width: '100%', maxWidth: '920px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', margin: 0, flex: 1, minWidth: 0 }}>{title}</h3>
          <button type="button" onClick={togglePillFilter} disabled={selected.length === 0}
            style={{ background: showOnlySelected ? '#1d4ed8' : '#dbeafe', color: showOnlySelected ? 'white' : '#1d4ed8', fontWeight: '700', fontSize: '13px', padding: '5px 12px', borderRadius: '20px', border: 'none', cursor: selected.length === 0 ? 'not-allowed' : 'pointer', opacity: selected.length === 0 ? 0.55 : 1, display: 'inline-flex', alignItems: 'center', gap: '6px', transition: 'all 0.15s ease', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
            {selected.length} selected
            <span style={{ fontSize: '10px', lineHeight: 1 }}>{showOnlySelected ? '▴' : '▾'}</span>
          </button>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#6b7280', flexShrink: 0 }}>✕</button>
        </div>
        <div style={{ padding: '10px 20px', borderBottom: '1px solid #f0f0f0' }}>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search questions..."
            style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '13px', outline: 'none', fontFamily: 'inherit' }}
            autoFocus />
        </div>
        <div ref={scrollRef} style={{ overflowY: 'auto', flex: 1 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Loading questions...</div>
          ) : visible.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
              {showOnlySelected ? 'No selected questions to show' : 'No questions found'}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '500px' }}>
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
            </div>
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
  const [open, setOpen]       = useState(false);
  const [dropPos, setDropPos] = useState({ top: 0, left: 0 });
  const btnRef     = useRef(null);
  const dropdownRef = useRef(null);

  const handleOpen = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const top = spaceBelow < 300
        ? rect.top + window.scrollY - 300
        : rect.bottom + window.scrollY + 4;
      setDropPos({ top, left: Math.min(rect.left + window.scrollX, window.innerWidth - 280) });
    }
    setOpen(p => !p);
  };

  const toggle = (code) => onChange(value.includes(code) ? value.filter(x => x !== code) : [...value, code]);
  const getChapterName = (ch) => ch.chapter_name_en || ch.chapter_name_urdu || ch.chapter_code;
  const label = value.length === 0 ? 'All Chapters' : `${value.length} chapter${value.length > 1 ? 's' : ''}`;

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) &&
          btnRef.current && !btnRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const dropdown = open ? (
    <div ref={dropdownRef} style={{ position: 'absolute', top: dropPos.top, left: dropPos.left, background: 'white', border: '1px solid #d1d5db', borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)', zIndex: 99999, width: '260px', maxHeight: '280px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', borderRadius: '8px 8px 0 0' }}>
        <span style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>Select Chapters</span>
        <button onClick={() => setOpen(false)} style={{ background: '#e2e8f0', border: 'none', borderRadius: '4px', cursor: 'pointer', color: '#64748b', fontSize: '12px', padding: '2px 8px', fontWeight: '600' }}>✕</button>
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
              <input type="checkbox" checked={isChecked} onChange={() => toggle(ch.chapter_code)} style={{ marginTop: '2px', accentColor: '#2563eb', flexShrink: 0, width: '14px', height: '14px', cursor: 'pointer' }} />
              <span style={{ wordBreak: 'break-word' }}>{getChapterName(ch)}</span>
            </label>
          );
        })}
      </div>
    </div>
  ) : null;

  return (
    <div style={{ display: 'inline-block' }}>
      <button ref={btnRef} type="button" onClick={handleOpen}
        style={{ padding: '5px 10px', border: '1px solid #d1d5db', borderRadius: '5px', fontSize: '12px', cursor: 'pointer', background: 'white', whiteSpace: 'nowrap', minWidth: '110px', textAlign: 'left', color: value.length > 0 ? '#1d4ed8' : '#374151', fontWeight: value.length > 0 ? '600' : 'normal' }}>
        {label} ▾
      </button>
      {typeof document !== 'undefined' && open ? ReactDOM.createPortal(dropdown, document.body) : null}
    </div>
  );
}

function CountInput({ value, totalAvailable, readOnly, onChange }) {
  const [localError, setLocalError] = useState('');
  const handleChange = (e) => {
    const num = parseInt(e.target.value) || 0;
    if (totalAvailable != null && num > totalAvailable) {
      setLocalError(`Max ${totalAvailable}`);
      onChange(totalAvailable);
    } else {
      setLocalError('');
      onChange(num);
    }
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <input type="number" min="0" max={totalAvailable ?? 9999} value={value} readOnly={readOnly}
          onChange={handleChange}
          style={{ ...numInputStyle, borderColor: localError ? '#ef4444' : '#d1d5db', boxShadow: localError ? '0 0 0 2px rgba(239,68,68,0.15)' : 'none' }} />
        {totalAvailable != null && (
          <span style={{ fontSize: '11px', color: localError ? '#ef4444' : '#94a3b8', fontWeight: localError ? '700' : 'normal' }}>
            /{totalAvailable}
          </span>
        )}
      </div>
      {localError && <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: '600', whiteSpace: 'nowrap' }}>⚠ {localError}</span>}
    </div>
  );
}

function SolveDropdown({ count, value, onChange }) {
  const max = parseInt(count) || 0;
  const options = Array.from({ length: max }, (_, i) => i + 1);
  return (
    <select value={value || max || ''} onChange={e => onChange(parseInt(e.target.value) || 0)}
      className="s5-sel" disabled={max === 0} style={{ minWidth: '65px', opacity: max === 0 ? 0.5 : 1 }}>
      {max === 0 && <option value="">—</option>}
      {options.map(n => <option key={n} value={n}>{n}</option>)}
    </select>
  );
}

function SolveInput({ count, value, onChange }) {
  const [error, setError] = useState('');
  const max = parseInt(count) || 0;
  useEffect(() => {
    if (max > 0) {
      const current = parseInt(value) || 0;
      if (current === 0 || current > max) { onChange(max); setError(''); }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [max]);
  const handleChange = (e) => {
    const num = parseInt(e.target.value) || 0;
    if (max > 0 && num > max) { setError(`Max ${max}`); }
    else { setError(''); onChange(num); }
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <input type="number" min="0" max={max || 9999} value={value || ''}
        onChange={handleChange} placeholder={max ? String(max) : 'Any'}
        style={{ ...numInputStyle, borderColor: error ? '#ef4444' : '#d1d5db', boxShadow: error ? '0 0 0 2px rgba(239,68,68,0.15)' : 'none' }} />
      {error && <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: '600' }}>⚠ {error}</span>}
    </div>
  );
}

function SelectCell({ qt, sectionKey, rowIndex, rowData, onChange, onPickQuestions, chapters }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [questions, setQuestions]   = useState([]);
  const [loadingQ, setLoadingQ]     = useState(false);
  const handleChange = (val) => {
    onChange(sectionKey, rowIndex, 'selection', val);
    if (val === 'pick') {
      setPickerOpen(true); setLoadingQ(true);
      onPickQuestions(qt.type_id, rowData.chapter_codes || []).then(qs => { setQuestions(qs); setLoadingQ(false); });
    }
  };
  const handleDone = (ids) => { onChange(sectionKey, rowIndex, 'picked_ids', ids); onChange(sectionKey, rowIndex, 'count', ids.length); setPickerOpen(false); };
  return (
    <>
      <select value={rowData.selection || 'random'} onChange={e => handleChange(e.target.value)} className="s5-sel">
        <option value="random">Random</option>
        <option value="pick">Pick</option>
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
  const [questions, setQuestions]   = useState([]);
  const [loadingQ, setLoadingQ]     = useState(false);
  const qt = section.question_types[0];
  const handleChange = (val) => {
    onChange(section.key, rowIndex, 'selection', val);
    if (val === 'pick') {
      setPickerOpen(true); setLoadingQ(true);
      onPickQuestions(qt.type_id, rowData.chapter_codes || []).then(qs => { setQuestions(qs); setLoadingQ(false); });
    }
  };
  const handleDone = (ids) => { onChange(section.key, rowIndex, 'picked_ids', ids); onChange(section.key, rowIndex, 'count', ids.length); setPickerOpen(false); };
  const handleCountChange = (val) => {
    onChange(section.key, rowIndex, 'count', val);
    const currentSolve = parseInt(rowData.solve) || 0;
    if (currentSolve === 0 || currentSolve > val) onChange(section.key, rowIndex, 'solve', val);
  };
  return (
    <>
      <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
        <td style={tdStyle}>{qt.name}</td>
        <td style={tdStyle}><CountInput value={rowData.count || 0} totalAvailable={qt.total_available} readOnly={rowData.selection === 'pick'} onChange={handleCountChange} /></td>
        <td style={tdStyle}><ChapterMultiSelect chapters={chapters} value={rowData.chapter_codes || []} onChange={val => onChange(section.key, rowIndex, 'chapter_codes', val)} /></td>
        <td style={tdStyle}><SolveDropdown count={rowData.count || 0} value={rowData.solve} onChange={val => onChange(section.key, rowIndex, 'solve', val)} /></td>
        <td style={tdStyle}>
          <select value={rowData.selection || 'random'} onChange={e => handleChange(e.target.value)} className="s5-sel">
            <option value="random">Random</option>
            <option value="pick">Pick</option>
          </select>
        </td>
        <td style={tdStyle}><input type="number" min="0" value={rowData.marks || ''} onChange={e => onChange(section.key, rowIndex, 'marks', parseInt(e.target.value) || 0)} style={numInputStyle} /></td>
        <td style={tdStyle}>
          {canRemove && (
            <button onClick={() => onRemove(section.key, rowIndex)}
              style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '4px', width: '28px', height: '28px', cursor: 'pointer', fontSize: '18px', fontWeight: '700' }}>−</button>
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

function LongPart({ part, questionTypes, partData, onChange, onPickQuestions, chapters, hasError }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [questions, setQuestions]   = useState([]);
  const [loadingQ, setLoadingQ]     = useState(false);
  const selectedTypeId = partData.type_id || questionTypes[0]?.type_id;
  const selectedQt     = questionTypes.find(qt => qt.type_id === Number(selectedTypeId)) || questionTypes[0];
  const handleSelectionChange = (val) => {
    onChange('selection', val);
    if (val === 'pick') {
      setPickerOpen(true); setLoadingQ(true);
      onPickQuestions(selectedTypeId, partData.chapter_ids || []).then(qs => { setQuestions(qs); setLoadingQ(false); });
    }
  };
  return (
    <>
      <div style={{ borderTop: '1px solid #bfdbfe', paddingTop: '12px', marginTop: '12px' }}>
        <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e40af', marginBottom: '10px' }}>Part {part}:</div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={labelStyle}>Question Type</label>
            <select value={partData.type_id || questionTypes[0]?.type_id || ''} onChange={e => onChange('type_id', Number(e.target.value))} className="s5-sel">
              {questionTypes.map(qt => <option key={qt.type_id} value={qt.type_id}>{qt.name}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={labelStyle}>Chapters</label>
            <ChapterMultiSelect chapters={chapters} value={partData.chapter_ids || []} onChange={val => onChange('chapter_ids', val)} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={labelStyle}>Select Type</label>
            <select value={partData.selection || 'random'} onChange={e => handleSelectionChange(e.target.value)} className="s5-sel">
              <option value="random">Random</option>
              <option value="pick">Pick</option>
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ ...labelStyle, color: hasError ? '#dc2626' : '#475569' }}>
              Marks {hasError && <span style={{ color: '#dc2626' }}>*</span>}
            </label>
            <input type="number" min="0" value={partData.marks || ''} onChange={e => onChange('marks', parseInt(e.target.value) || 0)}
              placeholder={hasError ? 'Required' : ''}
              style={{ ...numInputStyle, borderColor: hasError ? '#ef4444' : '#d1d5db', boxShadow: hasError ? '0 0 0 3px rgba(239,68,68,0.2)' : 'none', animation: hasError ? 'shake 0.4s ease' : 'none' }} />
            {hasError && <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: '600', whiteSpace: 'nowrap' }}>Required</span>}
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

const labelStyle    = { fontSize: '11px', fontWeight: '600', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.4px' };
const numInputStyle = { width: '70px', padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: '5px', fontSize: '13px', textAlign: 'center', transition: 'border-color 0.15s, box-shadow 0.15s' };
const cardStyle     = { background: 'white', borderRadius: '10px', overflow: 'visible', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', position: 'relative' };
const headerStyle   = { background: '#2563eb', color: 'white', padding: '12px 20px', fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '10px 10px 0 0' };

// ── Section key classification ───────────────────────────────────────────────
const BOARD_SECTION_KEYS = [
  'short_questions_according_to_board_pattern',
  'long_question_according_to_board_pattern',
];
const WITHOUT_BOARD_KEYS = [
  'objective',
  'subjective_without_board_pattern',
];

function getCleanTitle(section) {
  if (section.key === 'subjective_without_board_pattern') return 'Subjective';
  if (section.key === 'short_questions_according_to_board_pattern') return 'Short Questions';
  if (section.key === 'long_question_according_to_board_pattern') return 'Long Questions';
  return section.title;
}

export default function Step5ConfigReview() {
  const navigate = useNavigate();
  const { selectedSubject, loadPaperConfig, loadQuestions } = useTestMaker();
  const [apiData,              setApiData]              = useState(null);
  const [configLoading,        setConfigLoading]        = useState(true);
  const [configError,          setConfigError]          = useState('');
  const [chapters,             setChapters]             = useState([]);
  const [sectionRows,          setSectionRows]          = useState({});
  const [longBlocks,           setLongBlocks]           = useState({});
  const [longSectionChoices,   setLongSectionChoices]   = useState({});
  const [longMarksErrors,      setLongMarksErrors]      = useState({});
  const [showValidationBanner, setShowValidationBanner] = useState(false);

  // ── Board/Without Board toggle ───────────────────────────────────────────
  const [boardMode, setBoardMode] = useState(
    () => localStorage.getItem('step5_board_mode') || 'without'
  );

  const handleBoardModeChange = (mode) => {
    setBoardMode(mode);
    localStorage.setItem('step5_board_mode', mode);
  };

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
    } catch (err) { console.error('Chapters error:', err); }
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
    const rows = {}; const longs = {};
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
    setSectionRows(rows); setLongBlocks(longs);
  };

  const handlePickQuestions = async (typeId, selectedChapterCodes) => {
    try {
      const classId         = localStorage.getItem('class_id') || '';
      const exerciseQuestion = localStorage.getItem('exercise_question') || '1,0,2,3,4';
      let finalChapterIds = ''; let finalTopics = '';
      if (selectedChapterCodes?.length > 0) {
        const ids = []; const topics = [];
        chapters.forEach(ch => {
          if (selectedChapterCodes.includes(ch.chapter_code)) {
            if (ch.chapter_id) ids.push(ch.chapter_id);
            if (ch.topics?.length > 0) topics.push(...ch.topics);
          }
        });
        finalChapterIds = ids.join(','); finalTopics = [...new Set(topics)].join(',');
      } else {
        finalChapterIds = localStorage.getItem('chapter_ids') || '';
        finalTopics     = localStorage.getItem('topics') || '';
      }
      const data = await loadQuestions({ class_id: parseInt(classId) || 0, chapter_ids: finalChapterIds, topics: finalTopics, exercise_ids: '', exercise_question: exerciseQuestion, type_id: typeId });
      return data || [];
    } catch (err) { console.error('Questions error:', err); return []; }
  };

  const handleRowChange    = (sectionKey, rowIndex, field, value) => setSectionRows(prev => { const rows = [...(prev[sectionKey] || [])]; rows[rowIndex] = { ...rows[rowIndex], [field]: value }; return { ...prev, [sectionKey]: rows }; });
  const handleAddRow       = (sectionKey) => setSectionRows(prev => ({ ...prev, [sectionKey]: [...(prev[sectionKey] || []), { count: 0, chapter_ids: [], solve: '', marks: '', selection: 'random', picked_ids: [] }] }));
  const handleRemoveRow    = (sectionKey, rowIndex) => setSectionRows(prev => { const rows = [...(prev[sectionKey] || [])]; rows.splice(rowIndex, 1); return { ...prev, [sectionKey]: rows }; });

  const handleBlockChange = (sectionKey, blockIndex, field, value) => {
    setLongBlocks(prev => {
      const blocks = JSON.parse(JSON.stringify(prev[sectionKey] || []));
      if (field.startsWith('parts.')) {
        const [, part, sub] = field.split('.');
        if (!blocks[blockIndex].parts) blocks[blockIndex].parts = {};
        if (!blocks[blockIndex].parts[part]) blocks[blockIndex].parts[part] = {};
        blocks[blockIndex].parts[part][sub] = value;
      } else { blocks[blockIndex][field] = value; }
      return { ...prev, [sectionKey]: blocks };
    });
    if (field.endsWith('.marks')) {
      const part = field.split('.')[1];
      setLongMarksErrors(prev => { const next = { ...prev }; delete next[`${sectionKey}-${blockIndex}-${part}`]; return next; });
    }
  };

  const handleAddBlock = (sectionKey, section) => {
    const parts = {};
    (section.config?.parts || ['A', 'B']).forEach(p => { parts[p] = { type_id: section.question_types[0]?.type_id }; });
    setLongBlocks(prev => ({ ...prev, [sectionKey]: [...(prev[sectionKey] || []), { choice: '', parts }] }));
  };

  const handleRemoveBlock = (sectionKey, blockIndex) => {
    setLongBlocks(prev => {
      const blocks = [...(prev[sectionKey] || [])]; blocks.splice(blockIndex, 1);
      setLongSectionChoices(p => { const current = parseInt(p[sectionKey]) || 0; if (current > blocks.length) return { ...p, [sectionKey]: blocks.length > 0 ? String(blocks.length) : '' }; return p; });
      return { ...prev, [sectionKey]: blocks };
    });
  };

  const validateAndProceed = () => {
    const sections = apiData?.sections || [];
    const errors = {}; let hasErrors = false;
    sections.forEach(section => {
      if (section.key === 'long_question_according_to_board_pattern') {
        const blocks = longBlocks[section.key] || [];
        const parts  = section.config?.parts || ['A', 'B'];
        blocks.forEach((block, bi) => {
          const anyHasMarks = parts.some(p => parseInt(block.parts?.[p]?.marks) > 0);
          if (anyHasMarks) {
            parts.forEach(p => {
              if (!(parseInt(block.parts?.[p]?.marks) > 0)) { errors[`${section.key}-${bi}-${p}`] = true; hasErrors = true; }
            });
          }
        });
      }
    });
    setLongMarksErrors(errors);
    if (hasErrors) {
      setShowValidationBanner(true);
      setTimeout(() => { const el = document.querySelector('[data-marks-error="true"]'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 80);
      return;
    }
    setShowValidationBanner(false);
    localStorage.setItem('step5_config',   JSON.stringify({ sections, sectionRows, longBlocks, longSectionChoices, boardMode }));
    localStorage.setItem('step5_chapters', JSON.stringify(chapters));
    navigate('/test-maker/step-6');
  };

  if (configLoading) return <LoadingSpinner message="Loading paper configuration..." />;

  const allSections  = apiData?.sections || [];
  const totalDataset = apiData?.total_dataset_questions;

  // Detect if board pattern sections exist
  const hasBoardSections = allSections.some(s => BOARD_SECTION_KEYS.includes(s.key));

  // Filter sections based on toggle
  const visibleSections = allSections.filter(s => {
    if (boardMode === 'without') {
      return WITHOUT_BOARD_KEYS.includes(s.key) || s.key === 'objective';
    } else {
      return !WITHOUT_BOARD_KEYS.includes(s.key) || s.key === 'objective';
    }
  });

  return (
    <div className="s5-page">
      <TopBar />

      {/* Breadcrumb */}
      <div className="s5-breadcrumb">
        <span className="s5-bc-item">{selectedSubject?.subject_name || 'Subject'}</span>
        <i className="ti ti-chevron-right s5-bc-sep" />
        <span className="s5-bc-item s5-bc-active">Paper Config</span>
      </div>

      {/* Header */}
      <div className="s5-header">
        <div className="s5-step-badge">Step 05 of 06</div>
        <h1 className="s5-title">
          <span className="s5-num">05</span>
          Select Questions
        </h1>
        {totalDataset && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '14px' }}>
            <div style={{ background: '#dbeafe', border: '1px solid #93c5fd', borderRadius: '10px', padding: '10px 28px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#1e40af', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Dataset Questions</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#1d4ed8' }}>{totalDataset.toLocaleString()}</div>
            </div>
          </div>
        )}

        {/* Board Mode Toggle — only shown if board sections exist */}
        {hasBoardSections && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
            <div style={{ display: 'inline-flex', background: '#f1f5f9', borderRadius: '12px', padding: '4px', gap: '4px' }}>
              <button
                onClick={() => handleBoardModeChange('without')}
                style={{
                  padding: '9px 24px', borderRadius: '9px', border: 'none', cursor: 'pointer',
                  fontSize: '13px', fontWeight: '700', fontFamily: 'inherit',
                  transition: 'all 0.2s',
                  background: boardMode === 'without' ? 'white' : 'transparent',
                  color: boardMode === 'without' ? '#1d4ed8' : '#64748b',
                  boxShadow: boardMode === 'without' ? '0 1px 4px rgba(0,0,0,0.12)' : 'none',
                }}
              >
                Without Board
              </button>
              <button
                onClick={() => handleBoardModeChange('with')}
                style={{
                  padding: '9px 24px', borderRadius: '9px', border: 'none', cursor: 'pointer',
                  fontSize: '13px', fontWeight: '700', fontFamily: 'inherit',
                  transition: 'all 0.2s',
                  background: boardMode === 'with' ? 'white' : 'transparent',
                  color: boardMode === 'with' ? '#1d4ed8' : '#64748b',
                  boxShadow: boardMode === 'with' ? '0 1px 4px rgba(0,0,0,0.12)' : 'none',
                }}
              >
                With Board
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="s5-content">
        {configError && <ErrorAlert message={configError} onClose={() => setConfigError('')} />}

        {showValidationBanner && (
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '12px 16px', display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '16px' }}>
            <span style={{ fontSize: '20px', flexShrink: 0 }}>⚠️</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#991b1b' }}>Incomplete marks in long questions</div>
              <div style={{ fontSize: '12px', color: '#b91c1c', marginTop: '2px' }}>If any part has marks filled, all parts must have marks.</div>
            </div>
            <button onClick={() => setShowValidationBanner(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#991b1b', fontSize: '16px', padding: '0 4px', flexShrink: 0 }}>✕</button>
          </div>
        )}

        {visibleSections.map(section => {
          const isLong       = section.key === 'long_question_according_to_board_pattern';
          const isShortBoard = section.key === 'short_questions_according_to_board_pattern';
          const displayTitle = getCleanTitle(section);

          if (isLong) {
            const blockCount    = (longBlocks[section.key] || []).length;
            const currentChoice = longSectionChoices[section.key] || '';
            const choiceOptions = Array.from({ length: blockCount }, (_, i) => i + 1);
            return (
              <div key={section.key} style={cardStyle}>
                <div style={headerStyle}>
                  <i className="ti ti-info-circle" />
                  <span style={{ minWidth: 0, flex: 1 }}>{displayTitle}</span>
                </div>
                <div style={{ padding: '16px 20px 20px' }}>
                  <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '8px', padding: '12px 14px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <i className="ti ti-list-check" style={{ fontSize: '18px', color: '#b45309', flexShrink: 0 }} />
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#92400e' }}>Students must attempt any</span>
                    <select value={currentChoice} onChange={e => setLongSectionChoices(prev => ({ ...prev, [section.key]: e.target.value }))} className="s5-sel" style={{ minWidth: '70px' }} disabled={blockCount === 0}>
                      <option value="">All</option>
                      {choiceOptions.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#92400e' }}>out of {blockCount} long question{blockCount !== 1 ? 's' : ''}</span>
                  </div>
                  {(longBlocks[section.key] || []).map((block, bi) => {
                    const blockHasAnyError = Object.keys(longMarksErrors).some(k => k.startsWith(`${section.key}-${bi}-`));
                    return (
                      <div key={bi} data-marks-error={blockHasAnyError ? 'true' : 'false'}
                        style={{ background: '#eff6ff', border: `1px solid ${blockHasAnyError ? '#fca5a5' : '#bfdbfe'}`, borderRadius: '8px', marginBottom: '16px', padding: '16px', boxShadow: blockHasAnyError ? '0 0 0 3px rgba(239,68,68,0.08)' : 'none', transition: 'border-color 0.2s, box-shadow 0.2s' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
                          <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e40af' }}>Long Question {bi + 1}</div>
                          {blockHasAnyError && <span style={{ fontSize: '11px', color: '#dc2626', fontWeight: '600', background: '#fee2e2', padding: '2px 8px', borderRadius: '10px' }}>Fill all marks</span>}
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
                  <i className="ti ti-info-circle" />
                  <span style={{ flex: 1, minWidth: 0 }}>{displayTitle}</span>
                  <button onClick={() => handleAddRow(section.key)}
                    style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)', color: 'white', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', flexShrink: 0 }}>
                    + Add Row
                  </button>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '560px' }}>
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

          // Regular section
          const rows = sectionRows[section.key] || [];
          return (
            <div key={section.key} style={cardStyle}>
              <div style={headerStyle}>
                {section.order > 1 && <i className="ti ti-info-circle" />}
                <span style={{ flex: 1, minWidth: 0 }}>{displayTitle}</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '480px' }}>
                  <thead>
                    <tr>
                      {['#', 'Question Type', 'Count', 'Select', ...(section.has_solve_field ? ['Solve'] : []), 'Marks'].map((h, i) => (
                        <th key={i} style={{ background: '#f8fafc', padding: '10px 14px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '12px', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {section.question_types.map((qt, i) => (
                      <tr key={qt.type_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '10px 14px', color: '#64748b', fontSize: '12px', width: '36px' }}>{i + 1}</td>
                        <td style={{ padding: '10px 14px', fontWeight: '500', color: '#334155', minWidth: '160px' }}>{qt.name}</td>
                        <td style={{ padding: '10px 14px' }}>
                          <CountInput value={(rows[i] || {}).count || 0} totalAvailable={qt.total_available}
                            readOnly={(rows[i] || {}).selection === 'pick'}
                            onChange={val => {
                              handleRowChange(section.key, i, 'count', val);
                              if (section.has_solve_field) {
                                const currentSolve = parseInt((rows[i] || {}).solve) || 0;
                                if (currentSolve === 0 || currentSolve > val) handleRowChange(section.key, i, 'solve', val);
                              }
                            }} />
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <SelectCell qt={qt} sectionKey={section.key} rowIndex={i} rowData={rows[i] || {}}
                            onChange={handleRowChange} onPickQuestions={handlePickQuestions} chapters={chapters} />
                        </td>
                        {section.has_solve_field && (
                          <td style={{ padding: '10px 14px' }}>
                            <SolveDropdown count={(rows[i] || {}).count || 0} value={(rows[i] || {}).solve}
                              onChange={val => handleRowChange(section.key, i, 'solve', val)} />
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

      {/* Bottom action buttons */}
      <div className="s5-actions">
        <button onClick={() => navigate('/test-maker/step-4')} className="s5-btn s5-btn-ghost">
          <i className="ti ti-arrow-left" /> Back
        </button>
        <button onClick={validateAndProceed} className="s5-btn s5-btn-primary">
          Next <i className="ti ti-arrow-right" />
        </button>
      </div>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        .s5-q-content table {
          border-collapse: collapse !important;
          width: 100% !important;
          margin: 10px 0 !important;
        }

        .s5-q-content table td,
        .s5-q-content table th {
          border: 1px solid #ddd !important;
          padding: 8px !important;
          text-align: center !important;
        }

        .s5-q-content table th {
          background-color: #f2f2f2 !important;
          font-weight: bold !important;
        }

        .s5-q-content table tr {
          border: 1px solid #ddd !important;
        }
        .s5-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #f0f4f8 100%);
          padding: 24px 20px 48px;
          font-family: 'Segoe UI', system-ui, sans-serif;
          display: flex;
          flex-direction: column;
        }

        .s5-breadcrumb {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-top: 80px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }
        .s5-bc-item { padding: 4px 12px; background: rgba(255,255,255,0.7); border-radius: 20px; font-size: 12px; color: #64748b; font-weight: 500; }
        .s5-bc-active { background: white; color: #2563eb; font-weight: 700; box-shadow: 0 2px 8px rgba(0,0,0,0.07); }
        .s5-bc-sep { color: #cbd5e1; font-size: 13px; }

        .s5-header {
          max-width: 1100px;
          width: 100%;
          margin: 0 auto 24px;
          text-align: center;
        }
        .s5-step-badge {
          display: inline-flex;
          padding: 5px 18px;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: white;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.5px;
          margin-bottom: 16px;
        }
        .s5-title {
          font-size: clamp(22px, 5vw, 36px);
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          letter-spacing: -0.5px;
          flex-wrap: wrap;
          line-height: 1.2;
        }
        .s5-num {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 50px; height: 50px;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: white;
          border-radius: 50%;
          font-size: 20px;
          font-weight: 800;
          flex-shrink: 0;
        }

        .s5-content {
          max-width: 1100px;
          width: 100%;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .s5-sel { padding: 6px 8px; border: 1px solid #d1d5db; border-radius: 5px; font-size: 13px; cursor: pointer; background: white; }
        .s5-sel:focus { outline: none; border-color: #2563eb; }

        .s5-q-content img { vertical-align: middle; display: inline-block; max-width: 100%; height: auto; }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-4px); }
          40% { transform: translateX(4px); }
          60% { transform: translateX(-3px); }
          80% { transform: translateX(3px); }
        }

        .s5-actions {
          max-width: 1100px;
          width: 100%;
          margin: 24px auto 0;
          display: flex;
          gap: 12px;
          padding-top: 20px;
          border-top: 2px solid rgba(0,0,0,0.07);
        }
        .s5-btn {
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
        .s5-btn-primary {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: white;
          box-shadow: 0 4px 16px rgba(37,99,235,0.3);
        }
        .s5-btn-primary:hover { box-shadow: 0 6px 22px rgba(37,99,235,0.45); }
        .s5-btn-primary:active { transform: scale(0.97); }
        .s5-btn-ghost {
          background: white;
          color: #64748b;
          border: 1px solid #e0e7ef;
          flex: 0 0 auto;
          padding: 13px 28px;
        }
        .s5-btn-ghost:hover { background: #f8fafc; }

        @media (max-width: 768px) {
          .s5-breadcrumb { display: none; }
          .s5-header { margin-top: 72px; }
          .s5-page { padding: 24px 14px 40px; }
          .s5-actions { padding: 16px 0 0; }
        }

        @media (max-width: 480px) {
          .s5-page { padding: 16px 12px 32px; }
          .s5-header { margin-top: 68px; margin-bottom: 16px; }
          .s5-num { width: 40px; height: 40px; font-size: 16px; }
          .s5-title { font-size: 20px; gap: 8px; }
          .s5-btn-ghost { padding: 13px 20px; }
        }

        @media (min-width: 769px) {
          .s5-header { margin-top: 0; }
        }
      `}</style>
    </div>
  );
}