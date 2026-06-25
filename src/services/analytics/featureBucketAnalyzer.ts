import type { Lead } from '@/types/lead'
import type { BreakdownRow, FeatureBucketBreakdown, FeatureImportance, SegmentResult } from '@/types/analysis'

const BUCKET_COUNT = 4

function numericVal(lead: Lead, feature: string): number {
  const v = lead[feature]
  return typeof v === 'boolean' ? (v ? 1 : 0) : v
}

function formatRange(min: number, max: number): string {
  const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1))
  return min === max ? fmt(min) : `${fmt(min)}–${fmt(max)}`
}

// Splits leads into ~4 equal-sized rank buckets per feature (not fixed value
// ranges, which wouldn't adapt across wildly different scales) and reports
// conversion rate + SQL rate per bucket. This is what answers "what range of
// company size converts best, and should I prioritize?" with real numbers.
// Processes every numeric feature that has importance — no arbitrary cap.
export function analyzeFeatureBuckets(
  leads: Lead[],
  segments: SegmentResult,
  featureImportance: FeatureImportance[],
): FeatureBucketBreakdown[] {
  if (leads.length === 0) return []

  const sqlSet = new Set(segments.sql)

  const breakdowns = featureImportance.map((fi) => {
    const indexed = leads.map((lead, i) => ({ i, v: numericVal(lead, fi.feature) }))
    indexed.sort((a, b) => a.v - b.v)

    const n = indexed.length
    const chunkSize = Math.ceil(n / BUCKET_COUNT)
    const rawRows: BreakdownRow[] = []

    for (let b = 0; b < BUCKET_COUNT; b++) {
      const chunk = indexed.slice(b * chunkSize, (b + 1) * chunkSize)
      if (chunk.length === 0) continue
      const min = chunk[0].v
      const max = chunk[chunk.length - 1].v
      const convertedCount = chunk.filter(({ i }) => leads[i].converted).length
      const openChunk = chunk.filter(({ i }) => !leads[i].converted)
      const sqlCount = openChunk.filter(({ i }) => sqlSet.has(i)).length
      rawRows.push({
        label: formatRange(min, max),
        count: chunk.length,
        conversionRate: Math.round((convertedCount / chunk.length) * 1000) / 10,
        sqlRate: openChunk.length === 0 ? 0 : Math.round((sqlCount / openChunk.length) * 1000) / 10,
      })
    }

    // Skewed/low-variance distributions can produce identical ranges across
    // consecutive buckets (e.g. a mostly-binary feature) — merge those rather
    // than showing misleading duplicate rows.
    const rows: BreakdownRow[] = []
    for (const row of rawRows) {
      const last = rows.at(-1)
      if (last?.label === row.label) {
        const totalCount = last.count + row.count
        last.conversionRate = Math.round(
          ((last.conversionRate * last.count + row.conversionRate * row.count) / totalCount) * 10,
        ) / 10
        last.sqlRate = Math.round(
          ((last.sqlRate * last.count + row.sqlRate * row.count) / totalCount) * 10,
        ) / 10
        last.count = totalCount
      } else {
        rows.push({ ...row })
      }
    }

    return { feature: fi.feature, label: fi.label, rows }
  })

  // A feature with only one merged bucket has no spread worth showing.
  return breakdowns.filter((f) => f.rows.length > 1)
}
