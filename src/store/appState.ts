import { create } from 'zustand';

export interface AppState {
  currentStep: 'mode' | 'customize' | 'language' | 'record' | 'process';
  selectedMode: 'tasks' | 'biography' | null;
  language: string;
  customization: {
    tone: string;
    targetAudience: string;
    style: string;
    additionalInstructions: string;
  };
  results: {
    content: string;
    title: string;
    timestamp: string;
  } | null;
  error: string | null;
}

export const useAppStore = create<AppState>((set) => ({
  currentStep: 'mode',
  selectedMode: null,
  language: 'en',
  customization: {
    tone: '',
    targetAudience: '',
    style: '',
    additionalInstructions: ''
  },
  results: null,
  error: null,

  setStep: (step: AppState['currentStep']) => set({ currentStep: step }),
  setMode: (mode: AppState['selectedMode']) => set({ selectedMode: mode }),
  setLanguage: (language: string) => set({ language }),
  setCustomization: (customization: AppState['customization']) => 
    set({ customization }),
  setResults: (results: AppState['results']) => set({ results }),
  setError: (error: string | null) => set({ error }),
  reset: () => set({
    currentStep: 'mode',
    selectedMode: null,
    language: 'en',
    customization: {
      tone: '',
      targetAudience: '',
      style: '',
      additionalInstructions: ''
    },
    results: null,
    error: null
  })
}));