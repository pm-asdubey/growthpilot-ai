import { useCallback, useEffect, useState } from 'react'
import { fetchInsights } from '@/services/api/analyzeService'
import type { AIRequestPayload } from '@/types/analysis'
import type { AIResponse } from '@/types/ai'

export type InsightState = 'idle' | 'loading' | 'done' | 'error'

export interface UseAIInsightsResult {
  insightState: InsightState
  insights: AIResponse | null
  error: string | null
  retry: () => void
}

export function useAIInsights(payload: AIRequestPayload | null): UseAIInsightsResult {
  const [insightState, setInsightState] = useState<InsightState>('idle')
  const [insights, setInsights] = useState<AIResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const run = useCallback(async (p: AIRequestPayload) => {
    setInsightState('loading')
    setInsights(null)
    setError(null)

    const result = await fetchInsights(p)

    if (result.success && result.data && 'executiveSummary' in result.data) {
      setInsights(result.data)
      setInsightState('done')
    } else {
      setError(result.error ?? 'An unexpected error occurred.')
      setInsightState('error')
    }
  }, [])

  useEffect(() => {
    if (payload === null) {
      setInsightState('idle')
      setInsights(null)
      setError(null)
      return
    }
    void run(payload)
  }, [payload, run])

  const retry = useCallback(() => {
    if (payload) void run(payload)
  }, [payload, run])

  return { insightState, insights, error, retry }
}
