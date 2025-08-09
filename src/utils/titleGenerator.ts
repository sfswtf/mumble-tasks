import { truncate } from './stringUtils';

export function generateTitle(text: string, language: string = 'en'): string {
  // Extract first sentence or first 10 words
  const firstSentence = text.split(/[.!?]/, 1)[0].trim();
  const title = truncate(firstSentence, 60);
  
  // If title is too short, add timestamp
  if (title.length < 10) {
    const date = new Date();
    const timestamp = language === 'no' 
      ? `Notat ${date.toLocaleDateString('no-NO')}`
      : `Memo ${date.toLocaleDateString('en-US')}`;
    return timestamp;
  }

  return title;
}