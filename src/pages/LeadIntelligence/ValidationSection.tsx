import { AlertTriangle, CheckCircle } from 'lucide-react'
import { SectionCard } from '@/components/common/SectionCard'
import {
  ValidationChecklist,
  ValidationChecklistSkeleton,
} from '@/components/upload/ValidationChecklist'
import { ValidationErrorPanel } from '@/components/upload/ValidationErrorPanel'
import type { ValidationCheck, ValidationError } from '@/types/validation'

function buildChecklist(
  uploadState: string,
  errors: ValidationError[],
  featureColumns: string[],
  missingKnownColumns: string[],
): ValidationCheck[] {
  const isPending = uploadState === 'parsing' || uploadState === 'validating'
  const isDone = uploadState === 'error' || uploadState === 'ready'
  const hasConvertedError = errors.some((e) => e.column === 'converted')

  const checks: ValidationCheck[] = [
    {
      label: 'File is a valid CSV',
      status: isPending ? 'pending' : errors.some((e) => e.code === 'PARSE_ERROR') ? 'fail' : 'pass',
    },
    {
      label: 'File contains at least one row',
      status: isPending ? 'pending' : errors.some((e) => e.code === 'EMPTY_FILE') ? 'fail' : isDone ? 'pass' : 'pending',
    },
    {
      label: 'File is within size limits (25 MB / 10,000 rows)',
      status: isPending
        ? 'pending'
        : errors.some((e) => e.code === 'FILE_TOO_LARGE' || e.code === 'TOO_MANY_ROWS')
          ? 'fail'
          : isDone ? 'pass' : 'pending',
    },
    {
      label: 'No duplicate column headers',
      status: isPending ? 'pending' : errors.some((e) => e.code === 'DUPLICATE_COLUMN') ? 'fail' : isDone ? 'pass' : 'pending',
    },
    {
      label: '"converted" column present and valid (0/1 values)',
      status: isPending ? 'pending' : hasConvertedError ? 'fail' : isDone ? 'pass' : 'pending',
    },
    {
      label: `Numeric feature columns detected${isDone && !isPending ? ` (${String(featureColumns.length)} found)` : ''}`,
      status: isPending
        ? 'pending'
        : errors.some((e) => e.code === 'MISSING_COLUMN' && !e.column)
          ? 'fail'
          : featureColumns.length > 0 ? 'pass' : 'pending',
    },
  ]

  if (isDone && !isPending && missingKnownColumns.length > 0) {
    checks.push({
      label: `${String(missingKnownColumns.length)} standard column(s) not found — using available data`,
      status: 'warn',
      message: missingKnownColumns.slice(0, 4).join(', ') + (missingKnownColumns.length > 4 ? '…' : ''),
    })
  }

  return checks
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
  const checks = buildChecklist(uploadState, validationErrors, featureColumns, missingKnownColumns)
  const isPending = uploadState === 'parsing' || uploadState === 'validating'
  const isError = uploadState === 'error'
  const isReady = uploadState === 'ready'

  return (
    <SectionCard title="Dataset Validation" description={fileName ?? undefined}>
      <div className="space-y-5">
        {isPending && <ValidationChecklistSkeleton />}
        {(isError || isReady) && <ValidationChecklist checks={checks} />}

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

        {isReady && missingKnownColumns.length > 0 && (
          <div className="flex items-start gap-2 rounded-[10px] border border-warning/20 bg-warning/5 px-4 py-3">
            <AlertTriangle size={15} className="mt-0.5 shrink-0 text-warning" aria-hidden="true" />
            <p className="text-[12px] text-muted-foreground">
              <span className="font-medium text-foreground">Partial dataset:</span>{' '}
              {String(missingKnownColumns.length)} standard column(s) not found. Analysis will proceed using the{' '}
              {String(featureColumns.length)} available feature(s).
            </p>
          </div>
        )}

        {isReady && (
          <div className="flex items-center gap-2 rounded-[10px] bg-success/10 px-4 py-3">
            <CheckCircle size={16} className="shrink-0 text-success" aria-hidden="true" />
            <p className="text-[13px] font-medium text-success">
              Validation passed —{' '}
              <span className="font-bold">{rowCount.toLocaleString()} leads</span>{' '}
              ready for analysis with{' '}
              <span className="font-bold">{String(featureColumns.length)} feature{featureColumns.length !== 1 ? 's' : ''}</span>.
            </p>
          </div>
        )}
      </div>
    </SectionCard>
  )
}
