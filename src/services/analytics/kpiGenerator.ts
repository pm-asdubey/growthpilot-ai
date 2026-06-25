import type { ConversionResult, KPISet, LeadScore, SegmentResult } from '@/types/analysis'

export function generateKPIs(
  conversion: ConversionResult,
  segments: SegmentResult,
  leadScores: LeadScore[],
): KPISet {
  // Scoped to OPEN leads only (sql + mql + nurture) — that's the population
  // this product is actually trying to help you act on. Blending in
  // already-converted leads (who score systematically higher, by definition
  // of how the model learns from them) would inflate this number into
  // something that doesn't describe your current pipeline.
  const openIndices = new Set<number>([...segments.sql, ...segments.mql, ...segments.nurture])
  const openScores = leadScores.filter((ls) => openIndices.has(ls.index)).map((ls) => ls.score)
  const averageLeadScore =
    openScores.length === 0 ? 0 : Math.round(openScores.reduce((sum, s) => sum + s, 0) / openScores.length)

  return {
    totalLeads: conversion.totalLeads,
    convertedLeads: conversion.convertedLeads,
    openLeads: conversion.totalLeads - conversion.convertedLeads,
    conversionRate: conversion.conversionRate,
    averageLeadScore,
    sqlCount: segments.sql.length,
    mqlCount: segments.mql.length,
    nurtureCount: segments.nurture.length,
  }
}
