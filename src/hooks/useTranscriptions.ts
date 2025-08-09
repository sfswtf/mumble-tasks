import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { TranscriptionRecord } from '../types';

export function useTranscriptions(userId: string | null) {
  const [transcriptions, setTranscriptions] = useState<TranscriptionRecord[]>([]);
  const [loading, setLoading] = useState(false);

  // Load transcriptions when userId changes
  useEffect(() => {
    const loadTranscriptions = async () => {
      if (!userId) {
        setTranscriptions([]);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('transcriptions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error loading transcriptions:', error);
          setTranscriptions([]);
        } else {
          setTranscriptions(data || []);
        }
      } catch (error) {
        console.error('Error loading transcriptions:', error);
        setTranscriptions([]);
      } finally {
        setLoading(false);
      }
    };

    loadTranscriptions();
  }, [userId]);

  const saveTranscription = async (transcription: TranscriptionRecord) => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('transcriptions')
        .insert([{
          user_id: userId,
          title: transcription.title,
          transcription: transcription.transcription,
          summary: transcription.summary,
          tasks: transcription.tasks,
          mode: transcription.mode,
          language: transcription.language
        }])
        .select()
        .single();

      if (error) {
        console.error('Error saving transcription:', error);
        throw new Error('Failed to save transcription');
      }

      // Add the new transcription to the beginning of the list
      setTranscriptions(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error saving transcription:', error);
      throw error;
    }
  };

  const clearTranscriptions = async () => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('transcriptions')
        .delete()
        .eq('user_id', userId);

      if (error) {
        console.error('Error clearing transcriptions:', error);
        throw new Error('Failed to clear transcriptions');
      }

      setTranscriptions([]);
    } catch (error) {
      console.error('Error clearing transcriptions:', error);
      throw error;
    }
  };

  return { 
    transcriptions, 
    loading,
    saveTranscription, 
    clearTranscriptions 
  };
}