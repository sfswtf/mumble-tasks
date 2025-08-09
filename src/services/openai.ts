import OpenAI from 'openai';
import { BiographyContent } from '../types';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

// Approximate token count (rough estimate: 1 token ≈ 4 characters)
function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / 4);
}

// Split text into chunks that fit within token limit
function chunkText(text: string, maxTokens: number = 15000): string[] {
  const chunks: string[] = [];
  let currentChunk = '';
  const sentences = text.split(/(?<=[.!?])\s+/);
  
  for (const sentence of sentences) {
    const sentenceTokens = estimateTokenCount(sentence);
    const currentChunkTokens = estimateTokenCount(currentChunk);
    
    if (currentChunkTokens + sentenceTokens > maxTokens && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += (currentChunk ? ' ' : '') + sentence;
    }
  }
  
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

export async function transcribeAudio(
  audioFile: File, 
  language: string = 'en', 
  onProgress?: (progress: number) => void
): Promise<{ text: string }> {
  try {
    // Report initial progress
    onProgress?.(0);
    
    const formData = new FormData();
    formData.append('file', audioFile);
    formData.append('model', 'whisper-1');
    formData.append('language', language);
    formData.append('response_format', 'json');

    // Report progress for request preparation
    onProgress?.(0.2);

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
      },
      body: formData,
    });

    // Report progress for response processing
    onProgress?.(0.8);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenAI API Error Response:', errorData);
      throw new Error(errorData.error?.message || `Transcription failed: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.text) {
      throw new Error('No transcription text received from API');
    }

    // Report completion
    onProgress?.(1);

    return { text: data.text };
  } catch (error) {
    console.error('Transcription error:', error);
    throw error instanceof Error 
      ? error 
      : new Error('Failed to transcribe audio. Please try again.');
  }
}

export async function generateContent(
  text: string, 
  preferences: any, 
  language: string = 'en'
): Promise<BiographyContent> {
  try {
    // Check if text is too long and needs chunking
    const tokenCount = estimateTokenCount(text);
    if (tokenCount > 15000) {
      console.log(`Text is ${tokenCount} tokens long, chunking into smaller pieces`);
      const chunks = chunkText(text);
      console.log(`Split into ${chunks.length} chunks`);
      
      // Process each chunk and combine results
      const results = await Promise.all(
        chunks.map(async (chunk, index) => {
          console.log(`Processing chunk ${index + 1}/${chunks.length}`);
          return processChunk(chunk, preferences, language);
        })
      );
      
      // Combine results
      const combinedContent = results.map(r => r.content).join('\n\n');
      return {
        content: combinedContent,
        type: preferences.promptType || 'default',
        language
      };
    } else {
      return processChunk(text, preferences, language);
    }
  } catch (error) {
    console.error('Content generation error:', error);
    throw error instanceof Error 
      ? error 
      : new Error('Failed to generate content. Please try again.');
  }
}

async function processChunk(
  text: string, 
  preferences: any, 
  language: string
): Promise<BiographyContent> {
  const prompt = buildPrompt(text, preferences, language);
  
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: "You are a helpful assistant that processes text according to user preferences." },
      { role: "user", content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 4000
  });
  
  const content = response.choices[0]?.message?.content || '';
  
  return {
    content,
    type: preferences.promptType || 'default',
    language
  };
}

function buildPrompt(text: string, preferences: any, language: string): string {
  // Build a prompt based on preferences
  let prompt = `Process the following text according to these preferences:\n\n`;
  
  if (preferences.tone) {
    prompt += `Tone: ${preferences.tone}\n`;
  }
  
  if (preferences.style) {
    prompt += `Style: ${preferences.style}\n`;
  }
  
  if (preferences.audience) {
    prompt += `Audience: ${preferences.audience}\n`;
  }
  
  if (preferences.notes) {
    prompt += `Additional notes: ${preferences.notes}\n`;
  }
  
  if (preferences.authorGenre) {
    prompt += `Genre: ${preferences.authorGenre}\n`;
  }
  
  if (preferences.authorStyle) {
    prompt += `Writing style: ${preferences.authorStyle}\n`;
  }
  
  if (preferences.authorContext) {
    prompt += `Context: ${preferences.authorContext}\n`;
  }
  
  if (preferences.authorInstructions) {
    prompt += `Instructions: ${preferences.authorInstructions}\n`;
  }
  
  if (preferences.authorPasteText) {
    prompt += `Continue from this text: ${preferences.authorPasteText}\n\n`;
  }
  
  prompt += `\nText to process:\n${text}\n\n`;
  prompt += `Please process this text according to the preferences above. Do not add introductions, conclusions, or section headers unless specifically requested.`;
  
  return prompt;
}

// Updated generateSummaryAndTasks function with personalized prompts
export async function generateSummaryAndTasks(
  transcription: string,
  language: string = 'en',
  onProgress?: (progress: number) => void
): Promise<{ summary: string; tasks: string[] }> {
  if (!transcription?.trim()) {
    throw new Error('No transcription provided for summary generation');
  }

  try {
    // Report initial progress
    onProgress?.(0);

    const systemPrompt = language === 'no'
      ? `Du er en personlig assistent som analyserer talenotater og lager sammendrag. For følgende transkripsjon, gi:
        1. Et detaljert sammendrag som fanger opp alle viktige punkter og detaljer
        2. En komplett liste over alle spesifikke oppgaver som DU må gjøre (skriv i første person: "Du må...", "Du bør...", "Du trenger å...")
        
        VIKTIG for oppgaver: Skriv alle oppgaver som om de snakker direkte til brukeren som deres personlige assistent:
        - Bruk "Du må..." i stedet for "Taleren må..."
        - Bruk "Du bør..." i stedet for "Personen bør..."
        - Gjør det personlig og direkte
        
        Sammendrag skal være omfattende og inkludere:
        - Hovedpunkter og beslutninger
        - Viktige detaljer og kontekst
        - Nøkkelpersoner og deres roller
        - Tidspunkt og frister som nevnes
        
        Formater svaret slik:
        Sammendrag: [detaljert sammendragstekst]
        Oppgaver:
        - [oppgave 1 i første person]
        - [oppgave 2 i første person]
        osv.`
      : `You are a personal assistant that analyzes voice memos and creates comprehensive summaries. For the following transcription, provide:
        1. A detailed executive summary that captures all important points and details
        2. A complete list of all specific, actionable tasks that YOU need to do (write in first person: "You need to...", "You should...", "You must...")
        
        IMPORTANT for tasks: Write all tasks as if speaking directly to the user as their personal assistant:
        - Use "You need to..." instead of "The speaker needs to..."
        - Use "You should..." instead of "The person should..."
        - Make it personal and direct
        
        The summary should be comprehensive and include:
        - Key points and decisions made
        - Important details and context
        - Key people and their roles
        - Timelines and deadlines mentioned
        
        Format the response as:
        Summary: [detailed summary text]
        Tasks:
        - [task 1 in second person]
        - [task 2 in second person]
        etc.`;

    // Report progress for API call preparation
    onProgress?.(0.3);

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: transcription
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    // Report progress for response processing
    onProgress?.(0.8);

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response received from OpenAI');
    }

    // Parse response based on language
    const summaryLabel = language === 'no' ? 'Sammendrag:' : 'Summary:';
    const tasksLabel = language === 'no' ? 'Oppgaver:' : 'Tasks:';

    const [summaryPart, tasksPart] = response.split(new RegExp(`\n${tasksLabel}\n`, 'i'));
    const summary = summaryPart.replace(new RegExp(`^${summaryLabel}\\s*`, 'i'), '').trim();
    const tasks = tasksPart
      ? tasksPart.split('\n')
          .filter(task => task.trim().startsWith('-'))
          .map(task => task.replace(/^-\s*/, '').trim())
      : [];

    if (!summary) {
      throw new Error('Failed to generate summary from the transcription');
    }

    // Report completion
    onProgress?.(1);

    return { summary, tasks: tasks.length ? tasks : [] };
  } catch (error) {
    console.error('Summary and tasks generation error:', error);
    throw error instanceof Error 
      ? error 
      : new Error('Failed to generate summary and tasks. Please try again.');
  }
}

export async function generatePromptContent(
  transcription: string,
  type: string,
  customization: any,
  language: string = 'en',
  onProgress?: (progress: number) => void
): Promise<BiographyContent> {
  // Report initial progress
  onProgress?.(0);

  let systemPrompt = '';
  
  // Language instruction for output
  const languageInstruction = language === 'no' 
    ? 'VIKTIG: Skriv ALT innhold på NORSK. Selv om lydfilen er på engelsk, skal ALT output være på norsk.'
    : 'Write all content in English.';
  
  switch (type) {
    case 'content-creator':
      const platform = customization.platform;
      
      if (['tiktok', 'instagram-reels', 'youtube-shorts'].includes(platform)) {
        // Short Video Script Generation
        const duration = customization.duration || '30-60';
        const contentStyle = customization.contentStyle || 'educational';
        const hookType = customization.hookType || 'question';
        const callToAction = customization.callToAction || 'follow';
        
        systemPrompt = `You are a professional short-form video script writer for ${platform}. Create a COMPLETE ${duration} second VIDEO SCRIPT based on the provided audio content.

${languageInstruction}

IMPORTANT: This must be a FULL ${duration} second script. At normal speaking pace (150-160 words per minute), this requires:
- 15-30 seconds = 40-80 words of spoken content
- 30-60 seconds = 80-160 words of spoken content  
- 60-90 seconds = 160-220 words of spoken content

CONTENT EXTRACTION & EXPANSION:
1. Extract the main topic/message from the audio transcription
2. Identify key points, examples, or stories mentioned
3. Expand and elaborate on these points to fill the chosen duration
4. Add relevant context, explanations, and actionable advice
5. Structure for maximum engagement and retention

SCRIPT FORMAT:

HOOK (0:00-0:03):
${hookType === 'question' ? '[Compelling question that hooks viewers immediately]' : 
  hookType === 'bold_statement' ? '[Bold, attention-grabbing statement]' : 
  hookType === 'surprising_fact' ? '[Surprising fact or statistic]' : 
  '[Story opening that draws viewers in]'}
(Direction: Look directly at camera, confident tone)

MAIN CONTENT (0:03-${parseInt(duration.split('-')[1]) - 5}):
[Detailed script covering ALL key points from the audio. Expand each concept with:]
- Clear explanations of technical concepts
- Specific examples and use cases
- Step-by-step breakdowns where relevant
- Personal insights and experiences from the audio
- Actionable tips viewers can implement

(Include throughout: Camera directions, text overlay suggestions, visual cues)

CALL-TO-ACTION (${parseInt(duration.split('-')[1]) - 5}:${duration.split('-')[1]}):
[Strong, specific CTA related to the content]

PRODUCTION NOTES:
- Pacing: [Fast/Medium/Slow sections]
- Visual elements: [Text overlays, graphics needed]
- B-roll suggestions: [Specific shots or examples to show]
- Editing notes: [Cut points, transitions]

Make this a COMPLETE, production-ready script that fills the entire ${duration} second duration with valuable, engaging content based on the audio transcription.`;

      } else if (platform === 'youtube') {
        // YouTube Video Script Generation
        const targetLength = customization.targetLength || '8-10';
        const videoFormat = customization.videoFormat || 'educational';
        const engagementStyle = customization.engagementStyle || 'conversational';
        const structureElements = customization.structureElements || ['intro_hook', 'chapter_breaks', 'engagement_prompts', 'strong_conclusion'];
        
        const minMinutes = parseInt(targetLength.split('-')[0]);
        const maxMinutes = parseInt(targetLength.split('-')[1]);
        const avgMinutes = Math.round((minMinutes + maxMinutes) / 2);
        const totalWords = avgMinutes * 150; // 150 words per minute average speaking pace
        
        systemPrompt = `You are a professional YouTube script writer. Create a COMPREHENSIVE ${targetLength} minute video script based on the provided audio content.

${languageInstruction}

SCRIPT LENGTH REQUIREMENT: This must be approximately ${totalWords} words (${avgMinutes} minutes at 150 words/minute speaking pace).

CONTENT DEVELOPMENT STRATEGY:
1. Extract ALL key concepts from the audio transcription
2. Expand each concept with detailed explanations, examples, and context
3. Add relevant background information and industry insights
4. Include personal stories, case studies, and real-world applications
5. Provide actionable steps and practical advice
6. Address potential questions and objections

YOUTUBE SCRIPT STRUCTURE:

${structureElements.includes('intro_hook') ? `INTRO HOOK (0:00-0:30):
- Pattern interrupt or compelling question
- Preview of what viewers will learn
- Why this matters to your audience
- Quick credibility statement
(Target: 75-80 words)

INTRODUCTION (0:30-1:00):
- Welcome message and channel introduction
- Detailed preview of video contents
- Value proposition and what viewers will gain
- Subscribe reminder with specific benefit
(Target: 75-80 words)` : ''}

MAIN CONTENT SECTIONS (1:00-${maxMinutes - 1}:00):

${structureElements.includes('chapter_breaks') ? `
CHAPTER 1: [Main Topic Introduction] (1:00-${Math.round(maxMinutes/3)}:00)
- Deep dive into the core concept from audio
- Background and context
- Why this matters now
- Current industry landscape
(Target: ${Math.round(totalWords/4)} words)

CHAPTER 2: [Detailed Analysis/Process] (${Math.round(maxMinutes/3)}:00-${Math.round(maxMinutes*2/3)}:00)
- Step-by-step breakdown of key processes
- Technical explanations made accessible
- Real-world examples and case studies
- Common mistakes and how to avoid them
(Target: ${Math.round(totalWords/4)} words)

CHAPTER 3: [Practical Application] (${Math.round(maxMinutes*2/3)}:00-${maxMinutes - 1}:00)
- Actionable steps viewers can take
- Tools and resources mentioned in audio
- Advanced tips and strategies
- Future trends and considerations
(Target: ${Math.round(totalWords/4)} words)` : `

MAIN CONTENT (1:00-${maxMinutes - 1}:00):
[Comprehensive coverage of ALL topics from the audio, expanded with:]
- Detailed explanations of every concept mentioned
- Multiple examples and use cases
- Step-by-step processes and methodologies
- Industry context and background information
- Personal insights and experiences from the audio
- Practical tips and actionable advice
- Common challenges and solutions
- Future implications and trends
(Target: ${Math.round(totalWords*3/4)} words)`}

${structureElements.includes('strong_conclusion') ? `
CONCLUSION (${maxMinutes - 1}:00-${maxMinutes}:00):
- Comprehensive summary of key takeaways
- Reinforce the main message from audio
- Final thoughts and recommendations
- Strong call-to-action with specific next steps
- Subscribe reminder and next video preview
(Target: ${Math.round(totalWords/6)} words)` : ''}

${structureElements.includes('engagement_prompts') ? `
ENGAGEMENT ELEMENTS (Throughout):
- "Let me know in the comments if you've experienced this"
- "Which approach would you choose and why?"
- "Share your thoughts on [specific topic]"
- "What questions do you have about [topic]?"
- Strategic like and subscribe reminders` : ''}

SEO & METADATA:

TITLE SUGGESTIONS (based on audio content):
1. [Compelling, keyword-rich title reflecting main topic]
2. [Alternative angle focusing on practical benefits]
3. [Question-based title addressing viewer pain points]

DESCRIPTION TEMPLATE:
[Comprehensive description with timestamps, key points, and relevant links]

TAGS: [15-20 relevant tags based on actual content topics]

SCRIPT NOTES:
- Speaking pace: ${engagementStyle} and natural
- Retention hooks every 30-45 seconds
- Visual aids and graphics suggestions
- B-roll and example footage needed
- Editing and cut points marked

This script should take exactly ${targetLength} minutes to deliver at a natural speaking pace, providing comprehensive value to viewers interested in the topic discussed in the audio.`;

      } else if (platform === 'linkedin') {
        // LinkedIn Post Generation
        const contentTone = customization.contentTone || 'professional_insights';
        const postLength = customization.postLength || 'medium';
        const engagementFeatures = customization.engagementFeatures || ['industry_hashtags', 'question_comments'];
        const professionalFocus = customization.professionalFocus || 'business_insights';
        
        const targetWords = postLength === 'short' ? '50-100' : postLength === 'medium' ? '150-300' : '400-600';
        
        systemPrompt = `You are a LinkedIn content strategist. Create a ${postLength} professional post (${targetWords} words) based on the provided audio content.

${languageInstruction}

POST LENGTH REQUIREMENT: ${postLength.toUpperCase()} = ${targetWords} words

CONTENT EXTRACTION & EXPANSION:
1. Identify the core business insight or professional lesson from the audio
2. Extract specific examples, data points, or personal experiences mentioned
3. Expand with relevant context and industry implications
4. Add actionable advice for professionals
5. Include personal reflection and authentic voice

LINKEDIN POST STRUCTURE:

OPENING HOOK (First 1-2 sentences):
[Compelling statement that captures the main insight from the audio]

CONTEXT & STORY (Main body):
[Detailed explanation of the situation, experience, or insight from the audio, including:]
- Specific circumstances and background
- What happened and why it matters
- Personal observations and realizations
- Industry context and broader implications
- Specific examples and data if mentioned in audio

KEY INSIGHTS (Core message):
[Professional takeaways that other LinkedIn users can apply:]
- Main lesson learned
- Why this matters for professionals in the field
- How this impacts the industry or career development
- Specific strategies or approaches mentioned

ACTIONABLE ADVICE:
[Practical steps readers can implement:]
- Concrete actions professionals can take
- Tools, resources, or methods to try
- Questions to consider for their own situation

${engagementFeatures.includes('question_comments') ? `ENGAGEMENT QUESTION:
[Specific question related to the content that encourages professional discussion]` : ''}

CONTENT TONE: ${contentTone}
PROFESSIONAL FOCUS: ${professionalFocus}

GUIDELINES:
- Use professional but conversational language
- Include 1-2 strategic emojis maximum
- Reference specific details from the audio transcription
- Make it authentic and based on real experiences shared
${engagementFeatures.includes('industry_hashtags') ? '- Add 3-5 relevant industry hashtags at the end' : ''}
${engagementFeatures.includes('personal_story') ? '- Emphasize personal elements and authentic experiences from the audio' : ''}

Create a post that provides genuine professional value and reflects the actual content and insights from the audio transcription.`;

      } else if (platform === 'facebook') {
        // Facebook Post Generation
        const audienceType = customization.audienceType || 'business_page';
        const engagementGoal = customization.engagementGoal || 'discussion';
        const contentTone = customization.contentTone || 'casual_friendly';
        
        const targetLength = engagementGoal === 'discussion' ? '200-400 words' : 
                           engagementGoal === 'story_sharing' ? '300-500 words' : '150-300 words';
        
        systemPrompt = `You are a Facebook content creator. Create a ${engagementGoal} post (${targetLength}) based on the provided audio content.

${languageInstruction}

POST LENGTH REQUIREMENT: ${targetLength} for optimal ${engagementGoal}

CONTENT EXTRACTION & EXPANSION:
1. Find the most relatable and engaging moments from the audio
2. Extract personal stories, experiences, or emotional connections
3. Identify universal themes that resonate with ${audienceType}
4. Expand with context, details, and vivid storytelling
5. Add relatable analogies and shared experiences

FACEBOOK POST STRUCTURE:

HOOK (First 40 characters - visible without "See More"):
[Attention-grabbing opening that makes people want to read more]

STORY/EXPERIENCE (Main content):
[Detailed narrative based on the audio content, including:]
- Specific situation or experience shared in the audio
- Personal details that make it relatable
- Emotions and reactions involved
- What made this moment significant
- Vivid descriptions and context
- Lessons learned or realizations

UNIVERSAL CONNECTION:
[How this relates to common human experiences:]
- Why others can relate to this situation
- Broader themes and shared challenges
- Community aspects and shared values

ENGAGEMENT DRIVER:
[Content that encourages ${engagementGoal}:]
- Specific question about others' experiences
- Call for sharing similar stories
- Request for advice or opinions
- Invitation to tag friends who relate

AUDIENCE: ${audienceType}
TONE: ${contentTone}
GOAL: ${engagementGoal}

GUIDELINES:
- Use conversational, accessible language
- Include 3-5 relevant emojis for visual appeal and emotion
- Focus on authentic storytelling from the audio content
- Make it highly shareable and relatable
- Encourage specific types of engagement in comments
- Keep the most important content in the first 250 characters

Create a post that captures the authentic human experience shared in the audio and makes it resonate with a broader Facebook audience.`;

      } else if (platform === 'article') {
        // Article Generation
        const articleType = customization.articleType || 'opinion_piece';
        const targetLength = customization.targetLength || 'medium';
        const writingStyle = customization.writingStyle || 'informative';
        const audience = customization.audience || 'general_public';
        
        const wordCount = targetLength === 'short' ? '800-1200' : 
                         targetLength === 'medium' ? '1500-2500' : '3000-5000';
        
        systemPrompt = `You are a professional ${articleType.replace('_', ' ')} writer. Create a comprehensive ${targetLength} length article (${wordCount} words) based on the provided audio content.

${languageInstruction}

ARTICLE TYPE: ${articleType.replace('_', ' ').toUpperCase()}
TARGET LENGTH: ${wordCount} words
WRITING STYLE: ${writingStyle}
AUDIENCE: ${audience.replace('_', ' ')}

CONTENT DEVELOPMENT:
1. Extract ALL key themes, arguments, and insights from the audio
2. Research and expand with additional context and background
3. Structure arguments logically with supporting evidence
4. Include expert perspectives and industry analysis
5. Provide balanced viewpoints where appropriate
6. Add actionable takeaways for readers

ARTICLE STRUCTURE:

HEADLINE:
[Compelling, SEO-optimized headline based on main topic]

SUBHEADLINE:
[Supporting statement that adds context]

INTRODUCTION (150-250 words):
- Hook that captures reader attention
- Brief context and background
- Clear thesis statement
- Preview of main arguments
- Why this matters to the audience

MAIN BODY (${Math.round(parseInt(wordCount.split('-')[1]) * 0.7)} words):
${articleType === 'opinion_piece' ? `
- Personal perspective and stance
- Supporting arguments with evidence
- Counter-arguments and rebuttals
- Personal experiences and anecdotes
- Call for action or change` : 
articleType === 'financial_article' ? `
- Market analysis and trends
- Financial data and statistics
- Expert opinions and forecasts
- Investment implications
- Risk assessment and recommendations` :
articleType === 'movie_review' ? `
- Plot summary (spoiler-free)
- Performance analysis
- Technical aspects (cinematography, sound, etc.)
- Thematic elements and messaging
- Comparison to similar works
- Recommendation and rating` :
articleType === 'book_review' ? `
- Brief plot overview (no spoilers)
- Character development analysis
- Writing style and prose quality
- Thematic depth and significance
- Target audience assessment
- Recommendation and rating` :
articleType === 'music_review' ? `
- Album/song overview and context
- Musical composition and production
- Lyrical content and meaning
- Artist's evolution and style
- Comparison to previous works
- Overall assessment and recommendation` :
`- Detailed analysis of key topics
- Supporting evidence and examples
- Expert insights and research
- Practical applications
- Industry implications`}

CONCLUSION (100-200 words):
- Summary of key points
- Reinforcement of main argument
- Final thoughts and reflections
- Call-to-action for readers
- Future implications or predictions

FORMATTING:
- Use subheadings for easy scanning
- Include relevant quotes from the audio
- Add bullet points for key takeaways
- Suggest images or graphics where appropriate

Create a well-researched, engaging article that thoroughly explores the topic discussed in the audio transcription.`;

      } else {
        // Fallback for unknown platforms
        systemPrompt = `You are a professional content creator for ${platform}. Create comprehensive, platform-optimized content based on the provided audio transcription.

${languageInstruction}
        
        CONTENT DEVELOPMENT:
        1. Extract ALL key insights, concepts, and examples from the audio
        2. Expand significantly on each point with detailed explanations
        3. Add relevant context and background information
        4. Include practical applications and actionable advice
        5. Structure for optimal engagement on ${platform}
        
        Consider these preferences:
        - Platform: ${platform}
        - Tone: ${customization.tone || 'engaging'}
        - Style: ${customization.style || 'professional'}
        - Target Audience: ${customization.audience || 'general'}
        - Additional Notes: ${customization.notes || 'None'}
        
        Create substantial, valuable content that thoroughly covers the topics discussed in the audio and provides comprehensive value to the audience.`;
      }
      break;

    case 'article':
      // Direct Article Generation (when selected as main type, not platform)
      const articleType = customization.articleType || 'opinion_piece';
      const targetLength = customization.targetLength || 'medium';
      const writingStyle = customization.writingStyle || 'informative';
      const audience = customization.audience || 'general_public';
      
      const wordCount = targetLength === 'short' ? '800-1200' : 
                       targetLength === 'medium' ? '1500-2500' : '3000-5000';
      
      systemPrompt = `You are a professional ${articleType.replace('_', ' ')} writer. Create a comprehensive ${targetLength} length article (${wordCount} words) based on the provided audio content.

${languageInstruction}

ARTICLE TYPE: ${articleType.replace('_', ' ').toUpperCase()}
TARGET LENGTH: ${wordCount} words
WRITING STYLE: ${writingStyle}
AUDIENCE: ${audience.replace('_', ' ')}

CONTENT DEVELOPMENT:
1. Extract ALL key themes, arguments, and insights from the audio
2. Research and expand with additional context and background
3. Structure arguments logically with supporting evidence
4. Include expert perspectives and industry analysis
5. Provide balanced viewpoints where appropriate
6. Add actionable takeaways for readers

ARTICLE STRUCTURE:

HEADLINE:
[Compelling, SEO-optimized headline based on main topic]

SUBHEADLINE:
[Supporting statement that adds context]

INTRODUCTION (150-250 words):
- Hook that captures reader attention
- Brief context and background
- Clear thesis statement
- Preview of main arguments
- Why this matters to the audience

MAIN BODY (${Math.round(parseInt(wordCount.split('-')[1]) * 0.7)} words):
${articleType === 'opinion_piece' ? `
- Personal perspective and stance
- Supporting arguments with evidence
- Counter-arguments and rebuttals
- Personal experiences and anecdotes
- Call for action or change` : 
articleType === 'financial_article' ? `
- Market analysis and trends
- Financial data and statistics
- Expert opinions and forecasts
- Investment implications
- Risk assessment and recommendations` :
articleType === 'movie_review' ? `
- Plot summary (spoiler-free)
- Performance analysis
- Technical aspects (cinematography, sound, etc.)
- Thematic elements and messaging
- Comparison to similar works
- Recommendation and rating` :
articleType === 'book_review' ? `
- Brief plot overview (no spoilers)
- Character development analysis
- Writing style and prose quality
- Thematic depth and significance
- Target audience assessment
- Recommendation and rating` :
articleType === 'music_review' ? `
- Album/song overview and context
- Musical composition and production
- Lyrical content and meaning
- Artist's evolution and style
- Comparison to previous works
- Overall assessment and recommendation` :
`- Detailed analysis of key topics
- Supporting evidence and examples
- Expert insights and research
- Practical applications
- Industry implications`}

CONCLUSION (100-200 words):
- Summary of key points
- Reinforcement of main argument
- Final thoughts and reflections
- Call-to-action for readers
- Future implications or predictions

FORMATTING:
- Use subheadings for easy scanning
- Include relevant quotes from the audio
- Add bullet points for key takeaways
- Suggest images or graphics where appropriate

Create a well-researched, engaging article that thoroughly explores the topic discussed in the audio transcription.`;
      break;

    case 'prompt':
      if (customization.promptMode === 'initial') {
        systemPrompt = `You are a prompt engineering expert. Based on the user's description, create 3 different variations of clear, effective prompts for ${customization.promptType}. 
        
        Format the output exactly like this:

        1. [First prompt variation]

        2. [Second prompt variation]

        3. [Third prompt variation]

        Tips for Best Results:
        • [Tip 1]
        • [Tip 2]
        • [Tip 3]`;
      } else {
        systemPrompt = `You are a prompt engineering expert helping users refine their interactions with AI models. 
        Analyze the LLM's output and the user's question/concern, then provide:

        1. A clear, refined response to address the LLM's questions
        2. Suggestions for additional context or clarifications that could improve the response
        3. Alternative approaches to consider

        Original LLM Output:
        ${customization.llmOutput}

        User's Question/Concern:
        ${customization.notes}`;
      }
      break;
      
    case 'meeting':
      systemPrompt = `You are a professional meeting notes expert. Analyze the meeting recording and try to identify different speakers and extract:
      
      SPEAKER IDENTIFICATION: Try to distinguish between different speakers in the conversation:
      - Look for conversational patterns, transitions, and dialogue cues
      - Use names if mentioned, otherwise use descriptive labels (Speaker A, Speaker B, Main Presenter, etc.)
      - Note when the conversation shifts between speakers
      - Pay attention to voice patterns, speaking styles, and topic ownership
      
      1. Key Discussion Points by Speaker
      - Main topics covered and who discussed them
      - Important insights shared by each participant
      - Quote key statements and attribute them to speakers
      
      2. Decisions Made
      - List all decisions and agreements
      - Include who made or influenced each decision
      - Note any dissenting opinions and who expressed them
      
      3. Action Items by Person
      - Specific tasks assigned to individuals
      - Responsible parties clearly identified
      - Deadlines if mentioned
      - Follow up on commitments made by each speaker
      
      4. Follow-up Items
      - Questions to be answered and who should answer them
      - Topics for next meeting
      - Required preparations and responsible parties
      
      Format the output to clearly show:
      - Conversation flow: "Speaker A mentioned...", "Speaker B responded that...", "The main presenter explained..."
      - Who is responsible for each action: "John will handle...", "Sarah agreed to..."
      - Speaker-specific insights: "According to the finance team representative...", "The project manager noted..."`;
      break;
      
    case 'tasks':
      systemPrompt = `You are a task organization expert. Convert the following content into a structured ${customization.taskType} list.
      For each task, include:
      - Clear, actionable description
      - Priority level
      - Estimated time/effort
      - Any dependencies or prerequisites`;
      break;
      
    default:
      systemPrompt = `Convert the following content into a well-structured ${type} format.
      Consider the following preferences:
      - Tone: ${customization.tone}
      - Style: ${customization.style}
      - Target Audience: ${customization.audience}
      Additional Notes: ${customization.notes}`;
  }

  try {
    // Report progress for API call preparation
    onProgress?.(0.3);

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: transcription
        }
      ],
      temperature: 0.7,
      max_tokens: 4000
    });

    // Report progress for response processing
    onProgress?.(0.8);

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content generated');
    }

    // Report completion
    onProgress?.(1);

    return {
      content,
      type,
      language: language
    };
  } catch (error) {
    console.error('Content generation error:', error);
    throw error instanceof Error 
      ? error 
      : new Error('Failed to generate content. Please try again.');
  }
}
