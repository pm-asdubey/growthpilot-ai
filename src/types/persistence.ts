import type { ChartDataSet, FeatureImportance, KPISet, SegmentResult } from './analysis'

// Subset of AnalysisResult stored in localStorage.
// Raw leadScores[] is excluded — too large for storage and not needed on the Dashboard.
export interface PersistedAnalysis {
  kpis: KPISet
  segments: Pick<SegmentResult, 'sqlThreshold' | 'mqlThreshold'>
  featureImportance: FeatureImportance[]
  charts: ChartDataSet
  fileName: string
  rowCount: number
  analyzedAt: string   // ISO 8601
}
