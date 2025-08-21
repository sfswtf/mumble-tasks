import { truncate } from './stringUtils';
// No client-side OpenAI usage. Titles are generated via backend proxy.

export async function generateTitle(text: string, language: string = 'en'): Promise<string> {
  // Fallback function for simple title generation
  const generateFallbackTitle = (text: string, language: string): string => {
    const firstSentence = text.split(/[.!?]/, 1)[0].trim();
    const title = truncate(firstSentence, 60);
    
    if (title.length < 10) {
      const date = new Date();
      const timestamp = language === 'no' 
        ? `Notat ${date.toLocaleDateString('no-NO')}`
        : `Memo ${date.toLocaleDateString('en-US')}`;
      return timestamp;
    }
    return title;
  };

  // If text is too short, use fallback
  if (!text || text.trim().length < 20) {
    return generateFallbackTitle(text, language);
  }

  try {
    const systemPrompt = language === 'no' 
      ? `Du er en ekspert på å lage presise og beskrivende titler. Analyser teksten og lag en kort, klar tittel (maksimalt 50 tegn) som fanger hovedessensen og hensikten med innholdet.

Retningslinjer:
- Lag NORSKE titler selv om teksten er på engelsk
- Fokuser på HOVEDTEMAET og HENSIKTEN
- Bruk hverdagslige, forståelige ord
- Unngå generiske fraser som "møte om" eller "diskusjon av"
- Lag handlingsorienterte titler når mulig
- Maksimalt 50 tegn

Eksempler på GODE titler:
- "Planlegg Italia-ferie"
- "Budsjettgjennomgang Q1"
- "Produktlansering mars"
- "Teambuilding-ideer"

Bare returner tittelen, ingen forklaring.`
      : `You are an expert at creating precise and descriptive titles. Analyze the text and create a short, clear title (maximum 50 characters) that captures the main essence and intent of the content.

Guidelines:
- Focus on the MAIN TOPIC and PURPOSE
- Use everyday, understandable words
- Avoid generic phrases like "meeting about" or "discussion of"
- Create action-oriented titles when possible
- Maximum 50 characters
- Be specific and concrete

Examples of GOOD titles:
- "Plan Italy vacation"
- "Q1 budget review" 
- "March product launch"
- "Team building ideas"

Only return the title, no explanation.`;

    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ prompt: `${systemPrompt}\n\nCreate a title for this content:\n\n${text.substring(0, 500)}...`, temperature: 0.3, max_tokens: 50, provider: 'anthropic', model: 'claude-3-haiku-20240307' })
    });
    if (!res.ok) throw new Error('Failed to generate title');
    const data = await res.json();
    const aiTitle = (data.content as string | undefined)?.trim();
    
    if (aiTitle && aiTitle.length > 5 && aiTitle.length <= 60) {
      // Remove quotes if present
      return aiTitle.replace(/^["']|["']$/g, '');
    } else {
      return generateFallbackTitle(text, language);
    }
    
  } catch (error) {
    console.error('Error generating AI title, using fallback:', error);
    return generateFallbackTitle(text, language);
  }
}