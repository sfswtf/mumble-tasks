import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const assemblyaiApiKey = Deno.env.get('ASSEMBLYAI_API_KEY')
    if (!assemblyaiApiKey) {
      throw new Error('ASSEMBLYAI_API_KEY not configured')
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    const language = formData.get('language') || 'en'

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file uploaded' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Convert language code for AssemblyAI
    const assemblyaiLanguage = language === 'no' ? 'en' : language

    // Upload to AssemblyAI
    const uploadResponse = await fetch('https://api.assemblyai.com/v2/upload', {
      method: 'POST',
      headers: {
        'authorization': assemblyaiApiKey,
      },
      body: file,
    })

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload file to AssemblyAI')
    }

    const { upload_url } = await uploadResponse.json()

    // Create transcription job
    const transcriptResponse = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: {
        'authorization': assemblyaiApiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        audio_url: upload_url,
        language_code: assemblyaiLanguage,
      }),
    })

    if (!transcriptResponse.ok) {
      throw new Error('Failed to create transcription job')
    }

    const transcript = await transcriptResponse.json()

    // Poll for completion
    let status = 'queued'
    let result = transcript

    while (status === 'queued' || status === 'processing') {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const statusResponse = await fetch(`https://api.assemblyai.com/v2/transcript/${transcript.id}`, {
        headers: {
          'authorization': assemblyaiApiKey,
        },
      })

      if (!statusResponse.ok) {
        throw new Error('Failed to check transcription status')
      }

      result = await statusResponse.json()
      status = result.status
    }

    if (status === 'error') {
      throw new Error(result.error || 'Transcription failed')
    }

    return new Response(
      JSON.stringify({ text: result.text || '' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Transcription error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
