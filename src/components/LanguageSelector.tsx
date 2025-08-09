import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Check } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../utils/languages';

interface LanguageSelectorProps {
  selectedLanguage: string;
  onLanguageSelect: (language: string) => void;
  autoDetected?: boolean;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onLanguageSelect,
  autoDetected = false
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center space-x-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 border border-gray-200 transition-colors"
      >
        <span className="text-xl">
          {SUPPORTED_LANGUAGES.find(lang => lang.code === selectedLanguage)?.flag}
        </span>
        <span className="text-sm text-gray-700">
          {SUPPORTED_LANGUAGES.find(lang => lang.code === selectedLanguage)?.name}
          {autoDetected && ' (Auto)'}
        </span>
        <Globe className="w-4 h-4 text-gray-500" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50"
          >
            <div className="py-1">
              {SUPPORTED_LANGUAGES.map((language) => (
                <button
                  key={language.code}
                  onClick={() => {
                    onLanguageSelect(language.code);
                    setIsOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3"
                >
                  <span className="text-xl">{language.flag}</span>
                  <span className="flex-1">{language.name}</span>
                  {selectedLanguage === language.code && (
                    <Check className="w-4 h-4 text-green-500" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSelector;