import { SUPPORTED_AUDIO_FORMATS } from '../constants';

export class FileValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FileValidationError';
  }
}

export const validateAudioFile = (file: File): void => {
  if (!file) {
    throw new FileValidationError('No file provided');
  }

  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  const mimeType = file.type.toLowerCase();
  
  // Check if the file has any content
  if (file.size === 0) {
    throw new FileValidationError('File is empty');
  }

  // Validate file format
  const isValidFormat = SUPPORTED_AUDIO_FORMATS.some(format => 
    mimeType.includes(format) || (fileExtension && format === fileExtension)
  );

  if (!isValidFormat) {
    throw new FileValidationError(
      `Unsupported audio format. Please use one of the following formats: ${SUPPORTED_AUDIO_FORMATS.join(', ')}`
    );
  }

  // Validate file size (25MB limit for OpenAI API)
  const MAX_FILE_SIZE = 25 * 1024 * 1024;
  if (file.size > MAX_FILE_SIZE) {
    throw new FileValidationError('File size exceeds 25MB limit. The file will be automatically compressed if possible.');
  }
};

export const processAudioFile = async (file: File): Promise<File> => {
  try {
    validateAudioFile(file);
    
    // Check if file needs conversion
    const fileType = file.type.toLowerCase();
    if (!SUPPORTED_AUDIO_FORMATS.some(format => fileType.includes(format))) {
      return await convertAudioFormat(file);
    }
    
    return file;
  } catch (error) {
    if (error instanceof FileValidationError) {
      throw error;
    }
    throw new Error('Failed to process audio file. Please try a different file.');
  }
};

export const convertAudioFormat = async (file: File): Promise<File> => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    const offlineContext = new OfflineAudioContext({
      numberOfChannels: audioBuffer.numberOfChannels,
      length: audioBuffer.length,
      sampleRate: audioBuffer.sampleRate
    });
    
    const source = offlineContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(offlineContext.destination);
    source.start();
    
    const renderedBuffer = await offlineContext.startRendering();
    const wavBlob = await audioBufferToWav(renderedBuffer);
    
    return new File([wavBlob], `${file.name.split('.')[0]}.wav`, {
      type: 'audio/wav'
    });
  } catch (error) {
    throw new Error('Failed to convert audio format. Please try a different file.');
  }
};

const audioBufferToWav = async (buffer: AudioBuffer): Promise<Blob> => {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2;
  const view = new DataView(new ArrayBuffer(44 + length));

  // Write WAV header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + length, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numOfChan, true);
  view.setUint32(24, buffer.sampleRate, true);
  view.setUint32(28, buffer.sampleRate * 2 * numOfChan, true);
  view.setUint16(32, numOfChan * 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, length, true);

  // Write audio data
  const offset = 44;
  const channels = [];
  for (let i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  for (let i = 0; i < buffer.length; i++) {
    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const sample = Math.max(-1, Math.min(1, channels[channel][i]));
      view.setInt16(offset + (i * numOfChan + channel) * 2, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
    }
  }

  return new Blob([view], { type: 'audio/wav' });
};

const writeString = (view: DataView, offset: number, string: string): void => {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
};