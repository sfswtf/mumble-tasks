import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { TranscriptionRecord } from '../types';

export function useTranscriptions(userId: string | null) {
  const [transcriptions, setTranscriptions] = useState<TranscriptionRecord[]>([]);
  const [loading, setLoading] = useState(false);

  // Load transcriptions when userId changes
  useEffect(() => {
    const loadTranscriptions = async () => {
      console.log('🔍 Loading transcriptions for user:', userId);
      
      if (!userId) {
        console.log('❌ No userId, setting empty transcriptions');
        setTranscriptions([]);
        return;
      }

      setLoading(true);
      try {
        console.log('📡 Querying transcriptions table...');
        const { data, error } = await supabase
          .from('transcriptions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        console.log('📊 Raw query result:', { 
          dataCount: data?.length, 
          error, 
          sampleRecord: data?.[0] ? {
            id: data[0].id,
            title: data[0].title,
            mode: data[0].mode,
            created_at: data[0].created_at,
            hasContent: !!data[0].content
          } : 'No records'
        });

        if (error) {
          console.error('❌ Error loading transcriptions:', error);
          setTranscriptions([]);
        } else {
          console.log('✅ Raw data from DB:', data);
          
          // Transform database records to match our TypeScript interface
          const transformedRecords: TranscriptionRecord[] = (data || []).map((record, index) => {
            console.log(`🔄 Transforming record ${index + 1}:`, {
              id: record.id,
              title: record.title,
              mode: record.mode,
              created_at: record.created_at,
              user_id: record.user_id
            });
            
            return {
              id: record.id,
              userId: record.user_id,
              transcription: record.transcription || '',
              type: record.mode || record.type || 'tasks', // Handle both old and new field names
              content: record.content,
              title: record.title || 'Untitled',
              createdAt: record.created_at,
              language: record.language || 'en',
              mode: record.mode || record.type || 'tasks',
              summary: record.summary,
              tasks: record.tasks
            };
          });
          
          console.log('✅ Final transformed records:', transformedRecords.length, 'records');
          console.log('📋 Sample transformed record:', transformedRecords[0]);
          setTranscriptions(transformedRecords);
        }
      } catch (error) {
        console.error('❌ Exception loading transcriptions:', error);
        setTranscriptions([]);
      } finally {
        console.log('🏁 Finished loading transcriptions, setting loading to false');
        setLoading(false);
      }
    };

    loadTranscriptions();
  }, [userId]);

  const saveTranscription = async (transcription: TranscriptionRecord) => {
    if (!userId) return;

    try {
      console.log('💾 Saving transcription:', transcription);
      
      const { data, error } = await supabase
        .from('transcriptions')
        .insert([{
          user_id: userId,
          title: transcription.title,
          transcription: transcription.transcription,
          summary: transcription.summary,
          tasks: transcription.tasks,
          mode: transcription.mode,
          language: transcription.language,
          content: transcription.content
        }])
        .select()
        .single();

      if (error) {
        console.error('Error saving transcription:', error);
        throw new Error('Failed to save transcription');
      }

      console.log('✅ Saved to database:', data);

      // Transform the returned data to match our interface
      const transformedRecord: TranscriptionRecord = {
        id: data.id,
        userId: data.user_id,
        transcription: data.transcription || '',
        type: data.mode || 'tasks',
        content: data.content,
        title: data.title || 'Untitled',
        createdAt: data.created_at,
        language: data.language || 'en',
        mode: data.mode || 'tasks',
        summary: data.summary,
        tasks: data.tasks
      };

      // Add the new transcription to the beginning of the list
      setTranscriptions(prev => [transformedRecord, ...prev]);
      return transformedRecord;
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