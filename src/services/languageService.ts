import OpenAI from 'openai';
import { BiographyContent } from '../types';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export const enforceLanguage = async (
  content: string,
  targetLanguage: string,
  type: string
): Promise<BiographyContent> => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a professional translator. Translate the following content to ${targetLanguage} while maintaining the original style and format.`
        },
        {
          role: "user",
          content
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const translatedContent = completion.choices[0]?.message?.content;
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