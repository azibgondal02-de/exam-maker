import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTestMaker } from '../../hooks/useTestMaker';
import ProfileMenu from '../../components/ProfileMenu';
import logoImg from '../../assets/logo.png';

const IMAGE_BASE = 'https://testmaker.pk';

function fixHtml(html) {
  if (!html) return '';
  return html.replace(/src="\/([^"]+)"/g, `src="${IMAGE_BASE}/$1"`);
}

const SCHOOL_NAME_FIELDS = ['school_name', 'schoolName', 'institute_name', 'institution_name', 'academy_name'];

function deepFindField(obj, fields, depth = 0) {
  if (!obj || typeof obj !== 'object' || depth > 4) return '';
  for (const f of fields) {
    if (typeof obj[f] === 'string' && obj[f].trim()) return obj[f].trim();
  }
  for (const k in obj) {
    if (obj[k] && typeof obj[k] === 'object') {
      const r = deepFindField(obj[k], fields, depth + 1);
      if (r) return r;
    }
  }
  return '';
}

function resolveSchoolName() {
  const ok = (v) => (typeof v === 'string' && v.trim() && !/^data:/.test(v.trim())) ? v.trim() : '';
  // 1. direct string keys
  for (const k of SCHOOL_NAME_FIELDS) {
    const v = ok(localStorage.getItem(k));
    if (v) return v;
  }
  // 2. scan every localStorage entry — plain strings whose KEY looks like a name holder,
  //    and JSON objects that contain one of the known fields anywhere inside.
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const first = raw.trim()[0];
      if (first === '{' || first === '[') {
        try {
          const o = JSON.parse(raw);
          const found = deepFindField(o, SCHOOL_NAME_FIELDS);
          if (ok(found)) return found.trim();
        } catch (e) {}
      } else if (/school.*name|institute.*name|institution.*name|academy.*name/i.test(key)) {
        const v = ok(raw);
        if (v) return v;
      }
    }
  } catch (e) {}
  return '';
}

// Urdu / Arabic script ranges — used to tell a real translation from duplicated content
const URDU_SCRIPT_RE = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
function hasUrduScript(s) {
  if (!s) return false;
  return URDU_SCRIPT_RE.test(s.replace(/<[^>]*>/g, ''));
}
function imgSrcs(s) {
  if (!s) return [];
  const out = []; const re = /<img[^>]+src="([^"]+)"/gi; let m;
  while ((m = re.exec(s))) out.push(m[1].trim());
  return out;
}
// In "both" mode, is the Urdu field genuinely distinct content (real translation /
// different image) rather than the same thing duplicated (identical image, math eq, numbers)?
function urIsDistinctContent(enStr, urStr) {
  const enImgs = imgSrcs(enStr); const urImgs = imgSrcs(urStr);
  if (enImgs.length && urImgs.length) {
    // Only use image-URL comparison when content is PURELY images (no surrounding text).
    // If there is text around the image, fall through to the Urdu-script check instead.
    const enText = (enStr || '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, '').trim();
    const urText = (urStr || '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, '').trim();
    if (enText === '' && urText === '') return enImgs.join('|') !== urImgs.join('|');
  }
  return hasUrduScript(urStr);
}

function hasContent(s) {
  if (!s) return false;
  if (/<img\b/i.test(s)) return true;
  return s.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, '').trim() !== '';
}

function cleanName(name) {
  if (!name) return '';
  const map = {
    'short question same statement': 'Short Questions', 'same statement short questions': 'Short Questions',
    'same statement long questions': 'Long Questions', 'long question': 'Long Questions',
    'short question': 'Short Questions', 'mcqs': 'MCQs', 'mcqs (kpk)': 'MCQs (KPK)',
    'numerical (secondary)': 'Numerical Problems', 'theorem': 'Theorems',
    'fill in the blanks': 'Fill in the Blanks', 'true / false': 'True / False',
    'form of verb': 'Form of Verb', 'present correct form of verb': 'Present Form of Verb',
    'past correct form of verb': 'Past Form of Verb', 'future correct form of verb': 'Future Form of Verb',
    'choose the word with correct spelling': 'Correct Spelling', 'underline word': 'Underline the Word',
    'correct option according to the grammar': 'Grammar (Correct Option)',
    'voice of the following': 'Active / Passive Voice', 'make the sentences': 'Sentence Making',
    'make sentences (primary)': 'Sentence Making',
    'translate the sentence into english': 'Translation (Urdu to English)',
    'translate into urdu': 'Translation (English to Urdu)',
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
    'subjective without board pattern': 'Subjective', 'subjective with board pattern': 'Subjective',
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
  const { sections, sectionRows, longBlocks, longSectionChoices } = step5Config;
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
    const isLong       = section.key === 'long_question_according_to_board_pattern';
    const isShortBoard = section.key === 'short_questions_according_to_board_pattern';
    const rows   = sectionRows[section.key] || [];
    const blocks = longBlocks[section.key]  || [];

    if (isLong) {
      const sectionChoiceCount = parseInt((longSectionChoices || {})[section.key]) || 0;
      const totalBlocks = blocks.length;
      const sectionHasChoice = sectionChoiceCount > 0 && sectionChoiceCount < totalBlocks;
      const sectionQuestions = [];
      blocks.forEach((block, bi) => {
        const parts = section.config?.parts || ['A', 'B'];
        const groupName = `Group ${String.fromCharCode(65 + bi)}`;
        parts.forEach(part => {
          const partData = block.parts?.[part] || {};
          const qt = section.question_types.find(q => q.type_id === Number(partData.type_id)) || section.question_types[0];
          if (!qt) return;
          const pickedIds = partData.picked_ids || [];
          const isRandom  = pickedIds.length === 0;
          const count     = pickedIds.length > 0 ? pickedIds.length : 1;
          const marks     = parseInt(partData.marks) || 0;
          const partChapterCodes = partData.chapter_ids || [];
          let topics     = getTopicNames(partChapterCodes);
          let chapterIds = getChapterIds(partChapterCodes);
          if (topics.length === 0 && chapters.length > 0) {
            const all = []; chapters.forEach(ch => (ch.topics || []).forEach(t => all.push(t))); topics = [...new Set(all)];
          }
          if (marks > 0 || pickedIds.length > 0) {
            sectionQuestions.push({ type_id: qt.type_id, type_name: qt.name, is_random: isRandom, count: count || 1, marks_per_question: marks, selected_question_ids: isRandom ? [] : pickedIds, topics, chapter_ids: chapterIds, has_choice: sectionHasChoice, choice_count: sectionHasChoice ? sectionChoiceCount : 0, part_id: part, group_name: groupName });
          }
        });
      });
      if (sectionQuestions.length > 0) payloadSections.push({ section_key: section.key, section_title: section.title, order: section.order, questions: sectionQuestions });
      return;
    }

    if (isShortBoard) {
      const sectionQuestions = rows.filter(row => (row.count > 0) || (row.picked_ids?.length > 0)).map(row => {
        const qt       = section.question_types[0];
        const pickedIds = row.picked_ids || [];
        const isRandom  = pickedIds.length === 0;
        const count     = pickedIds.length > 0 ? pickedIds.length : parseInt(row.count) || 0;
        const solve     = parseInt(row.solve) || 0;
        const chapterCodes = row.chapter_codes || [];
        return { type_id: qt.type_id, type_name: qt.name, is_random: isRandom, count, marks_per_question: parseInt(row.marks) || 0, selected_question_ids: isRandom ? [] : pickedIds, topics: getTopicNames(chapterCodes), chapter_ids: getChapterIds(chapterCodes), has_choice: solve > 0 && solve < count, choice_count: solve > 0 ? solve : 0, part_id: '', group_name: 'Board Pattern Short Questions' };
      }).filter(q => q.count > 0);
      if (sectionQuestions.length > 0) payloadSections.push({ section_key: section.key, section_title: section.title, order: section.order, questions: sectionQuestions });
      return;
    }

    const sectionQuestions = section.question_types.map((qt, i) => {
      const row       = rows[i] || {};
      const pickedIds = row.picked_ids || [];
      const isRandom  = pickedIds.length === 0;
      const count     = pickedIds.length > 0 ? pickedIds.length : parseInt(row.count) || 0;
      const solve     = parseInt(row.solve) || 0;
      if (count === 0) return null;
      return { type_id: qt.type_id, type_name: qt.name, is_random: isRandom, count, marks_per_question: parseInt(row.marks) || 0, selected_question_ids: isRandom ? [] : pickedIds, topics: getTopicNames(row.chapter_ids || []), chapter_ids: localStorage.getItem('chapter_ids') || '', has_choice: solve > 0 && solve < count, choice_count: solve > 0 ? solve : 0, part_id: '', group_name: section.order === 1 ? '' : qt.name };
    }).filter(Boolean);
    if (sectionQuestions.length > 0) payloadSections.push({ section_key: section.key, section_title: section.title, order: section.order, questions: sectionQuestions });
  });

  const totalMarks = payloadSections.reduce((t, sec) => t + sec.questions.reduce((st, q) => st + (q.count * q.marks_per_question), 0), 0);
  return { subject_id: subjectId, sections: payloadSections, total_marks: totalMarks };
}

