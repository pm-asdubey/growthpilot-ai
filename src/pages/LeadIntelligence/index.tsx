import { useEffect } from 'react'
import { RefreshCw } from 'lucide-react'
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

export function LeadIntelligencePage() {
  const { uploadState, fileName, validationResult, leads, error, handleFileSelected, reset } =
    useCSVUpload()
  const { analysisState, analysisResult, error: analysisError } = useAnalysis(leads)
  const { insightState, insights, error: insightError, retry: retryInsights } = useAIInsights(
    analysisState === 'done' && analysisResult ? analysisResult.aiPayload : null,
  )
  const { saveAnalysis } = usePersistedAnalysis()

  // Persist analysis + toast on completion
  useEffect(() => {
    if (analysisState === 'done' && analysisResult && fileName) {
      saveAnalysis(analysisResult, fileName)
      toast.success('Analysis complete', {
        description: `${analysisResult.kpis.totalLeads.toLocaleString()} leads processed`,
      })
    }
  }, [analysisState, analysisResult, fileName, saveAnalysis])

  // Toast when AI insights arrive
  useEffect(() => {
    if (insightState === 'done') {
      toast.success('AI insights ready')
    }
    if (insightState === 'error') {
      toast.error('AI insights unavailable', { description: insightError ?? undefined })
    }
  }, [insightState, insightError])

  const isIdle = uploadState === 'idle'
  const isUploadProcessing = uploadState === 'parsing' || uploadState === 'validating'
  const isUploadError = uploadState === 'error'
  const isUploadReady = uploadState === 'ready'

  return (
    <div className="mx-auto max-w-[1440px] space-y-8">
      {/* Header */}
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

      {/* Upload */}
      {isIdle && (
        <SectionCard>
          <UploadSection onFileSelected={handleFileSelected} />
        </SectionCard>
      )}

      {/* Validation */}
      {(isUploadProcessing || isUploadError || isUploadReady) && (
        <ValidationSection
          uploadState={uploadState}
          fileName={fileName}
          validationErrors={validationResult?.errors ?? []}
          parseError={error}
          rowCount={validationResult?.rowCount ?? 0}
          onReset={reset}
        />
      )}

      {/* Analysis + charts + AI */}
      {isUploadReady && (
        <AnalysisResults
          analysisState={analysisState}
          analysisResult={analysisResult}
          analysisError={analysisError}
          insightState={insightState}
          insights={insights}
          insightError={insightError}
          onReset={reset}
          onRetryInsights={retryInsights}
        />
      )}
    </div>
  )
}
