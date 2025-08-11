import React, { useState } from 'react';
import { compressAudio } from '../utils/audioProcessor';

interface AudioCompressorProps {
  file: File;
  onCompressed: (file: File) => void;
  onError: (error: string) => void;
  language?: string;
}

const getTranslations = (language: string) => {
  const translations = {
    en: {
      audioCompression: 'Audio Compression',
      compressionText: 'Compressing it will reduce the file size while maintaining acceptable quality.',
      compressing: 'Compressing...',
      compressAudio: 'Compress Audio',
      compressionComplete: 'Compression complete!',
      compressingFile: 'Compressing audio file...',
      failedToCompress: 'Failed to compress audio file'
    },
    no: {
      audioCompression: 'Lydkomprimering',
      compressionText: 'Komprimering vil redusere filstørrelsen mens akseptabel kvalitet opprettholdes.',
      compressing: 'Komprimerer...',
      compressAudio: 'Komprimer Lyd',
      compressionComplete: 'Komprimering fullført!',
      compressingFile: 'Komprimerer lydfil...',
      failedToCompress: 'Kunne ikke komprimere lydil'
    }
  };
  return translations[language as keyof typeof translations] || translations.en;
};

const AudioCompressor: React.FC<AudioCompressorProps> = ({
  file,
  onCompressed,
  onError,
  language = 'en'
}) => {
  const [isCompressing, setIsCompressing] = useState(false);
  const [progress, setProgress] = useState<string>('');
  const t = getTranslations(language);

  const handleCompress = async () => {
    setIsCompressing(true);
    setProgress(t.compressingFile);

    try {
      const compressedFile = await compressAudio(file);
      setProgress(t.compressionComplete);
      onCompressed(compressedFile);
    } catch (error) {
      console.error('Compression error:', error);
      onError(error instanceof Error ? error.message : t.failedToCompress);
    } finally {
      setIsCompressing(false);
    }
  };

  return (
    <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
      <h3 className="text-lg font-medium text-gray-900">{t.audioCompression}</h3>
      <p className="mt-1 text-sm text-gray-500">
        This file is {(file.size / (1024 * 1024)).toFixed(2)} MB. 
        {t.compressionText}
      </p>
      
      <button
        onClick={handleCompress}
        disabled={isCompressing}
        className={`mt-3 w-full py-2 px-4 rounded-md font-medium ${
          isCompressing
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {isCompressing ? t.compressing : t.compressAudio}
      </button>
      
      {isCompressing && (
        <div className="mt-3 text-center text-gray-600">
          <div className="animate-pulse">{progress}</div>
        </div>
      )}
    </div>
  );
};

export default AudioCompressor; 