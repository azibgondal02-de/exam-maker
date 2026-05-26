import React, { useEffect, useState, useRef } from 'react';
import { useTestMaker } from '../../hooks/useTestMaker';
import ProfileMenu from '../../components/ProfileMenu';
import logo from '../../assets/logo.png';

const IMAGE_BASE = 'https://testmaker.pk';

function fixHtml(html) {
  if (!html) return '';
  return html.replace(/src="\/([^"]+)"/g, `src="${IMAGE_BASE}/$1"`);
}

// ── Name cleaning (display only, never touches data) ──
function cleanName(name) {
  if (!name) return '';
  const map = {
    'short question same statement': 'Short Questions',
    'same statement short questions': 'Short Questions',
    'same statement long questions': 'Long Questions',
    'long question': 'Long Questions', 'short question': 'Short Questions',
    'mcqs': 'MCQs', 'mcqs (kpk)': 'MCQs (KPK)',
    'numerical (secondary)': 'Numerical Problems', 'theorem': 'Theorems',
    'fill in the blanks': 'Fill in the Blanks', 'true / false': 'True / False',
    'form of verb': 'Form of Verb', 'present correct form of verb': 'Present Form of Verb',
    'past correct form of verb': 'Past Form of Verb', 'future correct form of verb': 'Future Form of Verb',
    'choose the word with correct spelling': 'Correct Spelling', 'underline word': 'Underline the Word',
    'correct option according to the grammar': 'Grammar (Correct Option)',
    'voice of the following': 'Active / Passive Voice', 'make the sentences': 'Sentence Making',
    'make sentences (primary)': 'Sentence Making',
    'translate the sentence into english': 'Translation (Urdu → English)',
    'translate into urdu': 'Translation (English → Urdu)',
    'comprehension passage': 'Comprehension', 'reference to the context': 'Reference to Context',
    'summaries': 'Summary Writing', 'dialogue': 'Dialogue Writing',
    'letter': 'Letter Writing', 'stories': 'Story Writing',
    'write words meaning': 'Word Meanings',
    'write words / phrases / idioms (9th ptb)': 'Words / Phrases / Idioms',
    'meaning 9th ptb': 'Word Meanings',
  };
  const lower = name.trim().toLowerCase();
  if (map[lower]) return map[lower];
  let s = name.trim().replace(/[۔.]{2,}$/, '').replace(/\s*\(\s*(9th|10th|11th|12th)?\s*PTB\s*\)/gi, '').replace(/same statement\s*/gi, '').trim();
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : name;
}

function cleanSectionTitle(title) {
  if (!title) return '';
  const map = {
    'subjective without board pattern': 'Subjective',
    'subjective with board pattern': 'Subjective',
    'short questions according to board pattern': 'Short Questions',
    'long question according to board pattern': 'Long Questions',
    'long questions according to board pattern': 'Long Questions',
    'translation of ahadees according to board pattern': 'Translation of Ahadees',
    'translation of qurani ayat according to board pattern': 'Translation of Quranic Verses',
    'arabic grammer questions according to board pattern': 'Arabic Grammar',
    'word meanings according to board pattern': 'Word Meanings',
    'detail note on topics according to board pattern': 'Notes on Topics',
    'notes on personalities according to board pattern': 'Notes on Personalities',
    'idiomatic urdu translation of parts': 'Idiomatic Urdu Translation',
    'objective': 'Objective',
  };
  const lower = title.trim().toLowerCase();
  if (map[lower]) return map[lower];
  let s = title.replace(/\s*according to( the)? board pattern\s*/gi, '').replace(/\s*(with|without) board pattern\s*/gi, '').replace(/\s{2,}/g, ' ').trim();
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : title;
}

