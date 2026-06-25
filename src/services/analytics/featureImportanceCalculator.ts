import type { Lead } from '@/types/lead'
import type { FeatureImportance } from '@/types/analysis'

type FeatureColumn = keyof Omit<Lead, 'converted'>

// Human-readable labels — keyed by Lead column name (excluding the target variable).
const FEATURE_LABELS: Record<FeatureColumn, string> = {
  employees: 'Company Size',
  trial_users: 'Trial Users',
  pricing_page_visits: 'Pricing Page Visits',
  daily_active_users: 'Daily Active Users',
  invited_teammates: 'Invited Teammates',
  webinar_attended: 'Webinar Attended',
  support_tickets: 'Support Tickets',
  days_since_signup: 'Days Since Signup',
}

// Explicit typed array so TS knows every element is a valid Lead key.
const FEATURE_COLUMNS: FeatureColumn[] = [
  'employees',
  'trial_users',
  'pricing_page_visits',
  'daily_active_users',
  'invited_teammates',
  'webinar_attended',
  'support_tickets',
  'days_since_signup',
]

export function calculateFeatureImportance(leads: Lead[]): FeatureImportance[] {
  const converted = leads.filter((l) => l.converted)
  const notConverted = leads.filter((l) => !l.converted)

  // Need at least one lead in each group to compute a meaningful difference.
  if (converted.length === 0 || notConverted.length === 0) {
    return FEATURE_COLUMNS.map((feature) => ({
      feature,
      label: FEATURE_LABELS[feature],
      importance: 0,
      normalizedWeight: 0,
    }))
  }

  // Raw score = |mean(converted) - mean(not converted)| for each feature.
  const rawScores = FEATURE_COLUMNS.map((feature) => {
    const meanConv = mean(converted.map((l) => numericValue(l, feature as keyof Lead)))
    const meanNotConv = mean(notConverted.map((l) => numericValue(l, feature as keyof Lead)))
    return { feature, raw: Math.abs(meanConv - meanNotConv) }
  })

  const totalRaw = rawScores.reduce((sum, s) => sum + s.raw, 0)

  // Normalise so all weights sum to 1.0.
  const results: FeatureImportance[] = rawScores
    .map(({ feature, raw }) => {
      const normalizedWeight = totalRaw === 0 ? 0 : raw / totalRaw
      return {
        feature,
        label: FEATURE_LABELS[feature],
        importance: Math.round(normalizedWeight * 100),
        normalizedWeight: Math.round(normalizedWeight * 10_000) / 10_000, // 4 dp
      }
    })
    .sort((a, b) => b.importance - a.importance)

  return results
}

function numericValue(lead: Lead, feature: keyof Lead): number {
  const v = lead[feature]
  if (typeof v === 'boolean') return v ? 1 : 0
  return v
}

function mean(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((sum, v) => sum + v, 0) / values.length
}
