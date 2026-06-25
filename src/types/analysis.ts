import type {
  ConversionTrendData,
  FeatureImportanceChartData,
  LeadScoreHistogramData,
  SegmentDistributionData,
} from './chart'

export interface FeatureImportance {
  feature: string           // Column name as-is
  label: string             // Human-readable label for display
  importance: number        // Integer 0-100
  normalizedWeight: number  // Float 0-1; all weights sum to 1
}

export interface LeadScore {
  index: number   // Row position in the original Lead[]
  score: number   // Integer 0-100
}

export interface ConversionResult {
  totalLeads: number
  convertedLeads: number
  nonConvertedLeads: number
  conversionRate: number          // Percentage, 2 decimal places
  conversionByDaysBucket: ConversionTrendData[]
}

export interface SegmentResult {
  sql: number[]         // Indices of SQL leads  (top 15%)
  mql: number[]         // Indices of MQL leads  (next 15%)
  nurture: number[]     // Indices of remaining leads
  sqlThreshold: number  // Minimum score to be SQL
  mqlThreshold: number  // Minimum score to be MQL
}

export interface KPISet {
  totalLeads: number
  convertedLeads: number
  conversionRate: number    // Percentage, 2 decimal places
  averageLeadScore: number  // Rounded integer
  sqlCount: number
  mqlCount: number
  nurtureCount: number
}

export interface ChartDataSet {
  featureImportance: FeatureImportanceChartData[]
  leadScoreHistogram: LeadScoreHistogramData[]
  segmentDistribution: SegmentDistributionData[]
  conversionTrend: ConversionTrendData[]
}

// The complete payload sent to the Netlify function in Phase 6.
// Never contains raw lead rows or PII.
export interface AIRequestPayload {
  dataset: {
    rows: number
    conversionRate: number
  }
  kpis: {
    sqlCount: number
    mqlCount: number
    nurtureCount: number
    averageLeadScore: number
  }
  topPredictors: string[]  // Top 3 feature labels by importance
}

// The full output of the analytics pipeline.
export interface AnalysisResult {
  dataset: { rows: number; columns: string[]; featureColumns: string[] }
  kpis: KPISet
  featureImportance: FeatureImportance[]
  leadScores: LeadScore[]
  segments: SegmentResult
  charts: ChartDataSet
  aiPayload: AIRequestPayload
}
