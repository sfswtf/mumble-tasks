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

const ContentProcessor: React.FC<ContentProcessorProps> = ({
  audioFile,
  preferences,
  language,
  onContentGenerated,
  onError
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<string>('');

  const processAudio = async () => {
    if (!audioFile) {
      onError('No audio file selected');
      return;
    }

    setIsProcessing(true);
    setProgress('Transcribing audio...');

    try {
      // Step 1: Transcribe audio
      const { text } = await transcribeAudio(audioFile, language);
      setProgress('Transcription complete. Generating content...');

      // Step 2: Generate content with chunking support
      const content = await generateContent(text, preferences, language);
      
      setProgress('Content generation complete!');
      onContentGenerated(content);
    } catch (error) {
      console.error('Processing error:', error);
      
      if (error instanceof FileValidationError) {
        onError(error.message);
      } else if (error instanceof Error) {
        onError(error.message);
      } else {
        onError('An unknown error occurred during processing');
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
        {isProcessing ? 'Processing...' : 'Process Audio'}
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