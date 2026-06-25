import type { AIRequestPayload } from '@/types/analysis'
import type { AnalyzeAPIResponse } from '@/types/ai'

const ENDPOINT = '/api/analyze'
const TIMEOUT_MS = 30_000

export async function fetchInsights(payload: AIRequestPayload): Promise<AnalyzeAPIResponse> {
  const controller = new AbortController()
  const timer = setTimeout(() => { controller.abort() }, TIMEOUT_MS)

  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })

    clearTimeout(timer)

    const json = await response.json() as AnalyzeAPIResponse
    return json
  } catch (err) {
    clearTimeout(timer)
    if (err instanceof Error && err.name === 'AbortError') {
      return { success: false, error: 'The AI service timed out. Please retry.' }
    }
    return { success: false, error: 'Could not reach the analysis service. Check your connection.' }
  }
}
