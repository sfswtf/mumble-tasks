import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, AlertCircle, Globe, Check } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../utils/languages';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuth: (email: string, password: string, isSignUp: boolean) => Promise<void>;
  language?: string;
}

const getTranslations = (language: string) => {
  const translations = {
    en: {
      welcomeBack: 'Welcome',
      email: 'Email',
      password: 'Password',
      signIn: 'Sign In',
      emailPlaceholder: 'your@email.com',
      passwordPlaceholder: '••••••••',
      dontHaveAccount: "Don't have an account?",
      requestAccess: 'Request Access',
      signingIn: 'Signing in...'
    },
    no: {
      welcomeBack: 'Velkommen',
      email: 'E-post',
      password: 'Passord',
      signIn: 'Logg Inn',
      emailPlaceholder: 'din@epost.no',
      passwordPlaceholder: '••••••••',
      dontHaveAccount: 'Har du ikke en konto?',
      requestAccess: 'Be om Tilgang',
      signingIn: 'Logger inn...'
    }
  };
  return translations[language as keyof typeof translations] || translations.no;
};

export default function AuthModal({ isOpen, onClose, onAuth, language }: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(language || 'no');
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  
  const t = getTranslations(selectedLanguage);

  const clearForm = () => {
    setEmail('');
    setPassword('');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await onAuth(email, password, false); // Always false since we're removing sign up
    } catch (error: any) {
      setError(error.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestAccess = () => {
    const subject = selectedLanguage === 'no' ? 'Forespørsel om tilgang til MumbleTasks' : 'Request access to MumbleTasks';
    const body = selectedLanguage === 'no' 
      ? 'Hei,\n\nJeg ønsker tilgang til MumbleTasks. Kan dere hjelpe meg med å opprette en konto?\n\nTakk!'
      : 'Hello,\n\nI would like to request access to MumbleTasks. Can you help me create an account?\n\nThank you!';
    
    const mailtoLink = `mailto:support@mumbletasks.no?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink, '_blank');
  };

  const handleLanguageSelect = (languageCode: string) => {
    setSelectedLanguage(languageCode);
    setShowLanguageDropdown(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-sm sm:max-w-md relative shadow-2xl"
          >
            {/* Header with Close button and Language selector */}
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <div className="relative">
                <button
                  onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                  className="inline-flex items-center justify-center space-x-2 px-3 py-1.5 bg-gray-50 rounded-lg hover:bg-gray-100 border border-gray-200 transition-colors"
                >
                  <span className="text-lg">
                    {SUPPORTED_LANGUAGES.find(lang => lang.code === selectedLanguage)?.flag}
                  </span>
                  <span className="text-xs text-gray-700">
                    {SUPPORTED_LANGUAGES.find(lang => lang.code === selectedLanguage)?.name}
                  </span>
                  <Globe className="w-3 h-3 text-gray-500" />
                </button>

                <AnimatePresence>
                  {showLanguageDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50"
                    >
                      <div className="py-1">
                        {SUPPORTED_LANGUAGES.map((language) => (
                          <button
                            key={language.code}
                            onClick={() => handleLanguageSelect(language.code)}
                            className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center space-x-3 text-sm"
                          >
                            <span className="text-base">{language.flag}</span>
                            <span className="flex-1">{language.name}</span>
                            {selectedLanguage === language.code && (
                              <Check className="w-3 h-3 text-green-500" />
                            )}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 z-10 p-1 touch-manipulation"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6">
              {t.welcomeBack}
            </h2>

            {/* Error Message Inside Modal */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2"
              >
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <span className="text-red-700 text-sm">{error}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {t.email}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 sm:pl-10 w-full p-3 sm:p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                    placeholder={t.emailPlaceholder}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {t.password}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 sm:pl-10 w-full p-3 sm:p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                    placeholder={t.passwordPlaceholder}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-500 text-white py-3 sm:py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation font-medium"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>{t.signingIn}</span>
                  </div>
                ) : (
                  t.signIn
                )}
              </button>
            </form>

            <div className="mt-4 sm:mt-6 text-center">
              <p className="text-sm text-gray-600 mb-3">
                {t.dontHaveAccount}
              </p>
              <button
                onClick={handleRequestAccess}
                className="px-4 py-2.5 sm:py-2 text-green-600 hover:text-green-700 font-medium hover:bg-green-50 rounded-lg transition-colors border border-green-200 hover:border-green-300 touch-manipulation"
              >
                {t.requestAccess}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}