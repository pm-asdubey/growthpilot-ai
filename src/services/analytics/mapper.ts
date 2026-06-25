import type { Lead } from '@/types/lead'
import { detectNumericColumns } from './validator'

// PapaParse preserves the CSV's original header casing as object keys
// ("Converted", "Employees", ...), but every lookup downstream assumes
// lowercase, trimmed keys ("converted", "employees", ...). Without this
// normalization, row[col] is undefined for any CSV that isn't already
// lowercase, which throws when .trim() is called on it.
export function normalizeRows(
  rawRows: Record<string, string>[],
  headers: string[],
): Record<string, string>[] {
  const keyMap = headers.map((h) => [h, h.trim().toLowerCase()] as const)
  return rawRows.map((row) => {
    const normalized: Record<string, string> = {}
    for (const [original, lower] of keyMap) {
      normalized[lower] = row[original] ?? ''
    }
    return normalized
  })
}

export function getFeatureColumns(headers: string[], rows: Record<string, string>[]): string[] {
  return detectNumericColumns(headers, rows)
}

// Extracts just the categorical columns into a parallel array, same length
// and index order as Lead[], so breakdowns can be joined back to
// converted/score by index without storing strings on Lead itself.
export function extractCategoricalData(
  rows: Record<string, string>[],
  categoricalColumns: string[],
): Record<string, string>[] {
  return rows.map((row) => {
    const out: Record<string, string> = {}
    for (const col of categoricalColumns) {
      out[col] = row[col].trim()
    }
    return out
  })
}

const TRUE_VALUES = new Set(['1', 'true', 'yes', 'y'])

export function mapRowToLead(row: Record<string, string>, featureColumns: string[]): Lead {
  const lead: Lead = { converted: parseBoolean(row.converted) }

  for (const col of featureColumns) {
    const raw = row[col].trim().toLowerCase()
    if (TRUE_VALUES.has(raw)) {
      lead[col] = true
    } else if (raw === 'false' || raw === '0' || raw === 'no' || raw === 'n') {
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
  return TRUE_VALUES.has(value.trim().toLowerCase())
}
