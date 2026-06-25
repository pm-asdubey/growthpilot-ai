import type { Lead } from '@/types/lead'
import { KNOWN_FEATURE_LABELS } from '@/types/lead'
import type { FeatureImportance } from '@/types/analysis'

function featureLabel(column: string): string {
  return KNOWN_FEATURE_LABELS[column] ?? column.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export function calculateFeatureImportance(leads: Lead[]): FeatureImportance[] {
  if (leads.length === 0) return []

  const converted = leads.filter((l) => l.converted)
  const notConverted = leads.filter((l) => !l.converted)

  // Discover feature columns dynamically from the first lead
  const featureColumns = Object.keys(leads[0]).filter((k) => k !== 'converted')

  if (featureColumns.length === 0) return []

  if (converted.length === 0 || notConverted.length === 0) {
    return featureColumns.map((feature) => ({
      feature, label: featureLabel(feature), importance: 0, normalizedWeight: 0,
    }))
  }

  const rawScores = featureColumns.map((feature) => {
    const meanConv = mean(converted.map((l) => numericVal(l, feature)))
    const meanNot = mean(notConverted.map((l) => numericVal(l, feature)))
    return { feature, raw: Math.abs(meanConv - meanNot) }
  })

  const totalRaw = rawScores.reduce((sum, s) => sum + s.raw, 0)

  return rawScores
    .map(({ feature, raw }) => {
      const normalizedWeight = totalRaw === 0 ? 1 / featureColumns.length : raw / totalRaw
      return {
        feature,
        label: featureLabel(feature),
        importance: Math.round(normalizedWeight * 100),
        normalizedWeight: Math.round(normalizedWeight * 10_000) / 10_000,
      }
    })
    .sort((a, b) => b.importance - a.importance)
}

function numericVal(lead: Lead, feature: string): number {
  const v = lead[feature]
  if (typeof v === 'boolean') return v ? 1 : 0
  return v
}

function mean(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((sum, v) => sum + v, 0) / values.length
}
