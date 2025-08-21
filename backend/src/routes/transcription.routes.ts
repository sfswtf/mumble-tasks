import express from 'express';
import multer from 'multer';
import { AssemblyAI } from 'assemblyai';
import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config';
// Auth can be re-enabled later; keeping routes open for alpha testing

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

if (!config.assemblyaiApiKey) {
  throw new Error('ASSEMBLYAI_API_KEY is required');
}
if (!config.anthropicApiKey) {
  throw new Error('ANTHROPIC_API_KEY is required');
}

const assemblyaiClient = new AssemblyAI({ apiKey: config.assemblyaiApiKey });
const anthropicClient = new Anthropic({ apiKey: config.anthropicApiKey });

router.post('/transcribe', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { language = 'en' } = req.body as { language?: string };

    // Convert language code for AssemblyAI (it uses 'en' for English, 'es' for Spanish, etc.)
    const assemblyaiLanguage = language === 'no' ? 'en' : language; // AssemblyAI doesn't support Norwegian, fallback to English

    const params = {
      audio: req.file.buffer,
      language_code: assemblyaiLanguage as any,
    };

    const transcript = await assemblyaiClient.transcripts.transcribe(params);

    if (transcript.status === 'error') {
      throw new Error(transcript.error || 'Transcription failed');
    }

    return res.json({ text: transcript.text || '' });
  } catch (err) {
    return next(err);
  }
});

router.post('/generate', async (req, res, next) => {
  try {
    const { prompt, temperature = 0.7, max_tokens = 1000, model, provider = 'anthropic' } = req.body as {
      prompt?: string;
      temperature?: number;
      max_tokens?: number;
      model?: string;
      provider?: 'openai' | 'anthropic';
    };

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Missing prompt' });
    }

    let content = '';
    
    if (provider === 'anthropic') {
      const completion = await anthropicClient.messages.create({
        model: model || 'claude-3-haiku-20240307',
        max_tokens: max_tokens,
        temperature: temperature,
        messages: [
          { role: 'user', content: prompt }
        ]
      });
      content = completion.content?.[0]?.type === 'text' ? completion.content[0].text : '';
    } else {
      // OpenAI fallback (if needed in future)
      throw new Error('OpenAI provider temporarily unavailable. Use Anthropic provider.');
    }

    return res.json({ content });
  } catch (err) {
    return next(err);
  }
});

export default router;


