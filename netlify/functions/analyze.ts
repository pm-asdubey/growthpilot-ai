import type { Handler } from '@netlify/functions'

const NVIDIA_API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions'
const MODEL = 'meta/llama-3.1-8b-instruct'
const TIMEOUT_MS = 20_000

const SYSTEM_PROMPT = `You are an expert Marketing Operations analyst. You receive structured analytics data from a lead intelligence platform and produce concise, actionable business insights.

Rules:
- Never invent statistics. Only interpret the numbers provided.
- Be direct and executive-ready. Avoid filler phrases.
- Every recommendation must reference a specific metric from the data.
- Respond ONLY with valid JSON matching the exact schema requested.`

function buildUserPrompt(payload: unknown): string {
  return `Analyse the following lead dataset metrics and return a JSON object with exactly these keys:
{
  "executiveSummary": "2-3 sentence overview of the dataset and conversion health",
  "keyFindings": ["finding 1", "finding 2", "finding 3"],
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"],
  "risks": ["risk 1", "risk 2"],
  "nextActions": ["action 1", "action 2", "action 3"]
}

Dataset metrics:
${JSON.stringify(payload, null, 2)}

Respond with only the JSON object. No markdown, no code fences, no commentary.`
}

function parseAIResponse(raw: string): Record<string, unknown> {
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim()
  return JSON.parse(cleaned) as Record<string, unknown>
}

function isValidInsights(obj: Record<string, unknown>): boolean {
  const requiredKeys = ['executiveSummary', 'keyFindings', 'recommendations', 'risks', 'nextActions']
  return requiredKeys.every((k) => k in obj)
}

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ success: false, error: 'Method not allowed' }) }
  }

  const apiKey = process.env.NVIDIA_API_KEY
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: 'NVIDIA_API_KEY is not configured.' }),
    }
  }

  let payload: unknown
  try {
    payload = JSON.parse(event.body ?? '{}') as unknown
  } catch {
    return { statusCode: 400, body: JSON.stringify({ success: false, error: 'Invalid JSON body.' }) }
  }

  const controller = new AbortController()
  const timer = setTimeout(() => { controller.abort() }, TIMEOUT_MS)

  try {
    const response = await fetch(NVIDIA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: buildUserPrompt(payload) },
        ],
        temperature: 0.3,
        max_tokens: 1024,
      }),
      signal: controller.signal,
    })

    clearTimeout(timer)

    if (!response.ok) {
      const text = await response.text()
      console.error('NVIDIA API error:', response.status, text)
      return {
        statusCode: 502,
        body: JSON.stringify({ success: false, error: 'AI service returned an error. Please retry.' }),
      }
    }

    const json = await response.json() as { choices?: { message?: { content?: string } }[] }
    const content = json.choices?.[0]?.message?.content ?? ''

    const parsed = parseAIResponse(content)

    if (!isValidInsights(parsed)) {
      return {
        statusCode: 502,
        body: JSON.stringify({ success: false, error: 'AI returned an unexpected response format.' }),
      }
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, data: parsed }),
    }
  } catch (err) {
    clearTimeout(timer)
    const isTimeout = err instanceof Error && err.name === 'AbortError'
    return {
      statusCode: 504,
      body: JSON.stringify({
        success: false,
        error: isTimeout
          ? 'The AI service timed out. Please retry.'
          : 'An unexpected error occurred. Please retry.',
      }),
    }
  }
}

export { handler }
