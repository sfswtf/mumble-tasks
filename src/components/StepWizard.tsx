import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Play, Mic } from 'lucide-react';
import UploadSection from './UploadSection';
import RecordAudio from './RecordAudio';
import { ProfileContext } from '../types';
import { ProfileContextForm } from './ProfileContextForm';

interface StepWizardProps {
  currentStep: 'language' | 'record' | 'process';
  selectedLanguage: string;
  selectedFile: File | null;
  onLanguageSelect: (language: string) => void;
  onFileSelect: (file: File) => void;
  onProcess: () => void;
  isProcessing: boolean;
  mode: 'tasks' | 'meeting';
  profileContext: ProfileContext;
  onProfileContextChange: (next: ProfileContext) => void;
}

export default function StepWizard({
  currentStep,
  selectedLanguage,
  selectedFile,
  onLanguageSelect,
  onFileSelect,
  onProcess,
  isProcessing,
  mode,
  profileContext,
  onProfileContextChange
}: StepWizardProps) {
  const [error, setError] = useState<string | null>(null);

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleFileSelected = (file: File) => {
    onFileSelect(file);
  };

  const getTranslations = (language: string) => {
    const translations = {
      en: {
        selectLanguage: 'Language Selected',
        languageNote: `Content will be processed in ${language === 'en' ? 'English' : 'Norwegian'}`,
        recordNew: 'Record a new voice memo',
        uploadExisting: 'Upload an existing audio file',
        process: 'Process your audio',
        startProcessing: 'Start Processing',
        processing: 'Processing...',
        error: 'An error occurred. Please try again.',
        continue: 'Continue to Recording'
      },
      no: {
        selectLanguage: 'Språk Valgt',
        languageNote: `Innhold vil bli behandlet på ${language === 'en' ? 'engelsk' : 'norsk'}`,
        recordNew: 'Ta opp et nytt lydmemo',
        uploadExisting: 'Last opp en eksisterende lydfil',
        process: 'Behandle lyden din',
        startProcessing: 'Start Behandling',
        processing: 'Behandler...',
        error: 'En feil oppstod. Prøv igjen.',
        continue: 'Fortsett til Opptak'
      }
    };
    return translations[language as keyof typeof translations] || translations.en;
  };

  const t = getTranslations(selectedLanguage);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <AnimatePresence mode="wait">
        {currentStep === 'language' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <span className="text-2xl">
                  {selectedLanguage === 'en' ? '🇺🇸' : '🇳🇴'}
                </span>
                <h3 className="text-lg font-semibold text-green-800">
                  {t.selectLanguage}
                </h3>
              </div>
              <p className="text-green-700 mb-4">{t.languageNote}</p>
              <button
                onClick={() => onLanguageSelect(selectedLanguage)}
                className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                {t.continue}
              </button>
            </div>
          </motion.div>
        )}

        {currentStep === 'record' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
            id="record-upload-section"
          >
            <ProfileContextForm
              value={profileContext}
              onChange={onProfileContextChange}
              language={selectedLanguage}
            />

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {selectedLanguage === 'en' ? 'Add Your Audio' : 'Legg til Lyden Din'}
              </h2>
              <p className="text-gray-600">
                {selectedLanguage === 'en' 
                  ? 'Choose how you want to provide your audio content' 
                  : 'Velg hvordan du vil gi lydinnholdet ditt'
                }
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 min-h-[400px]">
              {/* Record Audio */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-xl shadow-lg border-2 border-dashed border-gray-200 hover:border-blue-400 transition-all duration-300 p-6"
                id="record-audio-section"
              >
                <div className="text-center mb-4">
                  <div className="bg-blue-100 rounded-full p-3 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                    <Mic className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {selectedLanguage === 'en' ? 'Record Audio' : 'Ta opp Lyd'}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">{t.recordNew}</p>
                </div>
                <RecordAudio
                  onRecordingComplete={onFileSelect}
                  language={selectedLanguage}
                />
              </motion.div>

              {/* Upload Audio */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-xl shadow-lg border-2 border-dashed border-gray-200 hover:border-green-400 transition-all duration-300 p-6"
                id="upload-audio-section"
              >
                <div className="text-center mb-4">
                  <div className="bg-green-100 rounded-full p-3 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                    <Upload className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {selectedLanguage === 'en' ? 'Upload File' : 'Last opp Fil'}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">{t.uploadExisting}</p>
                </div>
                <UploadSection
                  onFileSelected={handleFileSelected}
                  onError={handleError}
                  language={selectedLanguage}
                />
              </motion.div>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
                {error}
              </div>
            )}
          </motion.div>
        )}

        {currentStep === 'process' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
            id="process-audio-section"
          >
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="bg-blue-100 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <Play className="w-10 h-10 text-blue-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-800 mb-4">{t.process}</h2>
              
              {selectedFile && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                    <span className="font-medium">
                      {selectedLanguage === 'en' ? 'Selected file:' : 'Valgt fil:'}
                    </span>
                    <span className="truncate max-w-xs">{selectedFile.name}</span>
                    <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                      {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
                    </span>
                  </div>
                </div>
              )}
              
              <div className="flex justify-center">
                <button
                  onClick={onProcess}
                  disabled={isProcessing || !selectedFile}
                  className={`flex items-center space-x-3 px-8 py-4 rounded-lg font-medium text-lg transition-all duration-200 ${
                    isProcessing || !selectedFile
                      ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                      : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      <span>{t.processing}</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-6 h-6" />
                      <span>{t.startProcessing}</span>
                    </>
                  )}
                </button>
              </div>
              
              {!selectedFile && (
                <p className="text-sm text-red-500 mt-4">
                  {selectedLanguage === 'en' 
                    ? 'Please select an audio file first' 
                    : 'Velg en lydfil først'
                  }
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}