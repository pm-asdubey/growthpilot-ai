import { useEffect, useState } from 'react'
import { calculateConversion } from '@/services/analytics/conversionCalculator'
import { generateChartData } from '@/services/analytics/chartDataGenerator'
import { calculateFeatureImportance } from '@/services/analytics/featureImportanceCalculator'
import { generateKPIs } from '@/services/analytics/kpiGenerator'
import { calculateLeadScores } from '@/services/analytics/leadScoreCalculator'
import { classifySegments } from '@/services/analytics/segmentClassifier'
import { buildAIPayload } from '@/services/analytics/summaryBuilder'
import type { AnalysisResult } from '@/types/analysis'
import type { Lead } from '@/types/lead'

export type AnalysisState = 'idle' | 'running' | 'done' | 'error'

export interface UseAnalysisResult {
  analysisState: AnalysisState
  analysisResult: AnalysisResult | null
  error: string | null
}

export function useAnalysis(leads: Lead[] | null, featureColumns: string[] = []): UseAnalysisResult {
  const [analysisState, setAnalysisState] = useState<AnalysisState>('idle')
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (leads === null) {
      setAnalysisState('idle')
      setAnalysisResult(null)
      setError(null)
      return
    }

    setAnalysisState('running')
    setAnalysisResult(null)
    setError(null)

    try {
      const conversion = calculateConversion(leads)
      const featureImportance = calculateFeatureImportance(leads)
      const leadScores = calculateLeadScores(leads, featureImportance)
      const segments = classifySegments(leadScores)
      const kpis = generateKPIs(conversion, segments, leadScores)
      const charts = generateChartData(featureImportance, leadScores, segments, conversion)
      const aiPayload = buildAIPayload(kpis, featureImportance)

      const result: AnalysisResult = {
        dataset: { rows: leads.length, columns: featureColumns, featureColumns },
        kpis,
        featureImportance,
        leadScores,
        segments,
        charts,
        aiPayload,
      }

      setAnalysisResult(result)
      setAnalysisState('done')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.'
      setError(`Analytics engine error: ${message}`)
      setAnalysisState('error')
    }
  }, [leads, featureColumns])

  return { analysisState, analysisResult, error }
}
