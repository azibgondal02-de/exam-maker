import axios from 'axios';

import API_BASE_URL from './config';

const getAuthToken = () => {
  return localStorage.getItem('auth_token') || '';
};

const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

API.interceptors.request.use((config) => {
  config.headers['Content-Type'] = 'application/json';
  config.headers['Authorization'] = `Bearer ${getAuthToken()}`;
  return config;
});

API.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // If token is invalid or expired → clear token and redirect to login
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
      return;
    }
    const message = error.response?.data?.detail || error.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export const fetchBoards = async () => {
  return API.get('get_boards');
};

export const fetchClasses = async (boardId) => {
  return API.get(`get_classes_against_board/${boardId}`);
};

export const fetchSubjects = async (classId) => {
  return API.get(`get_subjects_against_class_board/${classId}`);
};

export const fetchTopics = async (subjectId) => {
  return API.get(`get_topics_against_subject/${subjectId}`);
};

export const fetchChapters = async (subjectId) => {
  return API.get(`get_chapters_against_subject/${subjectId}`);
};

export const fetchPaperConfig = async (subjectId) => {
  return API.get(`paper-config/${subjectId}`);
};

export const fetchQuestions = async (payload) => {
  return API.post('get_questions', payload);
};

export const generateQuestions = async (payload) => {
  return API.post('generate-questions', payload);
};

export default API;