function buildPayload(step5Config, chaptersFromState) {
  const { sections, sectionRows, longBlocks } = step5Config;
  const subjectId = parseInt(localStorage.getItem('subject_id') || '0');
  let chapters = chaptersFromState;
  if (!chapters || chapters.length === 0) {
    try { const s = localStorage.getItem('step5_chapters'); if (s) chapters = JSON.parse(s); } catch(e) {}
  }
  chapters = chapters || [];

  const getTopicNames = (chapterCodes) => {
    if (!chapterCodes || chapterCodes.length === 0) {
      const saved = (localStorage.getItem('topics') || '').split(',').filter(Boolean);
      if (saved.length > 0) return saved;
      const all = []; chapters.forEach(ch => (ch.topics || []).forEach(t => all.push(t))); return [...new Set(all)];
    }
    const names = [];
    chapters.forEach(ch => { if (chapterCodes.includes(ch.chapter_code)) (ch.topics || []).forEach(t => names.push(t)); });
    return [...new Set(names)];
  };

  const getChapterIds = (chapterCodes) => {
    if (!chapterCodes || chapterCodes.length === 0) return localStorage.getItem('chapter_ids') || '';
    return chapters.filter(ch => chapterCodes.includes(ch.chapter_code) && ch.chapter_id).map(ch => String(ch.chapter_id)).join(',');
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
          const partChapterCodes = partData.chapter_ids || [];
          let topics = getTopicNames(partChapterCodes);
          let chapterIds = getChapterIds(partChapterCodes);
          if (topics.length === 0 && chapters.length > 0) {
            const all = []; chapters.forEach(ch => (ch.topics || []).forEach(t => all.push(t))); topics = [...new Set(all)];
          }
          if (marks > 0 || pickedIds.length > 0) {
            sectionQuestions.push({
              type_id: qt.type_id, type_name: qt.name, is_random: isRandom,
              count: count || 1, marks_per_question: marks,
              selected_question_ids: isRandom ? [] : pickedIds,
              topics, chapter_ids: chapterIds,
              has_choice: choiceCount > 0, choice_count: choiceCount,
              part_id: part, group_name: groupName,
            });
          }
        });
      });
      if (sectionQuestions.length > 0) payloadSections.push({ section_key: section.key, section_title: section.title, order: section.order, questions: sectionQuestions });
      return;
    }

    if (isShortBoard) {
      const sectionQuestions = rows.filter(row => (row.count > 0) || (row.picked_ids?.length > 0)).map(row => {
        const qt = section.question_types[0];
        const pickedIds = row.picked_ids || [];
        const isRandom = pickedIds.length === 0;
        const count = pickedIds.length > 0 ? pickedIds.length : parseInt(row.count) || 0;
        const solve = parseInt(row.solve) || 0;
        const chapterCodes = row.chapter_codes || [];
        return {
          type_id: qt.type_id, type_name: qt.name, is_random: isRandom, count,
          marks_per_question: parseInt(row.marks) || 0,
          selected_question_ids: isRandom ? [] : pickedIds,
          topics: getTopicNames(chapterCodes), chapter_ids: getChapterIds(chapterCodes),
          has_choice: solve > 0 && solve < count, choice_count: solve > 0 ? solve : 0,
          part_id: '', group_name: 'Board Pattern Short Questions',
        };
      }).filter(q => q.count > 0);
      if (sectionQuestions.length > 0) payloadSections.push({ section_key: section.key, section_title: section.title, order: section.order, questions: sectionQuestions });
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
    if (sectionQuestions.length > 0) payloadSections.push({ section_key: section.key, section_title: section.title, order: section.order, questions: sectionQuestions });
  });

  const totalMarks = payloadSections.reduce((t, sec) => t + sec.questions.reduce((st, q) => st + (q.count * q.marks_per_question), 0), 0);
  return { subject_id: subjectId, sections: payloadSections, total_marks: totalMarks };
}

