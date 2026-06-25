import type { ConversionResult, KPISet, LeadScore, SegmentResult } from '@/types/analysis'

export function generateKPIs(
  conversion: ConversionResult,
  segments: SegmentResult,
  leadScores: LeadScore[],
): KPISet {
  const averageLeadScore =
    leadScores.length === 0
      ? 0
      : Math.round(leadScores.reduce((sum, ls) => sum + ls.score, 0) / leadScores.length)

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
