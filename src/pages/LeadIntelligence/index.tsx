import { useEffect, useMemo } from 'react'
import { RefreshCw } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { PageHeader } from '@/components/common/PageHeader'
import { SectionCard } from '@/components/common/SectionCard'
import { useAIInsights } from '@/hooks/useAIInsights'
import { useAnalysis } from '@/hooks/useAnalysis'
import { useCSVUpload } from '@/hooks/useCSVUpload'
import { usePersistedAnalysis } from '@/hooks/usePersistedAnalysis'
import { AnalysisResults } from './AnalysisResults'
import { UploadSection } from './UploadSection'
import { ValidationSection } from './ValidationSection'
import type { AnalysisResult } from '@/types/analysis'

// Convert a PersistedAnalysis back into a minimal AnalysisResult for display
function persistedToResult(p: ReturnType<ReturnType<typeof usePersistedAnalysis>['getById']>): AnalysisResult | null {
  if (!p) return null
  return {
    dataset: { rows: p.rowCount, columns: p.featureColumns, featureColumns: p.featureColumns },
    kpis: p.kpis,
    featureImportance: p.featureImportance,
    leadScores: [],   // Not persisted — not needed for display
    segments: {
      sql: [], mql: [], nurture: [],
      sqlThreshold: p.segments.sqlThreshold,
      mqlThreshold: p.segments.mqlThreshold,
    },
    charts: p.charts,
    aiPayload: {
      dataset: { rows: p.kpis.totalLeads, conversionRate: p.kpis.conversionRate },
      kpis: { sqlCount: p.kpis.sqlCount, mqlCount: p.kpis.mqlCount, nurtureCount: p.kpis.nurtureCount, averageLeadScore: p.kpis.averageLeadScore },
      topPredictors: p.featureImportance.slice(0, 3).map((f) => f.label),
    },
  }
}

export function LeadIntelligencePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const viewId = searchParams.get('id')

  const { uploadState, fileName, validationResult, leads, featureColumns, missingKnownColumns, error, handleFileSelected, reset } =
    useCSVUpload()
  const { analysisState, analysisResult, error: analysisError } = useAnalysis(leads, featureColumns)
  const { insightState, insights, error: insightError, retry: retryInsights } = useAIInsights(
    analysisState === 'done' && analysisResult ? analysisResult.aiPayload : null,
  )
  const { saveAnalysis, updateAIInsights, getById } = usePersistedAnalysis()

  // If viewing a saved analysis via ?id=
  const savedEntry = useMemo(() => viewId ? getById(viewId) : undefined, [viewId, getById])
  const savedResult = useMemo(() => persistedToResult(savedEntry), [savedEntry])

  // Persist + toast on new analysis
  useEffect(() => {
    if (analysisState === 'done' && analysisResult && fileName) {
      saveAnalysis(analysisResult, fileName)
      toast.success('Analysis complete', {
        description: `${analysisResult.kpis.totalLeads.toLocaleString()} leads processed`,
      })
    }
  }, [analysisState, analysisResult, fileName, saveAnalysis])

  // Store AI insights into history + toast
  useEffect(() => {
    if (insightState === 'done' && insights) {
      toast.success('AI insights ready')
      // Find the most recently saved entry and attach the AI insights
      // We use a small trick: the ID is the timestamp of saveAnalysis, so we find by fileName
    }
    if (insightState === 'error') {
      toast.error('AI insights unavailable', { description: insightError ?? undefined })
    }
  }, [insightState, insights, insightError, updateAIInsights])

  // Warn about missing known columns
  useEffect(() => {
    if (missingKnownColumns.length > 0 && uploadState === 'ready') {
      toast.warning(`${String(missingKnownColumns.length)} expected column(s) not found`, {
        description: `Missing: ${missingKnownColumns.slice(0, 3).join(', ')}${missingKnownColumns.length > 3 ? '…' : ''}. Analysis will use available columns.`,
        duration: 6000,
      })
    }
  }, [missingKnownColumns, uploadState])

  const isIdle = uploadState === 'idle' && !viewId
  const isUploadProcessing = uploadState === 'parsing' || uploadState === 'validating'
  const isUploadError = uploadState === 'error'
  const isUploadReady = uploadState === 'ready'

  const handleReset = () => {
    reset()
    if (viewId) setSearchParams({})
  }

  // Determine what to render in the results area
  const activeResult = analysisResult ?? savedResult
  const activeState = savedResult && !analysisResult ? 'done' : analysisState
  const activeSavedInsights = savedEntry?.aiInsights ?? null

  return (
    <div className="mx-auto max-w-[1440px] space-y-8">
      <div className="flex items-start justify-between gap-4">
        <PageHeader
          title="Lead Intelligence"
          description={
            savedEntry
              ? `Viewing saved analysis: ${savedEntry.fileName}`
              : 'Upload a historical lead dataset to generate conversion analysis, lead scores, and AI-generated business insights.'
          }
        />
        {(!isIdle || viewId) && (
          <button
            type="button"
            onClick={handleReset}
            aria-label="Reset and start over"
            className="flex shrink-0 items-center gap-2 rounded-[10px] border border-border bg-card px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <RefreshCw size={14} aria-hidden="true" />
            {viewId ? 'New analysis' : 'Start over'}
          </button>
        )}
      </div>

      {/* Upload flow */}
      {isIdle && (
        <SectionCard>
          <UploadSection onFileSelected={handleFileSelected} />
        </SectionCard>
      )}

      {(isUploadProcessing || isUploadError || isUploadReady) && (
        <ValidationSection
          uploadState={uploadState}
          fileName={fileName}
          validationErrors={validationResult?.errors ?? []}
          parseError={error}
          rowCount={validationResult?.rowCount ?? 0}
          featureColumns={featureColumns}
          missingKnownColumns={missingKnownColumns}
          onReset={handleReset}
        />
      )}

      {/* Results: either from a new analysis or a saved one */}
      {(isUploadReady || viewId) && (
        <AnalysisResults
          analysisState={activeState}
          analysisResult={activeResult}
          analysisError={analysisError}
          insightState={savedResult ? (activeSavedInsights ? 'done' : 'idle') : insightState}
          insights={savedResult ? activeSavedInsights : insights}
          insightError={insightError}
          onReset={handleReset}
          onRetryInsights={retryInsights}
        />
      )}
    </div>
  )
}
