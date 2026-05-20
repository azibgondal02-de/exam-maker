import { useTestMakerStore } from '../stores/testMakerStore';
import * as apiService from '../services/api';

export const useTestMaker = () => {
  const store = useTestMakerStore();

  const goToStep = (step) => {
    if (step >= 1 && step <= 7) {
      store.setCurrentStep(step);
      window.scrollTo(0, 0);
    }
  };

  const goNext = () => {
    if (store.currentStep < 7) {
      goToStep(store.currentStep + 1);
    }
  };

  const goBack = () => {
    if (store.currentStep > 1) {
      goToStep(store.currentStep - 1);
    }
  };

  const loadBoards = async () => {
    try {
      store.setIsLoading(true);
      store.clearError('boards');
      const data = await apiService.fetchBoards();
      store.setBoards(data.boards || []);
      return data.boards;
    } catch (error) {
      store.setError('boards', error.message);
      throw error;
    } finally {
      store.setIsLoading(false);
    }
  };

  const loadClasses = async (boardId) => {
    try {
      store.setIsLoading(true);
      store.clearError('classes');
      const data = await apiService.fetchClasses(boardId);
      store.setClasses(data.classes || []);
      return data.classes;
    } catch (error) {
      store.setError('classes', error.message);
      throw error;
    } finally {
      store.setIsLoading(false);
    }
  };

  const loadSubjects = async (classId) => {
    try {
      store.setIsLoading(true);
      store.clearError('subjects');
      const data = await apiService.fetchSubjects(classId);
      store.setSubjects(data.subjects || []);
      return data.subjects;
    } catch (error) {
      store.setError('subjects', error.message);
      throw error;
    } finally {
      store.setIsLoading(false);
    }
  };

  const loadTopics = async (subjectId) => {
    try {
      store.setIsLoading(true);
      store.clearError('topics');
      const data = await apiService.fetchTopics(subjectId);
      store.setChapters(data.data || []);
      return data.data;
    } catch (error) {
      store.setError('topics', error.message);
      throw error;
    } finally {
      store.setIsLoading(false);
    }
  };

  const loadPaperConfig = async (subjectId) => {
    try {
      store.setIsLoading(true);
      store.clearError('config');
      const data = await apiService.fetchPaperConfig(subjectId);
      store.setPaperConfig(data);
      return data;
    } catch (error) {
      store.setError('config', error.message);
      throw error;
    } finally {
      store.setIsLoading(false);
    }
  };

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

  return {
    currentStep: store.currentStep,
    selectedBoard: store.selectedBoard,
    selectedClass: store.selectedClass,
    selectedSubject: store.selectedSubject,
    selectedTopics: store.selectedTopics,
    boards: store.boards,
    classes: store.classes,
    subjects: store.subjects,
    chapters: store.chapters,
    paperConfig: store.paperConfig,
    questionsBank: store.questionsBank,
    selectedQuestions: store.selectedQuestions,
    isLoading: store.isLoading,
    errors: store.errors,

    setCurrentStep: store.setCurrentStep,
    setSelectedBoard: store.setSelectedBoard,
    setSelectedClass: store.setSelectedClass,
    setSelectedSubject: store.setSelectedSubject,
    setSelectedTopics: store.setSelectedTopics,
    setSelectedQuestions: store.setSelectedQuestions,
    setIsLoading: store.setIsLoading,
    setError: store.setError,
    clearError: store.clearError,

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

    resetAll: store.resetAll,
  };
};