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

// POST — dedupe by subjectId + filters fingerprint so rapid re-mounts
// (React StrictMode, back-navigation) don't fire a second request
export const fetchPaperConfig = (subjectId, filters = {}) => {
  const key = `paper-config_${subjectId}_${filters.chapter_ids || ''}_${filters.topics || ''}_${filters.exercise_question || ''}`;
  return dedupe(key, () =>
    API.post(`paper-config/${subjectId}`, {
      chapter_ids:       filters.chapter_ids       || null,
      topics:            filters.topics            || null,
      exercise_question: filters.exercise_question || null,
    })
  );
};

export const fetchQuestions = (payload) =>
  API.post('get_questions', payload);

// Paper generation — dedupe by payload fingerprint so StrictMode double-fire
// and accidental re-mounts don't trigger a second heavy request
export const generateQuestions = (payload) => {
  const key = `generate_${JSON.stringify(payload)}`;
  return dedupe(key, () => API_HEAVY.post('generate-questions', payload));
};

// ── Admin API ─────────────────────────────────────────────────────────────────
export const fetchUsers = () =>
  API.get('admin/users');

export const createUser = (payload) =>
  API.post('admin/users', payload);

export const updateUser = (userCode, payload) =>
  API.put(`admin/users/${userCode}`, payload);

export const uploadLogo = (userCode, imageBase64) =>
  API.post(`admin/users/${userCode}/logo`, { image_base64: imageBase64 });

export const updatePermissions = (userCode, classIds) =>
  API.put(`admin/users/${userCode}/permissions`, { class_ids: classIds });

export default API;