import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuth: (email: string, password: string, isSignUp: boolean) => Promise<void>;
  language?: string;
}

const getTranslations = (language: string) => {
  const translations = {
    en: {
      welcomeBack: 'Welcome Back',
      createAccount: 'Create Account',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      signIn: 'Sign In',
      signUp: 'Sign Up',
      emailPlaceholder: 'your@email.com',
      passwordPlaceholder: '••••••••',
      confirmPasswordPlaceholder: '••••••••',
      dontHaveAccount: "Don't have an account?",
      alreadyHaveAccount: 'Already have an account?',
      passwordsDontMatch: 'Passwords do not match',
      signingIn: 'Signing in...',
      creatingAccount: 'Creating account...'
    },
    no: {
      welcomeBack: 'Velkommen Tilbake',
      createAccount: 'Opprett Konto',
      email: 'E-post',
      password: 'Passord',
      confirmPassword: 'Bekreft Passord',
      signIn: 'Logg Inn',
      signUp: 'Registrer Deg',
      emailPlaceholder: 'din@epost.no',
      passwordPlaceholder: '••••••••',
      confirmPasswordPlaceholder: '••••••••',
      dontHaveAccount: 'Har du ikke en konto?',
      alreadyHaveAccount: 'Har du allerede en konto?',
      passwordsDontMatch: 'Passordene stemmer ikke overens',
      signingIn: 'Logger inn...',
      creatingAccount: 'Oppretter konto...'
    }
  };
  return translations[language as keyof typeof translations] || translations.en;
};

export default function AuthModal({ isOpen, onClose, onAuth, language = 'en' }: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const t = getTranslations(language);

  const clearForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError(null);
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    clearForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate passwords match for sign up
    if (isSignUp && password !== confirmPassword) {
      setError(t.passwordsDontMatch);
      return;
    }

    setIsLoading(true);

    try {
      await onAuth(email, password, isSignUp);
    } catch (error: any) {
      setError(error.message || (isSignUp ? 'Failed to create account' : 'Failed to sign in'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 w-full max-w-md relative shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-bold text-center mb-6">
              {isSignUp ? t.createAccount : t.welcomeBack}
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
                  <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={t.passwordPlaceholder}
                    required
                  />
                </div>
              </div>

              {/* Confirm Password Field - Only for Sign Up */}
              {isSignUp && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <label className="block text-sm font-medium text-gray-700">
                    {t.confirmPassword}
                  </label>
                  <div className="relative">
                    <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={t.confirmPasswordPlaceholder}
                      required
                    />
                  </div>
                </motion.div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>{isSignUp ? t.creatingAccount : t.signingIn}</span>
                  </div>
                ) : (
                  isSignUp ? t.signUp : t.signIn
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {isSignUp ? t.alreadyHaveAccount : t.dontHaveAccount}
              </p>
              <button
                onClick={toggleMode}
                className="mt-2 px-4 py-2 text-blue-500 hover:text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-colors"
              >
                {isSignUp ? t.signIn : t.signUp}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}