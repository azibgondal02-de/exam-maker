import React, { useEffect, useState, useRef } from 'react';
import { useTestMaker } from '../../hooks/useTestMaker';

const IMAGE_BASE = 'https://testmaker.pk';

function fixHtml(html) {
  if (!html) return '';
  return html.replace(/src="\/([^"]+)"/g, `src="${IMAGE_BASE}/$1"`);
}

function buildPayload(step5Config, chapters) {
  const { sections, sectionRows, longBlocks } = step5Config;
  const subjectId = parseInt(localStorage.getItem('subject_id') || '0');

  const getTopicNames = (chapterCodes) => {
    if (!chapterCodes || chapterCodes.length === 0) {
      return (localStorage.getItem('topics') || '').split(',').filter(Boolean);
    }
    const names = [];
    chapters.forEach(ch => {
      if (chapterCodes.includes(ch.chapter_code)) {
        (ch.topics || []).forEach(t => names.push(t));
      }
    });
    return [...new Set(names)];
  };

  const getChapterIds = (chapterCodes) => {
    if (!chapterCodes || chapterCodes.length === 0) return localStorage.getItem('chapter_ids') || '';
    return chapters.filter(ch => chapterCodes.includes(ch.chapter_code)).map(ch => String(ch.chapter_id)).join(',');
  };

  const payloadSections = [];

  sections.forEach(section => {
    const isLong = section.key === 'long_question_according_to_board_pattern';
    const isShortBoard = section.key === 'short_questions_according_to_board_pattern';
    const rows = sectionRows[section.key] || [];
    const blocks = longBlocks[section.key] || [];

    if (isLong) {
      const sectionQuestions = [];
      blocks.forEach((block, bi) => {
        const parts = section.config?.parts || ['A', 'B'];
        const choiceCount = parseInt(block.choice) || 0;
        const groupName = `Group ${String.fromCharCode(65 + bi)}`;
        parts.forEach(part => {
          const partData = block.parts?.[part] || {};
          const qt = section.question_types.find(q => q.type_id === Number(partData.type_id)) || section.question_types[0];
          if (!qt) return;
          const pickedIds = partData.picked_ids || [];
          const isRandom = pickedIds.length === 0;
          const count = pickedIds.length > 0 ? pickedIds.length : 1;
          const marks = parseInt(partData.marks) || 0;
          if (marks > 0 || pickedIds.length > 0) {
            sectionQuestions.push({
              type_id: qt.type_id, type_name: qt.name, is_random: isRandom,
              count: count || 1, marks_per_question: marks,
              selected_question_ids: isRandom ? [] : pickedIds,
              topics: getTopicNames(partData.chapter_ids || []),
              chapter_ids: getChapterIds(partData.chapter_ids || []),
              has_choice: choiceCount > 0, choice_count: choiceCount,
              part_id: part, group_name: groupName,
            });
          }
        });
      });
      if (sectionQuestions.length > 0) {
        payloadSections.push({ section_key: section.key, section_title: section.title, order: section.order, questions: sectionQuestions });
      }
      return;
    }

    if (isShortBoard) {
      const sectionQuestions = rows
        .filter(row => (row.count > 0) || (row.picked_ids?.length > 0))
        .map(row => {
          const qt = section.question_types[0];
          const pickedIds = row.picked_ids || [];
          const isRandom = pickedIds.length === 0;
          const count = pickedIds.length > 0 ? pickedIds.length : parseInt(row.count) || 0;
          const solve = parseInt(row.solve) || 0;
          return {
            type_id: qt.type_id, type_name: qt.name, is_random: isRandom, count,
            marks_per_question: parseInt(row.marks) || 0,
            selected_question_ids: isRandom ? [] : pickedIds,
            topics: getTopicNames(row.chapter_codes || []),
            chapter_ids: getChapterIds(row.chapter_codes || []),
            has_choice: solve > 0 && solve < count, choice_count: solve > 0 ? solve : 0,
            part_id: '', group_name: 'Board Pattern Short Questions',
          };
        }).filter(q => q.count > 0);
      if (sectionQuestions.length > 0) {
        payloadSections.push({ section_key: section.key, section_title: section.title, order: section.order, questions: sectionQuestions });
      }
      return;
    }

    const sectionQuestions = section.question_types.map((qt, i) => {
      const row = rows[i] || {};
      const pickedIds = row.picked_ids || [];
      const isRandom = pickedIds.length === 0;
      const count = pickedIds.length > 0 ? pickedIds.length : parseInt(row.count) || 0;
      const solve = parseInt(row.solve) || 0;
      if (count === 0) return null;
      return {
        type_id: qt.type_id, type_name: qt.name, is_random: isRandom, count,
        marks_per_question: parseInt(row.marks) || 0,
        selected_question_ids: isRandom ? [] : pickedIds,
        topics: getTopicNames(row.chapter_ids || []),
        chapter_ids: localStorage.getItem('chapter_ids') || '',
        has_choice: solve > 0 && solve < count, choice_count: solve > 0 ? solve : 0,
        part_id: '', group_name: section.order === 1 ? '' : qt.name,
      };
    }).filter(Boolean);

    if (sectionQuestions.length > 0) {
      payloadSections.push({ section_key: section.key, section_title: section.title, order: section.order, questions: sectionQuestions });
    }
  });

  const totalMarks = payloadSections.reduce((t, sec) => t + sec.questions.reduce((st, q) => st + (q.count * q.marks_per_question), 0), 0);
  return { subject_id: subjectId, sections: payloadSections, total_marks: totalMarks };
}