function MCQOption({ opt, medium, editMode, letter, showAnswers, enFont, urFont, fontSize }) {
  const enRef = useRef(null); const urRef = useRef(null);
  useEffect(() => {
    if (enRef.current) enRef.current.innerHTML = fixHtml(opt.option_en || '');
    if (urRef.current) urRef.current.innerHTML = fixHtml(opt.option_ur || '');
  }, [medium, opt.option_en, opt.option_ur]);
  const isCorrect  = showAnswers && opt.is_correct;
  const eStyle     = editMode ? { outline: '1px dashed #2563eb', padding: '1px 3px', borderRadius: '3px', background: '#f0f7ff' } : {};
  const answerStyle = isCorrect ? { background: '#dcfce7', borderRadius: '4px', padding: '1px 6px', fontWeight: '700', color: '#15803d' } : {};
  const optFontSize = Math.max((fontSize || 13) - 1, 10);
  const hasEn = hasContent(opt.option_en); const hasUr = hasContent(opt.option_ur);
  const urDistinct = urIsDistinctContent(opt.option_en, opt.option_ur);
  let showEn, showUr;
  if (medium === 'en') { showEn = hasEn; showUr = false; }
  else if (medium === 'ur') { showEn = false; showUr = hasUr; }
  else { // both: show both only when Urdu is a genuine translation / different image
    if (urDistinct) { showEn = hasEn; showUr = hasUr; }
    else { showEn = hasEn; showUr = hasUr && !hasEn; } // same content → one (prefer EN)
  }
  const isRTL = (showUr && !showEn) || (medium === 'ur');
  const letterMark = isRTL ? `(${letter}` : `${letter})`;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '4px', fontSize: optFontSize + 'px', direction: isRTL ? 'rtl' : 'ltr', ...answerStyle }}>
      <span style={{ fontWeight: '600', flexShrink: 0, fontFamily: enFont, direction: 'ltr', unicodeBidi: 'isolate' }}>{letterMark}</span>
      <span style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        {showEn && <span ref={enRef} contentEditable={editMode} suppressContentEditableWarning style={{ ...eStyle, fontFamily: enFont, fontSize: optFontSize + 'px' }} />}
        {showUr && <span ref={urRef} contentEditable={editMode} suppressContentEditableWarning style={{ ...eStyle, direction: 'rtl', textAlign: 'right', fontFamily: urFont, fontSize: optFontSize + 'px' }} />}
      </span>
    </div>
  );
}

function MCQOptions({ options, medium, editMode, showAnswers, enFont, urFont, fontSize }) {
  if (!options || options.length === 0) return null;
  const letters = ['a', 'b', 'c', 'd', 'e'];
  const cols = options.length <= 4 ? 4 : 2;
  const anyEn = options.some(o => hasContent(o.option_en));
  const anyUr = options.some(o => hasContent(o.option_ur));
  const reverseOrder  = (medium === 'ur') || (medium === 'both' && anyUr && !anyEn);
  const renderOrder   = reverseOrder ? options.map((opt, i) => ({ opt, letter: letters[i] })).reverse() : options.map((opt, i) => ({ opt, letter: letters[i] }));
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '4px 16px', marginTop: '6px' }}>
      {renderOrder.map(({ opt, letter }) => <MCQOption key={opt.option_id} opt={opt} medium={medium} editMode={editMode} letter={letter} showAnswers={showAnswers} enFont={enFont} urFont={urFont} fontSize={fontSize} />)}
    </div>
  );
}

