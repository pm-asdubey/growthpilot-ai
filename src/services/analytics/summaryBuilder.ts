import type { AIRequestPayload, FeatureImportance, KPISet } from '@/types/analysis'

export function buildAIPayload(
  kpis: KPISet,
  featureImportance: FeatureImportance[],
): AIRequestPayload {
  // Send only the top 3 predictors by importance — concise context for the AI.
  const topPredictors = featureImportance.slice(0, 3).map((fi) => fi.label)

  return {
    dataset: {
      rows: kpis.totalLeads,
      conversionRate: kpis.conversionRate,
    },
    kpis: {
      sqlCount: kpis.sqlCount,
      mqlCount: kpis.mqlCount,
      nurtureCount: kpis.nurtureCount,
      averageLeadScore: kpis.averageLeadScore,
    },
    topPredictors,
  }
}
