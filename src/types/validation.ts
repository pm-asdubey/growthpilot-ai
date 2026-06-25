export type ValidationErrorCode =
  | 'EMPTY_FILE'
  | 'MISSING_COLUMN'
  | 'DUPLICATE_COLUMN'
  | 'INVALID_TYPE'
  | 'INVALID_BOOLEAN'
  | 'FILE_TOO_LARGE'
  | 'TOO_MANY_ROWS'
  | 'PARSE_ERROR'

export interface ValidationError {
  code: ValidationErrorCode
  message: string   // Human-readable — shown directly in the UI
  column?: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  rowCount: number
}

// Drives the ValidationChecklist component — one entry per rule checked.
export interface ValidationCheck {
  label: string
  status: 'pending' | 'pass' | 'fail'
  message?: string
}
