import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;

export async function loadFFmpeg() {
  if (!ffmpeg) {
    ffmpeg = new FFmpeg();
    await ffmpeg.load({
      coreURL: await toBlobURL('https://unpkg.com/@ffmpeg/core@0.12.4/dist/ffmpeg-core.js', 'text/javascript'),
      wasmURL: await toBlobURL('https://unpkg.com/@ffmpeg/core@0.12.4/dist/ffmpeg-core.wasm', 'application/wasm'),
    });
  }
  return ffmpeg;
}

export async function compressAudio(file: File): Promise<File> {
  const ffmpeg = await loadFFmpeg();
  
  // Write the input file to FFmpeg's virtual file system
  await ffmpeg.writeFile('input', await fetchFile(file));
  
  // Run FFmpeg command to compress the audio
  // Using more aggressive compression settings:
  // - Reduced bitrate to 64k
  // - Reduced sample rate to 22050Hz
  // - Convert to mono audio
  await ffmpeg.exec([
    '-i', 'input',
    '-c:a', 'libmp3lame',
    '-b:a', '64k',
    '-ar', '22050',
    '-ac', '1',
    'output.mp3'
  ]);
  
  // Read the compressed file
  const data = await ffmpeg.readFile('output.mp3');
  
  // Create a new File object from the compressed data
  const compressedBlob = new Blob([data], { type: 'audio/mp3' });
  const compressedFile = new File([compressedBlob], file.name.replace(/\.[^/.]+$/, '.mp3'), {
    type: 'audio/mp3',
    lastModified: file.lastModified
  });
  
  return compressedFile;
}