// ── Fix 1 & 2: MCQOption with ref to sustain edits ──
function MCQOption({ opt, medium, editMode, letter }) {
  const enRef = useRef(null);
  const urRef = useRef(null);

  useEffect(() => {
    if (enRef.current && !enRef.current.dataset.init) {
      enRef.current.innerHTML = fixHtml(opt.option_en || '');
      enRef.current.dataset.init = '1';
    }
    if (urRef.current && !urRef.current.dataset.init) {
      urRef.current.innerHTML = fixHtml(opt.option_ur || '');
      urRef.current.dataset.init = '1';
    }
  }, []);

  const eStyle = editMode ? { outline: '1px dashed #2563eb', padding: '1px 3px', borderRadius: '3px', background: '#f0f7ff' } : {};

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '4px', fontSize: '12px' }}>
      <span style={{ fontWeight: '600', flexShrink: 0 }}>{letter})</span>
      <span style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {(medium === 'en' || medium === 'both') && (
          <span ref={enRef} contentEditable={editMode} suppressContentEditableWarning style={eStyle} />
        )}
        {(medium === 'ur' || medium === 'both') && opt.option_ur && (
          <span ref={urRef} contentEditable={editMode} suppressContentEditableWarning style={{ ...eStyle, direction: 'rtl' }} />
        )}
      </span>
    </div>
  );
}

function MCQOptions({ options, medium, editMode }) {
  if (!options || options.length === 0) return null;
  const letters = ['a', 'b', 'c', 'd', 'e'];
  const cols = options.length <= 4 ? 4 : 2;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '4px 16px', marginTop: '6px' }}>
      {options.map((opt, i) => (
        <MCQOption key={opt.option_id} opt={opt} medium={medium} editMode={editMode} letter={letters[i]} />
      ))}
    </div>
  );
}

