import type { LeadScore, SegmentResult } from '@/types/analysis'

// Top 15% → SQL, next 15% → MQL, remaining → Nurture.
const SQL_PERCENTILE = 0.85   // Score must be >= 85th percentile
const MQL_PERCENTILE = 0.70   // Score must be >= 70th percentile

export function classifySegments(leadScores: LeadScore[]): SegmentResult {
  if (leadScores.length === 0) {
    return { sql: [], mql: [], nurture: [], sqlThreshold: 0, mqlThreshold: 0 }
  }

  // Sort a copy descending by score — do not mutate the input.
  const sorted = [...leadScores].sort((a, b) => b.score - a.score)

  const sqlThreshold = percentileScore(sorted, SQL_PERCENTILE)
  const mqlThreshold = percentileScore(sorted, MQL_PERCENTILE)

  const sql: number[] = []
  const mql: number[] = []
  const nurture: number[] = []

  for (const { index, score } of leadScores) {
    if (score >= sqlThreshold) {
      sql.push(index)
    } else if (score >= mqlThreshold) {
      mql.push(index)
    } else {
      nurture.push(index)
    }
  }

  return { sql, mql, nurture, sqlThreshold, mqlThreshold }
}

// Returns the score value at the given percentile rank in a desc-sorted array.
// e.g. percentileScore(sorted, 0.85) → the score at position floor(n * 0.15)
function percentileScore(sortedDesc: LeadScore[], percentile: number): number {
  const cutoffIndex = Math.floor(sortedDesc.length * (1 - percentile))
  const idx = Math.min(cutoffIndex, sortedDesc.length - 1)
  return sortedDesc[idx]?.score ?? 0
}
