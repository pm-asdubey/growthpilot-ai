// Chart data contracts — one interface per Recharts chart in Phase 5.

export interface FeatureImportanceChartData {
  feature: string   // Human-readable label (e.g. "Pricing Page Visits")
  value: number     // normalizedWeight * 100, integer 0-100
}

export interface LeadScoreHistogramData {
  bucket: string    // e.g. "0–10", "10–20"
  count: number
}

export interface SegmentDistributionData {
  label: 'SQL' | 'MQL' | 'Nurture'
  count: number
}

export interface ConversionTrendData {
  bucket: string      // e.g. "0–30 days"
  converted: number
  notConverted: number
}