// ── Fix 2: QuestionItem uses refs to sustain edits across toggle ──
function QuestionItem({ q, index, showNumber = true, medium, editMode }) {
  const stEn = [q.statement_en, q.description_en].filter(Boolean).join(' ');
  const stUr = [q.statement_ur, q.description_ur].filter(Boolean).join(' ');
  const enRef = useRef(null);
  const urRef = useRef(null);

  useEffect(() => {
    if (enRef.current && !enRef.current.dataset.init) {
      enRef.current.innerHTML = fixHtml(stEn);
      enRef.current.dataset.init = '1';
    }
    if (urRef.current && !urRef.current.dataset.init) {
      urRef.current.innerHTML = fixHtml(stUr);
      urRef.current.dataset.init = '1';
    }
  }, []);

  const eStyle = (extra = {}) => editMode
    ? { outline: '1px dashed #2563eb', padding: '2px 4px', borderRadius: '3px', background: '#f0f7ff', minHeight: '18px', ...extra }
    : { ...extra };

  return (
    <div style={{ marginBottom: '10px', breakInside: 'avoid' }}>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
        {showNumber && index && <span style={{ fontWeight: '600', flexShrink: 0, minWidth: '24px' }}>{index}.</span>}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {(medium === 'en' || medium === 'both') && stEn && (
              <span ref={enRef} contentEditable={editMode} suppressContentEditableWarning style={eStyle({ flex: 1, minWidth: '200px' })} />
            )}
            {(medium === 'ur' || medium === 'both') && stUr && (
              <span ref={urRef} contentEditable={editMode} suppressContentEditableWarning style={eStyle({ flex: 1, minWidth: '200px', direction: 'rtl', textAlign: 'right' })} />
            )}
          </div>
          {q.options && q.options.length > 0 && <MCQOptions options={q.options} medium={medium} editMode={editMode} />}
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title, totalMarks, qNo }) {
  return (
    <div style={{ background: '#1a1a2e', color: 'white', padding: '8px 16px', marginTop: '20px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '4px' }}>
      <span style={{ fontWeight: '700', fontSize: '14px' }}>Q.NO. {qNo}. {title}</span>
      {totalMarks > 0 && <span style={{ fontSize: '13px', fontWeight: '600' }}>Total Marks: {totalMarks}</span>}
    </div>
  );
}

function PaperPreview({ paper, medium, schoolName, subject, className, editMode, fontSize }) {
  const totalMarks = paper.total_marks || 0;
  return (
    <div id="paper-preview" style={{ background: 'white', padding: '32px 40px', maxWidth: '900px', margin: '0 auto', fontSize: (fontSize || 13) + 'px', fontFamily: "'Times New Roman', Times, serif", lineHeight: '1.6' }}>
      <div style={{ textAlign: 'center', marginBottom: '16px', borderBottom: '3px solid #1a1a2e', paddingBottom: '12px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: '700', margin: '0 0 4px', color: '#1a1a2e' }}>{schoolName || 'School Name'}</h2>
        <div style={{ fontSize: '12px', color: '#555' }}>Pakistan's Best Assessment Program</div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px', border: '2px solid #1a1a2e' }}>
        <tbody>
          <tr style={{ background: '#1a1a2e', color: 'white' }}>
            <td style={{ padding: '6px 10px', fontWeight: '700', width: '15%' }}>Name:</td>
            <td style={{ padding: '6px 10px', borderRight: '1px solid #555', width: '35%' }}></td>
            <td style={{ padding: '6px 10px', fontWeight: '700', width: '15%' }}>Roll No.:</td>
            <td style={{ padding: '6px 10px', borderRight: '1px solid #555', width: '20%' }}></td>
            <td style={{ padding: '6px 10px', fontWeight: '700', width: '10%' }}>Class:</td>
            <td style={{ padding: '6px 10px' }}>{className || '___'}</td>
          </tr>
          <tr style={{ background: '#1a1a2e', color: 'white' }}>
            <td style={{ padding: '6px 10px', fontWeight: '700' }}>Subject:</td>
            <td style={{ padding: '6px 10px', borderRight: '1px solid #555' }}>{subject || '___'}</td>
            <td style={{ padding: '6px 10px', fontWeight: '700' }}>Date:</td>
            <td style={{ padding: '6px 10px', borderRight: '1px solid #555' }}></td>
            <td style={{ padding: '6px 10px', fontWeight: '700' }}>T.Marks:</td>
            <td style={{ padding: '6px 10px' }}>{totalMarks}</td>
          </tr>
        </tbody>
      </table>

      {paper.sections?.map((section, si) => {
        const isLong = section.section_key === 'long_question_according_to_board_pattern';
        return (
          <div key={section.section_key}>
            <SectionHeader title={section.section_title} totalMarks={section.total_marks || 0} qNo={si + 1} />

            {isLong ? (() => {
              const groupMap = {};
              section.question_groups?.forEach(g => {
                const k = g.group_name || 'default';
                if (!groupMap[k]) groupMap[k] = [];
                groupMap[k].push(g);
              });
              return Object.entries(groupMap).map(([, groups], qi) => (
                <div key={qi} style={{ marginBottom: '16px' }}>
                  <div style={{ fontWeight: '700', fontSize: '13px', marginBottom: '6px' }}>
                    Question {qi + 1}:
                    {groups[0]?.has_choice && (
                      <span style={{ fontWeight: '400', fontStyle: 'italic', marginLeft: '8px', color: '#555' }}>
                        (Attempt any {groups[0].choice_count})
                      </span>
                    )}
                  </div>
                  {/* Fix 3: part label inline with question, no space */}
                  {groups.map((group, pi) => (
                    <div key={pi} style={{ marginLeft: '16px', marginBottom: '6px' }}>
                      {group.questions?.map(q => (
                        <div key={q.question_id} style={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                          {group.part_id && (
                            <span style={{ fontWeight: '600', flexShrink: 0 }}>
                              {String.fromCharCode(96 + pi + 1)})
                            </span>
                          )}
                          <div style={{ flex: 1 }}>
                            <QuestionItem q={q} showNumber={false} medium={medium} editMode={editMode} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ));
            })() : (
              section.question_groups?.map((group, gi) => {
                const hasChoice = group.has_choice && group.choice_count > 0;
                return (
                  <div key={gi} style={{ marginBottom: '20px' }}>
                    <div style={{ fontWeight: '700', fontSize: '13px', padding: '6px 12px', background: '#f0f4f8', border: '1px solid #e2e8f0', borderLeft: '4px solid #1a1a2e', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{group.type_name}</span>
                      <span style={{ fontWeight: '400', fontSize: '12px', color: '#555' }}>
                        {group.marks_per_question > 0 && `(${group.marks_per_question} marks each)`}
                        {hasChoice && ` — Attempt any ${group.choice_count}`}
                      </span>
                    </div>
                    {group.questions?.map((q, qi) => (
                      <QuestionItem key={q.question_id} q={q} index={qi + 1} medium={medium} editMode={editMode} />
                    ))}
                  </div>
                );
              })
            )}
          </div>
        );
      })}

      <div style={{ marginTop: '32px', borderTop: '1px solid #ccc', paddingTop: '8px', textAlign: 'center', fontSize: '11px', color: '#888' }}>
        Generated by TestMaker — Pakistan's Best Assessment Program
      </div>
    </div>
  );
}

export default function Step6QuestionSelect() {
  const { selectedSubject, selectedClass, generatePaper } = useTestMaker();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paper, setPaper] = useState(null);
  const [medium, setMedium] = useState('both');
  const [schoolName, setSchoolName] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [fontSize, setFontSize] = useState(13);
  const printRef = useRef(null);

  const subjectName = selectedSubject?.subject_name || localStorage.getItem('subject_name') || 'Subject';
  const className = selectedClass?.class_name || localStorage.getItem('class_name') || '';

  useEffect(() => { generatePaperFromConfig(); }, []);

  const generatePaperFromConfig = async () => {
    try {
      setLoading(true); setError('');
      const step5Raw = localStorage.getItem('step5_config');
      const chaptersRaw = localStorage.getItem('step5_chapters');
      if (!step5Raw) { setError('No paper configuration found. Please go back to Step 5.'); setLoading(false); return; }
      const step5Config = JSON.parse(step5Raw);
      const chapters = chaptersRaw ? JSON.parse(chaptersRaw) : [];
      const payload = buildPayload(step5Config, chapters);
      if (payload.sections.length === 0) { setError('No questions configured. Please go back and add question counts.'); setLoading(false); return; }
      const result = await generatePaper(payload);
      setPaper(result);
    } catch (err) {
      setError(err.message || 'Failed to generate paper. Please try again.');
    } finally { setLoading(false); }
  };

  const handleSavePDF = () => {
    const el = document.getElementById('paper-preview');
    if (!el) return;
    const w = window.open('', '_blank');
    w.document.write(`<html><head><title>Paper</title><style>body{margin:0;padding:20px;font-family:'Times New Roman',serif;font-size:${fontSize}px}img{max-width:200px;height:auto}[contenteditable]{outline:none!important;background:transparent!important;padding:0!important}</style></head><body>${el.innerHTML}</body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); w.close(); }, 500);
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
      <div style={{ fontSize: '18px', fontWeight: '600', color: '#1a1a2e' }}>Generating Your Paper...</div>
      <div style={{ fontSize: '14px', color: '#666' }}>Please wait while we fetch questions</div>
      <div style={{ width: '48px', height: '48px', border: '4px solid #e2e8f0', borderTop: '4px solid #2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8' }}>
      <div style={{ background: '#1a1a2e', color: 'white', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
        <span style={{ fontWeight: '700', fontSize: '16px', marginRight: '8px' }}>TestMaker</span>
        <button onClick={() => window.print()} style={tbBtn('#2563eb')}>🖨️ Print</button>
        <button onClick={generatePaperFromConfig} style={tbBtn('#7c3aed')}>🔄 Regenerate</button>
        <button onClick={() => window.location.href = '/test-maker/step-5'} style={tbBtn('#374151')}>← Back</button>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <input value={schoolName} onChange={e => setSchoolName(e.target.value)} placeholder="School Name"
            style={{ padding: '6px 12px', borderRadius: '5px', border: '1px solid #4b5563', background: '#374151', color: 'white', fontSize: '13px', width: '160px' }} />
          <select value={medium} onChange={e => setMedium(e.target.value)} style={selStyle}>
            <option value="both">Both</option>
            <option value="en">English</option>
            <option value="ur">Urdu</option>
          </select>
          <select value={fontSize} onChange={e => setFontSize(Number(e.target.value))} style={selStyle}>
            {[10,11,12,13,14,16,18,20].map(s => <option key={s} value={s}>{s}px</option>)}
          </select>
          <button onClick={() => setEditMode(v => !v)} style={tbBtn(editMode ? '#16a34a' : '#6b7280')}>
            ✏️ Edit {editMode ? 'ON' : 'OFF'}
          </button>
          <button onClick={handleSavePDF} style={tbBtn('#dc2626')}>📄 Save PDF</button>
        </div>
      </div>

      {error && (
        <div style={{ maxWidth: '700px', margin: '40px auto', padding: '20px', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px', color: '#991b1b', textAlign: 'center' }}>
          <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>⚠️ {error}</div>
          <button onClick={() => window.location.href = '/test-maker/step-5'} style={{ padding: '8px 20px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>← Go Back to Step 5</button>
        </div>
      )}

      {paper && (
        <div style={{ padding: '24px', maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ background: 'white', borderRadius: '8px', padding: '12px 20px', marginBottom: '20px', display: 'flex', gap: '24px', flexWrap: 'wrap', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', alignItems: 'center' }}>
            {[['Total Questions', paper.total_questions, '#1a1a2e'], ['Total Marks', paper.total_marks, '#2563eb'], ['Sections', paper.sections?.length, '#7c3aed']].map(([label, val, color]) => (
              <div key={label} style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', fontWeight: '600' }}>{label}</span>
                <span style={{ fontSize: '22px', fontWeight: '700', color }}>{val}</span>
              </div>
            ))}
            <div style={{ marginLeft: 'auto', fontSize: '13px', color: '#6b7280', fontStyle: 'italic' }}>✅ Paper generated successfully</div>
          </div>
          <div ref={printRef} style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.12)', borderRadius: '8px', overflow: 'hidden' }}>
            <PaperPreview paper={paper} medium={medium} schoolName={schoolName} subject={subjectName} className={className} editMode={editMode} fontSize={fontSize} />
          </div>
        </div>
      )}

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #paper-preview, #paper-preview * { visibility: visible; }
          #paper-preview { position: absolute; left: 0; top: 0; width: 100%; padding: 20px; }
          [contenteditable] { outline: none !important; background: transparent !important; }
        }
      `}</style>
    </div>
  );
}

const tbBtn = (bg) => ({ padding: '7px 14px', background: bg, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap' });
const selStyle = { padding: '6px 8px', borderRadius: '5px', border: '1px solid #4b5563', background: '#374151', color: 'white', fontSize: '13px', cursor: 'pointer' };