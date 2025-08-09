import React, { useState } from 'react';
import { compressAudio } from '../utils/audioProcessor';

interface AudioCompressorProps {
  file: File;
  onCompressed: (compressedFile: File) => void;
  onError: (error: string) => void;
}

const AudioCompressor: React.FC<AudioCompressorProps> = ({
  file,
  onCompressed,
  onError
}) => {
  const [isCompressing, setIsCompressing] = useState(false);
  const [progress, setProgress] = useState<string>('');

  const handleCompress = async () => {
    setIsCompressing(true);
    setProgress('Compressing audio file...');

    try {
      const compressedFile = await compressAudio(file);
      setProgress('Compression complete!');
      onCompressed(compressedFile);
    } catch (error) {
      console.error('Compression error:', error);
      onError(error instanceof Error ? error.message : 'Failed to compress audio file');
    } finally {
      setIsCompressing(false);
    }
  };

  return (
    <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
      <h3 className="text-lg font-medium text-gray-900">Audio Compression</h3>
      <p className="mt-1 text-sm text-gray-500">
        This file is {(file.size / (1024 * 1024)).toFixed(2)} MB. 
        Compressing it will reduce the file size while maintaining acceptable quality.
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
        {isCompressing ? 'Compressing...' : 'Compress Audio'}
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