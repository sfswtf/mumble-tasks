import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const RETRYABLE_STATUS = new Set([429, 502, 503, 504, 529])

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

function computeBackoffMs(attempt: number) {
  // Exponential backoff with jitter, capped.
  const base = 400
  const cap = 8000
  const exp = Math.min(cap, base * Math.pow(2, attempt))
  const jitter = Math.floor(Math.random() * 250)
  return exp + jitter
}

function safeJsonParse(text: string) {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

function buildErrorPayload(params: {
  provider: string
  status: number
  rawText: string
}) {
  const { provider, status, rawText } = params
  const parsed = safeJsonParse(rawText)

  // Anthropic error format often looks like:
  // {"type":"error","error":{"type":"overloaded_error","message":"Overloaded"},"request_id":"req_..."}
  const requestId =
    parsed?.request_id ||
    parsed?.requestId ||
    parsed?.error?.request_id ||
    parsed?.error?.requestId ||
    undefined

  const upstreamType = parsed?.error?.type || parsed?.type || undefined
  const upstreamMessage = parsed?.error?.message || parsed?.message || rawText || 'Unknown error'

  let code = `${provider}_error`
  if (provider === 'anthropic' && status === 529) code = 'anthropic_overloaded'
  if (provider === 'anthropic' && upstreamType === 'overloaded_error') code = 'anthropic_overloaded'
  if (provider === 'anthropic' && status === 429) code = 'anthropic_rate_limited'

  return {
    error: {
      provider,
      status,
      code,
      message: upstreamMessage,
      requestId,
      upstreamType,
    },
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY')
    if (!anthropicApiKey) {
      throw new Error('ANTHROPIC_API_KEY not configured')
    }

    const { prompt, temperature = 0.7, max_tokens = 1000, model, provider = 'anthropic' } = await req.json()

    if (!prompt || typeof prompt !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Missing prompt' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    let content = ''

    if (provider === 'anthropic') {
      const maxRetries = 3
      let lastErrorText = ''
      let lastStatus = 500

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': anthropicApiKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: model || 'claude-3-haiku-20240307',
            max_tokens: max_tokens,
            temperature: temperature,
            messages: [
              { role: 'user', content: prompt }
            ]
          })
        })

        if (response.ok) {
          const data = await response.json()
          content = data.content?.[0]?.text || ''
          lastErrorText = ''
          lastStatus = 200
          break
        }

        lastStatus = response.status
        lastErrorText = await response.text()

        const shouldRetry = RETRYABLE_STATUS.has(response.status) && attempt < maxRetries
        if (shouldRetry) {
          const delay = computeBackoffMs(attempt)
          console.warn(`Anthropic request failed with ${response.status}. Retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`)
          await sleep(delay)
          continue
        }

        const payload = buildErrorPayload({
          provider: 'anthropic',
          status: response.status,
          rawText: lastErrorText,
        })

        return new Response(
          JSON.stringify(payload),
          {
            status: response.status,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      if (lastStatus !== 200 && !content) {
        const payload = buildErrorPayload({
          provider: 'anthropic',
          status: lastStatus,
          rawText: lastErrorText || 'Unknown error',
        })
        return new Response(
          JSON.stringify(payload),
          {
            status: lastStatus || 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
    } else {
      throw new Error('OpenAI provider temporarily unavailable. Use Anthropic provider.')
    }

    return new Response(
      JSON.stringify({ content }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Generation error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
