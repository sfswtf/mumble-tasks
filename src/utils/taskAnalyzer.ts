import { parse, isValid } from 'date-fns';

export function analyzeTaskPriority(text: string): 'High' | 'Medium' | 'Low' {
  const urgentKeywords = ['urgent', 'asap', 'immediately', 'critical', 'important'];
  const mediumKeywords = ['soon', 'next', 'later', 'should'];
  
  const lowerText = text.toLowerCase();
  
  if (urgentKeywords.some(keyword => lowerText.includes(keyword))) {
    return 'High';
  }
  
  if (mediumKeywords.some(keyword => lowerText.includes(keyword))) {
    return 'Medium';
  }
  
  return 'Low';
}

export function extractDateFromText(text: string): string | null {
  // Common date formats
  const datePatterns = [
    /(\d{1,2})[/-](\d{1,2})[/-](\d{4})/,  // DD/MM/YYYY or DD-MM-YYYY
    /(\d{4})[/-](\d{1,2})[/-](\d{1,2})/,  // YYYY/MM/DD or YYYY-MM-DD
    /(tomorrow|today|next week|next month)/i,
    /(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
  ];

  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      // Convert matched text to date
      const date = parse(match[0], 'yyyy-MM-dd', new Date());
      if (isValid(date)) {
        return date.toISOString().split('T')[0];
      }
    }
  }

  return null;
}