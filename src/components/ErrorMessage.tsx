import React from 'react';
import { XCircle, RefreshCw, X } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => Promise<void>;
  isRetrying?: boolean;
  onDismiss: () => void;
  language?: string;
}

const getTranslations = (language: string) => {
  const translations = {
    en: {
      retrying: 'Retrying...',
      retry: 'Retry',
      dismiss: 'Dismiss'
    },
    no: {
      retrying: 'Prøver igjen...',
      retry: 'Prøv Igjen',
      dismiss: 'Lukk'
    }
  };
  return translations[language as keyof typeof translations] || translations.en;
};

const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  message, 
  onRetry, 
  isRetrying, 
  onDismiss, 
  language = 'en' 
}) => {
  const t = getTranslations(language);

  return (
    <div className="rounded-md bg-red-50 p-4 relative z-40 shadow-lg border border-red-200">
      <div className="flex">
        <div className="flex-shrink-0">
          <XCircle className="h-5 w-5 text-red-400" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">{message}</h3>
        </div>
      </div>
      <div className="mt-4">
        {onRetry && (
          <button
            onClick={onRetry}
            disabled={isRetrying}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed mr-2"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
            {isRetrying ? t.retrying : t.retry}
          </button>
        )}
        <button
          onClick={onDismiss}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          <X className="h-4 w-4 mr-2" />
          {t.dismiss}
        </button>
      </div>
    </div>
  );
};

export default ErrorMessage;