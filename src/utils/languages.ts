export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'no', name: 'Norwegian', flag: '🇳🇴' },
  { code: 'sv', name: 'Swedish', flag: '🇸🇪' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'pl', name: 'Polish', flag: '🇵🇱' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'fr', name: 'French', flag: '🇫🇷' }
] as const;

export type LanguageCode = typeof SUPPORTED_LANGUAGES[number]['code'];

export function getLanguageName(code: string): string {
  return SUPPORTED_LANGUAGES.find(lang => lang.code === code)?.name || 'Unknown';
}

export function detectLanguage(text: string): LanguageCode {
  // This is a simple implementation. In production, you might want to use
  // a more sophisticated library like 'franc' or an API
  const commonWords = {
    en: ['the', 'and', 'is', 'in', 'to'],
    no: ['og', 'er', 'det', 'i', 'å'],
    sv: ['och', 'är', 'det', 'att', 'i'],
    de: ['der', 'die', 'das', 'und', 'ist'],
    pl: ['jest', 'nie', 'to', 'się', 'w'],
    it: ['il', 'la', 'e', 'che', 'di'],
    fr: ['le', 'la', 'est', 'et', 'dans']
  };

  const wordCounts = Object.entries(commonWords).map(([lang, words]) => ({
    lang,
    count: words.filter(word => 
      text.toLowerCase().split(/\s+/).includes(word)
    ).length
  }));

  const detected = wordCounts.reduce((max, curr) => 
    curr.count > max.count ? curr : max
  );

  return (detected.count > 0 ? detected.lang : 'en') as LanguageCode;
}