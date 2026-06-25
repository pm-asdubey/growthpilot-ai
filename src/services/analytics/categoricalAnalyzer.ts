import type { Lead } from '@/types/lead'
import type { BreakdownRow, CategoricalBreakdown, SegmentResult } from '@/types/analysis'

const MAX_VISIBLE_VALUES_PER_COLUMN = 10  // beyond this, remaining values are rolled into "Other" — never dropped
const MIN_GROUP_SIZE = 3                  // ignore groups too small to be statistically meaningful

function labelFor(column: string): string {
  return column.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function buildRow(value: string, indices: number[], leads: Lead[], sqlSet: Set<number>): BreakdownRow {
  const convertedCount = indices.filter((i) => leads[i].converted).length
  const openIndices = indices.filter((i) => !leads[i].converted)
  const sqlCount = openIndices.filter((i) => sqlSet.has(i)).length
  return {
    label: value,
    count: indices.length,
    conversionRate: Math.round((convertedCount / indices.length) * 1000) / 10,
    sqlRate: openIndices.length === 0 ? 0 : Math.round((sqlCount / openIndices.length) * 1000) / 10,
  }
}

// Weighted-average merge of every row beyond the visible cap, so the
// breakdown's total count always matches the dataset — no lead's category
// silently disappears just because its value wasn't in the top N.
function mergeIntoOther(rows: BreakdownRow[]): BreakdownRow {
  const totalCount = rows.reduce((s, r) => s + r.count, 0)
  const weightedConv = rows.reduce((s, r) => s + r.conversionRate * r.count, 0) / totalCount
  const weightedSql = rows.reduce((s, r) => s + r.sqlRate * r.count, 0) / totalCount
  return {
    label: `Other (${String(rows.length)} more values)`,
    count: totalCount,
    conversionRate: Math.round(weightedConv * 10) / 10,
    sqlRate: Math.round(weightedSql * 10) / 10,
  }
}

// Computes conversion rate and SQL rate per distinct value of every
// categorical column — this is what actually answers "which lead source
// converts best, and which should I prioritize?" instead of leaving the AI
// to guess from a feature name. Processes ALL detected categorical columns —
// no arbitrary column limit.
export function analyzeCategoricalFeatures(
  categoricalData: Record<string, string>[],
  leads: Lead[],
  segments: SegmentResult,
  categoricalColumns: string[],
): CategoricalBreakdown[] {
  if (categoricalData.length === 0 || categoricalColumns.length === 0) return []

  const sqlSet = new Set(segments.sql)

  const breakdowns = categoricalColumns.map((column) => {
    const groups = new Map<string, number[]>()
    categoricalData.forEach((row, index) => {
      const value = row[column] || '(blank)'
      const indices = groups.get(value)
      if (indices) indices.push(index)
      else groups.set(value, [index])
    })

    const allRows = Array.from(groups.entries())
      .filter(([, indices]) => indices.length >= MIN_GROUP_SIZE)
      .map(([value, indices]) => buildRow(value, indices, leads, sqlSet))
      .sort((a, b) => b.count - a.count)

    const visible = allRows.slice(0, MAX_VISIBLE_VALUES_PER_COLUMN)
    const overflow = allRows.slice(MAX_VISIBLE_VALUES_PER_COLUMN)
    const rows = overflow.length > 0 ? [...visible, mergeIntoOther(overflow)] : visible

    return { column, label: labelFor(column), rows }
  })

  return breakdowns.filter((b) => b.rows.length > 0)
}
