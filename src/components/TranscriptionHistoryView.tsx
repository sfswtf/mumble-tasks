import React, { memo } from 'react';
import { TranscriptionRecord, TranscriptionMode } from '../types';

interface TranscriptionHistoryViewProps {
  transcriptions: TranscriptionRecord[];
  selectedLanguage: string;
  onSelectRecord: (record: TranscriptionRecord) => void;
}

export const TranscriptionHistoryView = memo(({ 
  transcriptions, 
  selectedLanguage, 
  onSelectRecord 
}: TranscriptionHistoryViewProps) => {
  const getModeDisplayName = (mode: string) => {
    const modeNames = selectedLanguage === 'no' ? {
      'tasks': 'Oppgaveliste',
      'meeting': 'Møtenotater', 
      'article': 'Artikkel',
      'content-creator': 'Innholdsproduksjon'
    } : {
      'tasks': 'Task List',
      'meeting': 'Meeting Notes', 
      'article': 'Article',
      'content-creator': 'Content Creation'
    };
    return modeNames[mode as keyof typeof modeNames] || mode || 'Unknown';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return selectedLanguage === 'no' ? 'Ingen dato' : 'No date';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(selectedLanguage === 'no' ? 'no-NO' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getTitle = (record: TranscriptionRecord): string => {
    if (record.title && record.title !== 'Untitled') {
      return record.title;
    }
    const mode = getModeDisplayName(record.mode || 'unknown');
    const date = formatDate(record.createdAt);
    return `${mode} - ${date}`;
  };

  const handleRecordClick = (record: TranscriptionRecord) => {
    if (!record.content) {
      alert(selectedLanguage === 'no' 
        ? 'Dette notatet har ikke noe innhold å vise' 
        : 'This memo has no content to display'
      );
      return;
    }
    
    onSelectRecord(record);
  };

  return (
    <div className="min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          {selectedLanguage === 'no' ? 'Opptakshistorikk' : 'Recording History'}
        </h2>
        
        {transcriptions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg mb-2">
              {selectedLanguage === 'no' ? 'Ingen opptak funnet' : 'No recordings found'}
            </p>
            <p className="text-gray-400 text-sm">
              {selectedLanguage === 'no' 
                ? 'Start med å lage ditt første lydmemo eller oppgaveliste' 
                : 'Start by creating your first voice memo or task list'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {transcriptions.map((record, index) => {
              if (!record) {
                return null;
              }

              return (
                <div
                  key={record.id || `record-${index}`}
                  className="group bg-gray-50 rounded-lg p-4 hover:shadow-md hover:bg-gray-100 transition-all cursor-pointer"
                  onClick={() => handleRecordClick(record)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900 mb-1">
                        {getTitle(record)}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {formatDate(record.createdAt)}
                        {record.mode && ` • ${getModeDisplayName(record.mode)}`}
                        {record.content ? 
                          ` • ${selectedLanguage === 'no' ? 'Klar til visning' : 'Ready to view'}` : 
                          ` • ${selectedLanguage === 'no' ? 'Ingen innhold' : 'No content'}`
                        }
                      </p>
                    </div>
                    <div className="text-gray-400">→</div>
                  </div>
                </div>
              );
            }).filter(Boolean)}
          </div>
        )}
      </div>
    </div>
  );
});

TranscriptionHistoryView.displayName = 'TranscriptionHistoryView';