function ParagraphSubQuestion({ sub, num, medium, editMode, showAnswers, enFont, urFont, fontSize }) {
  const stEnRef = useRef(null); const stUrRef = useRef(null);
  const optEnRefs = useRef({}); const optUrRefs = useRef({});
  const visibleOptions = (sub.options || []).filter(o => hasContent(o.name_en) || hasContent(o.name_ur));
  useEffect(() => {
    if (stEnRef.current) stEnRef.current.innerHTML = fixHtml(sub.statement_en || '');
    if (stUrRef.current) stUrRef.current.innerHTML = fixHtml(sub.statement_ur || '');
    visibleOptions.forEach((opt, i) => { if (optEnRefs.current[i]) optEnRefs.current[i].innerHTML = fixHtml(opt.name_en || ''); if (optUrRefs.current[i]) optUrRefs.current[i].innerHTML = fixHtml(opt.name_ur || ''); });
  }, [medium, sub.statement_en, sub.statement_ur, visibleOptions]);
  const letters = ['a', 'b', 'c', 'd', 'e', 'f'];
  const subHasEn = hasContent(sub.statement_en); const subHasUr = hasContent(sub.statement_ur);
  const showEn = (medium === 'en' || medium === 'both') && subHasEn;
  const showUr = (medium === 'ur' || medium === 'both') && subHasUr;
  const isUr  = (showUr && !showEn) || (medium === 'ur');
  const optFontSize = Math.max((fontSize || 13) - 1, 10);
  const renderOptionBoxes = (lang) => {
    const isUrLang = lang === 'ur';
    return (
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${visibleOptions.length}, 1fr)`, gap: '6px', marginTop: '6px', direction: isUrLang ? 'rtl' : 'ltr' }}>
        {visibleOptions.map((opt, i) => {
          const isCorrect = showAnswers && (String(opt.is_true) === '1' || opt.is_true === 1 || opt.is_true === true);
          const text = isUrLang ? opt.name_ur : opt.name_en;
          if (!hasContent(text)) return <div key={i} />;
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid #1a1a2e', borderRadius: '4px', padding: '4px 8px', background: isCorrect ? '#dcfce7' : '#ffffff', minHeight: '26px', fontFamily: isUrLang ? urFont : enFont, direction: isUrLang ? 'rtl' : 'ltr', fontSize: optFontSize + 'px' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '18px', height: '18px', minWidth: '18px', borderRadius: '50%', border: '1px solid #1a1a2e', fontSize: Math.max(optFontSize - 2, 9) + 'px', fontWeight: '700', flexShrink: 0, background: '#ffffff', color: '#000000', fontFamily: enFont }}>{letters[i]}</span>
              <span ref={el => { if (isUrLang) optUrRefs.current[i] = el; else optEnRefs.current[i] = el; }} contentEditable={editMode} suppressContentEditableWarning style={{ flex: 1, outline: editMode ? '1px dashed #2563eb' : 'none', color: isCorrect ? '#15803d' : '#000000', fontWeight: isCorrect ? '700' : 'normal', textAlign: isUrLang ? 'right' : 'left' }} />
            </div>
          );
        })}
      </div>
    );
  };
  return (
    <div style={{ marginBottom: '10px', breakInside: 'avoid' }}>
      <div style={{ display: 'flex', gap: '6px', flexDirection: isUr ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
        <span style={{ fontWeight: '700', flexShrink: 0, color: '#000', minWidth: '22px', textAlign: isUr ? 'right' : 'left' }}>{num})</span>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', flexDirection: isUr ? 'row-reverse' : 'row' }}>
            {showEn && <span ref={stEnRef} className="q-content" contentEditable={editMode} suppressContentEditableWarning style={{ flex: 1, minWidth: '200px', fontFamily: enFont, color: '#000' }} />}
            {showUr && <span ref={stUrRef} className="q-content" contentEditable={editMode} suppressContentEditableWarning style={{ flex: 1, minWidth: '200px', direction: 'rtl', textAlign: 'right', fontFamily: urFont, color: '#000' }} />}
          </div>
        </div>
      </div>
      {(medium === 'en' || medium === 'both') && visibleOptions.some(o => hasContent(o.name_en)) && renderOptionBoxes('en')}
      {(medium === 'ur' || medium === 'both') && visibleOptions.some(o => hasContent(o.name_ur)) && renderOptionBoxes('ur')}
    </div>
  );
}

function ParagraphQuestions({ subs, medium, editMode, showAnswers, enFont, urFont, fontSize }) {
  if (!subs || subs.length === 0) return null;
  return (
    <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px dashed #cbd5e1' }}>
      {subs.map((sub, i) => <ParagraphSubQuestion key={i} sub={sub} num={i + 1} medium={medium} editMode={editMode} showAnswers={showAnswers} enFont={enFont} urFont={urFont} fontSize={fontSize} />)}
    </div>
  );
}

function QuestionItem({ q, index, showNumber = true, medium, editMode, showAnswers, enFont, urFont, fontSize }) {
  const stEn = [q.statement_en, q.description_en].filter(Boolean).join(' ');
  const stUr = [q.statement_ur, q.description_ur].filter(Boolean).join(' ');
  const enRef = useRef(null); const urRef = useRef(null);
  // In view mode: dangerouslySetInnerHTML (same as Step 5) — browser renders CMS
  // inline-styles for fractions/radicals unmolested. In edit mode: ref+contentEditable.
  useEffect(() => {
    if (!editMode) return;
    if (enRef.current) enRef.current.innerHTML = fixHtml(stEn);
    if (urRef.current) urRef.current.innerHTML = fixHtml(stUr);
  }, [editMode, stEn, stUr]);
  const eStyle = (extra = {}) => ({ outline: '1px dashed #2563eb', padding: '2px 4px', borderRadius: '3px', background: '#f0f7ff', minHeight: '18px', ...extra });
  const hasEn = hasContent(stEn); const hasUr = hasContent(stUr);
  // Statements always show both EN and UR based on medium — no dedup.
  // Dedup (urIsDistinctContent) is for MCQ options only.
  const showEn = (medium === 'en' || medium === 'both') && hasEn;
  const showUr = (medium === 'ur' || medium === 'both') && hasUr;
  const isRTL = (showUr && !showEn) || (medium === 'ur');
  const baseEn = { flex: 1, minWidth: '200px', fontFamily: enFont, color: '#000' };
  const baseUr = { flex: 1, minWidth: '200px', direction: 'rtl', textAlign: 'right', fontFamily: urFont, color: '#000' };
  return (
    <div style={{ marginBottom: '10px', breakInside: 'avoid' }}>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
        {showNumber && index && <span style={{ fontWeight: '700', flexShrink: 0, minWidth: '24px', color: '#000', textAlign: isRTL ? 'right' : 'left' }}>{index}.</span>}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
            {showEn && (editMode
              ? <span ref={enRef} className="q-content" contentEditable suppressContentEditableWarning style={eStyle(baseEn)} />
              : <span className="q-content" dangerouslySetInnerHTML={{ __html: fixHtml(stEn) }} style={baseEn} />
            )}
            {showUr && (editMode
              ? <span ref={urRef} className="q-content" contentEditable suppressContentEditableWarning style={eStyle(baseUr)} />
              : <span className="q-content" dangerouslySetInnerHTML={{ __html: fixHtml(stUr) }} style={baseUr} />
            )}
          </div>
          {q.options && q.options.length > 0 && <MCQOptions options={q.options} medium={medium} editMode={editMode} showAnswers={showAnswers} enFont={enFont} urFont={urFont} fontSize={fontSize} />}
          {q.paragraph_questions?.length > 0 && <ParagraphQuestions subs={q.paragraph_questions} medium={medium} editMode={editMode} showAnswers={showAnswers} enFont={enFont} urFont={urFont} fontSize={fontSize} />}
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title, totalMarks, qNo, editMode, medium, choiceInfo }) {
  return (
    <div style={{ margin: '24px 0 10px', pageBreakInside: 'avoid' }}>
      <div style={{ background: '#000000', color: 'white', padding: '10px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '4px', direction: 'ltr', flexDirection: 'row' }}>
        <span contentEditable={editMode} suppressContentEditableWarning style={{ fontWeight: '800', fontSize: '14px', letterSpacing: '0.5px', outline: editMode ? '1px dashed #60a5fa' : 'none', borderRadius: '3px', color: 'white' }}>
          Q.{qNo}. {title.toUpperCase()}{choiceInfo ? ` — ${choiceInfo}` : ''}
        </span>
        {totalMarks > 0 && (
          <span contentEditable={editMode} suppressContentEditableWarning style={{ fontSize: '13px', fontWeight: '700', background: 'rgba(255,255,255,0.2)', padding: '2px 12px', borderRadius: '12px', outline: editMode ? '1px dashed #60a5fa' : 'none', color: 'white' }}>
            Total Marks: {totalMarks}
          </span>
        )}
      </div>
    </div>
  );
}

function PaperPreview({ paper, medium, schoolName, schoolLogo, subject, className, editMode, fontSize, showAnswers, examTime, examType, fontFamily, urduFont }) {
  const totalMarks = paper.total_marks || 0;
  const enFont = fontFamily || "'Times New Roman', Times, serif";
  const urFont = urduFont  || "'Noto Nastaliq Urdu', serif";
  const fs = fontSize || 13;
  const td = (extra={}) => ({ padding: '6px 10px', border: '1px solid #1a1a2e', background: '#ffffff', color: '#000000', ...extra });
  const th = (extra={}) => ({ padding: '6px 10px', border: '1px solid #1a1a2e', fontWeight: '700', background: '#1a1a2e', color: '#ffffff', whiteSpace: 'nowrap', ...extra });

  return (
    <div id="paper-preview" style={{ background: 'white', padding: '32px 36px', maxWidth: '900px', margin: '0 auto', fontSize: fs + 'px', lineHeight: '1.7', color: '#000000' }}>
      <style>{`
        .q-content { display: block; }
        /* Step 5 approach: minimal overrides so CMS inline-styles render unmolested.
           Images sit inline (fractions/radicals use inline styles from the CMS).
           Only real data tables (2+ columns) get bordered-grid treatment. */
        .q-content img { vertical-align: middle; display: inline-block; max-width: 100%; height: auto; }
        .q-content table { border-collapse: collapse; width: auto; max-width: 100%; font-size: ${fs}px; }
        .q-content table td, .q-content table th { padding: 4px 8px; vertical-align: middle; }
        .q-content table:has(td + td) td, .q-content table:has(td + td) th,
        .q-content table:has(th + th) td, .q-content table:has(th + th) th
          { border: 1px solid #1a1a2e; padding: 6px 10px; min-width: 60px; height: 28px; background: #fff; color: #000; }
        .q-content table:has(th + th) th { background: #f3f4f6; font-weight: 700; }
        .q-content:has(table:has(td + td)), .q-content:has(table:has(th + th))
          { flex-basis: 100% !important; min-width: 100% !important; }
      `}</style>

      {/* ── Header ── */}
      <div style={{ marginBottom: '14px', paddingBottom: '12px', borderBottom: '3px double #1a1a2e', display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Left logo */}
        {schoolLogo && (
          <img src={schoolLogo} alt="School Logo" style={{ height: '70px', width: 'auto', flexShrink: 0, objectFit: 'contain' }} />
        )}
        {/* Center text */}
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: fs + 8 + 'px', fontWeight: '800', color: '#1a1a2e', fontFamily: enFont, letterSpacing: '0.5px' }}>
            {schoolName || 'School Name'}
          </div>
          <div style={{ fontSize: fs - 1 + 'px', color: '#444', marginTop: '3px', fontFamily: enFont }}>
            Smart Board Paper Generation — PaperCraft
          </div>
        </div>
        {/* Right spacer to keep title centered (logo only on the left) */}
        {schoolLogo && (
          <div style={{ width: '70px', flexShrink: 0 }} aria-hidden="true" />
        )}
      </div>

      {/* ── Info table ── */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px', fontSize: fs - 1 + 'px', fontFamily: enFont }}>
        <tbody>
          <tr>
            <td style={th({ width: '13%' })}>Name:</td>
            <td contentEditable={editMode} suppressContentEditableWarning style={{ ...td({ width: '30%' }) }}></td>
            <td style={th({ width: '12%' })}>Roll No:</td>
            <td contentEditable={editMode} suppressContentEditableWarning style={{ ...td({ width: '15%' }) }}></td>
            <td style={th({ width: '10%' })}>Class:</td>
            <td contentEditable={editMode} suppressContentEditableWarning style={{ ...td() }}>{className || ''}</td>
          </tr>
          <tr>
            <td style={th()}>Subject:</td>
            <td contentEditable={editMode} suppressContentEditableWarning style={{ ...td() }}>{subject || ''}</td>
            <td style={th()}>Date:</td>
            <td contentEditable={editMode} suppressContentEditableWarning style={{ ...td() }}></td>
            <td style={th()}>Total Marks:</td>
            <td contentEditable={editMode} suppressContentEditableWarning style={{ ...td() }}>{totalMarks}</td>
          </tr>
          <tr>
            <td style={th()}>Time:</td>
            <td contentEditable={editMode} suppressContentEditableWarning style={{ ...td() }}>{examTime || ''}</td>
            <td style={th()}>Exam Type:</td>
            <td contentEditable={editMode} suppressContentEditableWarning style={{ ...td() }}>{examType || ''}</td>
            <td style={th()}>Teacher Name:</td>
            <td contentEditable={editMode} suppressContentEditableWarning style={{ ...td() }}></td>
          </tr>
        </tbody>
      </table>

      {paper.sections?.map((section, si) => {
        const isLong = section.section_key === 'long_question_according_to_board_pattern';
        let longChoiceInfo = '';
        if (isLong && section.question_groups?.length > 0) {
          const uniqueGroups = new Set(section.question_groups.map(g => g.group_name || ''));
          const totalGroups  = uniqueGroups.size;
          const choice    = section.question_groups[0]?.choice_count || 0;
          const hasChoice = section.question_groups[0]?.has_choice && choice > 0;
          if (hasChoice) longChoiceInfo = `Attempt any ${choice} out of ${totalGroups}`;
        }
        return (
          <div key={section.section_key}>
            <SectionHeader title={cleanSectionTitle(section.section_title)} totalMarks={section.total_marks || 0} qNo={si + 1} editMode={editMode} medium={medium} choiceInfo={longChoiceInfo} />
            {isLong ? (() => {
              const groupMap = {};
              section.question_groups?.forEach(g => { const k = g.group_name || 'default'; if (!groupMap[k]) groupMap[k] = []; groupMap[k].push(g); });
              return Object.entries(groupMap).map(([, groups], qi) => (
                <div key={qi} style={{ marginBottom: '16px' }}>
                  <div contentEditable={editMode} suppressContentEditableWarning style={{ fontWeight: '700', fontSize: '13px', marginBottom: '6px', outline: editMode ? '1px dashed #2563eb' : 'none', padding: editMode ? '1px 4px' : '0', borderRadius: '3px' }}>Question {qi + 1}:</div>
                  {groups.map((group, pi) => (
                    <div key={pi} style={{ marginLeft: '16px', marginBottom: '6px' }}>
                      {group.questions?.map(q => (
                        <div key={q.question_id} style={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                          {group.part_id && <span style={{ fontWeight: '600', flexShrink: 0 }}>{String.fromCharCode(96 + pi + 1)})</span>}
                          <div style={{ flex: 1 }}><QuestionItem q={q} showNumber={false} medium={medium} editMode={editMode} showAnswers={showAnswers} enFont={enFont} urFont={urFont} fontSize={fs} /></div>
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
                      <span contentEditable={editMode} suppressContentEditableWarning style={{ outline: editMode ? '1px dashed #2563eb' : 'none', padding: editMode ? '1px 4px' : '0', borderRadius: '3px', color: '#000' }}>{cleanName(group.type_name)}</span>
                      <span contentEditable={editMode} suppressContentEditableWarning style={{ fontWeight: '400', fontSize: '12px', color: '#000', outline: editMode ? '1px dashed #2563eb' : 'none', padding: editMode ? '1px 4px' : '0', borderRadius: '3px' }}>
                        {group.marks_per_question > 0 && `(${group.marks_per_question} marks each)`}{hasChoice && ` — Attempt any ${group.choice_count}`}
                      </span>
                    </div>
                    {group.questions?.map((q, qi) => <QuestionItem key={q.question_id} q={q} index={qi + 1} medium={medium} editMode={editMode} showAnswers={showAnswers} enFont={enFont} urFont={urFont} fontSize={fs} />)}
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

function openPDF(fontFamily, urduFont, fontSize) {
  const el = document.getElementById('paper-preview');
  if (!el) return;
  const clone = el.cloneNode(true);
  clone.style.color = '#000000';
  clone.style.backgroundColor = '#ffffff';
  const matchDark = (node) => {
    const bg = (node.style.background || node.style.backgroundColor || '').replace(/\s+/g, '').toLowerCase();
    if (!bg) return null;
    if (bg.includes('#000000') || bg.includes('rgb(0,0,0)') || bg === 'black') return '#000000';
    if (bg.includes('#1a1a2e') || bg.includes('rgb(26,26,46)')) return '#1a1a2e';
    return null;
  };
  const svgLayer = (hex) => {
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none' viewBox='0 0 4 4'><rect width='4' height='4' fill='${hex}'/></svg>`;
    const img = document.createElement('img');
    img.src = 'data:image/svg+xml,' + encodeURIComponent(svg);
    img.alt = '';
    img.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;z-index:-1;display:block;border-radius:inherit;';
    return img;
  };
  clone.querySelectorAll('*').forEach((node) => {
    const hex = matchDark(node);
    if (!hex) return;
    const pos = node.style.position;
    if (!pos || pos === 'static') node.style.position = 'relative';
    node.style.overflow = 'hidden';
    node.insertBefore(svgLayer(hex), node.firstChild);
  });
  const extractFontName = (fontStr) => {
    const match = fontStr.match(/'([^']+)'/);
    return match ? match[1] : fontStr.split(',')[0].trim().replace(/['"]/g, '');
  };
  const urFamilyParam = encodeURIComponent(extractFontName(urduFont)).replace(/%20/g, '+');
  const fontsHref = `https://fonts.googleapis.com/css2?family=${urFamilyParam}:wght@400;700&display=swap`;
  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.cssText = 'position:fixed;top:-10000px;left:-10000px;width:100%;height:100%;border:0;';
  document.body.appendChild(iframe);
  const doc = iframe.contentDocument || iframe.contentWindow.document;
  doc.open();
  doc.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Paper</title>
    <link href="${fontsHref}" rel="stylesheet">
    <style>
      *{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;}
      @page{size:A4;margin:15mm 18mm;}
      html,body{margin:0;padding:0;background:#fff;color:#000;font-family:${fontFamily};font-size:${fontSize}px;line-height:1.7;}
      .paper-wrap{max-width:900px;margin:0 auto;}
      td{background-color:#fff!important;color:#000!important;}
      th{color:#fff!important;}
      [contenteditable]{outline:none!important;}
      img{max-width:200px;height:auto;}
      img[src^="data:image/svg+xml"]{max-width:none!important;}
      table,tr,td,th{page-break-inside:avoid;}
    </style></head>
    <body><div class="paper-wrap">${clone.innerHTML}</div></body></html>`);
  doc.close();
  const win = iframe.contentWindow;
  const waitForAssets = (maxWaitMs = 6000) => new Promise((resolve) => {
    let settled = false;
    const finish = () => { if (!settled) { settled = true; resolve(); } };
    const cap = setTimeout(finish, maxWaitMs);
    const pending = [];
    if (doc.fonts && doc.fonts.ready) pending.push(doc.fonts.ready.catch(() => {}));
    Array.from(doc.images || []).forEach((img) => {
      if (img.complete) return;
      pending.push(new Promise((res) => {
        img.addEventListener('load', res, { once: true });
        img.addEventListener('error', res, { once: true });
      }));
    });
    Promise.all(pending).then(() => {
      clearTimeout(cap);
      if (win.requestAnimationFrame) win.requestAnimationFrame(() => win.requestAnimationFrame(finish));
      else finish();
    });
  });
  const removeFrame = () => { if (iframe.parentNode) iframe.parentNode.removeChild(iframe); };
  waitForAssets().then(() => {
    let cleaned = false;
    const safeCleanup = () => { if (!cleaned) { cleaned = true; removeFrame(); } };
    win.addEventListener('afterprint', () => setTimeout(safeCleanup, 300), { once: true });
    setTimeout(safeCleanup, 60000);
    win.focus();
    try { win.print(); } catch (e) { safeCleanup(); }
  });
}

export default function Step6QuestionSelect() {
  const navigate = useNavigate();
  const { selectedSubject, selectedClass, generatePaper } = useTestMaker();
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [paper,       setPaper]       = useState(null);
  const [medium,      setMedium]      = useState('both');
  const [schoolName]                  = useState(() => resolveSchoolName());
  const [schoolLogo]                  = useState(() => localStorage.getItem('school_logo') || '');
  const [editMode,    setEditMode]    = useState(false);
  const [fontSize,    setFontSize]    = useState(13);
  const [showAnswers, setShowAnswers] = useState(false);
  const [examTime,    setExamTime]    = useState('');
  const [examType,    setExamType]    = useState('');
  const [fontFamily,  setFontFamily]  = useState("'Times New Roman', Times, serif");
  const [urduFont,    setUrduFont]    = useState("'Noto Nastaliq Urdu', serif");
  const [drawerOpen,  setDrawerOpen]  = useState(false);

  const mediumAutoSetRef = useRef(false);
  // Tracks the config hash last used to generate a paper.
  // If Step 6 re-mounts but config hasn't changed, we skip the API call.
  const lastConfigHashRef = useRef(null);
  const subjectName = selectedSubject?.subject_name || localStorage.getItem('subject_name') || 'Subject';
  const className   = selectedClass?.class_name     || localStorage.getItem('class_name')   || '';

  useEffect(() => { generatePaperFromConfig(); }, []);

  useEffect(() => {
    if (!drawerOpen) return;
    const handler = (e) => { if (!e.target.closest('.s6-drawer') && !e.target.closest('.s6-fab-settings')) setDrawerOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [drawerOpen]);

  const generatePaperFromConfig = async (force = false) => {
    try {
      setLoading(true); setError('');
      const step5Raw    = localStorage.getItem('step5_config');
      // Skip re-generation if config hasn't changed since last run (unless forced).
      // This prevents the API call firing again when the user navigates back to Step 6.
      const configHash = step5Raw ? step5Raw.length + '_' + (step5Raw.slice(0, 64)) : null;
      if (!force && configHash && lastConfigHashRef.current === configHash && paper) {
        setLoading(false); return;
      }
      const chaptersRaw = localStorage.getItem('step5_chapters');
      if (!step5Raw) { setError('No paper configuration found. Please go back to Step 5.'); setLoading(false); return; }
      const step5Config = JSON.parse(step5Raw);
      const chapters    = chaptersRaw ? JSON.parse(chaptersRaw) : [];
      const payload     = buildPayload(step5Config, chapters);
      if (payload.sections.length === 0) { setError('No questions configured. Please go back and add question counts.'); setLoading(false); return; }
      const result = await generatePaper(payload);
      setPaper(result);
      lastConfigHashRef.current = configHash;
      if (!mediumAutoSetRef.current && result?.sections) {
        let enCount = 0, urCount = 0, total = 0;
        const walk = (qs) => { (qs || []).forEach(q => { total++; if (hasContent([q.statement_en, q.description_en].filter(Boolean).join(' '))) enCount++; if (hasContent([q.statement_ur, q.description_ur].filter(Boolean).join(' '))) urCount++; if (q.paragraph_questions) walk(q.paragraph_questions); }); };
        result.sections.forEach(sec => (sec.question_groups || []).forEach(g => walk(g.questions)));
        if (total > 0) {
          const enRatio = enCount / total; const urRatio = urCount / total;
          let detected = 'both';
          if (urRatio >= 0.8 && enRatio < 0.2) detected = 'ur';
          else if (enRatio >= 0.8 && urRatio < 0.2) detected = 'en';
          setMedium(detected);
        }
        mediumAutoSetRef.current = true;
      }
    } catch (err) { setError(err.message || 'Failed to generate paper. Please try again.'); }
    finally { setLoading(false); }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
      <div style={{ fontSize: '18px', fontWeight: '600', color: '#1a1a2e' }}>Generating Your Paper...</div>
      <div style={{ fontSize: '14px', color: '#666' }}>Please wait while we fetch questions</div>
      <div className="s6-spinner" />
      <style>{`@keyframes s6spin { to { transform: rotate(360deg); } } .s6-spinner { width: 48px; height: 48px; border: 4px solid #e2e8f0; border-top: 4px solid #2563eb; border-radius: 50%; animation: s6spin 0.8s linear infinite; }`}</style>
    </div>
  );

  const settingsFields = [
    { label: 'Total Time',  el: <input value={examTime} onChange={e => setExamTime(e.target.value)} placeholder="e.g. 3 Hours" className="s6-input" style={{ width: '110px' }} /> },
    { label: 'Exam Type', el: (
      <select value={examType} onChange={e => setExamType(e.target.value)} className="s6-sel">
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
      <select value={medium} onChange={e => setMedium(e.target.value)} className="s6-sel">
        <option value="both">Both (EN + UR)</option>
        <option value="en">English Only</option>
        <option value="ur">Urdu Only</option>
      </select>
    )},
    { label: 'English Font', el: (
      <select value={fontFamily} onChange={e => setFontFamily(e.target.value)} className="s6-sel">
        <option value="'Times New Roman', Times, serif">Times New Roman</option>
        <option value="'Arial', sans-serif">Arial</option>
        <option value="'Georgia', serif">Georgia</option>
        <option value="'Courier New', monospace">Courier New</option>
        <option value="'Verdana', sans-serif">Verdana</option>
        <option value="'Calibri', sans-serif">Calibri</option>
        <option value="'Cambria', serif">Cambria</option>
      </select>
    )},
    { label: 'Urdu Font', el: (
      <select value={urduFont} onChange={e => setUrduFont(e.target.value)} className="s6-sel">
        <option value="'Noto Nastaliq Urdu', serif">Noto Nastaliq Urdu</option>
        <option value="'Gulzar', 'Noto Nastaliq Urdu', serif">Gulzar</option>
        <option value="'Amiri', serif">Amiri</option>
        <option value="'Scheherazade New', serif">Scheherazade New</option>
      </select>
    )},
    { label: 'Font Size', el: (
      <select value={fontSize} onChange={e => setFontSize(Number(e.target.value))} className="s6-sel">
        {[10,11,12,13,14,16,18,20].map(s => <option key={s} value={s}>{s}px</option>)}
      </select>
    )},
  ];

  return (
    <div className="s6-root">

      {/* Desktop toolbar */}
      <div className="s6-toolbar s6-desktop-toolbar">
        <div className="s6-toolbar-row1">
          <div onClick={() => navigate('/test-maker/step-1')} className="s6-logo-btn" title="Home">
            <img src={logoImg} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <button onClick={() => navigate('/test-maker/step-5')} className="s6-tb-btn" style={{ background: '#374151' }}>Back</button>
          <button onClick={() => generatePaperFromConfig(true)} className="s6-tb-btn" style={{ background: '#7c3aed' }}>Regenerate</button>
          <button onClick={() => window.print()} className="s6-tb-btn" style={{ background: '#2563eb' }}>Print</button>
          <button onClick={() => openPDF(fontFamily, urduFont, fontSize)} className="s6-tb-btn" style={{ background: '#dc2626' }}>PDF</button>
          <button onClick={() => setEditMode(v => !v)} className="s6-tb-btn" style={{ background: editMode ? '#16a34a' : '#4b5563' }}>Edit {editMode ? 'ON' : 'OFF'}</button>
          <button onClick={() => setShowAnswers(v => !v)} className="s6-tb-btn" style={{ background: showAnswers ? '#d97706' : '#4b5563' }}>Answers {showAnswers ? 'ON' : 'OFF'}</button>
          <div style={{ marginLeft: 'auto' }}><ProfileMenu /></div>
        </div>
        <div className="s6-toolbar-settings">
          {settingsFields.map(({ label, el }) => (
            <div key={label} className="s6-settings-field">
              <span className="s6-settings-label">{label}</span>
              {el}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile top bar */}
      <div className="s6-mobile-topbar">
        <div onClick={() => navigate('/test-maker/step-1')} className="s6-logo-btn s6-logo-sm">
          <img src={logoImg} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
        <span className="s6-mobile-title">Paper Preview</span>
        <ProfileMenu />
      </div>

      {error && (
        <div className="s6-error-box">
          <div style={{ fontSize: '15px', fontWeight: '600', marginBottom: '8px' }}>Warning: {error}</div>
          <button onClick={() => navigate('/test-maker/step-5')} className="s6-tb-btn" style={{ background: '#dc2626' }}>Go Back to Step 5</button>
        </div>
      )}

      {paper && (
        <div className="s6-stats-bar">
          {[['Questions', paper.total_questions, '#2563eb'], ['Marks', paper.total_marks, '#7c3aed'], ['Sections', paper.sections?.length, '#059669']].map(([label, val, color]) => (
            <div key={label} className="s6-stat">
              <span className="s6-stat-val" style={{ color }}>{val}</span>
              <span className="s6-stat-label">{label}</span>
            </div>
          ))}
          <div className="s6-stat-done">Generated</div>
        </div>
      )}

      {paper && (
        <div className="s6-paper-wrapper">
          <div className="s6-paper-scroll">
            <PaperPreview
              paper={paper} medium={medium}
              schoolName={schoolName} schoolLogo={schoolLogo}
              subject={subjectName} className={className}
              editMode={editMode} fontSize={fontSize}
              showAnswers={showAnswers} examTime={examTime}
              examType={examType} fontFamily={fontFamily} urduFont={urduFont}
            />
          </div>
        </div>
      )}

      {/* Mobile bottom actions */}
      <div className="s6-mobile-actions">
        <button onClick={() => navigate('/test-maker/step-5')} className="s6-mob-btn s6-mob-back">
          <i className="ti ti-arrow-left" style={{ fontSize: '16px' }} />
        </button>
        <button onClick={() => generatePaperFromConfig(true)} className="s6-mob-btn" style={{ background: '#7c3aed' }}>
          <i className="ti ti-refresh" style={{ fontSize: '16px' }} />
          <span>New</span>
        </button>
        <button onClick={() => window.print()} className="s6-mob-btn" style={{ background: '#2563eb' }}>
          <i className="ti ti-printer" style={{ fontSize: '16px' }} />
          <span>Print</span>
        </button>
        <button onClick={() => openPDF(fontFamily, urduFont, fontSize)} className="s6-mob-btn" style={{ background: '#dc2626' }}>
          <i className="ti ti-file-type-pdf" style={{ fontSize: '16px' }} />
          <span>PDF</span>
        </button>
        <button onClick={() => setShowAnswers(v => !v)} className="s6-mob-btn" style={{ background: showAnswers ? '#d97706' : '#4b5563' }}>
          <i className="ti ti-bulb" style={{ fontSize: '16px' }} />
          <span>{showAnswers ? 'Hide' : 'Ans'}</span>
        </button>
        <button onClick={() => setDrawerOpen(v => !v)} className="s6-mob-btn s6-fab-settings" style={{ background: '#0f172a' }}>
          <i className="ti ti-settings" style={{ fontSize: '16px' }} />
          <span>Settings</span>
        </button>
      </div>

      {/* Mobile settings drawer */}
      {drawerOpen && (
        <div className="s6-drawer-backdrop" onClick={() => setDrawerOpen(false)}>
          <div className="s6-drawer" onClick={e => e.stopPropagation()}>
            <div className="s6-drawer-handle" />
            <div className="s6-drawer-header">
              <span className="s6-drawer-title">Paper Settings</span>
              <button onClick={() => setDrawerOpen(false)} className="s6-drawer-close">X</button>
            </div>
            <div className="s6-drawer-toggles">
              <button onClick={() => setEditMode(v => !v)} className={`s6-toggle-btn ${editMode ? 's6-toggle-on' : ''}`}>
                <i className="ti ti-pencil" /> Edit Mode {editMode ? 'ON' : 'OFF'}
              </button>
              <button onClick={() => setShowAnswers(v => !v)} className={`s6-toggle-btn ${showAnswers ? 's6-toggle-amber' : ''}`}>
                <i className="ti ti-bulb" /> Answers {showAnswers ? 'ON' : 'OFF'}
              </button>
            </div>
            <div className="s6-drawer-fields">
              {settingsFields.map(({ label, el }) => (
                <div key={label} className="s6-drawer-field">
                  <span className="s6-drawer-field-label">{label}</span>
                  {el}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        .s6-root { min-height: 100vh; background: #f0f4f8; font-family: 'Segoe UI', system-ui, sans-serif; padding-bottom: 72px; }
        .s6-input { padding: 5px 8px; border-radius: 6px; border: 1px solid #374151; background: #0f172a; color: white; font-size: 12px; font-family: inherit; width: 150px; }
        .s6-sel { padding: 5px 8px; border-radius: 6px; border: 1px solid #374151; background: #0f172a; color: white; font-size: 12px; cursor: pointer; font-family: inherit; }
        .s6-tb-btn { padding: 7px 12px; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 700; white-space: nowrap; font-family: inherit; min-height: 32px; transition: opacity 0.15s; }
        .s6-tb-btn:active { opacity: 0.8; }
        .s6-logo-btn { background: #ffffff; border-radius: 8px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; cursor: pointer; border: 1px solid #e2e8f0; flex-shrink: 0; transition: transform 0.2s; }
        .s6-logo-btn:active { transform: scale(0.95); }
        .s6-logo-sm { width: 28px; height: 28px; border-radius: 6px; }
        .s6-logo-corner { position: absolute; top: 0; right: 0; width: 0; height: 0; border-style: solid; border-width: 0 10px 10px 0; border-color: transparent #f5a623 transparent transparent; }
        .s6-logo-p { color: #0f1f3d; font-size: 16px; font-weight: 700; font-family: Georgia, 'Times New Roman', serif; position: relative; z-index: 1; }
        .s6-desktop-toolbar { background: #1a1a2e; color: white; padding: 10px 16px; position: sticky; top: 0; z-index: 100; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; flex-direction: column; gap: 8px; }
        .s6-toolbar-row1 { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .s6-toolbar-settings { display: flex; align-items: flex-end; gap: 10px; flex-wrap: wrap; }
        .s6-settings-field { display: flex; flex-direction: column; gap: 3px; }
        .s6-settings-label { font-size: 9px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
        .s6-mobile-topbar { display: none; background: #1a1a2e; padding: 10px 14px; position: sticky; top: 0; z-index: 100; align-items: center; gap: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.3); }
        .s6-mobile-title { flex: 1; font-size: 15px; font-weight: 700; color: white; text-align: center; letter-spacing: -0.3px; }
        .s6-stats-bar { background: white; padding: 10px 20px; display: flex; align-items: center; gap: 0; border-bottom: 1px solid #e8eef5; box-shadow: 0 1px 4px rgba(0,0,0,0.05); overflow-x: auto; }
        .s6-stat { display: flex; flex-direction: column; align-items: center; padding: 0 16px; border-right: 1px solid #e8eef5; flex-shrink: 0; }
        .s6-stat:first-child { padding-left: 0; }
        .s6-stat-val   { font-size: 20px; font-weight: 700; line-height: 1.2; }
        .s6-stat-label { font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 600; }
        .s6-stat-done  { margin-left: auto; font-size: 13px; color: #16a34a; font-weight: 600; flex-shrink: 0; }
        .s6-paper-wrapper { padding: 20px; max-width: 960px; margin: 0 auto; }
        .s6-paper-scroll { box-shadow: 0 4px 24px rgba(0,0,0,0.12); border-radius: 10px; overflow: hidden; overflow-x: auto; background: white; }
        .s6-mobile-actions { display: none; position: fixed; bottom: 0; left: 0; right: 0; background: #1a1a2e; padding: 8px 10px; padding-bottom: calc(8px + env(safe-area-inset-bottom)); gap: 6px; z-index: 200; box-shadow: 0 -4px 20px rgba(0,0,0,0.3); border-top: 1px solid #374151; }
        .s6-mob-btn { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; padding: 6px 4px; border: none; border-radius: 8px; cursor: pointer; color: white; font-size: 10px; font-weight: 700; font-family: inherit; min-height: 48px; transition: opacity 0.15s, transform 0.1s; -webkit-tap-highlight-color: transparent; }
        .s6-mob-btn:active { opacity: 0.75; transform: scale(0.96); }
        .s6-mob-back { background: #374151 !important; flex: 0 0 44px; }
        .s6-drawer-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 300; display: flex; align-items: flex-end; }
        .s6-drawer { background: white; border-radius: 20px 20px 0 0; width: 100%; max-height: 82vh; overflow-y: auto; padding: 0 0 calc(16px + env(safe-area-inset-bottom)); animation: s6slideup 0.28s cubic-bezier(0.34,1.1,0.64,1); }
        @keyframes s6slideup { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .s6-drawer-handle { width: 36px; height: 4px; border-radius: 2px; background: #d1d5db; margin: 10px auto 0; }
        .s6-drawer-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 20px 10px; border-bottom: 1px solid #f0f4f8; }
        .s6-drawer-title { font-size: 16px; font-weight: 700; color: #0f172a; }
        .s6-drawer-close { background: #f1f5f9; border: none; border-radius: 50%; width: 30px; height: 30px; cursor: pointer; font-size: 14px; color: #64748b; display: flex; align-items: center; justify-content: center; }
        .s6-drawer-toggles { display: flex; gap: 10px; padding: 14px 20px; border-bottom: 1px solid #f0f4f8; }
        .s6-toggle-btn { flex: 1; padding: 10px 12px; border: 1.5px solid #e2e8f0; border-radius: 10px; background: #f8fafc; color: #334155; font-size: 13px; font-weight: 600; font-family: inherit; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.2s; }
        .s6-toggle-on    { background: #dcfce7; border-color: #22c55e; color: #15803d; }
        .s6-toggle-amber { background: #fef3c7; border-color: #f59e0b; color: #b45309; }
        .s6-drawer-fields { display: flex; flex-direction: column; gap: 0; padding: 8px 0; }
        .s6-drawer-field { display: flex; align-items: center; justify-content: space-between; padding: 12px 20px; border-bottom: 1px solid #f8fafc; }
        .s6-drawer-field-label { font-size: 13px; font-weight: 600; color: #334155; }
        .s6-drawer .s6-input, .s6-drawer .s6-sel { background: #f1f5f9; border-color: #e2e8f0; color: #0f172a; font-size: 13px; border-radius: 8px; padding: 7px 10px; width: 160px; }
        .s6-error-box { max-width: 600px; margin: 40px auto; padding: 24px; background: #fee2e2; border: 1px solid #fca5a5; border-radius: 12px; color: #991b1b; text-align: center; }
        @media print {
          .s6-desktop-toolbar, .s6-mobile-topbar, .s6-mobile-actions, .s6-stats-bar, .s6-drawer-backdrop { display: none !important; }
          .s6-root { padding-bottom: 0; }
          .s6-paper-wrapper { padding: 0; max-width: 100%; }
          .s6-paper-scroll { box-shadow: none; border-radius: 0; overflow: visible; }
          #paper-preview { position: absolute; left: 0; top: 0; width: 100%; padding: 20px; }
          [contenteditable] { outline: none !important; background: transparent !important; padding: 0 !important; }
        }
        @media (max-width: 768px) {
          .s6-desktop-toolbar { display: none; }
          .s6-mobile-topbar   { display: flex; }
          .s6-mobile-actions  { display: flex; }
          .s6-paper-wrapper { padding: 12px; }
          .s6-paper-scroll  { border-radius: 6px; }
          .s6-stats-bar { padding: 8px 14px; }
          .s6-stat { padding: 0 10px; }
          .s6-stat-val { font-size: 17px; }
          .s6-root { padding-bottom: 80px; }
        }
        @media (max-width: 480px) {
          .s6-paper-wrapper { padding: 8px; }
          .s6-stats-bar { gap: 0; }
          .s6-stat { padding: 0 8px; }
        }
      `}</style>
    </div>
  );
}