import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Clock, ChevronRight, Mic, List } from 'lucide-react';
import { format } from 'date-fns';
import { TranscriptionRecord } from '../types';

interface TranscriptionHistoryProps {
  transcriptions: TranscriptionRecord[];
  onSelect: (transcription: TranscriptionRecord) => void;
  language?: string;
}

const getHistoryTranslations = (language: string) => {
  const translations = {
    en: {
      title: 'Recording History',
      noRecordings: 'No recordings found',
      typeLabels: {
        tasks: 'Tasks',
        biography: 'Biography', 
        'content-creator': 'Content',
        article: 'Article',
        meeting: 'Meeting'
      }
    },
    no: {
      title: 'Opptakshistorikk',
      noRecordings: 'Ingen opptak funnet',
      typeLabels: {
        tasks: 'Oppgaver',
        biography: 'Biografi',
        'content-creator': 'Innhold', 
        article: 'Artikkel',
        meeting: 'Møte'
      }
    }
  };
  return translations[language as keyof typeof translations] || translations.en;
};

export default function TranscriptionHistory({ transcriptions, onSelect, language = 'en' }: TranscriptionHistoryProps) {
  const t = getHistoryTranslations(language);

  const getRecordTitle = (record: TranscriptionRecord): string => {
    // Try different ways to get a meaningful title
    if (record.title && record.title !== 'Untitled') {
      return record.title;
    }
    
    if (record.summary) {
      return record.summary.slice(0, 50) + (record.summary.length > 50 ? '...' : '');
    }
    
    if (record.transcription) {
      // Get first sentence or first 50 characters
      const firstSentence = record.transcription.split(/[.!?]/, 1)[0].trim();
      if (firstSentence.length > 5) {
        return firstSentence.slice(0, 50) + (firstSentence.length > 50 ? '...' : '');
      }
    }
    
    // Fallback to mode-based title with date
    const date = format(new Date(record.createdAt), language === 'no' ? 'd. MMM yyyy' : 'MMM d, yyyy');
    const modeLabel = t.typeLabels[record.mode as keyof typeof t.typeLabels] || record.mode;
    return language === 'no' 
      ? `${modeLabel} - ${date}` 
      : record.mode === 'tasks' ? `Tasks - ${date}` : `Voice Memo - ${date}`;
  };

  const getRecordSubtitle = (record: TranscriptionRecord): string => {
    if (record.mode === 'tasks' && record.tasks && record.tasks.length > 0) {
      return language === 'no' 
        ? `${record.tasks.length} oppgave${record.tasks.length !== 1 ? 'r' : ''}`
        : `${record.tasks.length} task${record.tasks.length !== 1 ? 's' : ''}`;
    }
    if (record.transcription) {
      const wordCount = record.transcription.split(' ').length;
      return language === 'no' 
        ? `${wordCount} ord`
        : `${wordCount} words`;
    }
    return language === 'no' 
      ? (record.mode === 'tasks' ? 'Oppgaveanalyse' : 'Lydmemo')
      : (record.mode === 'tasks' ? 'Task analysis' : 'Voice memo');
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">{t.title}</h2>
        <span className="text-sm text-gray-500">{transcriptions.length} recordings</span>
      </div>
      
      <div className="space-y-4">
        <AnimatePresence>
          {transcriptions.length === 0 ? (
            <div className="text-center py-8">
              <Mic className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">{t.noRecordings}</p>
              <p className="text-gray-400 text-sm">
                {language === 'no' 
                  ? 'Start med å lage ditt første lydmemo eller oppgaveliste' 
                  : 'Start by creating your first voice memo or task list'}
              </p>
            </div>
          ) : (
            transcriptions.map((record, index) => (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className="group bg-gray-50 rounded-lg p-4 hover:shadow-md hover:bg-gray-100 transition-all cursor-pointer"
                onClick={() => onSelect(record)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      {record.mode === 'tasks' ? (
                        <List className="w-5 h-5 text-green-500" />
                      ) : (
                        <FileText className="w-5 h-5 text-blue-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">
                        {getRecordTitle(record)}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{format(new Date(record.createdAt), 'MMM d, h:mm a')}</span>
                        </div>
                        <span>•</span>
                        <span>{getRecordSubtitle(record)}</span>
                        <span>•</span>
                        <span className="px-2 py-0.5 bg-gray-200 rounded-full text-xs capitalize">
                          {t.typeLabels[record.mode as keyof typeof t.typeLabels] || record.mode}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0" />
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}