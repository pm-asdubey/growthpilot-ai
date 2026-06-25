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
  message: string
  column?: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  rowCount: number
}

export interface ValidationCheck {
  label: string
  status: 'pending' | 'pass' | 'fail' | 'warn'
  message?: string
}
