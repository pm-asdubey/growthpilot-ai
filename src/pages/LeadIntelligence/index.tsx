import { CheckCircle, RefreshCw } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { SectionCard } from '@/components/common/SectionCard'
import { CSVDropzone } from '@/components/upload/CSVDropzone'
import {
  ValidationChecklist,
  ValidationChecklistSkeleton,
} from '@/components/upload/ValidationChecklist'
import { ValidationErrorPanel } from '@/components/upload/ValidationErrorPanel'
import { useCSVUpload } from '@/hooks/useCSVUpload'
import { REQUIRED_COLUMNS } from '@/types/lead'
import type { ValidationCheck } from '@/types/validation'

// Derive the static checklist from the required columns list so it stays in sync.
function buildChecklist(
  uploadState: string,
  errors: { column?: string; code: string }[],
): ValidationCheck[] {
  const failedColumns = new Set(errors.map((e) => e.column).filter(Boolean))
  const hasStructuralError = errors.some(
    (e) => e.code === 'EMPTY_FILE' || e.code === 'DUPLICATE_COLUMN' || e.code === 'PARSE_ERROR',
  )

  const isPending = uploadState === 'parsing' || uploadState === 'validating'
  const isDone = uploadState === 'error' || uploadState === 'ready'

  const checks: ValidationCheck[] = [
    {
      label: 'File is a valid CSV',
      status: isPending ? 'pending' : errors.some((e) => e.code === 'PARSE_ERROR') ? 'fail' : 'pass',
    },
    {
      label: 'File contains at least one row',
      status: isPending
        ? 'pending'
        : errors.some((e) => e.code === 'EMPTY_FILE')
          ? 'fail'
          : isDone
            ? 'pass'
            : 'pending',
    },
    {
      label: 'File is within size limits (25 MB / 10,000 rows)',
      status: isPending
        ? 'pending'
        : errors.some((e) => e.code === 'FILE_TOO_LARGE' || e.code === 'TOO_MANY_ROWS')
          ? 'fail'
          : isDone
            ? 'pass'
            : 'pending',
    },
    {
      label: 'No duplicate column headers',
      status: isPending
        ? 'pending'
        : errors.some((e) => e.code === 'DUPLICATE_COLUMN')
          ? 'fail'
          : isDone
            ? 'pass'
            : 'pending',
    },
  ]

  // One check per required column
  for (const col of REQUIRED_COLUMNS) {
    checks.push({
      label: `Column present: ${col}`,
      status: isPending
        ? 'pending'
        : hasStructuralError
          ? 'pending'
          : failedColumns.has(col)
            ? 'fail'
            : isDone
              ? 'pass'
              : 'pending',
    })
  }

  return checks
}

export function LeadIntelligencePage() {
  const { uploadState, fileName, validationResult, leads, error, handleFileSelected, reset } =
    useCSVUpload()

  const isIdle = uploadState === 'idle'
  const isProcessing = uploadState === 'parsing' || uploadState === 'validating'
  const isError = uploadState === 'error'
  const isReady = uploadState === 'ready'

  const checks = buildChecklist(uploadState, validationResult?.errors ?? [])

  return (
    <div className="mx-auto max-w-[1440px] space-y-8">
      <div className="flex items-start justify-between gap-4">
        <PageHeader
          title="Lead Intelligence"
          description="Upload a historical lead dataset to generate conversion analysis, lead scores, and AI-generated business insights."
        />
        {!isIdle && (
          <button
            type="button"
            onClick={reset}
            aria-label="Reset upload and start over"
            className="flex shrink-0 items-center gap-2 rounded-[10px] border border-border bg-card px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <RefreshCw size={14} aria-hidden="true" />
            Start over
          </button>
        )}
      </div>

      {/* ── Idle: show dropzone ── */}
      {isIdle && (
        <SectionCard>
          <div className="space-y-8">
            <CSVDropzone onFileSelected={handleFileSelected} />

            {/* What happens next */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {HOW_IT_WORKS.map((step) => (
                <div
                  key={step.title}
                  className="rounded-[10px] border border-border bg-background p-4"
                >
                  <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-[13px] font-bold text-primary">
                    {step.number}
                  </div>
                  <p className="text-[13px] font-semibold text-foreground">{step.title}</p>
                  <p className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      )}

      {/* ── Processing or error: show validation panel ── */}
      {(isProcessing || isError) && (
        <SectionCard title="Dataset Validation" description={fileName ?? undefined}>
          <div className="space-y-6">
            {isProcessing ? (
              <ValidationChecklistSkeleton />
            ) : (
              <ValidationChecklist checks={checks} />
            )}

            {/* General parse error (not a validation error) */}
            {isError && error && !validationResult && (
              <div
                role="alert"
                className="rounded-[10px] border border-error/30 bg-error/5 p-4 text-[13px] text-error"
              >
                {error}
                <button
                  type="button"
                  onClick={reset}
                  className="ml-3 font-medium underline underline-offset-2 hover:no-underline focus-visible:outline-none"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Structured validation errors */}
            {isError && validationResult && (
              <ValidationErrorPanel
                errors={validationResult.errors}
                fileName={fileName ?? 'your file'}
                onReset={reset}
              />
            )}
          </div>
        </SectionCard>
      )}

      {/* ── Ready: validation passed ── */}
      {isReady && leads && validationResult && (
        <>
          <SectionCard title="Dataset Validation" description={fileName ?? undefined}>
            <div className="space-y-4">
              <ValidationChecklist checks={checks} />
              <div className="flex items-center gap-2 rounded-[10px] bg-success/10 px-4 py-3">
                <CheckCircle size={16} className="shrink-0 text-success" aria-hidden="true" />
                <p className="text-[13px] font-medium text-success">
                  Validation passed —{' '}
                  <span className="font-bold">
                    {validationResult.rowCount.toLocaleString()} leads
                  </span>{' '}
                  ready for analysis.
                </p>
              </div>
            </div>
          </SectionCard>

          {/* Analysis placeholder — wired in Phase 4 */}
          <SectionCard
            title="Analytics Engine"
            description="Analysis will run automatically here in Phase 4."
          >
            <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle size={22} className="text-primary" aria-hidden="true" />
              </div>
              <p className="text-[15px] font-semibold text-foreground">Dataset loaded</p>
              <p className="text-[13px] text-muted-foreground">
                {validationResult.rowCount.toLocaleString()} leads parsed successfully. The
                analytics engine will process this data in Phase 4.
              </p>
            </div>
          </SectionCard>
        </>
      )}
    </div>
  )
}

const HOW_IT_WORKS = [
  {
    number: '1',
    title: 'Upload & Validate',
    description:
      'Drop in your CSV. Required columns, data types, and missing values are checked instantly.',
  },
  {
    number: '2',
    title: 'Analytics Engine',
    description:
      'Deterministic algorithms calculate conversion rates, feature importance, and lead scores.',
  },
  {
    number: '3',
    title: 'AI Insights',
    description:
      'An executive summary, business recommendations, and risk analysis are generated from your results.',
  },
]
