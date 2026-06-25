import type {
  ConversionTrendData,
  FeatureImportanceChartData,
  LeadScoreHistogramData,
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

// Thresholds are learned from your OWN conversion history, not fixed
// percentages. sqlConvertedPercentile=0.25 means: find the score below which
// only 25% of leads that ACTUALLY converted fell — i.e. ~75% of historical
// converters scored at or above this. An open lead clearing that bar matches
// the profile of a typical converter. mqlConvertedPercentile is a lower,
// more lenient bar (must be < sqlConvertedPercentile).
export interface SegmentConfig {
  sqlConvertedPercentile: number
  mqlConvertedPercentile: number
}

export const DEFAULT_SEGMENT_CONFIG: SegmentConfig = {
  sqlConvertedPercentile: 0.25,
  mqlConvertedPercentile: 0.10,
}

// SQL/MQL/Nurture are computed ONLY among leads that have NOT yet converted —
// prioritizing open pipeline is the entire point of this classification.
// Already-converted leads are tracked separately and excluded from scoring buckets.
export interface SegmentResult {
  converted: number[]    // Indices of already-converted leads — not scored/prioritized
  sql: number[]          // Indices of OPEN leads scoring at/above sqlThreshold
  mql: number[]          // Indices of OPEN leads scoring at/above mqlThreshold but below sqlThreshold
  nurture: number[]      // Remaining OPEN leads
  sqlThreshold: number   // Score threshold, learned from where converted leads scored (see SegmentConfig)
  mqlThreshold: number   // Score threshold, learned from where converted leads scored (see SegmentConfig)
}

export interface KPISet {
  totalLeads: number
  convertedLeads: number
  openLeads: number          // totalLeads - convertedLeads — the leads SQL/MQL/Nurture apply to
  conversionRate: number     // Percentage, 2 decimal places
  averageLeadScore: number   // Rounded integer, OPEN leads only (excludes already-converted)
  sqlCount: number
  mqlCount: number
  nurtureCount: number
}

export interface ChartDataSet {
  featureImportance: FeatureImportanceChartData[]
  leadScoreHistogram: LeadScoreHistogramData[]
  conversionTrend: ConversionTrendData[]
}

// One row of a breakdown table — a category value or a numeric value range,
// always paired with what actually happened for leads in that group.
// sqlRate (not average score) is the actionable number: a lead score is a
// blend of every feature, so one feature's bucket only nudges the average by
// a few points even when that feature alone is highly predictive — the
// average dilutes exactly the signal the table is trying to show. SQL rate
// answers the question a marketer actually has: "if a lead is in this group,
// how likely is it to be a top-priority lead?"
export interface BreakdownRow {
  label: string             // category value (e.g. "LinkedIn") or value range (e.g. "12–45")
  count: number
  conversionRate: number    // Percentage, 1 decimal place — converted ÷ total in group
  sqlRate: number           // Percentage, 1 decimal place — SQL ÷ OPEN leads in group
}

// Conversion rate + SQL rate per distinct value of a categorical column
// (Industry, Region, Lead Source, etc.) — answers "which X converts best?"
export interface CategoricalBreakdown {
  column: string
  label: string
  rows: BreakdownRow[]  // sorted by count descending, top values only
}

// Conversion rate + SQL rate per value range of a numeric feature —
// answers "what range of X converts best?" instead of just "X is important".
export interface FeatureBucketBreakdown {
  feature: string
  label: string
  rows: BreakdownRow[]  // ~4 equal-sized rank buckets, ascending by range
}

// The complete payload sent to the Netlify function in Phase 6.
// Never contains raw lead rows or PII — only aggregated breakdowns.
export interface AIRequestPayload {
  dataset: {
    rows: number
    conversionRate: number
  }
  kpis: {
    convertedLeads: number
    openLeads: number
    sqlCount: number
    mqlCount: number
    nurtureCount: number
    averageLeadScore: number
  }
  topPredictors: string[]  // Top 3 feature labels by importance
  categoricalBreakdown: CategoricalBreakdown[]
  featureBuckets: FeatureBucketBreakdown[]
}

// The full output of the analytics pipeline.
export interface AnalysisResult {
  dataset: { rows: number; columns: string[]; featureColumns: string[] }
  kpis: KPISet
  featureImportance: FeatureImportance[]
  leadScores: LeadScore[]
  segments: SegmentResult
  charts: ChartDataSet
  categoricalBreakdown: CategoricalBreakdown[]
  featureBuckets: FeatureBucketBreakdown[]
  aiPayload: AIRequestPayload
  segmentConfig: SegmentConfig
}
