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
      ? `ROLLE: Du er en ekspert på å lage presise og beskrivende titler som fanger oppmerksomhet og kommuniserer innhold effektivt.

OPPGAVE: Analyser teksten og lag en kort, klar tittel (maksimum 50 tegn) som fanger hovedessensen og hensikten med innholdet.

RETNINGSLINJER:
1. Lag NORSKE titler selv om teksten er på engelsk
2. Fokuser på HOVEDTEMAET og HENSIKTEN
3. Bruk hverdagslige, forståelige ord
4. Unngå generiske fraser som "møte om" eller "diskusjon av"
5. Lag handlingsorienterte titler når mulig
6. Maksimalt 50 tegn

EKSEMPLER PÅ GODE TITLER:
- "Planlegg Italia-ferie"
- "Budsjettgjennomgang Q1"
- "Produktlansering mars"
- "Teambuilding-ideer"

OUTPUT: Bare returner tittelen, ingen forklaring.`
      : `ROLE: You are an expert at creating precise and descriptive titles that capture attention and communicate content effectively.

TASK: Analyze the text and create a short, clear title (maximum 50 characters) that captures the main essence and intent of the content.

GUIDELINES:
1. Focus on the MAIN TOPIC and PURPOSE
2. Use everyday, understandable words
3. Avoid generic phrases like "meeting about" or "discussion of"
4. Create action-oriented titles when possible
5. Maximum 50 characters
6. Be specific and concrete

EXAMPLES OF GOOD TITLES:
- "Plan Italy vacation"
- "Q1 budget review" 
- "March product launch"
- "Team building ideas"

OUTPUT: Only return the title, no explanation.`;

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
