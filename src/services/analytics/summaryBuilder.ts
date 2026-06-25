import type {
  AIRequestPayload,
  CategoricalBreakdown,
  FeatureBucketBreakdown,
  FeatureImportance,
  KPISet,
} from '@/types/analysis'

// The UI shows every detected column and every category value (with an
// "Other" rollup for long tails) — that data is never restricted. The AI
// prompt, however, has a real context-window/cost budget, so only here do we
// trim to a representative subset before sending. This is a disclosed prompt
// constraint, not a silent analysis gap — the full breakdown is always
// visible in the app regardless of dataset size or column count.
const AI_MAX_CATEGORICAL_COLUMNS = 8
const AI_MAX_VALUES_PER_COLUMN = 8
const AI_MAX_FEATURE_COLUMNS = 8

function trimCategoricalForAI(items: CategoricalBreakdown[]): CategoricalBreakdown[] {
  return items
    .slice(0, AI_MAX_CATEGORICAL_COLUMNS)
    .map((item) => ({ ...item, rows: item.rows.slice(0, AI_MAX_VALUES_PER_COLUMN) }))
}

function trimBucketsForAI(items: FeatureBucketBreakdown[]): FeatureBucketBreakdown[] {
  return items.slice(0, AI_MAX_FEATURE_COLUMNS)
}

export function buildAIPayload(
  kpis: KPISet,
  featureImportance: FeatureImportance[],
  categoricalBreakdown: CategoricalBreakdown[],
  featureBuckets: FeatureBucketBreakdown[],
): AIRequestPayload {
  const topPredictors = featureImportance.slice(0, 3).map((fi) => fi.label)

  return {
    dataset: {
      rows: kpis.totalLeads,
      conversionRate: kpis.conversionRate,
    },
    kpis: {
      convertedLeads: kpis.convertedLeads,
      openLeads: kpis.openLeads,
      sqlCount: kpis.sqlCount,
      mqlCount: kpis.mqlCount,
      nurtureCount: kpis.nurtureCount,
      averageLeadScore: kpis.averageLeadScore,
    },
    topPredictors,
    categoricalBreakdown: trimCategoricalForAI(categoricalBreakdown),
    featureBuckets: trimBucketsForAI(featureBuckets),
  }
}
