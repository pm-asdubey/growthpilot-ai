import type { Handler } from '@netlify/functions'

const NVIDIA_API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions'
const MODEL = 'meta/llama-3.1-8b-instruct'
const TIMEOUT_MS = 60_000
const ANALYZE_MAX_TOKENS = 1600
const QUESTION_MAX_TOKENS = 400

const SYSTEM_PROMPT = `You are a Marketing Operations analyst advising on which leads to prioritize. Always respond with ONLY a JSON object — no markdown, no explanation, no code fences.

The data includes two breakdown arrays you must actually use, not ignore. Every row in both has two distinct numbers — do not confuse them:
- conversionRate: % of ALL leads in that group (including already-converted ones) that converted historically. Use this for "what converts best" questions.
- sqlRate: % of OPEN (not-yet-converted) leads in that group that are currently classified as SQL, the top-priority tier. Use this for "what should I prioritize right now" or "where should I focus" questions — it's about current pipeline, not history.

- categoricalBreakdown: for columns like Industry, Region, Lead Source — each entry lists every value with its conversionRate and sqlRate.
- featureBuckets: for numeric columns like company size or page visits — each entry lists value ranges with conversionRate and sqlRate.

When asked or writing about "what converts best", look up the row with the highest conversionRate. When asked "what should I prioritize" or "where is my best open pipeline", look up the row with the highest sqlRate instead — these can point to different rows. Always quote the exact label and number from the row you used. Never guess or invent a value (e.g. never say "medium-sized companies" unless a row literally labeled that way is the one with the highest rate — quote the real range instead, e.g. "leads with 51–200 employees convert at 22%, the highest of any range"). If no breakdown array covers what was asked, say so explicitly rather than fabricating an answer.`

function buildAnalyzePrompt(payload: unknown): string {
  return `Analyse these lead generation metrics and return a JSON object with this EXACT structure. All values must be plain strings or arrays of plain strings — no nested objects. Keep strings concise but always cite real numbers from the data (under 30 words is fine if it includes a number).

{
  "executiveSummary": "2 sentences referencing specific numbers from kpis or dataset",
  "keyFindings": ["finding citing a specific row's conversionRate from categoricalBreakdown or featureBuckets", "finding 2", "finding 3"],
  "recommendations": ["recommendation citing a specific row's sqlRate — which segment to prioritize right now", "recommendation 2", "recommendation 3"],
  "risks": ["risk 1", "risk 2"],
  "nextActions": ["action 1", "action 2", "action 3"],
  "suggestedQuestions": ["question 1", "question 2", "question 3", "question 4"]
}

suggestedQuestions should be answerable using categoricalBreakdown or featureBuckets, e.g. "Which lead source converts best?" or "Which industry should I prioritize right now?".

Metrics:
${JSON.stringify(payload)}`
}

interface PreviousQA { question: string; answer: string }

function buildQuestionPrompt(question: string, context: unknown, previousQA: PreviousQA[]): string {
  const history = previousQA.length > 0
    ? `\nPrevious questions already answered in this conversation:\n${previousQA.map((qa) => `Q: ${qa.question}\nA: ${qa.answer}`).join('\n')}\n`
    : ''

  return `You are analysing a lead generation dataset with these metrics, including per-category and per-value-range breakdowns:
${JSON.stringify(context)}
${history}
Each breakdown row has conversionRate (historical: % of all leads in that group that converted) and sqlRate (current: % of OPEN leads in that group that are top-priority SQL). Use conversionRate for "what converts best" questions and sqlRate for "what should I prioritize / focus on now" questions — they can point to different answers.

Answer this new question (2-4 sentences). If it's about a category or feature, find the matching row in categoricalBreakdown or featureBuckets, pick whichever of conversionRate/sqlRate fits the question, and quote its exact label and number — do not guess:
${question}

Return a JSON object with this EXACT structure:
{ "answer": "your answer here", "followUpQuestions": ["natural follow-up 1", "natural follow-up 2", "natural follow-up 3"] }

followUpQuestions should be NEW questions that build naturally on this answer and the conversation so far — not repeats of questions already asked.`
}

