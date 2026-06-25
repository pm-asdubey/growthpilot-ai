import {
  AlertTriangle,
  CheckCircle,
  Loader2,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react'
import { MetricCard } from '@/components/common/MetricCard'
import { PageHeader } from '@/components/common/PageHeader'
import { SectionCard } from '@/components/common/SectionCard'
import { ConversionTrendChart } from '@/components/charts/ConversionTrendChart'
import { FeatureImportanceChart } from '@/components/charts/FeatureImportanceChart'
import { LeadScoreHistogram } from '@/components/charts/LeadScoreHistogram'
import { SegmentPieChart } from '@/components/charts/SegmentPieChart'
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

// ── Checklist builder ────────────────────────────────────────────────────────

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
      status: isPending
        ? 'pending'
        : errors.some((e) => e.code === 'PARSE_ERROR') ? 'fail' : 'pass',
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

// ── Page ─────────────────────────────────────────────────────────────────────

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

      {/* ── Idle ── */}
      {isIdle && (
        <SectionCard>
          <div className="space-y-8">
            <CSVDropzone onFileSelected={handleFileSelected} />
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

      {/* ── Validation passed ── */}
      {isUploadReady && validationResult && (
        <SectionCard title="Dataset Validation" description={fileName ?? undefined}>
          <div className="space-y-4">
            <ValidationChecklist checks={checks} />
            <div className="flex items-center gap-2 rounded-[10px] bg-success/10 px-4 py-3">
              <CheckCircle size={16} className="shrink-0 text-success" aria-hidden="true" />
              <p className="text-[13px] font-medium text-success">
                Validation passed —{' '}
                <span className="font-bold">{validationResult.rowCount.toLocaleString()} leads</span>{' '}
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
          <div
            role="alert"
            className="flex items-start gap-3 rounded-[10px] border border-error/30 bg-error/5 p-4"
          >
            <AlertTriangle size={18} className="mt-0.5 shrink-0 text-error" aria-hidden="true" />
            <div className="space-y-2">
              <p className="text-[14px] font-medium text-foreground">Analytics engine error</p>
              <p className="text-[13px] text-muted-foreground">{analysisError}</p>
              <button
                type="button"
                onClick={reset}
                className="text-[13px] font-medium text-primary underline underline-offset-2 hover:no-underline focus-visible:outline-none"
              >
                Start over
              </button>
            </div>
          </div>
        </SectionCard>
      )}

      {/* ── Analysis complete ── */}
      {isAnalysisDone && (
        <>
          {/* KPI cards */}
          <section aria-labelledby="kpi-heading">
            <h2 id="kpi-heading" className="mb-4 text-[18px] font-semibold text-foreground">
              Key Metrics
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                title="Total Leads"
                value={analysisResult.kpis.totalLeads.toLocaleString()}
                icon={Users}
              />
              <MetricCard
                title="Converted Leads"
                value={analysisResult.kpis.convertedLeads.toLocaleString()}
                icon={CheckCircle}
                trend={{
                  direction: 'neutral',
                  label: `of ${analysisResult.kpis.totalLeads.toLocaleString()} total`,
                }}
              />
              <MetricCard
                title="Conversion Rate"
                value={`${String(analysisResult.kpis.conversionRate)}%`}
                icon={TrendingUp}
              />
              <MetricCard
                title="Avg Lead Score"
                value={String(analysisResult.kpis.averageLeadScore)}
                icon={Zap}
                trend={{ direction: 'neutral', label: 'out of 100' }}
              />
            </div>
          </section>

          {/* Segment badges */}
          <section aria-labelledby="segment-heading">
            <h2 id="segment-heading" className="mb-4 text-[18px] font-semibold text-foreground">
              Lead Segments
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <SegmentBadge
                label="SQL"
                subtitle="Sales Qualified Lead"
                count={analysisResult.kpis.sqlCount}
                total={analysisResult.kpis.totalLeads}
                threshold={analysisResult.segments.sqlThreshold}
                className="border-primary/20 bg-primary/5 text-primary"
              />
              <SegmentBadge
                label="MQL"
                subtitle="Marketing Qualified Lead"
                count={analysisResult.kpis.mqlCount}
                total={analysisResult.kpis.totalLeads}
                threshold={analysisResult.segments.mqlThreshold}
                className="border-warning/20 bg-warning/5 text-warning"
              />
              <SegmentBadge
                label="Nurture"
                subtitle="Requires further engagement"
                count={analysisResult.kpis.nurtureCount}
                total={analysisResult.kpis.totalLeads}
                threshold={0}
                className="border-border bg-muted text-muted-foreground"
              />
            </div>
          </section>

          {/* Charts — 2-column grid on desktop */}
          <section aria-labelledby="charts-heading">
            <h2 id="charts-heading" className="mb-4 text-[18px] font-semibold text-foreground">
              Analytics
            </h2>
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <FeatureImportanceChart data={analysisResult.charts.featureImportance} />
              <LeadScoreHistogram
                data={analysisResult.charts.leadScoreHistogram}
                sqlThreshold={analysisResult.segments.sqlThreshold}
                mqlThreshold={analysisResult.segments.mqlThreshold}
              />
              <SegmentPieChart
                data={analysisResult.charts.segmentDistribution}
                totalLeads={analysisResult.kpis.totalLeads}
              />
              <ConversionTrendChart
                data={analysisResult.charts.conversionTrend}
                conversionRate={analysisResult.kpis.conversionRate}
              />
            </div>
          </section>

          {/* AI insights placeholder — Phase 6 */}
          <SectionCard
            title="AI Executive Summary"
            description="AI-generated insights will appear here after Phase 6 integration."
          >
            <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Sparkles size={22} className="text-primary" aria-hidden="true" />
              </div>
              <p className="max-w-sm text-[14px] text-muted-foreground">
                Analytics complete. Connect the NVIDIA AI API in Phase 6 to generate an executive
                summary, recommendations, and risk analysis.
              </p>
            </div>
          </SectionCard>
        </>
      )}
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface SegmentBadgeProps {
  label: string
  subtitle: string
  count: number
  total: number
  threshold: number
  className: string
}

function SegmentBadge({ label, subtitle, count, total, threshold, className }: SegmentBadgeProps) {
  const pct = total === 0 ? 0 : Math.round((count / total) * 100)
  return (
    <div className={`rounded-[12px] border p-5 ${className}`}>
      <p className="text-[12px] font-semibold uppercase tracking-wider">{label}</p>
      <p className="mt-0.5 text-[11px] opacity-70">{subtitle}</p>
      <p className="mt-3 text-[32px] font-bold leading-none">{count.toLocaleString()}</p>
      <p className="mt-1.5 text-[12px] opacity-70">
        {pct}% of total
        {threshold > 0 && <> · score ≥ {threshold}</>}
      </p>
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
