import React from 'react';
import { motion } from 'framer-motion';
import { Check, Circle, ArrowRight } from 'lucide-react';
import { TranscriptionMode } from '../types';

interface StepProgressIndicatorProps {
  currentStep: string;
  mode: TranscriptionMode | null;
  language: string;
  onStepClick?: (step: string) => void;
  completedSteps?: string[];
}

const getStepsForMode = (mode: TranscriptionMode | null) => {
  if (!mode) return ['mode'];
  
  if (mode === 'tasks' || mode === 'meeting' || mode === 'script-generator') {
    return ['mode', 'language', 'record', 'process'];
  } else {
    return ['mode', 'customize', 'language', 'record', 'process'];
  }
};

const getStepLabels = (language: string) => {
  const labels = {
    en: {
      mode: 'Mode',
      customize: 'Customize',
      language: 'Language',
      record: 'Record',
      process: 'Process'
    },
    no: {
      mode: 'Modus',
      customize: 'Tilpass',
      language: 'Språk',
      record: 'Opptak',
      process: 'Behandle'
    }
  };
  
  return labels[language as keyof typeof labels] || labels.en;
};

export default function StepProgressIndicator({
  currentStep,
  mode,
  language,
  onStepClick,
  completedSteps = []
}: StepProgressIndicatorProps) {
  const steps = getStepsForMode(mode);
  const labels = getStepLabels(language);
  const currentStepIndex = steps.indexOf(currentStep);

  const canNavigateToStep = (stepIndex: number) => {
    return stepIndex <= currentStepIndex || completedSteps.includes(steps[stepIndex]);
  };

  if (steps.length <= 1) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isActive = step === currentStep;
          const isCompleted = completedSteps.includes(step) || index < currentStepIndex;
          const isClickable = canNavigateToStep(index) && onStepClick;
          
          return (
            <React.Fragment key={step}>
              <motion.div
                className="flex flex-col items-center"
                whileHover={isClickable ? { scale: 1.05 } : {}}
              >
                <button
                  onClick={() => isClickable && onStepClick(step)}
                  disabled={!isClickable}
                  className={`
                    relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200
                    ${isActive 
                      ? 'bg-blue-500 border-blue-500 text-white' 
                      : isCompleted 
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'bg-gray-100 border-gray-300 text-gray-500'
                    }
                    ${isClickable ? 'cursor-pointer hover:shadow-md' : 'cursor-not-allowed'}
                  `}
                >
                  {isCompleted && !isActive ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Circle 
                      className={`w-4 h-4 ${isActive ? 'fill-current' : ''}`} 
                    />
                  )}
                  
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-blue-300"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </button>
                
                <span className={`
                  mt-2 text-xs font-medium text-center
                  ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}
                `}>
                  {labels[step as keyof typeof labels] || step}
                </span>
              </motion.div>
              
              {index < steps.length - 1 && (
                <div className="flex-1 flex items-center justify-center px-2">
                  <ArrowRight 
                    className={`w-4 h-4 ${
                      index < currentStepIndex ? 'text-green-500' : 'text-gray-300'
                    }`} 
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
      
      <div className="mt-4 bg-gray-200 rounded-full h-2">
        <motion.div
          className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ 
            width: `${((currentStepIndex + 1) / steps.length) * 100}%` 
          }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
} 