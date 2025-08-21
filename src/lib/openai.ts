export const transcribeAudio = async (audioFile: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('file', audioFile);
    formData.append('model', 'whisper-1');

    const response = await fetch('/api/transcriptions/transcribe', {
      method: 'POST',
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
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that analyzes voice memo transcriptions. For each transcription, provide a concise summary and extract actionable tasks."
        },
        {
          role: "user",
          content: `Please analyze this voice memo transcription and provide: 1) A brief summary 2) A list of actionable tasks. Transcription: "${transcription}"`
        }
      ]
    });

    const response = completion.choices[0]?.message?.content || '';
    
    // Parse the response to extract summary and tasks
    const sections = response.split('\n\n');
    const summary = sections[0]?.replace(/^Summary:?\s*/i, '').trim();
    const tasksList = sections[1]?.split('\n')
      .filter(line => line.trim().startsWith('-') || line.trim().startsWith('•'))
      .map(task => task.replace(/^[-•]\s*/, '').trim());

    return {
      summary,
      tasks: tasksList
    };
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw error;
  }
}