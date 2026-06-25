import type { Lead } from '@/types/lead'
import type { ConversionResult } from '@/types/analysis'
import type { ConversionTrendData } from '@/types/chart'

const DAY_BUCKETS = [
  { label: '0–30 days', min: 0, max: 30 },
  { label: '31–60 days', min: 31, max: 60 },
  { label: '61–90 days', min: 61, max: 90 },
  { label: '91–120 days', min: 91, max: 120 },
  { label: '120+ days', min: 121, max: Infinity },
]

export function calculateConversion(leads: Lead[]): ConversionResult {
  const totalLeads = leads.length
  const convertedLeads = leads.filter((l) => l.converted).length
  const nonConvertedLeads = totalLeads - convertedLeads
  const conversionRate = totalLeads === 0 ? 0 : round2(convertedLeads / totalLeads * 100)

  const conversionByDaysBucket = buildTrendData(leads)

  return { totalLeads, convertedLeads, nonConvertedLeads, conversionRate, conversionByDaysBucket }
}

function buildTrendData(leads: Lead[]): ConversionTrendData[] {
  return DAY_BUCKETS.map(({ label, min, max }) => {
    const bucket = leads.filter((l) => l.days_since_signup >= min && l.days_since_signup <= max)
    const converted = bucket.filter((l) => l.converted).length
    const notConverted = bucket.length - converted
    return { bucket: label, converted, notConverted }
  }).filter((b) => b.converted + b.notConverted > 0)  // Drop empty buckets
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}
