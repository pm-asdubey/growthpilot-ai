import type {
  CategoricalBreakdown,
  ChartDataSet,
  FeatureBucketBreakdown,
  FeatureImportance,
  KPISet,
  SegmentConfig,
  SegmentResult,
} from './analysis'
import type { AIResponse } from './ai'

export interface PersistedAnalysis {
  id: string                     // Unique ID (timestamp-based)
  analyzedAt: string             // ISO 8601
  fileName: string
  rowCount: number
  featureColumns: string[]
  kpis: KPISet
  segments: Pick<SegmentResult, 'sqlThreshold' | 'mqlThreshold'>
  segmentConfig: SegmentConfig
  featureImportance: FeatureImportance[]
  charts: ChartDataSet
  categoricalBreakdown: CategoricalBreakdown[]
  featureBuckets: FeatureBucketBreakdown[]
  aiInsights?: AIResponse        // Stored after AI call completes
}