// ── MCQOption: re-renders when medium changes (fix language bug) ──
function MCQOption({ opt, medium, editMode, letter, showAnswers, enFont, urFont, fontSize }) {
  const enRef = useRef(null);
  const urRef = useRef(null);

  useEffect(() => {
    if (enRef.current) enRef.current.innerHTML = fixHtml(opt.option_en || '');
    if (urRef.current) urRef.current.innerHTML = fixHtml(opt.option_ur || '');
  }, [medium, opt.option_en, opt.option_ur]);

  const isCorrect = showAnswers && opt.is_correct;
  const eStyle = editMode ? { outline: '1px dashed #2563eb', padding: '1px 3px', borderRadius: '3px', background: '#f0f7ff' } : {};
  const answerStyle = isCorrect ? { background: '#dcfce7', borderRadius: '4px', padding: '1px 6px', fontWeight: '700', color: '#15803d' } : {};
  // MCQ options scale slightly smaller than main question font (1px less, min 10px)
  const optFontSize = Math.max((fontSize || 13) - 1, 10);

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '4px', fontSize: optFontSize + 'px', ...answerStyle }}>
      <span style={{ fontWeight: '600', flexShrink: 0 }}>{letter})</span>
      <span style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {(medium === 'en' || medium === 'both') && (
          <span ref={enRef} contentEditable={editMode} suppressContentEditableWarning style={{ ...eStyle, fontFamily: enFont, fontSize: optFontSize + 'px' }} />
        )}
        {(medium === 'ur' || medium === 'both') && opt.option_ur && (
          <span ref={urRef} contentEditable={editMode} suppressContentEditableWarning style={{ ...eStyle, direction: 'rtl', fontFamily: urFont, fontSize: optFontSize + 'px' }} />
        )}
      </span>
    </div>
  );
}

function MCQOptions({ options, medium, editMode, showAnswers, enFont, urFont, fontSize }) {
  if (!options || options.length === 0) return null;
  const letters = ['a', 'b', 'c', 'd', 'e'];
  const cols = options.length <= 4 ? 4 : 2;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '4px 16px', marginTop: '6px' }}>
      {options.map((opt, i) => (
        <MCQOption key={opt.option_id} opt={opt} medium={medium} editMode={editMode} letter={letters[i]} showAnswers={showAnswers} enFont={enFont} urFont={urFont} fontSize={fontSize} />
      ))}
    </div>
  );
}

// ── QuestionItem: re-renders when medium changes (fix language bug) ──
function QuestionItem({ q, index, showNumber = true, medium, editMode, showAnswers, enFont, urFont, fontSize }) {
  const stEn = [q.statement_en, q.description_en].filter(Boolean).join(' ');
  const stUr = [q.statement_ur, q.description_ur].filter(Boolean).join(' ');
  const enRef = useRef(null);
  const urRef = useRef(null);

  // Re-init on medium change to fix language switch bug
  useEffect(() => {
    if (enRef.current) enRef.current.innerHTML = fixHtml(stEn);
    if (urRef.current) urRef.current.innerHTML = fixHtml(stUr);
  }, [medium, stEn, stUr]);

  const eStyle = (extra = {}) => editMode
    ? { outline: '1px dashed #2563eb', padding: '2px 4px', borderRadius: '3px', background: '#f0f7ff', minHeight: '18px', ...extra }
    : { ...extra };

  const isUrOnly = medium === 'ur';
  return (
    <div style={{ marginBottom: '10px', breakInside: 'avoid' }}>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', flexDirection: isUrOnly ? 'row-reverse' : 'row' }}>
        {showNumber && index && <span style={{ fontWeight: '700', flexShrink: 0, minWidth: '24px', color: '#000' }}>{index}.</span>}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', flexDirection: isUrOnly ? 'row-reverse' : 'row' }}>
            {(medium === 'en' || medium === 'both') && stEn && (
              <span ref={enRef} className="q-content" contentEditable={editMode} suppressContentEditableWarning style={eStyle({ flex: 1, minWidth: '200px', fontFamily: enFont, color: '#000' })} />
            )}
            {(medium === 'ur' || medium === 'both') && stUr && (
              <span ref={urRef} className="q-content" contentEditable={editMode} suppressContentEditableWarning style={eStyle({ flex: 1, minWidth: '200px', direction: 'rtl', textAlign: 'right', fontFamily: urFont, color: '#000' })} />
            )}
          </div>
          {q.options && q.options.length > 0 && <MCQOptions options={q.options} medium={medium} editMode={editMode} showAnswers={showAnswers} enFont={enFont} urFont={urFont} fontSize={fontSize} />}
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title, totalMarks, qNo, editMode, medium }) {
  const isUr = medium === 'ur';
  return (
    <div style={{ margin: '24px 0 10px', pageBreakInside: 'avoid' }}>
      <div style={{ background: '#000000', color: 'white', padding: '10px 18px', display: 'flex', justifyContent: isUr ? 'flex-end' : 'space-between', alignItems: 'center', borderRadius: '4px', direction: isUr ? 'rtl' : 'ltr', flexDirection: isUr ? 'row-reverse' : 'row' }}>
        <span contentEditable={editMode} suppressContentEditableWarning
          style={{ fontWeight: '800', fontSize: '14px', letterSpacing: '0.5px', outline: editMode ? '1px dashed #60a5fa' : 'none', borderRadius: '3px', color: 'white' }}>
          Q.{qNo}. {title.toUpperCase()}
        </span>
        {totalMarks > 0 && (
          <span contentEditable={editMode} suppressContentEditableWarning
            style={{ fontSize: '13px', fontWeight: '700', background: 'rgba(255,255,255,0.2)', padding: '2px 12px', borderRadius: '12px', outline: editMode ? '1px dashed #60a5fa' : 'none', color: 'white' }}>
            Total Marks: {totalMarks}
          </span>
        )}
      </div>
    </div>
  );
}

