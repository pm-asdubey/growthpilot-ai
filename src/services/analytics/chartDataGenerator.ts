import type { ConversionResult, FeatureImportance, LeadScore } from '@/types/analysis'
import type { ChartDataSet } from '@/types/analysis'

const HISTOGRAM_BUCKETS = [
  '0–10', '10–20', '20–30', '30–40', '40–50',
  '50–60', '60–70', '70–80', '80–90', '90–100',
]

export function generateChartData(
  featureImportance: FeatureImportance[],
  leadScores: LeadScore[],
  conversion: ConversionResult,
): ChartDataSet {
  return {
    featureImportance: buildFeatureImportanceChart(featureImportance),
    leadScoreHistogram: buildLeadScoreHistogram(leadScores),
    conversionTrend: conversion.conversionByDaysBucket,
  }
}

function buildFeatureImportanceChart(featureImportance: FeatureImportance[]) {
  return featureImportance.map((fi) => ({ feature: fi.label, value: fi.importance }))
}

function buildLeadScoreHistogram(leadScores: LeadScore[]) {
  const counts = new Array<number>(10).fill(0)
  for (const { score } of leadScores) {
    const bucketIndex = Math.min(Math.floor(score / 10), 9)
    counts[bucketIndex] = (counts[bucketIndex] ?? 0) + 1
  }
  return HISTOGRAM_BUCKETS.map((bucket, i) => ({ bucket, count: counts[i] ?? 0 }))
}
