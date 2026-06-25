import { AlertTriangle, CheckCircle, Loader2, RefreshCw, TrendingUp } from 'lucide-react'
import { MetricCard } from '@/components/common/MetricCard'
import { PageHeader } from '@/components/common/PageHeader'
import { SectionCard } from '@/components/common/SectionCard'
import { CSVDropzone } from '@/components/upload/CSVDropzone'
import {
  ValidationChecklist,
  ValidationChecklistSkeleton,
} from '@/components/upload/ValidationChecklist'
import { ValidationErrorPanel } from '@/components/upload/ValidationErrorPanel'
import { useAnalysis } from '@/hooks/useAnalysis'
import { useCSVUpload } from '@/hooks/useCSVUpload'
import { REQUIRED_COLUMNS } from '@/types/lead'
import type { ValidationCheck } from '@/types/validation'

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
          : isDone ? 'pass' : 'pending',
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
      status: isPending
        ? 'pending'
        : errors.some((e) => e.code === 'DUPLICATE_COLUMN')
          ? 'fail'
          : isDone ? 'pass' : 'pending',
    },
  ]

  for (const col of REQUIRED_COLUMNS) {
    checks.push({
      label: `Column present: ${col}`,
      status: isPending
        ? 'pending'
        : hasStructuralError
          ? 'pending'
          : failedColumns.has(col)
            ? 'fail'
            : isDone ? 'pass' : 'pending',
    })
  }

  return checks
}

function formatNumber(n: number): string {
  return n.toLocaleString()
}