// Attempts to recover a usable JSON object even if the model's output was
// truncated mid-array (a common failure mode when max_tokens is reached).
function extractJSON(raw: string): Record<string, unknown> {
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim()

  try {
    return JSON.parse(cleaned) as Record<string, unknown>
  } catch { /* fall through to repair strategies */ }

  const start = cleaned.indexOf('{')
  if (start === -1) throw new Error('No JSON object found')

  const end = cleaned.lastIndexOf('}')
  if (end > start) {
    try {
      return JSON.parse(cleaned.slice(start, end + 1)) as Record<string, unknown>
    } catch { /* try repair below */ }
  }

  // Truncated mid-string/array: trim back to the last complete field and
  // close the object. This recovers most of the content instead of failing outright.
  let candidate = cleaned.slice(start)
  // Drop a dangling, incomplete trailing string/array element.
  candidate = candidate.replace(/,\s*"[^"]*$/, '').replace(/,\s*\[[^\]]*$/, '')
  // Balance any unterminated string.
  const quoteCount = (candidate.match(/(?<!\\)"/g) ?? []).length
  if (quoteCount % 2 !== 0) candidate += '"'
  // Close any open arrays/objects in reverse order of opening.
  const opens = candidate.match(/[[{]/g) ?? []
  const closes = candidate.match(/[\]}]/g) ?? []
  const deficit = opens.length - closes.length
  for (let i = 0; i < deficit; i++) {
    const lastOpenBracket = candidate.lastIndexOf('[')
    const lastOpenBrace = candidate.lastIndexOf('{')
    candidate += lastOpenBracket > lastOpenBrace ? ']' : '}'
  }

  return JSON.parse(candidate) as Record<string, unknown>
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

function toStrArr(v: unknown): string[] {
  return Array.isArray(v) ? v.map(toStr).filter((s) => s.trim().length > 0) : []
}

function normaliseInsights(obj: Record<string, unknown>): Record<string, unknown> {
  return {
    executiveSummary: toStr(obj.executiveSummary),
    keyFindings: toStrArr(obj.keyFindings),
    recommendations: toStrArr(obj.recommendations),
    risks: toStrArr(obj.risks),
    nextActions: toStrArr(obj.nextActions),
    suggestedQuestions: toStrArr(obj.suggestedQuestions),
  }
}

// Only the core narrative fields are mandatory. suggestedQuestions is best-effort —
// if the model truncates before reaching it, we still show a complete, useful response.
function isValidInsights(obj: Record<string, unknown>): boolean {
  return ['executiveSummary', 'keyFindings', 'recommendations', 'risks', 'nextActions'].every((k) => {
    const v = obj[k]
    return k === 'executiveSummary' ? typeof v === 'string' && v.length > 0 : Array.isArray(v) && v.length > 0
  })
}

async function callNVIDIA(apiKey: string, userPrompt: string, signal: AbortSignal, maxTokens: number): Promise<string> {
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
      max_tokens: maxTokens,
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
      const previousQA = Array.isArray(body.previousQA) ? body.previousQA as PreviousQA[] : []
      content = await callNVIDIA(apiKey, buildQuestionPrompt(question, context, previousQA), controller.signal, QUESTION_MAX_TOKENS)
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { mode: _ignored, ...payload } = body
      content = await callNVIDIA(apiKey, buildAnalyzePrompt(payload), controller.signal, ANALYZE_MAX_TOKENS)
    }

    clearTimeout(timer)

    let parsed: Record<string, unknown>
    try {
      parsed = extractJSON(content)
    } catch {
      console.error('JSON parse failed. Raw content:', content)
      return { statusCode: 502, body: JSON.stringify({ success: false, error: 'AI returned an unexpected format. Please retry.' }) }
    }

    if (mode === 'question') {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: true,
          data: {
            answer: toStr(parsed.answer ?? parsed),
            followUpQuestions: toStrArr(parsed.followUpQuestions),
          },
        }),
      }
    }

    const normalised = normaliseInsights(parsed)
    if (!isValidInsights(normalised)) {
      console.error('Incomplete insights:', JSON.stringify(normalised))
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
