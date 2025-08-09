export const SUPPORTED_AUDIO_FORMATS = [
  'flac',
  'm4a',
  'mp3',
  'mp4',
  'mpeg',
  'mpga',
  'oga',
  'ogg',
  'wav',
  'webm'
] as const;

export const MAX_RECORDING_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

export const RECORDING_WARNING_TIME = 29 * 60 * 1000; // 29 minutes in milliseconds