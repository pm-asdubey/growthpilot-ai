import { CheckCircle } from 'lucide-react'
import { SectionCard } from '@/components/common/SectionCard'
import {
  ValidationChecklist,
  ValidationChecklistSkeleton,
} from '@/components/upload/ValidationChecklist'
import { ValidationErrorPanel } from '@/components/upload/ValidationErrorPanel'
import { REQUIRED_COLUMNS } from '@/types/lead'
import type { ValidationCheck, ValidationError } from '@/types/validation'

function buildChecklist(
  uploadState: string,
  errors: ValidationError[],
): ValidationCheck[] {
  const failedColumns = new Set(errors.map((e) => e.column).filter(Boolean))
  const hasStructuralError = errors.some(
    (e) => e.code === 'EMPTY_FILE' || e.code === 'DUPLICATE_COLUMN' || e.code === 'PARSE_ERROR',
  )
  const isPending = uploadState === 'parsing' || uploadState === 'validating'
  const isDone = uploadState === 'error' || uploadState === 'ready'

  const checks: ValidationCheck[] = [
    { label: 'File is a valid CSV', status: isPending ? 'pending' : errors.some((e) => e.code === 'PARSE_ERROR') ? 'fail' : 'pass' },
    { label: 'File contains at least one row', status: isPending ? 'pending' : errors.some((e) => e.code === 'EMPTY_FILE') ? 'fail' : isDone ? 'pass' : 'pending' },
    { label: 'File is within size limits (25 MB / 10,000 rows)', status: isPending ? 'pending' : errors.some((e) => e.code === 'FILE_TOO_LARGE' || e.code === 'TOO_MANY_ROWS') ? 'fail' : isDone ? 'pass' : 'pending' },
    { label: 'No duplicate column headers', status: isPending ? 'pending' : errors.some((e) => e.code === 'DUPLICATE_COLUMN') ? 'fail' : isDone ? 'pass' : 'pending' },
  ]

  for (const col of REQUIRED_COLUMNS) {
    checks.push({
      label: `Column present: ${col}`,
      status: isPending ? 'pending' : hasStructuralError ? 'pending' : failedColumns.has(col) ? 'fail' : isDone ? 'pass' : 'pending',
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
  onReset: () => void
}

export function ValidationSection({ uploadState, fileName, validationErrors, parseError, rowCount, onReset }: Props) {
  const checks = buildChecklist(uploadState, validationErrors)
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
            <button type="button" onClick={onReset} className="ml-3 font-medium underline underline-offset-2 focus-visible:outline-none">Try again</button>
          </div>
        )}

        {isError && validationErrors.length > 0 && (
          <ValidationErrorPanel errors={validationErrors} fileName={fileName ?? 'your file'} onReset={onReset} />
        )}

        {isReady && (
          <div className="flex items-center gap-2 rounded-[10px] bg-success/10 px-4 py-3">
            <CheckCircle size={16} className="shrink-0 text-success" aria-hidden="true" />
            <p className="text-[13px] font-medium text-success">
              Validation passed — <span className="font-bold">{rowCount.toLocaleString()} leads</span> ready for analysis.
            </p>
          </div>
        )}
      </div>
    </SectionCard>
  )
}
