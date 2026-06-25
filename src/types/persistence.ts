import type { ChartDataSet, FeatureImportance, KPISet, SegmentResult } from './analysis'
import type { AIResponse } from './ai'

export interface PersistedAnalysis {
  id: string                     // Unique ID (timestamp-based)
  analyzedAt: string             // ISO 8601
  fileName: string
  rowCount: number
  featureColumns: string[]
  kpis: KPISet
  segments: Pick<SegmentResult, 'sqlThreshold' | 'mqlThreshold'>
  featureImportance: FeatureImportance[]
  charts: ChartDataSet
  aiInsights?: AIResponse        // Stored after AI call completes
}
