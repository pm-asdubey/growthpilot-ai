import type { Lead } from '@/types/lead'
import type { FeatureImportance, LeadScore } from '@/types/analysis'

export function calculateLeadScores(leads: Lead[], featureImportance: FeatureImportance[]): LeadScore[] {
  if (leads.length === 0 || featureImportance.length === 0) return []

  const stats = buildStats(leads, featureImportance)

  return leads.map((lead, index) => {
    let weightedSum = 0
    for (const fi of featureImportance) {
      const { min, max } = stats[fi.feature] ?? { min: 0, max: 0 }
      const raw = numericVal(lead, fi.feature)
      const normalised = max === min ? 0 : (raw - min) / (max - min)
      weightedSum += normalised * fi.normalizedWeight
    }
    const score = Math.min(100, Math.max(0, Math.round(weightedSum * 100)))
    return { index, score }
  })
}

function buildStats(leads: Lead[], featureImportance: FeatureImportance[]) {
  const stats: Record<string, { min: number; max: number }> = {}
  for (const fi of featureImportance) {
    const values = leads.map((l) => numericVal(l, fi.feature))
    stats[fi.feature] = { min: Math.min(...values), max: Math.max(...values) }
  }
  return stats
}

function numericVal(lead: Lead, feature: string): number {
  const v = lead[feature]
  if (typeof v === 'boolean') return v ? 1 : 0
  return v
}
