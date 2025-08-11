import React, { useState } from 'react';
import { FileAudio, LogOut, User, Globe } from 'lucide-react';
import type { User as UserType } from '../types';

interface LanguageSelectorProps {
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
  className?: string;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onLanguageChange,
  className = ''
}) => {
  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'no', name: 'Norsk', flag: '🇳🇴' }
  ];

  const currentLanguage = languages.find(lang => lang.code === selectedLanguage) || languages[0];

  return (
    <div className={`relative group ${className}`}>
      <div className="flex items-center space-x-1 px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
        <span className="text-lg">{currentLanguage.flag}</span>
        <span className="text-sm font-medium text-gray-700">{currentLanguage.code.toUpperCase()}</span>
        <Globe className="w-4 h-4 text-gray-500" />
      </div>
      
      <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 min-w-[140px]">
        {languages.map((language) => (
          <button
            key={language.code}
            onClick={() => onLanguageChange(language.code)}
            className={`w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3 first:rounded-t-lg last:rounded-b-lg transition-colors ${
              selectedLanguage === language.code ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
            }`}
          >
            <span className="text-lg">{language.flag}</span>
            <span className="font-medium">{language.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

const getTranslations = (language: string) => {
  const translations = {
    en: {
      title: 'Mumble Tasks',
      subtitle: 'What are you talking about?',
      signIn: 'Sign In',
      signOut: 'Sign Out',
      profile: 'Profile'
    },
    no: {
      title: 'Mumble Tasks',
      subtitle: 'Hva snakker du om?',
      signIn: 'Logg Inn',
      signOut: 'Logg Ut',
      profile: 'Profil'
    }
  };
  return translations[language as keyof typeof translations] || translations.en;
};

interface HeaderProps {
  user: UserType | null;
  onAuthClick: () => void;
  onSignOut: () => void;
  language: string;
  onLanguageChange: (language: string) => void;
  onNavigateHome: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  user, 
  onAuthClick, 
  onSignOut, 
  language, 
  onLanguageChange, 
  onNavigateHome
}) => {
  const t = getTranslations(language);
  const [isLogoHovered, setIsLogoHovered] = useState(false);

  const handleLanguageChange = (lang: string) => {
    onLanguageChange(lang);
    localStorage.setItem('preferredLanguage', lang);
  };

  return (
    <header 
      className="bg-white shadow-lg border-b border-gray-100 sticky top-0 z-40"
      role="banner"
    >
      <div className="container mx-auto px-4 py-3 sm:py-4 max-w-5xl">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div 
            className="flex items-center cursor-pointer transition-all duration-200 hover:opacity-90"
            onClick={onNavigateHome}
            onMouseEnter={() => setIsLogoHovered(true)}
            onMouseLeave={() => setIsLogoHovered(false)}
            aria-label="Go to home page"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onNavigateHome()}
          >
            <div className="flex items-center space-x-4">
              {/* Logo Container with Professional Styling */}
              <div className="relative p-1 rounded-lg bg-gradient-to-br from-white to-gray-50 shadow-sm border border-gray-100">
                <img 
                  src="/assets/images/mumble-logo.png"
                  alt="Mumble Tasks Logo"
                  className="h-8 w-auto sm:h-10 lg:h-12 transition-all duration-200"
                  onError={(e) => {
                    // Fallback to a default design if logo fails to load
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = `
                      <div class="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <svg class="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 14l9-5-9-5-9 5 9 5z"/>
                          <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
                        </svg>
                      </div>
                    `;
                  }}
                />
              </div>
              
              {/* Brand Text - Always visible for professional look */}
              <div className="flex flex-col">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800 leading-tight tracking-tight">
                  MumbleTasks
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 font-medium -mt-0.5 hidden sm:block">
                  {language === 'no' ? 'Hva snakker du om?' : 'What are you talking about?'}
                </p>
              </div>
            </div>
          </div>

          {/* Right side controls */}
          <div className="flex items-center space-x-3">
            {/* Language Selector - always visible */}
            <LanguageSelector 
              selectedLanguage={language} 
              onLanguageChange={handleLanguageChange}
            />
            
            {/* Auth Button */}
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg">
                  <User className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700 truncate max-w-[100px]">
                    {user.email.split('@')[0]}
                  </span>
                </div>
                <button 
                  onClick={onSignOut}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  aria-label={t.signOut}
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">{t.signOut}</span>
                </button>
              </div>
            ) : (
              <button 
                onClick={onAuthClick}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label={t.signIn}
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">{t.signIn}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;