export const transcribeAudio = async (audioFile: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('file', audioFile);
    formData.append('model', 'whisper-1');

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/transcribe`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Transcription failed');
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error('Transcription error:', error);
    throw error;
  }
};

export const generateSummaryAndTasks = async (transcription: string) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        prompt: `ROLE: You are a professional personal assistant and productivity expert specializing in voice memo analysis and task extraction.

TASK: Analyze the voice memo transcription to provide a comprehensive summary and extract all actionable tasks with clear priorities.

ANALYSIS REQUIREMENTS:
1. Create a detailed summary that captures all key points, decisions, and context
2. Extract specific, actionable tasks with clear next steps
3. Prioritize tasks by urgency and importance
4. Include relevant deadlines, people involved, and dependencies

FORMAT YOUR RESPONSE AS:
Summary: [Comprehensive summary of the voice memo]
Tasks:
- [High Priority] Task description with specific action required
- [Medium Priority] Task description with specific action required
- [Low Priority] Task description with specific action required

Transcription: "${transcription}"`,
        provider: 'anthropic',
        model: 'claude-3-haiku-20240307'
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate summary and tasks');
    }

    const data = await response.json();
    const content = data.content || '';
    
    // Parse the response to extract summary and tasks
    const sections = content.split('\n\n');
    const summary = sections[0]?.replace(/^Summary:?\s*/i, '').trim();
    const tasksList = sections[1]?.split('\n')
      .filter((line: string) => line.trim().startsWith('-') || line.trim().startsWith('•'))
      .map((task: string) => task.replace(/^[-•]\s*/, '').trim());

    return {
      summary,
      tasks: tasksList
    };
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
}
