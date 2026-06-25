import { CONVERTED_COLUMN, KNOWN_FEATURE_COLUMNS } from '@/types/lead'
import type { ValidationError, ValidationResult } from '@/types/validation'

const MAX_ROWS = 10_000
const MAX_BYTES = 25 * 1024 * 1024
// Accept common real-world conventions for boolean columns, not just 0/1.
const ACCEPTED_BOOLEAN_VALUES = new Set(['0', '1', 'true', 'false', 'yes', 'no', 'y', 'n'])

export function validateDataset(
  headers: string[],
  rows: Record<string, string>[],
  fileSize: number,
): ValidationResult {
  const errors: ValidationError[] = []
  const lowerHeaders = headers.map((h) => h.trim().toLowerCase())

  // 1. File size
  if (fileSize > MAX_BYTES) {
    errors.push({ code: 'FILE_TOO_LARGE', message: `File exceeds the 25 MB limit (${(fileSize / 1024 / 1024).toFixed(1)} MB).` })
    return { isValid: false, errors, rowCount: 0 }
  }

  // 2. Empty file
  if (rows.length === 0) {
    errors.push({ code: 'EMPTY_FILE', message: 'Uploaded file contains no records.' })
    return { isValid: false, errors, rowCount: 0 }
  }

  // 3. Row count limit
  if (rows.length > MAX_ROWS) {
    errors.push({ code: 'TOO_MANY_ROWS', message: `Dataset has ${rows.length.toLocaleString()} rows. Maximum is 10,000.` })
    return { isValid: false, errors, rowCount: rows.length }
  }

  // 4. Duplicate headers
  const seen = new Set<string>()
  for (const h of lowerHeaders) {
    if (seen.has(h)) {
      errors.push({ code: 'DUPLICATE_COLUMN', message: `Duplicate column: "${h}".`, column: h })
    }
    seen.add(h)
  }

  // 5. `converted` column is the only hard requirement
  if (!lowerHeaders.includes(CONVERTED_COLUMN)) {
    errors.push({ code: 'MISSING_COLUMN', message: `Required column "converted" was not found. This column must contain 0 or 1 values indicating whether each lead converted.`, column: CONVERTED_COLUMN })
  }

  // Stop on structural errors
  if (errors.length > 0) return { isValid: false, errors, rowCount: rows.length }

  // 6. Validate `converted` values
  const invalidConverted = rows.findIndex((row) => {
    const val = row[CONVERTED_COLUMN].trim().toLowerCase()
    return !val || !ACCEPTED_BOOLEAN_VALUES.has(val)
  })
  if (invalidConverted !== -1) {
    errors.push({ code: 'INVALID_BOOLEAN', message: `"converted" must contain only 0 or 1. Invalid value on row ${String(invalidConverted + 2)}.`, column: CONVERTED_COLUMN })
  }

  // 7. Check that at least 2 numeric/boolean feature columns exist
  const detectedFeatures = detectNumericColumns(lowerHeaders, rows)
  if (detectedFeatures.length < 1) {
    errors.push({ code: 'MISSING_COLUMN', message: 'No numeric feature columns found. The dataset needs at least one numeric column besides "converted" to perform analysis.' })
  }

  return { isValid: errors.length === 0, errors, rowCount: rows.length }
}

// Returns column names (excluding 'converted') that contain numeric or boolean values.
export function detectNumericColumns(headers: string[], rows: Record<string, string>[]): string[] {
  const sample = rows.slice(0, Math.min(20, rows.length))
  return headers.filter((h) => {
    if (h === CONVERTED_COLUMN) return false
    // A column is numeric/boolean if all sampled values parse as a number or boolean
    return sample.every((row) => {
      const val = row[h].trim().toLowerCase()
      if (!val) return false
      return ACCEPTED_BOOLEAN_VALUES.has(val) || !isNaN(Number(val))
    })
  })
}

// Returns the subset of numeric feature columns that are actually boolean —
// every value in the column (not just a sample) is from the boolean
// vocabulary (0/1/true/false/yes/no). This must check the WHOLE column: a
// genuinely numeric count column (e.g. invited_teammates: 0,1,2,5) also
// contains "0" and "1", so per-cell guessing would misclassify those specific
// rows as booleans while leaving the rest numeric — exactly the kind of mixed
// typing that made bucket/value displays inconsistent.
export function detectBooleanColumns(headers: string[], rows: Record<string, string>[]): Set<string> {
  const numericCols = detectNumericColumns(headers, rows)
  const booleanCols = new Set<string>()
  for (const col of numericCols) {
    const allBoolean = rows.every((row) => ACCEPTED_BOOLEAN_VALUES.has(row[col].trim().toLowerCase()))
    if (allBoolean) booleanCols.add(col)
  }
  return booleanCols
}

// Advisory — used in the UI to show which known columns were not found.
export function getMissingKnownColumns(headers: string[]): string[] {
  const lower = new Set(headers.map((h) => h.trim().toLowerCase()))
  return KNOWN_FEATURE_COLUMNS.filter((c) => !lower.has(c))
}

// Returns non-numeric columns that actually group leads together (Industry,
// Region, Lead Source, Job Title — no matter how many distinct values they
// have). Excludes only columns that are essentially unique per row (IDs, free
// text names, timestamps), where every "group" would have ~1 member and a
// breakdown would be meaningless. There is intentionally no upper limit on
// distinct-value count — a column with 50 cities is still useful; capping it
// would silently throw away real columns from larger or richer datasets.
export function detectCategoricalColumns(headers: string[], rows: Record<string, string>[]): string[] {
  const numericCols = new Set(detectNumericColumns(headers, rows))

  return headers.filter((h) => {
    if (h === CONVERTED_COLUMN || numericCols.has(h)) return false
    const values = rows.map((r) => r[h].trim()).filter((v) => v.length > 0)
    if (values.length === 0) return false
    const distinct = new Set(values.map((v) => v.toLowerCase()))
    if (distinct.size < 2) return false
    // Average group size >= 2 means values actually repeat and form groups;
    // close to 1 means every row is essentially unique (an ID/name/date column).
    const avgGroupSize = values.length / distinct.size
    return avgGroupSize >= 2
  })
}
