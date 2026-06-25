import { useEffect, useState } from 'react'
import { analyzeCategoricalFeatures } from '@/services/analytics/categoricalAnalyzer'
import { calculateConversion } from '@/services/analytics/conversionCalculator'
import { generateChartData } from '@/services/analytics/chartDataGenerator'
import { analyzeFeatureBuckets } from '@/services/analytics/featureBucketAnalyzer'
import { calculateFeatureImportance } from '@/services/analytics/featureImportanceCalculator'
import { generateKPIs } from '@/services/analytics/kpiGenerator'
import { calculateLeadScores } from '@/services/analytics/leadScoreCalculator'
import { classifySegments } from '@/services/analytics/segmentClassifier'
import { buildAIPayload } from '@/services/analytics/summaryBuilder'
import type { AnalysisResult, SegmentConfig } from '@/types/analysis'
import { DEFAULT_SEGMENT_CONFIG } from '@/types/analysis'
import type { Lead } from '@/types/lead'

export type AnalysisState = 'idle' | 'running' | 'done' | 'error'

export interface UseAnalysisResult {
  analysisState: AnalysisState
  analysisResult: AnalysisResult | null
  error: string | null
}

export function useAnalysis(
  leads: Lead[] | null,
  featureColumns: string[] = [],
  segmentConfig: SegmentConfig = DEFAULT_SEGMENT_CONFIG,
  categoricalData: Record<string, string>[] = [],
  categoricalColumns: string[] = [],
): UseAnalysisResult {
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
      const segments = classifySegments(leads, leadScores, segmentConfig)
      const kpis = generateKPIs(conversion, segments, leadScores)
      const charts = generateChartData(featureImportance, leadScores, conversion)
      const categoricalBreakdown = analyzeCategoricalFeatures(categoricalData, leads, segments, categoricalColumns)
      const featureBuckets = analyzeFeatureBuckets(leads, segments, featureImportance)
      const aiPayload = buildAIPayload(kpis, featureImportance, categoricalBreakdown, featureBuckets)

      const result: AnalysisResult = {
        dataset: { rows: leads.length, columns: featureColumns, featureColumns },
        kpis,
        featureImportance,
        leadScores,
        segments,
        charts,
        categoricalBreakdown,
        featureBuckets,
        aiPayload,
        segmentConfig,
      }

      setAnalysisResult(result)
      setAnalysisState('done')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.'
      setError(`Analytics engine error: ${message}`)
      setAnalysisState('error')
    }
  }, [leads, featureColumns, segmentConfig, categoricalData, categoricalColumns])

  return { analysisState, analysisResult, error }
}
