import React, { useState } from 'react';
import { transcribeAudio, generateContent } from '../services/openai';
import { BiographyContent, BiographyPreferences } from '../types';
import { FileValidationError } from '../services/fileService';

interface ContentProcessorProps {
  audioFile: File | null;
  preferences: BiographyPreferences;
  language: string;
  onContentGenerated: (content: BiographyContent) => void;
  onError: (error: string) => void;
}

const getTranslations = (language: string) => {
  const translations = {
    en: {
      noAudioFile: 'No audio file selected',
      transcribing: 'Transcribing audio...',
      transcriptionComplete: 'Transcription complete. Generating content...',
      contentComplete: 'Content generation complete!',
      processing: 'Processing...',
      processAudio: 'Process Audio',
      unknownError: 'An unknown error occurred during processing'
    },
    no: {
      noAudioFile: 'Ingen lydfil valgt',
      transcribing: 'Transkriberer lyd...',
      transcriptionComplete: 'Transkripsjon fullført. Genererer innhold...',
      contentComplete: 'Innholdsgenerering fullført!',
      processing: 'Behandler...',
      processAudio: 'Behandle Lyd',
      unknownError: 'En ukjent feil oppstod under behandling'
    }
  };
  return translations[language as keyof typeof translations] || translations.en;
};

const ContentProcessor: React.FC<ContentProcessorProps> = ({
  audioFile,
  preferences,
  language,
  onContentGenerated,
  onError
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<string>('');
  const t = getTranslations(language);

  const processAudio = async () => {
    if (!audioFile) {
      onError(t.noAudioFile);
      return;
    }

    setIsProcessing(true);
    setProgress(t.transcribing);

    try {
      // Step 1: Transcribe audio
      const { text } = await transcribeAudio(audioFile, language);
      setProgress(t.transcriptionComplete);

      // Step 2: Generate content with chunking support
      const content = await generateContent(text, preferences, language);
      
      setProgress(t.contentComplete);
      onContentGenerated(content);
    } catch (error) {
      console.error('Processing error:', error);
      
      if (error instanceof FileValidationError) {
        onError(error.message);
      } else if (error instanceof Error) {
        onError(error.message);
      } else {
        onError(t.unknownError);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="mt-6">
      <button
        onClick={processAudio}
        disabled={isProcessing || !audioFile}
        className={`w-full py-3 px-4 rounded-lg font-medium ${
          isProcessing || !audioFile
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {isProcessing ? t.processing : t.processAudio}
      </button>
      
      {isProcessing && (
        <div className="mt-4 text-center text-gray-600">
          <div className="animate-pulse">{progress}</div>
        </div>
      )}
    </div>
  );
};

export default ContentProcessor; 