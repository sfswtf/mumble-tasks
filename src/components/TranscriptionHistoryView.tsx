import React, { memo } from 'react';
import { TranscriptionRecord } from '../types';
import TranscriptionHistory from './TranscriptionHistory';

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
  const handleSelect = (record: TranscriptionRecord) => {
    // Only call onSelectRecord if the record has content
    if (!record.content) {
      // Still allow selection even without content - let the parent handle it
    }
    onSelectRecord(record);
  };

  return (
    <div className="min-h-screen">
      <TranscriptionHistory
        transcriptions={transcriptions}
        onSelect={handleSelect}
        language={selectedLanguage}
      />
    </div>
  );
});

TranscriptionHistoryView.displayName = 'TranscriptionHistoryView';
