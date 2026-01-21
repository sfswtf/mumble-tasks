import React, { useState } from 'react';
import { User, Building2, Briefcase, Users, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import { ProfileContext } from '../types';

interface ProfileContextFormProps {
  value: ProfileContext;
  onChange: (next: ProfileContext) => void;
  language: string;
}

const getTranslations = (language: string) => {
  const translations = {
    en: {
      title: 'Profile context (optional)',
      subtitle: 'Used to avoid placeholders and keep documents consistent.',
      yourName: 'Your name',
      yourCompany: 'Your company',
      yourTitle: 'Your title/role',
      recipientName: 'Recipient name',
      recipientCompany: 'Recipient company',
      preferredTone: 'Preferred tone',
      tonePlaceholder: 'e.g., Formal, friendly, confident',
      placeholder: 'Optional',
      expand: 'Show',
      collapse: 'Hide'
    },
    no: {
      title: 'Profil / kontekst (valgfritt)',
      subtitle: 'Brukes for å unngå plassholdere og holde dokumenter konsistente.',
      yourName: 'Ditt navn',
      yourCompany: 'Ditt selskap',
      yourTitle: 'Din rolle/stilling',
      recipientName: 'Mottakers navn',
      recipientCompany: 'Mottakers selskap',
      preferredTone: 'Ønsket tone',
      tonePlaceholder: 'f.eks. Formell, vennlig, tydelig',
      placeholder: 'Valgfritt',
      expand: 'Vis',
      collapse: 'Skjul'
    }
  };
  return translations[language as keyof typeof translations] || translations.en;
};

export function ProfileContextForm({ value, onChange, language }: ProfileContextFormProps) {
  const t = getTranslations(language);
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
      >
        <div className="text-left">
          <div className="font-semibold text-gray-900">{t.title}</div>
          <div className="text-sm text-gray-600">{t.subtitle}</div>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <span className="text-sm">{open ? t.collapse : t.expand}</span>
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4" />
                <span>{t.yourName}</span>
              </label>
              <input
                type="text"
                value={value.yourName || ''}
                onChange={(e) => onChange({ ...value, yourName: e.target.value })}
                placeholder={t.placeholder}
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Building2 className="w-4 h-4" />
                <span>{t.yourCompany}</span>
              </label>
              <input
                type="text"
                value={value.yourCompany || ''}
                onChange={(e) => onChange({ ...value, yourCompany: e.target.value })}
                placeholder={t.placeholder}
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Briefcase className="w-4 h-4" />
                <span>{t.yourTitle}</span>
              </label>
              <input
                type="text"
                value={value.yourTitle || ''}
                onChange={(e) => onChange({ ...value, yourTitle: e.target.value })}
                placeholder={t.placeholder}
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Users className="w-4 h-4" />
                <span>{t.recipientName}</span>
              </label>
              <input
                type="text"
                value={value.recipientName || ''}
                onChange={(e) => onChange({ ...value, recipientName: e.target.value })}
                placeholder={t.placeholder}
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Building2 className="w-4 h-4" />
                <span>{t.recipientCompany}</span>
              </label>
              <input
                type="text"
                value={value.recipientCompany || ''}
                onChange={(e) => onChange({ ...value, recipientCompany: e.target.value })}
                placeholder={t.placeholder}
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <SlidersHorizontal className="w-4 h-4" />
                <span>{t.preferredTone}</span>
              </label>
              <input
                type="text"
                value={value.preferredTone || ''}
                onChange={(e) => onChange({ ...value, preferredTone: e.target.value })}
                placeholder={t.tonePlaceholder}
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

