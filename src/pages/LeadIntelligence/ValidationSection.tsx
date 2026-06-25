import { AlertTriangle, CheckCircle } from 'lucide-react'
import { SectionCard } from '@/components/common/SectionCard'
import {
  ValidationChecklist,
  ValidationChecklistSkeleton,
} from '@/components/upload/ValidationChecklist'
import { ValidationErrorPanel } from '@/components/upload/ValidationErrorPanel'
import type { ValidationCheck, ValidationError } from '@/types/validation'

// Full checklist is only shown while validating or on failure — once a
// dataset is validated successfully, a one-line summary is enough.
function buildPendingChecklist(uploadState: string, errors: ValidationError[]): ValidationCheck[] {
  const isPending = uploadState === 'parsing' || uploadState === 'validating'
  const hasConvertedError = errors.some((e) => e.column === 'converted')

  return [
    { label: 'File is a valid CSV', status: isPending ? 'pending' : errors.some((e) => e.code === 'PARSE_ERROR') ? 'fail' : 'pass' },
    { label: 'File contains at least one row', status: isPending ? 'pending' : errors.some((e) => e.code === 'EMPTY_FILE') ? 'fail' : 'pass' },
    { label: 'File is within size limits (25 MB / 10,000 rows)', status: isPending ? 'pending' : errors.some((e) => e.code === 'FILE_TOO_LARGE' || e.code === 'TOO_MANY_ROWS') ? 'fail' : 'pass' },
    { label: 'No duplicate column headers', status: isPending ? 'pending' : errors.some((e) => e.code === 'DUPLICATE_COLUMN') ? 'fail' : 'pass' },
    { label: '"converted" column present and valid (0/1 values)', status: isPending ? 'pending' : hasConvertedError ? 'fail' : 'pass' },
    { label: 'Numeric feature columns detected', status: isPending ? 'pending' : errors.some((e) => e.code === 'MISSING_COLUMN' && !e.column) ? 'fail' : 'pass' },
  ]
}

interface Props {
  uploadState: string
  fileName: string | null
  validationErrors: ValidationError[]
  parseError: string | null
  rowCount: number
  featureColumns?: string[]
  missingKnownColumns?: string[]
  onReset: () => void
}

export function ValidationSection({
  uploadState, fileName, validationErrors, parseError, rowCount,
  featureColumns = [], missingKnownColumns = [], onReset,
}: Props) {
  const isPending = uploadState === 'parsing' || uploadState === 'validating'
  const isError = uploadState === 'error'
  const isReady = uploadState === 'ready'

  return (
    <SectionCard title="Dataset Validation" description={fileName ?? undefined}>
      <div className="space-y-4">
        {isPending && <ValidationChecklistSkeleton />}
        {isError && <ValidationChecklist checks={buildPendingChecklist(uploadState, validationErrors)} />}

        {isError && parseError && !validationErrors.length && (
          <div role="alert" className="rounded-[10px] border border-error/30 bg-error/5 p-4 text-[13px] text-error">
            {parseError}
            <button type="button" onClick={onReset} className="ml-3 font-medium underline underline-offset-2 focus-visible:outline-none">
              Try again
            </button>
          </div>
        )}
        {isError && validationErrors.length > 0 && (
          <ValidationErrorPanel errors={validationErrors} fileName={fileName ?? 'your file'} onReset={onReset} />
        )}

        {/* Ready: one compact summary line — no full checklist */}
        {isReady && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 rounded-[10px] bg-success/10 px-4 py-3">
              <CheckCircle size={16} className="shrink-0 text-success" aria-hidden="true" />
              <p className="text-[13px] font-medium text-success">
                <span className="font-bold">{rowCount.toLocaleString()} leads</span> validated · columns analyzed:{' '}
                <span className="font-medium">{featureColumns.join(', ')}</span>
              </p>
            </div>
            {missingKnownColumns.length > 0 && (
              <div className="flex items-start gap-2 rounded-[10px] border border-warning/20 bg-warning/5 px-4 py-2.5">
                <AlertTriangle size={14} className="mt-0.5 shrink-0 text-warning" aria-hidden="true" />
                <p className="text-[12px] text-muted-foreground">
                  {missingKnownColumns.length} standard column{missingKnownColumns.length !== 1 ? 's' : ''} not found
                  ({missingKnownColumns.join(', ')}) — analysis proceeds using available columns only.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </SectionCard>
  )
}
