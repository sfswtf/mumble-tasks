import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Code, Info } from 'lucide-react';

interface PromptPreviewProps {
  systemPrompt: string;
  language: string;
  isVisible: boolean;
  onToggle: () => void;
}

const getPromptPreviewTranslations = (language: string) => {
  const translations = {
    en: {
      title: 'AI Instructions Preview',
      description: 'See exactly what instructions are being sent to the AI',
      showPrompt: 'Show AI Instructions',
      hidePrompt: 'Hide AI Instructions',
      promptLength: 'Prompt Length',
      characters: 'characters',
      tip: 'These instructions guide how the AI processes your audio content'
    },
    no: {
      title: 'Forhåndsvisning av AI-instrukser',
      description: 'Se nøyaktig hvilke instrukser som sendes til AI-en',
      showPrompt: 'Vis AI-instrukser',
      hidePrompt: 'Skjul AI-instrukser',
      promptLength: 'Instrukslengde',
      characters: 'tegn',
      tip: 'Disse instruksene styrer hvordan AI-en behandler lydinnholdet ditt'
    }
  };
  return translations[language as keyof typeof translations] || translations.en;
};

const PromptPreview: React.FC<PromptPreviewProps> = ({
  systemPrompt,
  language,
  isVisible,
  onToggle
}) => {
  const t = getPromptPreviewTranslations(language);

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Code className="w-5 h-5 text-blue-600" />
          <h3 className="font-medium text-blue-800">{t.title}</h3>
        </div>
        <button
          onClick={onToggle}
          className="flex items-center space-x-2 px-3 py-1.5 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors text-sm"
        >
          {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          <span>{isVisible ? t.hidePrompt : t.showPrompt}</span>
        </button>
      </div>
      
      <div className="flex items-center space-x-2 text-sm text-blue-600 mb-2">
        <Info className="w-4 h-4" />
        <span>{t.tip}</span>
      </div>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="bg-white rounded-lg p-4 border border-blue-200 mt-3">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-600">
                  {t.promptLength}: {systemPrompt.length} {t.characters}
                </span>
              </div>
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono bg-gray-50 p-3 rounded border max-h-64 overflow-y-auto">
                {systemPrompt}
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PromptPreview;
