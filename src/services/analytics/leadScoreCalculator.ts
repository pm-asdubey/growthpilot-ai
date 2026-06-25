import type { Lead } from '@/types/lead'
import type { FeatureImportance, LeadScore } from '@/types/analysis'

export function calculateLeadScores(
  leads: Lead[],
  featureImportance: FeatureImportance[],
): LeadScore[] {
  if (leads.length === 0) return []

  // Pre-compute min/max for every feature so normalisation is O(n) per lead.
  const stats = buildFeatureStats(leads, featureImportance)

  return leads.map((lead, index) => {
    let weightedSum = 0

    for (const fi of featureImportance) {
      const { min, max } = stats[fi.feature]
      const raw = numericValue(lead, fi.feature as keyof Lead)

      // Min-max normalisation → 0 if all values are equal (avoid divide-by-zero).
      const normalised = max === min ? 0 : (raw - min) / (max - min)
      weightedSum += normalised * fi.normalizedWeight
    }

    // Scale to 0–100 and clamp to handle floating-point edge cases.
    const score = Math.min(100, Math.max(0, Math.round(weightedSum * 100)))
    return { index, score }
  })
}

interface FeatureStat {
  min: number
  max: number
}

function buildFeatureStats(
  leads: Lead[],
  featureImportance: FeatureImportance[],
): Record<string, FeatureStat> {
  const stats: Record<string, FeatureStat> = {}

  for (const fi of featureImportance) {
    const values = leads.map((l) => numericValue(l, fi.feature as keyof Lead))
    stats[fi.feature] = {
      min: Math.min(...values),
      max: Math.max(...values),
    }
  }

  return stats
}

function numericValue(lead: Lead, feature: keyof Lead): number {
  const v = lead[feature]
  if (typeof v === 'boolean') return v ? 1 : 0
  return v
}
