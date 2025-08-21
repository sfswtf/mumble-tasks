import { BiographyContent } from '../types';

export const enforceLanguage = async (
  content: string,
  targetLanguage: string,
  type: string
): Promise<BiographyContent> => {
  try {
    const completionRes = await fetch('/api/transcriptions/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: `You are a professional translator. Translate the following content to ${targetLanguage} while maintaining the original style and format.\n\n${content}`,
        temperature: 0.7,
        max_tokens: 2000,
        provider: 'anthropic',
        model: 'claude-3-haiku-20240307'
      })
    });
    if (!completionRes.ok) throw new Error('Translation failed');
    const data = await completionRes.json();
    const translatedContent = data.content;
    if (!translatedContent) {
      throw new Error('No translation generated');
    }

    return {
      content: translatedContent,
      type,
      language: targetLanguage
    };
  } catch (error) {
    console.error('Translation error:', error);
    throw new Error(
      error instanceof Error 
        ? `Failed to translate content: ${error.message}`
        : 'Failed to translate content. Please try again.'
    );
  }
};

export const detectLanguage = async (text: string): Promise<string> => {
  // Simple language detection based on common words
  const languagePatterns = {
    no: /[æøåÆØÅ]|og|eller|jeg|det|er|på/i,
    en: /\b(the|and|or|I|it|is|on)\b/i
  };

  for (const [lang, pattern] of Object.entries(languagePatterns)) {
    if (pattern.test(text)) {
      return lang;
    }
  }

  return 'en'; // Default to English if uncertain
};