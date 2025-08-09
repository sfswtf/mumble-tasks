import React from 'react';
import { motion } from 'framer-motion';
import { FileAudio, Brain, Sparkles, CheckCircle } from 'lucide-react';

interface ProcessingIndicatorProps {
  progress: number;
  language?: string;
}

const getTranslations = (language: string) => {
  const translations = {
    en: {
      processing: 'Processing',
      preparingFile: 'Preparing audio file...',
      transcribing: 'Transcribing audio...',
      analyzing: 'Analyzing content...',
      almostDone: 'Almost done...',
      complete: 'Complete!'
    },
    no: {
      processing: 'Behandler',
      preparingFile: 'Forbereder lydfil...',
      transcribing: 'Transkriberer lyd...',
      analyzing: 'Analyserer innhold...',
      almostDone: 'Nesten ferdig...',
      complete: 'Ferdig!'
    }
  };
  return translations[language as keyof typeof translations] || translations.en;
};

const getProgressStage = (progress: number, t: any) => {
  if (progress < 10) {
    return { message: t.preparingFile, icon: FileAudio, color: 'blue' };
  } else if (progress < 70) {
    return { message: t.transcribing, icon: FileAudio, color: 'purple' };
  } else if (progress < 95) {
    return { message: t.analyzing, icon: Brain, color: 'orange' };
  } else if (progress < 100) {
    return { message: t.almostDone, icon: Sparkles, color: 'green' };
  } else {
    return { message: t.complete, icon: CheckCircle, color: 'green' };
  }
};

export default function ProcessingIndicator({ progress, language = 'en' }: ProcessingIndicatorProps) {
  const t = getTranslations(language);
  const stage = getProgressStage(progress, t);
  const Icon = stage.icon;

  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    purple: 'text-purple-600 bg-purple-100',
    orange: 'text-orange-600 bg-orange-100',
    green: 'text-green-600 bg-green-100'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-lg shadow-lg border p-6 max-w-md mx-auto"
    >
      <div className="space-y-6">
        {/* Header with icon and title */}
        <div className="text-center">
          <motion.div
            animate={{ 
              rotate: progress < 100 ? 360 : 0,
              scale: progress === 100 ? [1, 1.1, 1] : 1
            }}
            transition={{ 
              rotate: { duration: 2, repeat: progress < 100 ? Infinity : 0, ease: "linear" },
              scale: { duration: 0.5 }
            }}
            className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${colorClasses[stage.color as keyof typeof colorClasses]} mb-4`}
          >
            <Icon className="w-8 h-8" />
          </motion.div>
          <h3 className="text-lg font-semibold text-gray-800">{t.processing}</h3>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">{stage.message}</span>
            <span className="font-medium text-gray-800">{Math.round(progress)}%</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 rounded-full relative"
            >
              {/* Animated shine effect */}
              {progress < 100 && (
                <motion.div
                  animate={{ x: [-100, 300] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
                />
              )}
            </motion.div>
          </div>
        </div>

        {/* Progress stages indicator */}
        <div className="flex items-center justify-between text-xs">
          <div className={`flex flex-col items-center ${progress >= 10 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-3 h-3 rounded-full border-2 ${progress >= 10 ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`} />
            <span className="mt-1">Setup</span>
          </div>
          <div className="flex-1 h-px bg-gray-300 mx-2" />
          <div className={`flex flex-col items-center ${progress >= 70 ? 'text-purple-600' : 'text-gray-400'}`}>
            <div className={`w-3 h-3 rounded-full border-2 ${progress >= 70 ? 'bg-purple-500 border-purple-500' : 'border-gray-300'}`} />
            <span className="mt-1">Audio</span>
          </div>
          <div className="flex-1 h-px bg-gray-300 mx-2" />
          <div className={`flex flex-col items-center ${progress >= 95 ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-3 h-3 rounded-full border-2 ${progress >= 95 ? 'bg-green-500 border-green-500' : 'border-gray-300'}`} />
            <span className="mt-1">Analysis</span>
          </div>
        </div>

        {/* Additional info */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            {progress < 100 
              ? (language === 'no' 
                  ? 'Vennligst vent mens vi behandler lydfilen din...' 
                  : 'Please wait while we process your audio file...')
              : (language === 'no' 
                  ? 'Behandling fullført!' 
                  : 'Processing complete!')
            }
          </p>
        </div>
      </div>
    </motion.div>
  );
}