export function LeadIntelligencePage() {
  const { uploadState, fileName, validationResult, leads, error, handleFileSelected, reset } =
    useCSVUpload()
  const { analysisState, analysisResult, error: analysisError } = useAnalysis(leads)

  const isIdle = uploadState === 'idle'
  const isUploadProcessing = uploadState === 'parsing' || uploadState === 'validating'
  const isUploadError = uploadState === 'error'
  const isUploadReady = uploadState === 'ready'
  const isAnalysing = isUploadReady && analysisState === 'running'
  const isAnalysisDone = analysisState === 'done' && analysisResult !== null
  const isAnalysisError = analysisState === 'error'

  const checks = buildChecklist(uploadState, validationResult?.errors ?? [])

  return (
    <div className="mx-auto max-w-[1440px] space-y-8">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <PageHeader
          title="Lead Intelligence"
          description="Upload a historical lead dataset to generate conversion analysis, lead scores, and AI-generated business insights."
        />
        {!isIdle && (
          <button
            type="button"
            onClick={reset}
            aria-label="Reset and start over"
            className="flex shrink-0 items-center gap-2 rounded-[10px] border border-border bg-card px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <RefreshCw size={14} aria-hidden="true" />
            Start over
          </button>
        )}
      </div>

      {/* ── Idle: dropzone ── */}
      {isIdle && (
        <SectionCard>
          <div className="space-y-8">
            <CSVDropzone onFileSelected={handleFileSelected} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {HOW_IT_WORKS.map((step) => (
                <div key={step.title} className="rounded-[10px] border border-border bg-background p-4">
                  <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-[13px] font-bold text-primary">
                    {step.number}
                  </div>
                  <p className="text-[13px] font-semibold text-foreground">{step.title}</p>
                  <p className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      )}

      {/* ── Upload processing / error ── */}
      {(isUploadProcessing || isUploadError) && (
        <SectionCard title="Dataset Validation" description={fileName ?? undefined}>
          <div className="space-y-6">
            {isUploadProcessing ? (
              <ValidationChecklistSkeleton />
            ) : (
              <ValidationChecklist checks={checks} />
            )}
            {isUploadError && error && !validationResult && (
              <div role="alert" className="rounded-[10px] border border-error/30 bg-error/5 p-4 text-[13px] text-error">
                {error}
                <button type="button" onClick={reset} className="ml-3 font-medium underline underline-offset-2 hover:no-underline focus-visible:outline-none">
                  Try again
                </button>
              </div>
            )}
            {isUploadError && validationResult && (
              <ValidationErrorPanel
                errors={validationResult.errors}
                fileName={fileName ?? 'your file'}
                onReset={reset}
              />
            )}
          </div>
        </SectionCard>
      )}

      {/* ── Upload ready: show validation pass + analysis ── */}
      {isUploadReady && validationResult && (
        <SectionCard title="Dataset Validation" description={fileName ?? undefined}>
          <div className="space-y-4">
            <ValidationChecklist checks={checks} />
            <div className="flex items-center gap-2 rounded-[10px] bg-success/10 px-4 py-3">
              <CheckCircle size={16} className="shrink-0 text-success" aria-hidden="true" />
              <p className="text-[13px] font-medium text-success">
                Validation passed —{' '}
                <span className="font-bold">{formatNumber(validationResult.rowCount)} leads</span>{' '}
                ready for analysis.
              </p>
            </div>
          </div>
        </SectionCard>
      )}

      {/* ── Analytics running ── */}
      {isAnalysing && (
        <SectionCard title="Analytics Engine">
          <div className="flex items-center gap-3 py-6" aria-live="polite">
            <Loader2 size={18} className="animate-spin text-primary" aria-hidden="true" />
            <p className="text-[14px] text-muted-foreground">Running analytics pipeline…</p>
          </div>
        </SectionCard>
      )}

      {/* ── Analytics error ── */}
      {isAnalysisError && (
        <SectionCard title="Analytics Engine">
          <div role="alert" className="flex items-start gap-3 rounded-[10px] border border-error/30 bg-error/5 p-4">
            <AlertTriangle size={18} className="mt-0.5 shrink-0 text-error" aria-hidden="true" />
            <div className="space-y-2">
              <p className="text-[14px] font-medium text-foreground">Analytics engine error</p>
              <p className="text-[13px] text-muted-foreground">{analysisError}</p>
              <button type="button" onClick={reset} className="text-[13px] font-medium text-primary underline underline-offset-2 hover:no-underline focus-visible:outline-none">
                Start over
              </button>
            </div>
          </div>
        </SectionCard>
      )}

      {/* ── Analysis complete: KPIs ── */}
      {isAnalysisDone && (
        <>
          {/* KPI cards */}
          <section aria-labelledby="analysis-kpis-heading">
            <h2 id="analysis-kpis-heading" className="mb-4 text-[18px] font-semibold text-foreground">
              Key Metrics
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                title="Total Leads"
                value={formatNumber(analysisResult.kpis.totalLeads)}
                icon={TrendingUp}
              />
              <MetricCard
                title="Converted Leads"
                value={formatNumber(analysisResult.kpis.convertedLeads)}
                trend={{ direction: 'neutral', label: `of ${formatNumber(analysisResult.kpis.totalLeads)} total` }}
              />
              <MetricCard
                title="Conversion Rate"
                value={`${String(analysisResult.kpis.conversionRate)}%`}
              />
              <MetricCard
                title="Avg Lead Score"
                value={String(analysisResult.kpis.averageLeadScore)}
                trend={{ direction: 'neutral', label: 'out of 100' }}
              />
            </div>
          </section>

          {/* Segment summary */}
          <section aria-labelledby="segment-heading">
            <h2 id="segment-heading" className="mb-4 text-[18px] font-semibold text-foreground">
              Lead Segments
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <SegmentBadge
                label="SQL"
                count={analysisResult.kpis.sqlCount}
                total={analysisResult.kpis.totalLeads}
                threshold={analysisResult.segments.sqlThreshold}
                colour="text-primary bg-primary/10 border-primary/20"
              />
              <SegmentBadge
                label="MQL"
                count={analysisResult.kpis.mqlCount}
                total={analysisResult.kpis.totalLeads}
                threshold={analysisResult.segments.mqlThreshold}
                colour="text-warning bg-warning/10 border-warning/20"
              />
              <SegmentBadge
                label="Nurture"
                count={analysisResult.kpis.nurtureCount}
                total={analysisResult.kpis.totalLeads}
                threshold={0}
                colour="text-muted-foreground bg-muted border-border"
              />
            </div>
          </section>

          {/* Feature importance table */}
          <SectionCard
            title="Feature Importance"
            description="Which signals most strongly predict conversion in your dataset."
          >
            <div className="space-y-3">
              {analysisResult.featureImportance.map((fi, i) => (
                <div key={fi.feature} className="flex items-center gap-4">
                  <span className="w-4 shrink-0 text-[12px] text-muted-foreground">{i + 1}</span>
                  <span className="w-40 shrink-0 text-[13px] font-medium text-foreground">{fi.label}</span>
                  <div className="flex-1 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                    <div
                      className="h-2 rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${String(fi.importance)}%` }}
                    />
                  </div>
                  <span className="w-10 shrink-0 text-right text-[13px] font-semibold text-foreground">
                    {fi.importance}%
                  </span>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Charts placeholder — Phase 5 */}
          <SectionCard
            title="Analytics Charts"
            description="Interactive charts will be rendered here in Phase 5."
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {analysisResult.charts.featureImportance.length > 0 && (
                <ChartPlaceholder
                  title="Feature Importance"
                  detail={`${String(analysisResult.charts.featureImportance.length)} features ranked`}
                />
              )}
              <ChartPlaceholder
                title="Lead Score Distribution"
                detail={`${String(analysisResult.leadScores.length)} leads scored`}
              />
              <ChartPlaceholder
                title="SQL / MQL / Nurture"
                detail={`${String(analysisResult.segments.sql.length)} SQL · ${String(analysisResult.segments.mql.length)} MQL`}
              />
              <ChartPlaceholder
                title="Conversion Trend"
                detail={`${String(analysisResult.charts.conversionTrend.length)} time buckets`}
              />
            </div>
          </SectionCard>

          {/* AI insights placeholder — Phase 6 */}
          <SectionCard
            title="AI Executive Summary"
            description="AI-generated insights will appear here after Phase 6 integration."
          >
            <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <TrendingUp size={22} className="text-primary" aria-hidden="true" />
              </div>
              <p className="text-[14px] text-muted-foreground max-w-sm">
                Analytics complete. The AI insights panel will be wired to the NVIDIA API in Phase 6.
              </p>
            </div>
          </SectionCard>
        </>
      )}
    </div>
  )
}

// ── Small local sub-components ────────────────────────────────────────────────

interface SegmentBadgeProps {
  label: string
  count: number
  total: number
  threshold: number
  colour: string
}

function SegmentBadge({ label, count, total, threshold, colour }: SegmentBadgeProps) {
  const pct = total === 0 ? 0 : Math.round((count / total) * 100)
  return (
    <div className={`rounded-[12px] border p-5 ${colour}`}>
      <p className="text-[13px] font-semibold uppercase tracking-wide">{label}</p>
      <p className="mt-1 text-[28px] font-bold leading-none">{count.toLocaleString()}</p>
      <p className="mt-1 text-[12px] opacity-80">
        {pct}% of total
        {threshold > 0 && <> · score ≥ {threshold}</>}
      </p>
    </div>
  )
}

function ChartPlaceholder({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-[10px] border border-dashed border-border bg-background py-10 text-center">
      <p className="text-[14px] font-semibold text-foreground">{title}</p>
      <p className="text-[12px] text-muted-foreground">{detail}</p>
      <p className="text-[11px] text-muted-foreground/60">Chart renders in Phase 5</p>
    </div>
  )
}

const HOW_IT_WORKS = [
  {
    number: '1',
    title: 'Upload & Validate',
    description: 'Drop in your CSV. Required columns, data types, and missing values are checked instantly.',
  },
  {
    number: '2',
    title: 'Analytics Engine',
    description: 'Deterministic algorithms calculate conversion rates, feature importance, and lead scores.',
  },
  {
    number: '3',
    title: 'AI Insights',
    description: 'An executive summary, business recommendations, and risk analysis are generated from your results.',
  },
]
