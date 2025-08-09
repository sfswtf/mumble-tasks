import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RecordAudioProps {
  onRecordingComplete: (file: File) => void;
  language: string;
}

const getTranslations = (language: string) => {
  const translations = {
    en: {
      start: 'Start Recording',
      stop: 'Stop Recording',
      pause: 'Pause',
      resume: 'Resume',
      processing: 'Processing...',
      recordingTime: 'Recording Time'
    },
    no: {
      start: 'Start Opptak',
      stop: 'Stopp Opptak',
      pause: 'Pause',
      resume: 'Fortsett',
      processing: 'Behandler...',
      recordingTime: 'Opptakstid'
    }
  };
  return translations[language as keyof typeof translations] || translations.en;
};

export default function RecordAudio({ onRecordingComplete, language }: RecordAudioProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const t = getTranslations(language);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const options = {
        mimeType: getSupportedMimeType()
      };

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: getSupportedMimeType() });
        const fileName = `recording-${new Date().toISOString()}.${getFileExtension()}`;
        const audioFile = new File([audioBlob], fileName, { type: getSupportedMimeType() });
        onRecordingComplete(audioFile);
        
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.start(1000);
      setIsRecording(true);
      setIsPaused(false);
      
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Unable to access microphone. Please ensure you have granted permission.');
    }
  };

  const getSupportedMimeType = (): string => {
    const types = [
      'audio/webm',
      'audio/webm;codecs=opus',
      'audio/ogg;codecs=opus',
      'audio/mp4',
      'audio/mpeg'
    ];
    
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    
    return 'audio/webm';
  };

  const getFileExtension = (): string => {
    const mimeType = getSupportedMimeType();
    if (mimeType.includes('webm')) return 'webm';
    if (mimeType.includes('ogg')) return 'ogg';
    if (mimeType.includes('mp4')) return 'mp4';
    if (mimeType.includes('mpeg')) return 'mp3';
    return 'webm';
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
      setRecordingTime(0);
    }
  };

  const togglePause = () => {
    if (!mediaRecorderRef.current || !isRecording) return;

    if (isPaused) {
      mediaRecorderRef.current.resume();
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      mediaRecorderRef.current.pause();
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    }
    setIsPaused(!isPaused);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center space-y-6 p-4 sm:p-8 bg-white rounded-lg shadow-lg w-full max-w-sm mx-auto">
      <div className="text-3xl sm:text-4xl font-mono font-bold text-gray-700">
        {formatTime(recordingTime)}
      </div>

      <AnimatePresence>
        {isRecording && !isPaused && (
          <motion.div
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-4 h-4 bg-red-500 rounded-full"
          />
        )}
      </AnimatePresence>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {!isRecording ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startRecording}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors flex items-center space-x-2 text-sm sm:text-base"
          >
            <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>{t.start}</span>
          </motion.button>
        ) : (
          <>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={togglePause}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition-colors flex items-center space-x-2 text-sm sm:text-base"
            >
              {isPaused ? (
                <>
                  <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>{t.resume}</span>
                </>
              ) : (
                <>
                  <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>{t.pause}</span>
                </>
              )}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={stopRecording}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors flex items-center space-x-2 text-sm sm:text-base"
            >
              <Square className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>{t.stop}</span>
            </motion.button>
          </>
        )}
      </div>
    </div>
  );
}