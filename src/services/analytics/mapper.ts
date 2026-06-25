import type { Lead } from '@/types/lead'
import { detectNumericColumns } from './validator'

export function getFeatureColumns(headers: string[], rows: Record<string, string>[]): string[] {
  return detectNumericColumns(headers, rows)
}

export function mapRowToLead(row: Record<string, string>, featureColumns: string[]): Lead {
  const lead: Lead = { converted: parseBoolean(row.converted) }

  for (const col of featureColumns) {
    const raw = row[col].trim().toLowerCase()
    if (raw === 'true' || raw === '1') {
      lead[col] = true
    } else if (raw === 'false' || raw === '0') {
      lead[col] = 0
    } else {
      lead[col] = parseFloat(raw) || 0
    }
  }

  return lead
}

export function mapRowsToLeads(rows: Record<string, string>[], featureColumns: string[]): Lead[] {
  return rows.map((row) => mapRowToLead(row, featureColumns))
}

function parseBoolean(value: string | undefined): boolean {
  if (!value) return false
  const v = value.trim().toLowerCase()
  return v === '1' || v === 'true'
}
