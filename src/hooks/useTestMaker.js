import { useTestMakerStore } from '../stores/testMakerStore';
import * as apiService from '../services/api';

// ── Cache helpers ─────────────────────────────────────────────────────────────
// Boards and classes almost never change → 1 hour TTL
// Subjects change occasionally → 30 minute TTL
// Topics are content-heavy and specific → 15 minute TTL
const TTL = {
  boards:   60 * 60 * 1000,       // 1 hour
  classes:  60 * 60 * 1000,       // 1 hour
  subjects: 30 * 60 * 1000,       // 30 minutes
  topics:   15 * 60 * 1000,       // 15 minutes
  chapters: 15 * 60 * 1000,       // 15 minutes
};

function cacheGet(key) {
  try {
    const raw = localStorage.getItem(`_cache_${key}`);
    if (!raw) return null;
    const { data, ts, ttl } = JSON.parse(raw);
    if (Date.now() - ts > ttl) { localStorage.removeItem(`_cache_${key}`); return null; }
    return data;
  } catch { return null; }
}

function cacheSet(key, data, ttl) {
  try {
    localStorage.setItem(`_cache_${key}`, JSON.stringify({ data, ts: Date.now(), ttl }));
  } catch { /* storage full — fail silently */ }
}

function cacheClear(prefix) {
  Object.keys(localStorage)
    .filter(k => k.startsWith(`_cache_${prefix}`))
    .forEach(k => localStorage.removeItem(k));
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export const useTestMaker = () => {
  const store = useTestMakerStore();

  const goToStep = (step) => {
    if (step >= 1 && step <= 7) {
      store.setCurrentStep(step);
      window.scrollTo(0, 0);
    }
  };

  const goNext = () => { if (store.currentStep < 7) goToStep(store.currentStep + 1); };
  const goBack = () => { if (store.currentStep > 1) goToStep(store.currentStep - 1); };

  // ── loadBoards ──────────────────────────────────────────────────────────────
  const loadBoards = async () => {
    // 1. If Zustand already has boards in memory (no full reload), use them
    if (store.boards.length > 0) return store.boards;

    // 2. Check localStorage cache
    const cached = cacheGet('boards');
    if (cached) { store.setBoards(cached); return cached; }

    // 3. Fetch from API
    try {
      store.setIsLoading(true);
      store.clearError('boards');
      const data = await apiService.fetchBoards();
      const boards = data.boards || [];
      store.setBoards(boards);
      cacheSet('boards', boards, TTL.boards);

      // Prefetch classes for all boards in background (don't await)
      // Silently prefetch classes for all boards in background
      boards.forEach(b => loadClasses(b.board_id, true));

      return boards;
    } catch (error) {
      store.setError('boards', error.message);
      throw error;
    } finally {
      store.setIsLoading(false);
    }
  };

  // ── loadClasses ─────────────────────────────────────────────────────────────
  // silent=true: skip loading spinner (used for hover prefetch)
  const loadClasses = async (boardId, silent = false) => {
    if (store.classes.length > 0 && store.selectedBoard?.board_id === boardId)
      return store.classes;

    const cached = cacheGet(`classes_${boardId}`);
    if (cached) { if (!silent) store.setClasses(cached); return cached; }

    try {
      if (!silent) { store.setIsLoading(true); store.clearError('classes'); }
      const data = await apiService.fetchClasses(boardId);
      const classes = data.classes || [];
      cacheSet(`classes_${boardId}`, classes, TTL.classes);
      if (!silent) store.setClasses(classes);
      return classes;
    } catch (error) {
      if (!silent) store.setError('classes', error.message);
      // silent prefetch errors are swallowed
    } finally {
      if (!silent) store.setIsLoading(false);
    }
  };

  // ── loadSubjects ────────────────────────────────────────────────────────────
  // silent=true: skip loading spinner (used for hover prefetch)
  const loadSubjects = async (classId, silent = false) => {
    if (store.subjects.length > 0 && store.selectedClass?.class_id === classId)
      return store.subjects;

    const cached = cacheGet(`subjects_${classId}`);
    if (cached) { if (!silent) store.setSubjects(cached); return cached; }

    try {
      if (!silent) { store.setIsLoading(true); store.clearError('subjects'); }
      const data = await apiService.fetchSubjects(classId);
      const subjects = data.subjects || [];
      cacheSet(`subjects_${classId}`, subjects, TTL.subjects);
      if (!silent) store.setSubjects(subjects);
      return subjects;
    } catch (error) {
      if (!silent) store.setError('subjects', error.message);
    } finally {
      if (!silent) store.setIsLoading(false);
    }
  };

  // ── loadTopics ──────────────────────────────────────────────────────────────
  // silent=true: skip loading spinner (used for hover prefetch)
  const loadTopics = async (subjectId, silent = false) => {
    if (store.chapters.length > 0 && store.selectedSubject?.subject_id === subjectId)
      return store.chapters;

    const cached = cacheGet(`topics_${subjectId}`);
    if (cached) { if (!silent) store.setChapters(cached); return cached; }

    try {
      if (!silent) { store.setIsLoading(true); store.clearError('topics'); }
      const data = await apiService.fetchTopics(subjectId);
      const chapters = data.data || [];
      cacheSet(`topics_${subjectId}`, chapters, TTL.topics);
      if (!silent) store.setChapters(chapters);
      return chapters;
    } catch (error) {
      if (!silent) store.setError('topics', error.message);
    } finally {
      if (!silent) store.setIsLoading(false);
    }
  };

  // ── loadPaperConfig ─────────────────────────────────────────────────────────
  const loadPaperConfig = async (subjectId) => {
    try {
      store.setIsLoading(true);
      store.clearError('config');
      const filters = {
        chapter_ids:       localStorage.getItem('chapter_ids')       || null,
        topics:            localStorage.getItem('topics')            || null,
        exercise_question: localStorage.getItem('exercise_question') || null,
      };
      const data = await apiService.fetchPaperConfig(subjectId, filters);
      store.setPaperConfig(data);
      return data;
    } catch (error) {
      store.setError('config', error.message);
      throw error;
    } finally {
      store.setIsLoading(false);
    }
  };

  // ── loadQuestions ───────────────────────────────────────────────────────────
  const loadQuestions = async (payload) => {
    try {
      store.setIsLoading(true);
      store.clearError('questions');
      const data = await apiService.fetchQuestions(payload);
      return data.questions || [];
    } catch (error) {
      store.setError('questions', error.message);
      throw error;
    } finally {
      store.setIsLoading(false);
    }
  };

  // ── generatePaper ───────────────────────────────────────────────────────────
  const generatePaper = async (payload) => {
    try {
      store.setIsLoading(true);
      store.clearError('generate');
      const data = await apiService.generateQuestions(payload);
      return data;
    } catch (error) {
      store.setError('generate', error.message);
      throw error;
    } finally {
      store.setIsLoading(false);
    }
  };

  // ── Cache management (expose so pages can call if needed) ───────────────────
  const clearCache = (prefix) => cacheClear(prefix || '');

  return {
    currentStep:       store.currentStep,
    selectedBoard:     store.selectedBoard,
    selectedClass:     store.selectedClass,
    selectedSubject:   store.selectedSubject,
    selectedTopics:    store.selectedTopics,
    boards:            store.boards,
    classes:           store.classes,
    subjects:          store.subjects,
    chapters:          store.chapters,
    paperConfig:       store.paperConfig,
    questionsBank:     store.questionsBank,
    selectedQuestions: store.selectedQuestions,
    isLoading:         store.isLoading,
    errors:            store.errors,

    setCurrentStep:      store.setCurrentStep,
    setSelectedBoard:    store.setSelectedBoard,
    setSelectedClass:    store.setSelectedClass,
    setSelectedSubject:  store.setSelectedSubject,
    setSelectedTopics:   store.setSelectedTopics,
    setSelectedQuestions: store.setSelectedQuestions,
    setIsLoading:        store.setIsLoading,
    setError:            store.setError,
    clearError:          store.clearError,

    goToStep,
    goNext,
    goBack,

    loadBoards,
    loadClasses,
    loadSubjects,
    loadTopics,
    loadPaperConfig,
    loadQuestions,
    generatePaper,
    clearCache,

    resetAll: store.resetAll,
  };
};

// _prefetchClasses removed — loadClasses(id, true) handles silent prefetch