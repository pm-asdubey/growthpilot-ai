import { useEffect, useMemo, useState } from 'react'
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
import type { AnalysisResult, SegmentConfig } from '@/types/analysis'
import { DEFAULT_SEGMENT_CONFIG } from '@/types/analysis'
import type { PersistedAnalysis } from '@/types/persistence'

// Convert a PersistedAnalysis back into a minimal AnalysisResult for display.
// leadScores is intentionally empty — raw per-lead scores aren't persisted,
// and the saved view only needs aggregates (which are all persisted).
function persistedToResult(p: PersistedAnalysis | undefined): AnalysisResult | null {
  if (!p) return null
  return {
    dataset: { rows: p.rowCount, columns: p.featureColumns, featureColumns: p.featureColumns },
    kpis: p.kpis,
    featureImportance: p.featureImportance,
    leadScores: [],
    segments: {
      converted: [], sql: [], mql: [], nurture: [],
      sqlThreshold: p.segments.sqlThreshold,
      mqlThreshold: p.segments.mqlThreshold,
    },
    charts: p.charts,
    categoricalBreakdown: p.categoricalBreakdown,
    featureBuckets: p.featureBuckets,
    aiPayload: {
      dataset: { rows: p.kpis.totalLeads, conversionRate: p.kpis.conversionRate },
      kpis: {
        convertedLeads: p.kpis.convertedLeads,
        openLeads: p.kpis.openLeads,
        sqlCount: p.kpis.sqlCount,
        mqlCount: p.kpis.mqlCount,
        nurtureCount: p.kpis.nurtureCount,
        averageLeadScore: p.kpis.averageLeadScore,
      },
      topPredictors: p.featureImportance.slice(0, 3).map((f) => f.label),
      categoricalBreakdown: p.categoricalBreakdown,
      featureBuckets: p.featureBuckets,
    },
    // Defensive: entries saved before the SegmentConfig shape changed (fixed
    // percentage → learned-from-conversions percentile) won't have this field
    // at runtime even though the type claims it's always present.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    segmentConfig: p.segmentConfig ?? DEFAULT_SEGMENT_CONFIG,
  }
}

export function LeadIntelligencePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const viewId = searchParams.get('id')
  const [segmentConfig, setSegmentConfig] = useState<SegmentConfig>(DEFAULT_SEGMENT_CONFIG)
  const [freshEntryId, setFreshEntryId] = useState<string | null>(null)

  const {
    uploadState, fileName, validationResult, leads, featureColumns,
    categoricalColumns, categoricalData, missingKnownColumns, error, handleFileSelected, reset,
  } = useCSVUpload()
  const { analysisState, analysisResult, error: analysisError } = useAnalysis(
    leads, featureColumns, segmentConfig, categoricalData, categoricalColumns,
  )
  const { saveAnalysis, updateAIInsights, getById } = usePersistedAnalysis()

  const savedEntry = useMemo(() => viewId ? getById(viewId) : undefined, [viewId, getById])
  const savedResult = useMemo(() => persistedToResult(savedEntry), [savedEntry])
  const isViewingSaved = Boolean(savedResult && !analysisResult)

  const activeResult = analysisResult ?? savedResult
  const activeState = savedResult && !analysisResult ? 'done' : analysisState

  // Whichever history entry the current view corresponds to — used to read
  // cached AI insights and to write newly-fetched ones back into storage.
  const targetEntry = isViewingSaved ? savedEntry : undefined
  const cachedInsights = targetEntry?.aiInsights ?? null

  // Only hit the AI endpoint when we don't already have a cached answer —
  // covers both a fresh analysis (always fetches once) and the first time an
  // older saved analysis is opened (fetches once, then caches permanently).
  const aiPayloadToFetch = activeState === 'done' && activeResult && !cachedInsights ? activeResult.aiPayload : null
  const { insightState: fetchedState, insights: fetchedInsights, error: insightError, retry: retryInsights } = useAIInsights(aiPayloadToFetch)

  const insightState = cachedInsights ? 'done' : fetchedState
  const insights = cachedInsights ?? fetchedInsights

  useEffect(() => {
    if (analysisState === 'done' && analysisResult && fileName) {
      const entry = saveAnalysis(analysisResult, fileName)
      setFreshEntryId(entry.id)
      toast.success('Analysis complete', {
        description: `${analysisResult.kpis.totalLeads.toLocaleString()} leads processed`,
      })
    }
  }, [analysisState, analysisResult, fileName, saveAnalysis])

  // Persist AI insights into history as soon as they're fetched — whether
  // this is a brand-new analysis or the first time we're opening an older one.
  const targetEntryId = isViewingSaved ? (savedEntry?.id ?? null) : freshEntryId
  useEffect(() => {
    if (fetchedState === 'done' && fetchedInsights && targetEntryId) {
      updateAIInsights(targetEntryId, fetchedInsights)
      toast.success('AI insights ready')
    }
    if (fetchedState === 'error') {
      toast.error('AI insights unavailable', { description: insightError ?? undefined })
    }
  }, [fetchedState, fetchedInsights, targetEntryId, updateAIInsights, insightError])

  const isIdle = uploadState === 'idle' && !viewId
  const isUploadProcessing = uploadState === 'parsing' || uploadState === 'validating'
  const isUploadError = uploadState === 'error'
  const isUploadReady = uploadState === 'ready'
  // Hide the validation card once analysis is done — a compact summary inside
  // AnalysisResults takes over from there.
  const showValidationCard = isUploadProcessing || isUploadError || (isUploadReady && analysisState !== 'done')

  const handleReset = () => {
    reset()
    setSegmentConfig(DEFAULT_SEGMENT_CONFIG)
    setFreshEntryId(null)
    if (viewId) setSearchParams({})
  }

  return (
    <div className="mx-auto max-w-[1440px] space-y-8">
      <div className="flex items-start justify-between gap-4">
        <PageHeader
          title="Lead Intelligence"
          description={
            savedEntry
              ? `Viewing saved analysis: ${savedEntry.fileName}`
              : 'Upload a historical lead dataset to learn what predicts conversion, then prioritize your open pipeline.'
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

      {isIdle && (
        <SectionCard>
          <UploadSection onFileSelected={handleFileSelected} />
        </SectionCard>
      )}

      {showValidationCard && (
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

      {(isUploadReady || viewId) && (
        <AnalysisResults
          analysisState={activeState}
          analysisResult={activeResult}
          analysisError={analysisError}
          insightState={insightState}
          insights={insights}
          insightError={insightError}
          onReset={handleReset}
          onRetryInsights={retryInsights}
          leads={isViewingSaved ? null : leads}
          categoricalData={isViewingSaved ? [] : categoricalData}
          featureColumns={featureColumns}
          fileName={fileName ?? savedEntry?.fileName ?? null}
          segmentConfig={segmentConfig}
          onSegmentConfigChange={isViewingSaved ? undefined : setSegmentConfig}
        />
      )}
    </div>
  )
}
