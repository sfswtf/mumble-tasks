import React from 'react';
import { Download } from 'lucide-react';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

interface ExportData {
  transcription: string;
  summary?: string;
  tasks?: Array<{
    text: string;
    priority: string;
    dueDate: string;
  }>;
  title: string;
  createdAt: string;
  // Add support for script content
  content?: {
    content: string;
    type: string;
  };
  type?: string;
}

interface ExportOptionsProps {
  data: ExportData;
  language?: string;
}

const getExportTranslations = (language: string) => {
  const translations = {
    en: {
      title: 'Export Options',
      exportTxt: 'Export as TXT',
      exportDocx: 'Export as DOCX'
    },
    no: {
      title: 'Eksportalternativer', 
      exportTxt: 'Eksporter som TXT',
      exportDocx: 'Eksporter som DOCX'
    }
  };
  return translations[language as keyof typeof translations] || translations.en;
};

// This component is deprecated - download functionality moved to output components
export const ExportOptions: React.FC<{ data: any; language?: string }> = () => {
  return null;
}; 