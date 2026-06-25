import { AlertTriangle, CheckCircle, Loader2, TrendingUp, Users, Zap } from 'lucide-react'
import { MetricCard } from '@/components/common/MetricCard'
import { SectionCard } from '@/components/common/SectionCard'
import { SegmentBadge } from '@/components/common/SegmentBadge'
import { ConversionTrendChart } from '@/components/charts/ConversionTrendChart'
import { FeatureImportanceChart } from '@/components/charts/FeatureImportanceChart'
import { LeadScoreHistogram } from '@/components/charts/LeadScoreHistogram'
import { SegmentPieChart } from '@/components/charts/SegmentPieChart'
import {
  AIInsightsPanelError,
  AIInsightsPanelLoading,
  AIInsightsPanelReady,
} from '@/components/insights/AIInsightsPanel'
import type { AnalysisResult } from '@/types/analysis'
import type { AIResponse } from '@/types/ai'
import type { AnalysisState } from '@/hooks/useAnalysis'
import type { InsightState } from '@/hooks/useAIInsights'

interface Props {
  analysisState: AnalysisState
  analysisResult: AnalysisResult | null
  analysisError: string | null
  insightState: InsightState
  insights: AIResponse | null
  insightError: string | null
  onReset: () => void
  onRetryInsights: () => void
}

export function AnalysisResults({
  analysisState,
  analysisResult,
  analysisError,
  insightState,
  insights,
  insightError,
  onReset,
  onRetryInsights,
}: Props) {
  return (
    <>
      {/* Running */}
      {analysisState === 'running' && (
        <SectionCard title="Analytics Engine">
          <div className="flex items-center gap-3 py-6" aria-live="polite">
            <Loader2 size={18} className="animate-spin text-primary" aria-hidden="true" />
            <p className="text-[14px] text-muted-foreground">Running analytics pipeline…</p>
          </div>
        </SectionCard>
      )}

      {/* Error */}
      {analysisState === 'error' && (
        <SectionCard title="Analytics Engine">
          <div role="alert" className="flex items-start gap-3 rounded-[10px] border border-error/30 bg-error/5 p-4">
            <AlertTriangle size={18} className="mt-0.5 shrink-0 text-error" aria-hidden="true" />
            <div className="space-y-2">
              <p className="text-[14px] font-medium text-foreground">Analytics engine error</p>
              <p className="text-[13px] text-muted-foreground">{analysisError}</p>
              <button type="button" onClick={onReset} className="text-[13px] font-medium text-primary underline underline-offset-2 focus-visible:outline-none">
                Start over
              </button>
            </div>
          </div>
        </SectionCard>
      )}

      {/* Done */}
      {analysisState === 'done' && analysisResult && (
        <>
          {/* KPIs */}
          <section aria-labelledby="kpi-heading">
            <h2 id="kpi-heading" className="mb-4 text-[18px] font-semibold text-foreground">Key Metrics</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard title="Total Leads" value={analysisResult.kpis.totalLeads.toLocaleString()} icon={Users} />
              <MetricCard title="Converted Leads" value={analysisResult.kpis.convertedLeads.toLocaleString()} icon={CheckCircle}
                trend={{ direction: 'neutral', label: `of ${analysisResult.kpis.totalLeads.toLocaleString()} total` }} />
              <MetricCard title="Conversion Rate" value={`${analysisResult.kpis.conversionRate.toFixed(1)}%`} icon={TrendingUp} />
              <MetricCard title="Avg Lead Score" value={String(analysisResult.kpis.averageLeadScore)} icon={Zap}
                trend={{ direction: 'neutral', label: 'out of 100' }} />
            </div>
          </section>

          {/* Segments */}
          <section aria-labelledby="segment-heading">
            <h2 id="segment-heading" className="mb-4 text-[18px] font-semibold text-foreground">Lead Segments</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <SegmentBadge label="SQL" subtitle="Sales Qualified Lead" count={analysisResult.kpis.sqlCount}
                total={analysisResult.kpis.totalLeads} threshold={analysisResult.segments.sqlThreshold} variant="sql" />
              <SegmentBadge label="MQL" subtitle="Marketing Qualified Lead" count={analysisResult.kpis.mqlCount}
                total={analysisResult.kpis.totalLeads} threshold={analysisResult.segments.mqlThreshold} variant="mql" />
              <SegmentBadge label="Nurture" subtitle="Requires further engagement" count={analysisResult.kpis.nurtureCount}
                total={analysisResult.kpis.totalLeads} variant="nurture" />
            </div>
          </section>

          {/* Charts */}
          <section aria-labelledby="charts-heading">
            <h2 id="charts-heading" className="mb-4 text-[18px] font-semibold text-foreground">Analytics</h2>
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <FeatureImportanceChart data={analysisResult.charts.featureImportance} />
              <LeadScoreHistogram data={analysisResult.charts.leadScoreHistogram}
                sqlThreshold={analysisResult.segments.sqlThreshold} mqlThreshold={analysisResult.segments.mqlThreshold} />
              <SegmentPieChart data={analysisResult.charts.segmentDistribution} totalLeads={analysisResult.kpis.totalLeads} />
              <ConversionTrendChart data={analysisResult.charts.conversionTrend} conversionRate={analysisResult.kpis.conversionRate} />
            </div>
          </section>

          {/* AI insights */}
          {insightState === 'loading' && <AIInsightsPanelLoading />}
          {insightState === 'error' && (
            <AIInsightsPanelError error={insightError ?? 'Unknown error'} onRetry={onRetryInsights} />
          )}
          {insightState === 'done' && insights && <AIInsightsPanelReady insights={insights} />}
        </>
      )}
    </>
  )
}
