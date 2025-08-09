import { useState, useEffect } from 'react';
import { TranscriptionRecord } from '../types';

const STORAGE_PREFIX = 'mumbleTasks_transcriptions_';

export function useTranscriptions(userId: string | null) {
  const [transcriptions, setTranscriptions] = useState<TranscriptionRecord[]>([]);

  // Load transcriptions when userId changes
  useEffect(() => {
    const loadTranscriptions = () => {
      if (!userId) {
        setTranscriptions([]);
        return;
      }

      try {
        const saved = localStorage.getItem(`${STORAGE_PREFIX}${userId}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            const sorted = parsed.sort((a, b) => 
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            setTranscriptions(sorted);
          } else {
            setTranscriptions([]);
          }
        } else {
          setTranscriptions([]);
        }
      } catch (error) {
        console.error('Error loading transcriptions:', error);
        setTranscriptions([]);
      }
    };

    loadTranscriptions();
  }, [userId]);

  const saveTranscription = (transcription: TranscriptionRecord) => {
    if (!userId) return;

    const newTranscriptions = [transcription, ...transcriptions];
    setTranscriptions(newTranscriptions);
    
    try {
      localStorage.setItem(
        `${STORAGE_PREFIX}${userId}`,
        JSON.stringify(newTranscriptions)
      );
    } catch (error) {
      console.error('Error saving transcriptions:', error);
    }
  };

  const clearTranscriptions = () => {
    if (!userId) return;
    setTranscriptions([]);
    localStorage.removeItem(`${STORAGE_PREFIX}${userId}`);
  };

  return { transcriptions, saveTranscription, clearTranscriptions };
}