function PaperPreview({ paper, medium, schoolName, subject, className, editMode, fontSize, showAnswers, examTime, examType, fontFamily, urduFont }) {
  const totalMarks = paper.total_marks || 0;
  const enFont = fontFamily || "'Times New Roman', Times, serif";
  const urFont = urduFont || "'Noto Nastaliq Urdu', serif";
  const fs = fontSize || 13;
  const td = (extra={}) => ({ padding: '6px 10px', border: '1px solid #1a1a2e', background: '#ffffff', color: '#000000', ...extra });
  const th = (extra={}) => ({ padding: '6px 10px', border: '1px solid #1a1a2e', fontWeight: '700', background: '#1a1a2e', color: '#ffffff', whiteSpace: 'nowrap', ...extra });
  const eStyle = editMode ? { outline: '1px dashed #60a5fa', borderRadius: '2px' } : {};
  return (
    <div id="paper-preview" style={{ background: 'white', padding: '32px 36px', maxWidth: '900px', margin: '0 auto', fontSize: fs + 'px', lineHeight: '1.7', color: '#000000' }}>

      {/* ── Scoped CSS for tables embedded inside question statements ── */}
      <style>{`
        .q-content {
          display: block;
        }
        .q-content table {
          border-collapse: collapse !important;
          width: auto !important;
          max-width: 100% !important;
          margin: 8px 0 !important;
          font-size: ${fs}px;
          background: #ffffff !important;
        }
        .q-content table td, .q-content table th {
          border: 1px solid #1a1a2e !important;
          padding: 6px 10px !important;
          min-width: 60px;
          min-height: 24px;
          height: 28px;
          vertical-align: middle !important;
          background: #ffffff !important;
          color: #000000 !important;
        }
        .q-content table th {
          background: #f3f4f6 !important;
          font-weight: 700 !important;
        }
        .q-content img {
          max-width: 100%;
          height: auto;
        }
        /* When question contains a table, let it take full row width */
        .q-content:has(table) {
          flex-basis: 100% !important;
          min-width: 100% !important;
        }
      `}</style>

      {/* ── Header ── */}
      <div style={{ textAlign: 'center', marginBottom: '14px', paddingBottom: '12px', borderBottom: '3px double #1a1a2e' }}>
        <div contentEditable={editMode} suppressContentEditableWarning
          style={{ fontSize: fs + 8 + 'px', fontWeight: '800', color: '#1a1a2e', fontFamily: enFont, letterSpacing: '0.5px', ...eStyle }}>
          {schoolName || 'School Name'}
        </div>
        <div contentEditable={editMode} suppressContentEditableWarning
          style={{ fontSize: fs - 1 + 'px', color: '#444', marginTop: '3px', fontFamily: enFont, ...eStyle }}>
          Smart Board Paper Generation — PaperCraft
        </div>
      </div>

      {/* ── Info Table ── */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px', fontSize: fs - 1 + 'px', fontFamily: enFont }}>
        <tbody>
          <tr>
            <td style={th({ width: '13%' })}>Name:</td>
            <td contentEditable={editMode} suppressContentEditableWarning style={{ ...td({ width: '30%' }), ...eStyle }}></td>
            <td style={th({ width: '12%' })}>Roll No:</td>
            <td contentEditable={editMode} suppressContentEditableWarning style={{ ...td({ width: '15%' }), ...eStyle }}></td>
            <td style={th({ width: '10%' })}>Class:</td>
            <td contentEditable={editMode} suppressContentEditableWarning style={{ ...td(), ...eStyle }}>{className || ''}</td>
          </tr>
          <tr>
            <td style={th()}>Subject:</td>
            <td contentEditable={editMode} suppressContentEditableWarning style={{ ...td(), ...eStyle }}>{subject || ''}</td>
            <td style={th()}>Date:</td>
            <td contentEditable={editMode} suppressContentEditableWarning style={{ ...td(), ...eStyle }}></td>
            <td style={th()}>Total Marks:</td>
            <td contentEditable={editMode} suppressContentEditableWarning style={{ ...td(), ...eStyle }}>{totalMarks}</td>
          </tr>
          <tr>
            <td style={th()}>Time:</td>
            <td contentEditable={editMode} suppressContentEditableWarning style={{ ...td(), ...eStyle }}>{examTime || ''}</td>
            <td style={th()}>Exam Type:</td>
            <td contentEditable={editMode} suppressContentEditableWarning style={{ ...td(), ...eStyle }}>{examType || ''}</td>
            <td style={th()}>Teacher Name:</td>
            <td contentEditable={editMode} suppressContentEditableWarning style={{ ...td(), ...eStyle }}></td>
          </tr>
        </tbody>
      </table>

      {paper.sections?.map((section, si) => {
        const isLong = section.section_key === 'long_question_according_to_board_pattern';
        return (
          <div key={section.section_key}>
            <SectionHeader title={cleanSectionTitle(section.section_title)} totalMarks={section.total_marks || 0} qNo={si + 1} editMode={editMode} medium={medium} />

            {isLong ? (() => {
              const groupMap = {};
              section.question_groups?.forEach(g => {
                const k = g.group_name || 'default';
                if (!groupMap[k]) groupMap[k] = [];
                groupMap[k].push(g);
              });
              return Object.entries(groupMap).map(([, groups], qi) => (
                <div key={qi} style={{ marginBottom: '16px' }}>
                  <div contentEditable={editMode} suppressContentEditableWarning
                    style={{ fontWeight: '700', fontSize: '13px', marginBottom: '6px', outline: editMode ? '1px dashed #2563eb' : 'none', padding: editMode ? '1px 4px' : '0', borderRadius: '3px' }}>
                    Question {qi + 1}:{groups[0]?.has_choice ? ` (Attempt any ${groups[0].choice_count})` : ''}
                  </div>
                  {groups.map((group, pi) => (
                    <div key={pi} style={{ marginLeft: '16px', marginBottom: '6px' }}>
                      {group.questions?.map(q => (
                        <div key={q.question_id} style={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                          {group.part_id && <span style={{ fontWeight: '600', flexShrink: 0 }}>{String.fromCharCode(96 + pi + 1)})</span>}
                          <div style={{ flex: 1 }}>
                            <QuestionItem q={q} showNumber={false} medium={medium} editMode={editMode} showAnswers={showAnswers} enFont={enFont} urFont={urFont} fontSize={fs} />
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
                    <div style={{ fontWeight: '700', fontSize: '13px', padding: '7px 14px', background: '#f5f5f5', border: '1px solid #ccc', borderLeft: medium === 'ur' ? 'none' : '5px solid #000', borderRight: medium === 'ur' ? '5px solid #000' : 'none', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: medium === 'ur' ? '4px 0 0 4px' : '0 4px 4px 0', direction: medium === 'ur' ? 'rtl' : 'ltr', flexDirection: medium === 'ur' ? 'row-reverse' : 'row' }}>
                      <span contentEditable={editMode} suppressContentEditableWarning
                        style={{ outline: editMode ? '1px dashed #2563eb' : 'none', padding: editMode ? '1px 4px' : '0', borderRadius: '3px', color: '#000' }}>
                        {cleanName(group.type_name)}
                      </span>
                      <span contentEditable={editMode} suppressContentEditableWarning
                        style={{ fontWeight: '400', fontSize: '12px', color: '#000', outline: editMode ? '1px dashed #2563eb' : 'none', padding: editMode ? '1px 4px' : '0', borderRadius: '3px' }}>
                        {group.marks_per_question > 0 && `(${group.marks_per_question} marks each)`}
                        {hasChoice && ` — Attempt any ${group.choice_count}`}
                      </span>
                    </div>
                    {group.questions?.map((q, qi) => (
                      <QuestionItem key={q.question_id} q={q} index={qi + 1} medium={medium} editMode={editMode} showAnswers={showAnswers} enFont={enFont} urFont={urFont} fontSize={fs} />
                    ))}
                  </div>
                );
              })
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function Step6QuestionSelect() {
  const { selectedSubject, selectedClass, generatePaper } = useTestMaker();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paper, setPaper] = useState(null);
  const [medium, setMedium] = useState('both');
  const [schoolName, setSchoolName] = useState(() => localStorage.getItem('school_name') || '');
  const [editMode, setEditMode] = useState(false);
  const [fontSize, setFontSize] = useState(13);
  const [showAnswers, setShowAnswers] = useState(false);
  const [examTime, setExamTime] = useState('');
  const [examType, setExamType] = useState('');
  const [fontFamily, setFontFamily] = useState("'Times New Roman', Times, serif");
  const [urduFont, setUrduFont] = useState("'Noto Nastaliq Urdu', serif");
  const printRef = useRef(null);

  const subjectName = selectedSubject?.subject_name || localStorage.getItem('subject_name') || 'Subject';
  const className = selectedClass?.class_name || localStorage.getItem('class_name') || '';

  useEffect(() => {
    generatePaperFromConfig();
    // Load Urdu fonts (famous ones from Google Fonts)
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;500;600;700&family=Gulzar&family=Amiri:wght@400;700&family=Scheherazade+New:wght@400;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

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
    
    // Clone the element to avoid affecting the original
    const clone = el.cloneNode(true);
    
    // Force all text to black in the cloned version
    clone.style.color = '#000000';
    clone.style.backgroundColor = '#ffffff';
    
    // Remove any grey backgrounds from section headers in the clone
    const sectionHeaders = clone.querySelectorAll('[style*="background: #000000"], [style*="background:#000000"]');
    sectionHeaders.forEach(header => {
      header.style.background = '#000000'; // Keep black background but ensure white text
      const spans = header.querySelectorAll('span');
      spans.forEach(span => span.style.color = '#ffffff');
    });
    
    // Ensure all text elements are black
    const allTextElements = clone.querySelectorAll('div, span, p, td, th, li');
    allTextElements.forEach(el => {
      const computedColor = window.getComputedStyle(el).color;
      // If the color is grey (contains rgb values around 100-150), force to black
      if (computedColor.includes('rgb') && !computedColor.includes('255,255,255')) {
        const rgbMatch = computedColor.match(/\d+/g);
        if (rgbMatch && rgbMatch.length >= 3) {
          const r = parseInt(rgbMatch[0]);
          const g = parseInt(rgbMatch[1]);
          const b = parseInt(rgbMatch[2]);
          // If it's greyish (all values similar and not pure black/white)
          if (Math.abs(r - g) < 30 && Math.abs(g - b) < 30 && r > 30 && r < 200) {
            el.style.color = '#000000';
          }
        }
      }
    });
    
    // Also fix table header backgrounds to ensure text is white
    const tableHeaders = clone.querySelectorAll('th');
    tableHeaders.forEach(th => {
      th.style.color = '#ffffff';
      th.style.backgroundColor = '#1a1a2e';
    });
    
    // Extract clean font-family names for Google Fonts URL
    const extractFontName = (fontStr) => {
      const match = fontStr.match(/'([^']+)'/);
      return match ? match[1] : fontStr.split(',')[0].trim().replace(/['"]/g, '');
    };
    const enFontName = extractFontName(fontFamily);
    const urFontName = extractFontName(urduFont);
    const googleFontsUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(enFontName).replace(/%20/g, '+')}:wght@400;700&family=${encodeURIComponent(urFontName).replace(/%20/g, '+')}:wght@400;700&display=swap`;
    
    const w = window.open('', '_blank');
    w.document.write(`<html><head><title>Paper</title>
      <link href="${googleFontsUrl}" rel="stylesheet">
      <style>
        /* Force browsers to print backgrounds and colors (fixes grey Q.1 heading issue) */
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
        @page {
          size: A4;
          margin: 15mm 18mm;
        }
        html, body {
          margin: 0;
          padding: 0;
          background: #ffffff;
          color: #000000;
          font-family: ${fontFamily};
          font-size: ${fontSize}px;
          line-height: 1.7;
        }
        /* Wrapper mirrors the on-screen preview so layout/spacing matches */
        .paper-wrap {
          max-width: 900px;
          margin: 0 auto;
          padding: 0;
        }
        /* Default: black text on white */
        body div, body span, body p, body li {
          color: #000000;
        }
        /* Table value cells: always white background, black text */
        td {
          background-color: #ffffff !important;
          color: #000000 !important;
        }
        /* Table label cells: dark background, white text */
        th {
          color: #ffffff !important;
          background-color: #1a1a2e !important;
        }
        /* Section headers (black Q.1, Q.2 bars) — keep black background + white text in print */
        [style*="background: #000000"],
        [style*="background:#000000"],
        [style*="background: rgb(0, 0, 0)"] {
          background: #000000 !important;
        }
        [style*="background: #000000"] *,
        [style*="background:#000000"] *,
        [style*="background: rgb(0, 0, 0)"] * {
          color: #ffffff !important;
        }
        [contenteditable] {
          outline: none !important;
        }
        img {
          max-width: 200px;
          height: auto;
        }
        /* Page break rules — don't split questions or section headers awkwardly */
        table, tr, td, th {
          page-break-inside: avoid;
        }
        [style*="pageBreakInside"], [style*="break-inside"] {
          page-break-inside: avoid;
          break-inside: avoid;
        }
      </style>
    </head><body><div class="paper-wrap">${clone.innerHTML}</div></body></html>`);
    w.document.close();
    w.focus();
    // Wait longer for fonts to load before printing
    setTimeout(() => { w.print(); w.close(); }, 1000);
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

      {/* ── Toolbar ── */}
      <div style={{ background: '#1a1a2e', color: 'white', padding: '10px 16px', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>

        {/* Row 1: Logo + action buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
          <div onClick={() => window.location.href = '/test-maker/step-1'}
            style={{ background: 'white', borderRadius: '8px', padding: '4px 10px', cursor: 'pointer', marginRight: '6px', display: 'flex', alignItems: 'center' }}>
            <img src={logo} alt="PaperCraft" style={{ height: '32px', width: 'auto', objectFit: 'contain', display: 'block' }} />
          </div>
          <button onClick={() => window.location.href = '/test-maker/step-5'} style={tbBtn('#374151')}>← Back</button>
          <button onClick={generatePaperFromConfig} style={tbBtn('#7c3aed')}>🔄 New Paper</button>
          <button onClick={() => window.print()} style={tbBtn('#2563eb')}>🖨️ Print</button>
          <button onClick={handleSavePDF} style={tbBtn('#dc2626')}>📄 PDF</button>
          <button onClick={() => setEditMode(v => !v)} style={tbBtn(editMode ? '#16a34a' : '#4b5563')}>
            ✏️ Edit {editMode ? 'ON' : 'OFF'}
          </button>
          <button onClick={() => setShowAnswers(v => !v)} style={tbBtn(showAnswers ? '#d97706' : '#4b5563')}>
            💡 Answers {showAnswers ? 'ON' : 'OFF'}
          </button>
        </div>

        <ProfileMenu/>

        {/* Row 2: Settings with labels */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', flexWrap: 'wrap' }}>
          {[
            { label: 'School Name', el: <input value={schoolName} onChange={e => setSchoolName(e.target.value)} placeholder="School name" style={{ ...inputStyle, width: '150px' }} /> },
            { label: 'Total Time', el: <input value={examTime} onChange={e => setExamTime(e.target.value)} placeholder="e.g. 3 Hours" style={{ ...inputStyle, width: '110px' }} /> },
            { label: 'Exam Type', el: (
              <select value={examType} onChange={e => setExamType(e.target.value)} style={selStyle}>
                <option value="">-- Select --</option>
                <option value="Annual">Annual Exam</option>
                <option value="Half Yearly">Half Yearly</option>
                <option value="Monthly Test">Monthly Test</option>
                <option value="Weekly Test">Weekly Test</option>
                <option value="Unit Test">Unit Test</option>
                <option value="Practice Test">Practice Test</option>
              </select>
            )},
            { label: 'Language', el: (
              <select value={medium} onChange={e => setMedium(e.target.value)} style={selStyle}>
                <option value="both">Both (EN + UR)</option>
                <option value="en">English Only</option>
                <option value="ur">Urdu Only</option>
              </select>
            )},
            { label: 'English Font', el: (
              <select value={fontFamily} onChange={e => setFontFamily(e.target.value)} style={selStyle}>
                <option value="'Times New Roman', Times, serif">Times New Roman</option>
                <option value="'Arial', sans-serif">Arial</option>
                <option value="'Georgia', serif">Georgia</option>
                <option value="'Courier New', monospace">Courier New</option>
                <option value="'Verdana', sans-serif">Verdana</option>
                <option value="'Tahoma', sans-serif">Tahoma</option>
                <option value="'Calibri', sans-serif">Calibri</option>
                <option value="'Cambria', serif">Cambria</option>
              </select>
            )},
            { label: 'Urdu Font', el: (
              <select value={urduFont} onChange={e => setUrduFont(e.target.value)} style={selStyle}>
                <option value="'Noto Nastaliq Urdu', serif">Noto Nastaliq Urdu</option>
                <option value="'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', serif">Jameel Noori Nastaleeq</option>
                <option value="'Alvi Nastaleeq', 'Noto Nastaliq Urdu', serif">Alvi Nastaleeq</option>
                <option value="'Gulzar', 'Noto Nastaliq Urdu', serif">Gulzar</option>
                <option value="'Amiri', serif">Amiri</option>
                <option value="'Scheherazade New', serif">Scheherazade New</option>
              </select>
            )},
            { label: 'Font Size', el: (
              <select value={fontSize} onChange={e => setFontSize(Number(e.target.value))} style={selStyle}>
                {[10,11,12,13,14,16,18,20].map(s => <option key={s} value={s}>{s}px</option>)}
              </select>
            )},
          ].map(({ label, el }) => (
            <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <span style={{ fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>{label}</span>
              {el}
            </div>
          ))}
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
            <PaperPreview
              paper={paper} medium={medium} schoolName={schoolName}
              subject={subjectName} className={className}
              editMode={editMode} fontSize={fontSize}
              showAnswers={showAnswers} examTime={examTime}
              examType={examType} fontFamily={fontFamily}
              urduFont={urduFont}
            />
          </div>
        </div>
      )}

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #paper-preview, #paper-preview * { visibility: visible; }
          #paper-preview { position: absolute; left: 0; top: 0; width: 100%; padding: 20px; }
          [contenteditable] { outline: none !important; background: transparent !important; padding: 0 !important; }
        }
      `}</style>
    </div>
  );
}

const tbBtn = (bg) => ({ padding: '7px 12px', background: bg, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '700', whiteSpace: 'nowrap', fontFamily: 'inherit', minHeight: '32px' });
const inputStyle = { padding: '5px 8px', borderRadius: '6px', border: '1px solid #374151', background: '#0f172a', color: 'white', fontSize: '12px', fontFamily: 'inherit' };
const selStyle = { padding: '5px 8px', borderRadius: '6px', border: '1px solid #374151', background: '#0f172a', color: 'white', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit' };