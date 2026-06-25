import type { Handler } from '@netlify/functions'

const NVIDIA_API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions'
const MODEL = 'meta/llama-3.1-8b-instruct'
const TIMEOUT_MS = 60_000
const ANALYZE_MAX_TOKENS = 1600
const QUESTION_MAX_TOKENS = 400

const SYSTEM_PROMPT = `You are a Marketing Operations strategist briefing a VP of Marketing. Always respond with ONLY a JSON object — no markdown, no explanation, no code fences.

Lead with the INSIGHT and what to DO about it. A number is supporting evidence, not the point — never write a sentence that is just a label and a percentage with no business meaning attached. Bad: "LinkedIn converts at 18%, the highest of any source." Good: "Referral and LinkedIn leads consistently outperform paid channels — worth shifting budget toward warm introductions instead of cold outbound." Use at most one number per sentence, only when it strengthens the point, and skip it entirely if the insight stands on its own.

Look for PATTERNS across multiple rows and across categoricalBreakdown AND featureBuckets together, not one isolated stat at a time — e.g. "your best leads share three traits: mid-size companies, webinar attendance, and a Referral source — that combination is your real ICP" is far more useful than three separate one-line stats. Treat the dataset like a strategist would: what's the one or two things this business should actually change, and why does the data support that.

The data includes two breakdown arrays:
- categoricalBreakdown: for columns like Industry, Region, Lead Source — each entry lists every value with conversionRate (historical: did they convert) and sqlRate (current: are open leads with this value top-priority right now).
- featureBuckets: same idea for numeric columns like company size or page visits, as value ranges instead of categories.

Use conversionRate to talk about what has historically worked. Use sqlRate to talk about where to focus right now on open pipeline — these can point to different answers, so don't conflate them. Never invent a category, range, or number that isn't actually in the data — if you're not sure, say so rather than fabricating something that sounds plausible.`

function buildAnalyzePrompt(payload: unknown): string {
  return `Analyse these lead generation metrics and return a JSON object with this EXACT structure. All values must be plain strings or arrays of plain strings — no nested objects. Write each item as a business insight with a clear "so what" — not a recitation of a single statistic.

{
  "executiveSummary": "2 sentences: the single biggest pattern in this data and why it matters",
  "keyFindings": ["ONE pattern in plain language, with AT MOST one number — e.g. 'Mid-size companies convert far better than very small or very large ones' (not 'X% vs Y% vs Z%')", "finding 2", "finding 3"],
  "recommendations": ["a concrete action grounded in the data — where to focus effort and why", "recommendation 2", "recommendation 3"],
  "risks": ["a real risk this data reveals, in business terms", "risk 2"],
  "nextActions": ["a specific next step", "action 2", "action 3"],
  "suggestedQuestions": ["question 1", "question 2", "question 3", "question 4"]
}

suggestedQuestions should be things a marketer would actually want to know next, e.g. "What does my ideal customer look like?" or "Where should I focus my outbound team this week?".

Metrics:
${JSON.stringify(payload)}`
}

interface PreviousQA { question: string; answer: string }

function buildQuestionPrompt(question: string, context: unknown, previousQA: PreviousQA[]): string {
  const history = previousQA.length > 0
    ? `\nPrevious questions already answered in this conversation:\n${previousQA.map((qa) => `Q: ${qa.question}\nA: ${qa.answer}`).join('\n')}\n`
    : ''

  return `You are a Marketing Operations strategist analysing a lead generation dataset with these metrics, including per-category and per-value-range breakdowns:
${JSON.stringify(context)}
${history}
Each breakdown row has conversionRate (historical: did leads with this value convert) and sqlRate (current: are open leads with this value top-priority right now). Use conversionRate for "what converts best" questions and sqlRate for "what should I prioritize / focus on now" — they can point to different answers.

Answer this question in 2-4 sentences, written as a strategist's take, not a stat lookup: lead with what it means and what to do, using at most one supporting number from the data and only if it strengthens the point. If the question is about a category or feature, ground your answer in the matching row from categoricalBreakdown or featureBuckets — but don't just restate the row, explain why it matters. Never invent a number or category that isn't in the data:
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
