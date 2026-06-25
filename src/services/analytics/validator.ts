import { REQUIRED_COLUMNS } from '@/types/lead'
import type { ValidationError, ValidationResult } from '@/types/validation'

const MAX_ROWS = 10_000
const MAX_BYTES = 25 * 1024 * 1024 // 25 MB

// Numeric columns that must contain only finite numbers.
const NUMERIC_COLUMNS = [
  'employees',
  'trial_users',
  'pricing_page_visits',
  'daily_active_users',
  'invited_teammates',
  'support_tickets',
  'days_since_signup',
] as const

// Boolean column — must be 0, 1, "0", "1", "true", or "false" (case-insensitive).
const BOOLEAN_COLUMNS = ['webinar_attended', 'converted'] as const

const ACCEPTED_BOOLEAN_VALUES = new Set(['0', '1', 'true', 'false'])

export function validateDataset(
  headers: string[],
  rows: Record<string, string>[],
  fileSize: number,
): ValidationResult {
  const errors: ValidationError[] = []

  // 1. File size
  if (fileSize > MAX_BYTES) {
    errors.push({
      code: 'FILE_TOO_LARGE',
      message: `File exceeds the 25 MB limit (${(fileSize / 1024 / 1024).toFixed(1)} MB uploaded).`,
    })
    return { isValid: false, errors, rowCount: 0 }
  }

  // 2. Empty file
  if (rows.length === 0) {
    errors.push({ code: 'EMPTY_FILE', message: 'Uploaded file contains no records.' })
    return { isValid: false, errors, rowCount: 0 }
  }

  // 3. Row count limit
  if (rows.length > MAX_ROWS) {
    errors.push({
      code: 'TOO_MANY_ROWS',
      message: `Dataset contains ${rows.length.toLocaleString()} rows. Maximum is 10,000 rows.`,
    })
    return { isValid: false, errors, rowCount: rows.length }
  }

  // 4. Duplicate headers (case-insensitive)
  const lowerHeaders = headers.map((h) => h.trim().toLowerCase())
  const seen = new Set<string>()
  for (const h of lowerHeaders) {
    if (seen.has(h)) {
      errors.push({
        code: 'DUPLICATE_COLUMN',
        message: `Duplicate column detected: "${h}". Each column name must be unique.`,
        column: h,
      })
    }
    seen.add(h)
  }

  // 5. Required columns present
  for (const col of REQUIRED_COLUMNS) {
    if (!lowerHeaders.includes(col)) {
      errors.push({
        code: 'MISSING_COLUMN',
        message: `Required column "${col}" was not found in the file.`,
        column: col,
      })
    }
  }

  // Stop here if structural errors exist — type checks below would be misleading.
  if (errors.length > 0) {
    return { isValid: false, errors, rowCount: rows.length }
  }

  // 6. Data type checks.
  // At this point all required columns are confirmed present, so row[col] is always a string.
  for (const col of NUMERIC_COLUMNS) {
    const invalidRow = rows.findIndex((row) => {
      const raw = row[col].trim()
      return raw === '' || !isFiniteNumeric(raw)
    })
    if (invalidRow !== -1) {
      errors.push({
        code: 'INVALID_TYPE',
        message: `Column "${col}" must contain numeric values. Invalid value found on row ${String(invalidRow + 2)}.`,
        column: col,
      })
    }
  }

  for (const col of BOOLEAN_COLUMNS) {
    const invalidRow = rows.findIndex((row) => {
      const raw = row[col].trim().toLowerCase()
      return !ACCEPTED_BOOLEAN_VALUES.has(raw)
    })
    if (invalidRow !== -1) {
      errors.push({
        code: 'INVALID_BOOLEAN',
        message: `Column "${col}" must contain only 0 or 1 values. Invalid value found on row ${String(invalidRow + 2)}.`,
        column: col,
      })
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    rowCount: rows.length,
  }
}

function isFiniteNumeric(value: string): boolean {
  const n = Number(value)
  return !isNaN(n) && isFinite(n)
}
