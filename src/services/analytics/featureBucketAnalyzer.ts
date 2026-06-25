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

function binaryLabel(v: number): string {
  if (v === 0) return 'No'
  if (v === 1) return 'Yes'
  return String(v)
}

function buildRow(label: string, indices: number[], leads: Lead[], sqlSet: Set<number>): BreakdownRow {
  const convertedCount = indices.filter((i) => leads[i].converted).length
  const openIndices = indices.filter((i) => !leads[i].converted)
  const sqlCount = openIndices.filter((i) => sqlSet.has(i)).length
  return {
    label,
    count: indices.length,
    conversionRate: Math.round((convertedCount / indices.length) * 1000) / 10,
    sqlRate: openIndices.length === 0 ? 0 : Math.round((sqlCount / openIndices.length) * 1000) / 10,
  }
}

// Splits leads into ~4 equal-sized rank buckets per feature (not fixed value
// ranges, which wouldn't adapt across wildly different scales) and reports
// conversion rate + SQL rate per bucket. This is what answers "what range of
// company size converts best, and should I prioritize?" with real numbers.
// Processes every numeric feature that has importance — no arbitrary cap.
//
// Features with only 1–2 distinct values (booleans like webinar_attended, or
// any numeric column that happens to only take two values) are NEVER rank-
// chunked into 4 groups — a binary feature only has two real states, and
// forcing a 4-way split on it can produce a misleading 3rd "mixed" bucket
// whenever the 0/1 split doesn't land exactly on a chunk boundary. Those get
// exactly one row per distinct value instead (e.g. "Yes" / "No").
export function analyzeFeatureBuckets(
  leads: Lead[],
  segments: SegmentResult,
  featureImportance: FeatureImportance[],
): FeatureBucketBreakdown[] {
  if (leads.length === 0) return []

  const sqlSet = new Set(segments.sql)

  const breakdowns = featureImportance.map((fi) => {
    const indexed = leads.map((lead, i) => ({ i, v: numericVal(lead, fi.feature) }))
    const distinctValues = [...new Set(indexed.map((x) => x.v))].sort((a, b) => a - b)

    if (distinctValues.length <= 2) {
      const rows = distinctValues.map((v) => {
        const indices = indexed.filter((x) => x.v === v).map((x) => x.i)
        const isBoolLike = distinctValues.length === 2 && distinctValues[0] === 0 && distinctValues[1] === 1
        return buildRow(isBoolLike ? binaryLabel(v) : formatRange(v, v), indices, leads, sqlSet)
      })
      return { feature: fi.feature, label: fi.label, rows }
    }

    indexed.sort((a, b) => a.v - b.v)
    const n = indexed.length
    const chunkSize = Math.ceil(n / BUCKET_COUNT)
    const rawRows: BreakdownRow[] = []

    for (let b = 0; b < BUCKET_COUNT; b++) {
      const chunk = indexed.slice(b * chunkSize, (b + 1) * chunkSize)
      if (chunk.length === 0) continue
      const min = chunk[0].v
      const max = chunk[chunk.length - 1].v
      rawRows.push(buildRow(formatRange(min, max), chunk.map((c) => c.i), leads, sqlSet))
    }

    // Skewed/low-variance distributions can still produce identical ranges
    // across consecutive buckets — merge those rather than showing duplicates.
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

  // A feature with only one resulting row has no spread worth showing.
  return breakdowns.filter((f) => f.rows.length > 1)
}
