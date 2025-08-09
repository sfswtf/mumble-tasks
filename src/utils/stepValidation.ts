import { AppState } from '../store/appState';

export const validateStep = (currentStep: AppState['currentStep'], state: AppState): boolean => {
  switch (currentStep) {
    case 'mode':
      return true; // Initial step
    case 'customize':
      return !!state.selectedMode;
    case 'language':
      return !!state.customization.tone || state.selectedMode === 'tasks';
    case 'record':
      return !!state.language;
    case 'process':
      return true; // Validated by component
    default:
      return false;
  }
};