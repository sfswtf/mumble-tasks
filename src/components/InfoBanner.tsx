import React from 'react';
import { InfoIcon, AlertCircle } from 'lucide-react';

interface InfoBannerProps {
  title: string;
  message: string;
  type?: 'info' | 'error';
}

export default function InfoBanner({ title, message, type = 'info' }: InfoBannerProps) {
  const styles = {
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-500',
      title: 'text-blue-800',
      text: 'text-blue-600',
      icon: <InfoIcon className="w-5 h-5 text-blue-500 mt-0.5" />
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-500',
      title: 'text-red-800',
      text: 'text-red-600',
      icon: <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
    }
  };

  const style = styles[type];

  return (
    <div className={`${style.bg} border-l-4 ${style.border} p-4 rounded-lg shadow-md`}>
      <div className="flex items-start">
        {style.icon}
        <div className="ml-3">
          <h3 className={`text-sm font-medium ${style.title}`}>{title}</h3>
          <p className={`mt-1 text-sm ${style.text}`}>{message}</p>
        </div>
      </div>
    </div>
  );
}