import React, { useState, useRef } from 'react';
import { FileValidationError } from '../services/fileService';
import AudioCompressor from './AudioCompressor';

interface UploadSectionProps {
  onFileSelected: (file: File) => void;
  onError: (error: string) => void;
  language?: string;
}

const getTranslations = (language: string) => {
  const translations = {
    en: {
      uploadAudio: 'Upload your audio file',
      dragDrop: 'Drag and drop your audio file here, or',
      browse: 'browse'
    },
    no: {
      uploadAudio: 'Last opp lydfildin',
      dragDrop: 'Dra og slipp lydfilen din her, eller',
      browse: 'bla gjennom'
    }
  };
  return translations[language as keyof typeof translations] || translations.en;
};

const UploadSection: React.FC<UploadSectionProps> = ({
  onFileSelected,
  onError,
  language = 'en'
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = getTranslations(language);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      onFileSelected(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    
    const file = event.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
      onFileSelected(file);
    }
  };

  const handleCompressed = (compressedFile: File) => {
    setSelectedFile(compressedFile);
    onFileSelected(compressedFile);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="audio/*"
          className="hidden"
        />
        
        <div className="space-y-4">
          <div className="flex justify-center">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
          
          <div>
            <p className="text-lg font-medium text-gray-900">
              {selectedFile ? selectedFile.name : t.uploadAudio}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {t.dragDrop}{' '}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-blue-600 hover:text-blue-500"
              >
                {t.browse}
              </button>
            </p>
          </div>
        </div>
      </div>
      
      {selectedFile && (
        <AudioCompressor
          file={selectedFile}
          onCompressed={handleCompressed}
          onError={onError}
          language={language}
        />
      )}
    </div>
  );
};

export default UploadSection;