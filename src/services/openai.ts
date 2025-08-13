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
      
      if (['short-videos', 'tiktok', 'instagram-reels', 'youtube-shorts'].includes(platform)) {
        // Modern Short Video Script Generation
        const duration = customization.duration || '30-60';
        const contentStyle = customization.contentStyle || 'educational';
        const hookType = customization.hookType || 'question';
        const callToAction = customization.callToAction || 'follow';
        
        systemPrompt = `You are a viral short-form video strategist and script writer. Create a production-ready ${duration}-second script based on the audio content that follows proven engagement formulas.

${languageInstruction}

CRITICAL REQUIREMENTS:
- Script length: ${duration} seconds at 150-160 WPM
- Hook viewers within first 3 seconds
- Maintain visual interest every 3-5 seconds
- Include retention hooks throughout
- End with strong, specific call-to-action

PROVEN VIRAL STRUCTURE:

HOOK (0:00-0:03) - CRITICAL:
${hookType === 'question' ? 'Open with an intriguing question that creates immediate curiosity gap' : 
  hookType === 'bold_statement' ? 'Start with a controversial or surprising statement that stops the scroll' : 
  hookType === 'surprising_fact' ? 'Begin with an unexpected statistic or fact that challenges assumptions' : 
  'Open with story tension or cliffhanger that demands resolution'}

CONTENT DEVELOPMENT (0:03-${parseInt(duration.split('-')[1]) - 7}):
Transform the audio content using these viral techniques:
• Pattern Interrupts: Break expectations every few seconds
• Contrast: Show before/after, right/wrong, old/new ways
• Personal Stakes: Why this matters to the viewer personally
• Urgency: Why they need to know this NOW
• Social Proof: Reference trends, popular methods, or common experiences

RETENTION ELEMENTS:
• Visual Transitions: "Here's what most people don't know..."
• Lists: "3 things that changed everything..."
• Reveals: "But here's the real secret..."
• Callbacks: Reference the hook to create full-circle moment

STRONG CLOSE (${parseInt(duration.split('-')[1]) - 7}:${duration.split('-')[1]}):
• Payoff the hook promise
• One key takeaway
• Specific CTA: ${callToAction === 'follow' ? 'Follow for more insights like this' : 
               callToAction === 'save' ? 'Save this for later reference' : 
               callToAction === 'share' ? 'Share this with someone who needs to see it' : 
               'Comment your biggest takeaway below'}

PRODUCTION NOTES:
✓ Speaking pace: Slightly faster than normal conversation
✓ Text overlays: Key points and numbers
✓ Visual rhythm: Cut or transition every 2-3 seconds
✓ Captions: Full script with emphasis on key words
✓ B-roll: Relevant visuals that support each point

Custom user instructions: ${customization.notes || 'None provided'}

Create a complete, word-for-word script that delivers maximum value and engagement. Focus on practical, actionable insights from the audio that viewers can immediately apply.`;

      } else if (['youtube-videos', 'youtube'].includes(platform)) {
        // Modern YouTube Video Script
        const targetLength = customization.targetLength || '8-10';
        const videoFormat = customization.videoFormat || 'educational';
        
        const minMinutes = parseInt(targetLength.split('-')[0]);
        const maxMinutes = parseInt(targetLength.split('-')[1]);
        const avgMinutes = Math.round((minMinutes + maxMinutes) / 2);
        const totalWords = avgMinutes * 150;
        
        systemPrompt = `You are a YouTube algorithm expert and script writer. Create a comprehensive ${targetLength}-minute video script optimized for watch time, engagement, and algorithm performance.

${languageInstruction}

TARGET: ${totalWords} words (${avgMinutes} minutes at natural speaking pace)

ALGORITHM-OPTIMIZED STRUCTURE:

HOOK SEQUENCE (0:00-0:15):
• Pattern Interrupt: Grab attention in first 3 seconds
• Promise: Clearly state what viewers will learn/gain
• Credibility: Why you're qualified to teach this
• Preview: "By the end of this video, you'll know exactly..."
• Subscribe Hook: "If you find this valuable, subscribe because..."

INTRODUCTION (0:15-1:00):
• Problem/Pain Point: What challenge does this solve?
• Stakes: Why this matters more than ever
• Personal Connection: Your experience with this topic
• Video Structure: What's coming up

MAIN CONTENT (1:00-${maxMinutes - 2}:00):
Transform audio insights using YouTube's best practices:

CHAPTER 1: Foundation/Context
• Background and current landscape
• Why traditional approaches fail
• Set up the solution

CHAPTER 2: Deep Dive/Process
• Step-by-step methodology
• Real examples and case studies
• Common pitfalls and solutions

CHAPTER 3: Advanced Applications
• Next-level strategies
• Tools and resources
• Future considerations

ENGAGEMENT TECHNIQUES:
• Pattern Interrupts: "But here's where it gets interesting..."
• Direct Address: "Now you might be thinking..."
• Callbacks: Reference earlier points
• Cliffhangers: "I'll show you the most important part in just a moment..."
• Community Building: "Let me know in the comments..."

RETENTION HOOKS (Every 60-90 seconds):
• "The next point might surprise you..."
• "This is where most people mess up..."
• "Here's the part that changed everything for me..."
• "Wait until you see what happens next..."

CONCLUSION (${maxMinutes - 2}:00-${maxMinutes}:00):
• Key Takeaways Summary
• Action Steps for viewers
• Related video suggestions
• Community engagement (like/comment/subscribe)
• End screen optimization

OPTIMIZATION ELEMENTS:
✓ Watch Time: Structure to keep viewers until end
✓ Engagement: Regular CTAs for likes/comments
✓ Searchability: Include key terms naturally
✓ Shareability: Memorable quotes and insights
✓ Community: Build connection with audience

Custom user instructions: ${customization.notes || 'None provided'}

Create a complete script that maximizes viewer value while optimizing for YouTube's algorithm. Focus on delivering comprehensive, actionable insights from the audio content.`;

      } else if (['linkedin-posts', 'linkedin'].includes(platform)) {
        // Modern LinkedIn Content Strategy
        const contentTone = customization.contentTone || 'professional_insights';
        const postLength = customization.postLength || 'medium';
        const targetWords = postLength === 'short' ? '100-200' : postLength === 'medium' ? '200-400' : '400-600';
        
        systemPrompt = `You are a LinkedIn thought leader and content strategist. Create a high-engagement professional post based on the audio content that drives meaningful business conversations.

${languageInstruction}

TARGET LENGTH: ${targetWords} words for optimal LinkedIn engagement

LINKEDIN SUCCESS FORMULA:

HOOK (First 125 characters - critical for mobile preview):
Use one of these proven patterns:
• Controversial Take: Challenge conventional wisdom
• Personal Revelation: "I was wrong about..."
• Industry Insight: "After X years in [industry]..."
• Question Hook: "Why do most professionals..."
• Narrative Hook: "Yesterday, something happened that..."

STORYTELLING STRUCTURE:
Use the audio content to craft a compelling narrative:

SETUP: Context and background
• Industry situation or personal experience
• What led to this insight
• Why it matters now

CONFLICT: Challenge or realization
• What wasn't working
• The moment of truth
• Traditional approach problems

RESOLUTION: Solution or insight
• What actually works
• Key lessons learned
• Actionable strategies

PROFESSIONAL VALUE:
• Industry implications
• Career impact
• Business applications
• Future considerations

ENGAGEMENT DRIVERS:
• Ask specific questions
• Request personal experiences
• Invite professional opinions
• Encourage story sharing

LINKEDIN BEST PRACTICES:
✓ Native video concepts (if applicable)
✓ Professional yet personal tone
✓ Industry-relevant hashtags (3-5 maximum)
✓ Tag relevant people/companies when appropriate
✓ Create discussion-worthy content
✓ Include clear call-to-action

FORMATTING:
• Use line breaks for readability
• Include 1-2 professional emojis maximum
• Bold key insights where appropriate
• Structure for mobile viewing

Custom user instructions: ${customization.notes || 'None provided'}

Transform the audio insights into professional content that establishes thought leadership and drives meaningful engagement in your industry.`;

      } else if (['facebook-posts', 'facebook'].includes(platform)) {
        // Modern Facebook Engagement Strategy
        const audienceType = customization.audienceType || 'business_page';
        const engagementGoal = customization.engagementGoal || 'discussion';
        
        systemPrompt = `You are a Facebook engagement specialist. Create a highly shareable post based on the audio content that drives meaningful community interaction.

${languageInstruction}

ENGAGEMENT GOAL: ${engagementGoal}
AUDIENCE: ${audienceType}

FACEBOOK ALGORITHM OPTIMIZATION:

HOOK (First 40 characters - above fold):
Grab attention immediately with:
• Emotional trigger
• Relatable situation
• Surprising statement
• Personal confession

STORYTELLING APPROACH:
Transform audio content into relatable narrative:

EMOTIONAL CONNECTION:
• Personal vulnerability
• Shared experiences
• Universal challenges
• Human moments

VISUAL STORYTELLING:
• Paint vivid pictures with words
• Use sensory descriptions
• Create mental imagery
• Include specific details

COMMUNITY BUILDING:
• Inclusive language
• Shared values
• Common ground
• Collective experiences

ENGAGEMENT TRIGGERS:
• Ask for personal stories
• Request advice or opinions
• Invite reactions and shares
• Create discussion topics

VIRAL ELEMENTS:
• Relatable content
• Emotional resonance
• Shareable insights
• Conversation starters

FACEBOOK BEST PRACTICES:
✓ Mobile-first formatting
✓ Strategic emoji use (3-5 total)
✓ Tag friends/pages when relevant
✓ Include compelling visuals description
✓ Create save-worthy content
✓ Optimize for comments and shares

FORMATTING:
• Short paragraphs (2-3 sentences)
• Line breaks for readability
• Clear call-to-action
• Conversation starters

Custom user instructions: ${customization.notes || 'None provided'}

Create authentic, engaging content that builds community and drives meaningful conversations around the insights from the audio.`;

      } else if (['twitter-threads', 'twitter'].includes(platform)) {
        // Modern Twitter Thread Strategy
        const threadLength = customization.threadLength || '5-8';
        const contentStyle = customization.contentStyle || 'educational';
        
        systemPrompt = `You are a Twitter thread strategist and viral content creator. Transform the audio content into a compelling thread that maximizes engagement and shareability.

${languageInstruction}

THREAD TARGET: ${threadLength} tweets optimized for Twitter's algorithm

VIRAL THREAD FORMULA:

TWEET 1 (HOOK TWEET):
Must accomplish 4 things:
• Stop the scroll with bold statement
• Promise valuable insights
• Create curiosity gap
• Include thread indicator "🧵 Thread:"

PROVEN HOOK PATTERNS:
• "Most people think X, but here's what actually works..."
• "I learned [valuable lesson] the hard way. Here's what I wish I knew..."
• "After [experience], here are the insights that changed everything..."
• "[Number] lessons from [experience] that everyone should know..."

TWEETS 2-[N-1] (VALUE DELIVERY):
Each tweet should:
• Deliver one key insight
• Include specific examples
• Use numbers and data when possible
• End with curiosity for next tweet

CONTENT DEVELOPMENT:
• Extract key insights from audio
• Break into tweet-sized insights
• Add context and examples
• Include actionable takeaways

THREAD TECHNIQUES:
• Progressive disclosure
• Pattern interrupts
• Specific examples
• Counterintuitive insights
• Personal experiences

ENGAGEMENT OPTIMIZATION:
• Strategic line breaks
• Bullet points for readability
• Numbers and statistics
• Questions and polls
• Reply-worthy content

FINAL TWEET (CALL-TO-ACTION):
• Summarize key takeaway
• Ask for engagement (RT, like, follow)
• Mention related content
• Include relevant hashtags (2-3 max)

TWITTER BEST PRACTICES:
✓ Character limits (280 per tweet)
✓ Thread numbering (1/N, 2/N, etc.)
✓ Strategic hashtags
✓ Mention relevant accounts when appropriate
✓ Include engaging visuals concepts
✓ Optimize for retweets and quotes

FORMATTING REQUIREMENTS:
• Clear numbered sequence
• Consistent thread flow
• Mobile-optimized formatting
• Visual hierarchy with emojis

Custom user instructions: ${customization.notes || 'None provided'}

Create a thread that delivers maximum value while optimizing for Twitter's engagement algorithm. Transform the audio insights into tweetable wisdom that drives conversation and followers.`;

      } else if (['blog-posts', 'blog'].includes(platform)) {
        // Modern Blog Content Strategy
        const targetLength = customization.targetLength || 'medium';
        const writingStyle = customization.writingStyle || 'conversational';
        const seoFocus = customization.seoFocus || 'moderate';
        
        const wordCount = targetLength === 'short' ? '1000-1500' : 
                         targetLength === 'medium' ? '2000-3000' : '3500-5000';
        
        systemPrompt = `You are a professional blog content strategist and writer. Create a comprehensive, SEO-optimized blog post based on the audio content that ranks well and provides exceptional reader value.

${languageInstruction}

TARGET LENGTH: ${wordCount} words
WRITING STYLE: ${writingStyle}
SEO OPTIMIZATION: ${seoFocus}

MODERN BLOG STRUCTURE:

HEADLINE:
Create 3 compelling options:
• Benefit-driven: "How to [achieve desired outcome]"
• Number-based: "X Ways to [solve problem]"
• Question-based: "Why Do [target audience] Struggle With [topic]?"

INTRODUCTION (150-200 words):
• Hook: Start with story, statistic, or bold statement
• Problem: Define the challenge readers face
• Promise: What they'll learn/achieve
• Preview: What's coming in the article

MAIN CONTENT SECTIONS:

Section 1: Foundation/Context
• Background and current landscape
• Why this matters now
• Common misconceptions

Section 2: Core Insights
• Main teachings from audio
• Step-by-step processes
• Real examples and case studies

Section 3: Advanced Strategies
• Next-level applications
• Tools and resources
• Expert tips and tricks

Section 4: Implementation
• Action steps for readers
• Common obstacles and solutions
• Timeline and expectations

ENGAGEMENT ELEMENTS:
• Subheadings for scannability
• Bullet points and numbered lists
• Bold key insights
• Internal questions to readers
• Relevant examples and stories

SEO OPTIMIZATION:
• Natural keyword integration
• Semantic keyword variations
• Internal linking opportunities
• Meta description suggestion
• Featured snippet optimization

CONCLUSION (100-150 words):
• Recap key takeaways
• Reinforce main message
• Clear next steps
• Call-to-action for engagement

CONTENT UPGRADES:
• Downloadable resources
• Related article suggestions
• Newsletter signup incentives
• Social sharing prompts

READABILITY FEATURES:
✓ Short paragraphs (2-4 sentences)
✓ Conversational tone
✓ Active voice preference
✓ Transition sentences between sections
✓ Visual content suggestions

Custom user instructions: ${customization.notes || 'None provided'}

Transform the audio content into a comprehensive blog post that provides exceptional value to readers while optimizing for search engines and social sharing.`;

      } else {
        // Enhanced fallback for other platforms
        systemPrompt = `You are a professional content strategist specializing in ${platform} content creation. Transform the provided audio content into platform-optimized, engaging material that drives results.

${languageInstruction}

PLATFORM: ${platform}
CONTENT FOCUS: High-value, actionable insights

CONTENT STRATEGY:
• Extract core insights from audio
• Adapt to platform best practices
• Optimize for audience engagement
• Include clear value propositions
• End with strong call-to-action

CUSTOMIZATION:
• Tone: ${customization.tone || 'professional yet approachable'}
• Style: ${customization.style || 'informative and engaging'}
• Audience: ${customization.audience || 'professionals in the field'}

Custom user instructions: ${customization.notes || 'Focus on practical, actionable insights'}

Create comprehensive, platform-native content that maximizes engagement and delivers exceptional value to your audience.`;
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

    // Post-process content to remove generic markers and clean formatting
    const cleanContent = (content: string): string => {
      return content
        // Remove example markers and placeholder text
        .replace(/\*\*example\*\*/gi, '')
        .replace(/\*\*Example\*\*/gi, '')
        .replace(/\*\*EXAMPLE\*\*/gi, '')
        .replace(/\[example\]/gi, '')
        .replace(/\[Example\]/gi, '')
        .replace(/\[EXAMPLE\]/gi, '')
        .replace(/\(example\)/gi, '')
        .replace(/\(Example\)/gi, '')
        .replace(/\(EXAMPLE\)/gi, '')
        // Remove generic placeholders
        .replace(/\[insert.*?\]/gi, '')
        .replace(/\[add.*?\]/gi, '')
        .replace(/\[include.*?\]/gi, '')
        .replace(/\[your.*?\]/gi, '')
        .replace(/\[company.*?\]/gi, '')
        .replace(/\[brand.*?\]/gi, '')
        // Clean up excessive asterisks and formatting
        .replace(/\*\*\*+/g, '**')
        .replace(/\*\*\s*\*\*/g, '')
        // Remove placeholder text patterns
        .replace(/This is just an example.*?\./gi, '')
        .replace(/Note: This is.*?\./gi, '')
        .replace(/Disclaimer:.*?\./gi, '')
        // Clean up extra whitespace
        .replace(/\n\s*\n\s*\n/g, '\n\n')
        .replace(/^\s+|\s+$/g, '')
        .trim();
    };

    const processedContent = cleanContent(content);

    return {
      content: processedContent,
      type,
      language
    };
  } catch (error) {
    console.error('Content generation error:', error);
    throw error instanceof Error 
      ? error 
      : new Error('Failed to generate content. Please try again.');
  }
}
