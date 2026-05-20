import { create } from 'zustand';

export const useTestMakerStore = create((set) => ({
  currentStep: 1,
  setCurrentStep: (step) => set({ currentStep: step }),

  selectedBoard: null,
  setSelectedBoard: (board) => set({ selectedBoard: board }),

  selectedClass: null,
  setSelectedClass: (cls) => set({ selectedClass: cls }),

  selectedSubject: null,
  setSelectedSubject: (subject) => set({ selectedSubject: subject }),

  selectedTopics: [],
  setSelectedTopics: (topics) => set({ selectedTopics: topics }),

  boards: [],
  setBoards: (boards) => set({ boards }),

  classes: [],
  setClasses: (classes) => set({ classes }),

  subjects: [],
  setSubjects: (subjects) => set({ subjects }),

  chapters: [],
  setChapters: (chapters) => set({ chapters }),

  paperConfig: null,
  setPaperConfig: (config) => set({ paperConfig: config }),

  questionsBank: {},
  setQuestionsBank: (questions) => set({ questionsBank: questions }),

  selectedQuestions: {},
  setSelectedQuestions: (questions) => set({ selectedQuestions: questions }),

  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),

  errors: {},
  setError: (field, error) => set((state) => ({
    errors: { ...state.errors, [field]: error }
  })),
  clearError: (field) => set((state) => ({
    errors: { ...state.errors, [field]: null }
  })),

  resetAll: () => set({
    currentStep: 1,
    selectedBoard: null,
    selectedClass: null,
    selectedSubject: null,
    selectedTopics: [],
    boards: [],
    classes: [],
    subjects: [],
    chapters: [],
    paperConfig: null,
    questionsBank: {},
    selectedQuestions: {},
    isLoading: false,
    errors: {},
  }),
}));