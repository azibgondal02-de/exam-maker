import axios from 'axios';
import API_BASE_URL from './config';

const getAuthToken = () => localStorage.getItem('auth_token') || '';

// ── Different timeouts per request type ──────────────────────────────────────
const API = axios.create({ baseURL: API_BASE_URL, timeout: 15000 });

// Separate instance for heavy operations (paper generation)
const API_HEAVY = axios.create({ baseURL: API_BASE_URL, timeout: 60000 });

const authInterceptor = (config) => {
  config.headers['Content-Type'] = 'application/json';
  config.headers['Authorization'] = `Bearer ${getAuthToken()}`;
  return config;
};

const errorInterceptor = (error) => {
  if (error.response?.status === 401 || error.response?.status === 403) {
    localStorage.removeItem('auth_token');
    window.location.href = '/login';
    return;
  }
  const message = error.response?.data?.detail || error.message || 'Something went wrong';
  return Promise.reject(new Error(message));
};

API.interceptors.request.use(authInterceptor);
API.interceptors.response.use((r) => r.data, errorInterceptor);

API_HEAVY.interceptors.request.use(authInterceptor);
API_HEAVY.interceptors.response.use((r) => r.data, errorInterceptor);

// ── In-flight request deduplication ─────────────────────────────────────────
// Prevents duplicate API calls when React StrictMode double-fires useEffect
// or user clicks rapidly. Same key = same pending promise returned.
const inFlight = new Map();

function dedupe(key, fn) {
  if (inFlight.has(key)) return inFlight.get(key);
  const promise = fn().finally(() => inFlight.delete(key));
  inFlight.set(key, promise);
  return promise;
}

// ── API functions ─────────────────────────────────────────────────────────────
export const fetchBoards = () =>
  dedupe('boards', () => API.get('get_boards'));

export const fetchClasses = (boardId) =>
  dedupe(`classes_${boardId}`, () => API.get(`get_classes_against_board/${boardId}`));

export const fetchSubjects = (classId) =>
  dedupe(`subjects_${classId}`, () => API.get(`get_subjects_against_class_board/${classId}`));

export const fetchTopics = (subjectId) =>
  dedupe(`topics_${subjectId}`, () => API.get(`get_topics_against_subject/${subjectId}`));

export const fetchChapters = (subjectId) =>
  dedupe(`chapters_${subjectId}`, () => API.get(`get_chapters_against_subject/${subjectId}`));

export const fetchPaperConfig = (subjectId, filters = {}) =>
  API.post(`paper-config/${subjectId}`, {
    chapter_ids:       filters.chapter_ids       || null,
    topics:            filters.topics            || null,
    exercise_question: filters.exercise_question || null,
  });

export const fetchQuestions = (payload) =>
  API.post('get_questions', payload);

// Paper generation uses the heavy instance (60s timeout)
export const generateQuestions = (payload) =>
  API_HEAVY.post('generate-questions', payload);

export default API;