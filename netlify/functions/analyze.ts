import type { Handler } from '@netlify/functions'

const NVIDIA_API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions'
const MODEL = 'meta/llama-3.1-8b-instruct'
const TIMEOUT_MS = 60_000

const SYSTEM_PROMPT = `You are a Marketing Operations analyst. Always respond with ONLY a JSON object — no markdown, no explanation, no code fences.`

function buildAnalyzePrompt(payload: unknown): string {
  return `Analyse these lead generation metrics and return a JSON object with this EXACT structure. All values must be plain strings or arrays of plain strings — no nested objects.

{
  "executiveSummary": "2 sentence overview referencing specific numbers",
  "keyFindings": ["finding 1", "finding 2", "finding 3"],
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"],
  "risks": ["risk 1", "risk 2"],
  "nextActions": ["action 1", "action 2", "action 3"],
  "suggestedQuestions": ["question about the data 1", "question about the data 2", "question about the data 3", "question about the data 4"]
}

The suggestedQuestions should be specific, answerable questions about this dataset that a Marketing Operations manager would want answered. Examples: "What company size converts best?", "How many converted leads visited the pricing page?", "What is the average days to conversion?".

Metrics:
${JSON.stringify(payload)}`
}

function buildQuestionPrompt(question: string, context: unknown): string {
  return `You are analysing a lead generation dataset with these metrics:
${JSON.stringify(context)}

Answer this specific question concisely (2-4 sentences, reference specific numbers where possible):
${question}

Return a JSON object: { "answer": "your answer here" }`
}

function extractJSON(raw: string): Record<string, unknown> {
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim()
  try {
    return JSON.parse(cleaned) as Record<string, unknown>
  } catch {
    const start = cleaned.indexOf('{')
    const end = cleaned.lastIndexOf('}')
    if (start !== -1 && end > start) {
      return JSON.parse(cleaned.slice(start, end + 1)) as Record<string, unknown>
    }
    throw new Error('No valid JSON found')
  }
}

function toStr(v: unknown): string {
  if (typeof v === 'string') return v
  if (typeof v === 'object' && v !== null) {
    const o = v as Record<string, string | undefined>
    const val = o.text ?? o.description ?? o.content ?? o.action ?? o.summary
    if (val !== undefined) return val
    return JSON.stringify(v)
  }
  return String(v)
}

function normaliseInsights(obj: Record<string, unknown>): Record<string, unknown> {
  const toStrArr = (v: unknown): string[] => Array.isArray(v) ? v.map(toStr) : []
  return {
    executiveSummary: toStr(obj.executiveSummary),
    keyFindings: toStrArr(obj.keyFindings),
    recommendations: toStrArr(obj.recommendations),
    risks: toStrArr(obj.risks),
    nextActions: toStrArr(obj.nextActions),
    suggestedQuestions: toStrArr(obj.suggestedQuestions),
  }
}

function isValidInsights(obj: Record<string, unknown>): boolean {
  return ['executiveSummary', 'keyFindings', 'recommendations', 'risks', 'nextActions'].every((k) => k in obj)
}

async function callNVIDIA(apiKey: string, userPrompt: string, signal: AbortSignal): Promise<string> {
  const response = await fetch(NVIDIA_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.2,
      max_tokens: 500,
      stream: true,
    }),
    signal,
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`NVIDIA API error ${String(response.status)}: ${text}`)
  }

  const reader = response.body?.getReader()
  if (!reader) throw new Error('No response body')

  let fullContent = ''
  const decoder = new TextDecoder()

  for (;;) {
    const result: { done: boolean; value?: Uint8Array } = await reader.read()
    if (result.done) break

    const chunk = decoder.decode(result.value, { stream: true })
    for (const line of chunk.split('\n').filter((l) => l.startsWith('data: '))) {
      const data = line.slice(6).trim()
      if (data === '[DONE]') continue
      try {
        const parsed = JSON.parse(data) as { choices?: { delta?: { content?: string } }[] }
        fullContent += parsed.choices?.[0]?.delta?.content ?? ''
      } catch { /* skip malformed chunk */ }
    }
  }
  return fullContent
}

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ success: false, error: 'Method not allowed' }) }
  }

  const apiKey = process.env.NVIDIA_API_KEY
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ success: false, error: 'NVIDIA_API_KEY is not configured.' }) }
  }

  let body: Record<string, unknown>
  try {
    body = JSON.parse(event.body ?? '{}') as Record<string, unknown>
  } catch {
    return { statusCode: 400, body: JSON.stringify({ success: false, error: 'Invalid request body.' }) }
  }

  const mode = (body.mode as string | undefined) ?? 'analyze'
  const controller = new AbortController()
  const timer = setTimeout(() => { controller.abort() }, TIMEOUT_MS)

  try {
    let content: string

    if (mode === 'question') {
      const question = body.question as string
      const context = body.context
      content = await callNVIDIA(apiKey, buildQuestionPrompt(question, context), controller.signal)
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { mode: _ignored, ...payload } = body
      content = await callNVIDIA(apiKey, buildAnalyzePrompt(payload), controller.signal)
    }

    clearTimeout(timer)

    let parsed: Record<string, unknown>
    try {
      parsed = extractJSON(content)
    } catch {
      console.error('JSON parse failed:', content.slice(0, 200))
      return { statusCode: 502, body: JSON.stringify({ success: false, error: 'AI returned an unexpected format. Please retry.' }) }
    }

    if (mode === 'question') {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: true, data: { answer: toStr(parsed.answer ?? parsed) } }),
      }
    }

    const normalised = normaliseInsights(parsed)
    if (!isValidInsights(normalised)) {
      return { statusCode: 502, body: JSON.stringify({ success: false, error: 'AI response was incomplete. Please retry.' }) }
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, data: normalised }),
    }
  } catch (err) {
    clearTimeout(timer)
    const isTimeout = err instanceof Error && err.name === 'AbortError'
    console.error('Function error:', err)
    return {
      statusCode: 504,
      body: JSON.stringify({
        success: false,
        error: isTimeout ? 'The AI service timed out. Please retry.' : 'An unexpected error occurred. Please retry.',
      }),
    }
  }
}

export { handler }
