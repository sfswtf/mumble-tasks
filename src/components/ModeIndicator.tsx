import React from 'react';
import { motion } from 'framer-motion';
import { ListTodo, Users, BookOpen, Newspaper, ArrowLeft, Video, FileText } from 'lucide-react';
import { TranscriptionMode } from '../types';

interface ModeIndicatorProps {
  currentMode: TranscriptionMode | null;
  currentStep: string;
  onBackToModeSelection: () => void;
  language: string;
}

const getModeConfig = (mode: TranscriptionMode | null, language: string) => {
  const configs = {
    en: {
      tasks: { 
        icon: ListTodo, 
        name: 'Task List', 
        color: 'blue',
        description: 'Converting voice to actionable tasks'
      },
      meeting: { 
        icon: Users, 
        name: 'Meeting Notes', 
        color: 'green',
        description: 'Capturing meeting insights'
      },
      article: { 
        icon: Newspaper, 
        name: 'Article', 
        color: 'orange',
        description: 'Creating structured articles'
      },
      'content-creator': { 
        icon: Video, 
        name: 'Content Creator', 
        color: 'red',
        description: 'Transform your voice into engaging content for social media platforms'
      },
      'professional-documents': { 
        icon: FileText, 
        name: 'Professional Documents', 
        color: 'purple',
        description: 'Generate professional documents from your audio recordings'
      }
    },
    no: {
      tasks: { 
        icon: ListTodo, 
        name: 'Oppgaveliste', 
        color: 'blue',
        description: 'Konverterer tale til oppgaver'
      },
      meeting: { 
        icon: Users, 
        name: 'Møtenotater', 
        color: 'green',
        description: 'Fanger møteinnsikt'
      },
      article: { 
        icon: Newspaper, 
        name: 'Artikkel', 
        color: 'orange',
        description: 'Lager strukturerte artikler'
      },
      'content-creator': { 
        icon: Video, 
        name: 'Innholdsproduksjon', 
        color: 'red',
        description: 'Gjør stemmen din om til engasjerende innhold for sosiale medier'
      },
      'professional-documents': { 
        icon: FileText, 
        name: 'Profesjonelle Dokumenter', 
        color: 'purple',
        description: 'Generer profesjonelle dokumenter fra lydopptakene dine'
      }
    }
  };

  const langConfigs = configs[language as keyof typeof configs] || configs.en;
  return mode ? langConfigs[mode as keyof typeof langConfigs] : null;
};

const getStepName = (step: string, language: string) => {
  const steps = {
    en: {
      mode: 'Select Mode',
      type: 'Select Type',
      customize: 'Customize',
      language: 'Select Language',
      record: 'Record Audio',
      process: 'Process'
    },
    no: {
      mode: 'Velg Modus',
      type: 'Velg Type',
      customize: 'Tilpass',
      language: 'Velg Språk',
      record: 'Ta opp Lyd',
      process: 'Behandle'
    }
  };
  
  const langSteps = steps[language as keyof typeof steps] || steps.en;
  return langSteps[step as keyof typeof langSteps] || step;
};

export default function ModeIndicator({ 
  currentMode, 
  currentStep, 
  onBackToModeSelection, 
  language 
}: ModeIndicatorProps) {
  const modeConfig = getModeConfig(currentMode, language);
  
  if (!currentMode || currentStep === 'mode') {
    return null;
  }

  const Icon = modeConfig?.icon || BookOpen;
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
    green: 'bg-green-100 text-green-800 border-green-200',
    orange: 'bg-orange-100 text-orange-800 border-orange-200',
    purple: 'bg-purple-100 text-purple-800 border-purple-200',
    red: 'bg-red-100 text-red-800 border-red-200'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-md border border-gray-200 p-4 mb-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBackToModeSelection}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title={language === 'no' ? 'Tilbake til modusvalg' : 'Back to mode selection'}
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${colorClasses[modeConfig?.color as keyof typeof colorClasses] || colorClasses.purple}`}>
              <Icon className="w-5 h-5" />
            </div>
            
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-gray-900">{modeConfig?.name}</h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${colorClasses[modeConfig?.color as keyof typeof colorClasses] || colorClasses.purple}`}>
                  {getStepName(currentStep, language)}
                </span>
              </div>
              <p className="text-sm text-gray-600">{modeConfig?.description}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
} 