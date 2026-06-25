import { AlertTriangle, CheckCircle, Loader2, TrendingUp, Users, Zap } from 'lucide-react'
import { MetricCard } from '@/components/common/MetricCard'
import { SectionCard } from '@/components/common/SectionCard'
import { SegmentBadge } from '@/components/common/SegmentBadge'
import { FormulaTooltip } from '@/components/common/FormulaTooltip'
import { ConversionTrendChart } from '@/components/charts/ConversionTrendChart'
import { FeatureImportanceChart } from '@/components/charts/FeatureImportanceChart'
import { LeadScoreHistogram } from '@/components/charts/LeadScoreHistogram'
import { SegmentPieChart } from '@/components/charts/SegmentPieChart'
import {
  AIInsightsPanelError,
  AIInsightsPanelLoading,
  AIInsightsPanelReady,
} from '@/components/insights/AIInsightsPanel'
import { AskAIPanel } from '@/components/insights/AskAIPanel'
import { BreakdownTable } from '@/components/insights/BreakdownTable'
import { DownloadLeadsButton } from '@/components/insights/DownloadLeadsButton'
import { ICPProfileCard } from '@/components/insights/ICPProfileCard'
import { SegmentSettingsPopover } from '@/components/insights/SegmentSettingsPopover'
import { TopLeadsTable } from '@/components/insights/TopLeadsTable'
import { DatasetSummaryBar } from './DatasetSummaryBar'
import type { AnalysisResult, SegmentConfig } from '@/types/analysis'
import type { AIResponse } from '@/types/ai'
import type { Lead } from '@/types/lead'
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
  leads: Lead[] | null
  categoricalData: Record<string, string>[]
  featureColumns: string[]
  fileName: string | null
  segmentConfig: SegmentConfig
  onSegmentConfigChange?: (config: SegmentConfig) => void
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
  leads,
  categoricalData,
  featureColumns,
  fileName,
  segmentConfig,
  onSegmentConfigChange,
}: Props) {
  return (
    <>
      {analysisState === 'running' && (
        <SectionCard title="Analytics Engine">
          <div className="flex items-center gap-3 py-6" aria-live="polite">
            <Loader2 size={18} className="animate-spin text-primary" aria-hidden="true" />
            <p className="text-[14px] text-muted-foreground">Running analytics pipeline…</p>
          </div>
        </SectionCard>
      )}

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

      {analysisState === 'done' && analysisResult && (() => {
        // Only meaningful for a fresh analysis — leadScores aren't persisted
        // for saved history, and the settings popover is hidden in that case anyway.
        const convertedScoresAsc = leads
          ? analysisResult.leadScores
              .filter((ls) => leads[ls.index]?.converted)
              .map((ls) => ls.score)
              .sort((a, b) => a - b)
          : []
        const openScores = leads
          ? analysisResult.leadScores.filter((ls) => !leads[ls.index]?.converted).map((ls) => ls.score)
          : []

        return (
        <>
          <DatasetSummaryBar fileName={fileName} rowCount={analysisResult.kpis.totalLeads} featureColumns={featureColumns.length > 0 ? featureColumns : analysisResult.dataset.featureColumns} />

          {/* KPIs */}
          <section aria-labelledby="kpi-heading">
            <div className="mb-4 flex items-center gap-2">
              <h2 id="kpi-heading" className="text-[18px] font-semibold text-foreground">Key Metrics</h2>
              <FormulaTooltip title="Key Metrics" lines={[
                'Total Leads: row count in your CSV.',
                'Converted Leads: rows where converted = 1.',
                'Conversion Rate = (Converted ÷ Total) × 100, rounded to 1 decimal.',
                'Avg Lead Score = mean of all individual 0–100 lead scores (all leads).',
              ]} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard title="Total Leads" value={analysisResult.kpis.totalLeads.toLocaleString()} icon={Users} />
              <MetricCard title="Converted Leads" value={analysisResult.kpis.convertedLeads.toLocaleString()} icon={CheckCircle}
                trend={{ direction: 'neutral', label: `of ${analysisResult.kpis.totalLeads.toLocaleString()} total` }} />
              <MetricCard title="Conversion Rate" value={`${analysisResult.kpis.conversionRate.toFixed(1)}%`} icon={TrendingUp} />
              <MetricCard title="Avg Lead Score" value={String(analysisResult.kpis.averageLeadScore)} icon={Zap}
                trend={{ direction: 'neutral', label: 'out of 100' }} />
            </div>
          </section>

          <ICPProfileCard
            featureBuckets={analysisResult.featureBuckets}
            categoricalBreakdown={analysisResult.categoricalBreakdown}
          />

          {/* Lead Prioritization (open pipeline only) */}
          <section aria-labelledby="segment-heading">
            <div className="mb-3 flex items-center gap-2">
              <h2 id="segment-heading" className="text-[18px] font-semibold text-foreground">Lead Prioritization</h2>
              <FormulaTooltip title="Lead Prioritization" lines={[
                'Converted leads are excluded — they already won, no prioritization needed.',
                'Thresholds are learned from your conversion history, not a fixed percentage:',
                `SQL bar = the score level at/above which ~${String(100 - Math.round(segmentConfig.sqlConvertedPercentile * 100))}% of leads that actually converted scored (≥ ${String(analysisResult.segments.sqlThreshold)}).`,
                `MQL bar = a more lenient level covering ~${String(100 - Math.round(segmentConfig.mqlConvertedPercentile * 100))}% of historical converters (≥ ${String(analysisResult.segments.mqlThreshold)}).`,
                `Among your ${analysisResult.kpis.openLeads.toLocaleString()} open leads: SQL clears the strict bar, MQL clears the lenient bar, Nurture clears neither.`,
                'Use "Adjust SQL / MQL Thresholds" below to change these.',
              ]} />
            </div>

            {/* Prominent, always-visible toolbar — easy to find, not hidden in a corner */}
            <div className="mb-4 flex flex-wrap items-center gap-2 rounded-[10px] border border-border bg-muted/40 px-3 py-2.5">
              <span className="mr-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Tools:</span>
              <DownloadLeadsButton
                leads={leads}
                leadScores={analysisResult.leadScores}
                segments={analysisResult.segments}
                featureColumns={featureColumns}
              />
              {onSegmentConfigChange && (
                <SegmentSettingsPopover
                  config={segmentConfig}
                  onChange={onSegmentConfigChange}
                  convertedScoresAsc={convertedScoresAsc}
                  openScores={openScores}
                />
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <SegmentBadge label="Converted" subtitle="Already a customer" count={analysisResult.kpis.convertedLeads}
                total={analysisResult.kpis.totalLeads} variant="converted" />
              <SegmentBadge label="SQL" subtitle="Top open lead — call now" count={analysisResult.kpis.sqlCount}
                total={analysisResult.kpis.openLeads} totalLabel="of open leads" threshold={analysisResult.segments.sqlThreshold} variant="sql" />
              <SegmentBadge label="MQL" subtitle="Marketing nurture candidate" count={analysisResult.kpis.mqlCount}
                total={analysisResult.kpis.openLeads} totalLabel="of open leads" threshold={analysisResult.segments.mqlThreshold} variant="mql" />
              <SegmentBadge label="Nurture" subtitle="Lower priority, open" count={analysisResult.kpis.nurtureCount}
                total={analysisResult.kpis.openLeads} totalLabel="of open leads" variant="nurture" />
            </div>
          </section>

          {/* Top Priority Leads — the actionable call list, only available for a fresh analysis */}
          {leads && (
            <TopLeadsTable
              leads={leads}
              leadScores={analysisResult.leadScores}
              segments={analysisResult.segments}
              categoricalData={categoricalData}
              topFeatures={analysisResult.featureImportance}
            />
          )}

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

          {/* Feature value ranges — what range of each top feature converts best */}
          {analysisResult.featureBuckets.length > 0 && (
            <section aria-labelledby="buckets-heading">
              <div className="mb-4 flex items-center gap-2">
                <h2 id="buckets-heading" className="text-[18px] font-semibold text-foreground">Feature Value Ranges</h2>
                <FormulaTooltip title="Feature Value Ranges" lines={[
                  'Leads are sorted by each feature\'s value and split into 4 equal-sized groups.',
                  'Conversion Rate = converted ÷ total leads in that range.',
                  'SQL Rate = SQL leads ÷ OPEN leads in that range — how likely an open lead in this range is to be top-priority.',
                  'This answers "what range of X should I prioritize?" with real numbers, not just an importance rank.',
                ]} />
              </div>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {analysisResult.featureBuckets.map((fb) => (
                  <BreakdownTable key={fb.feature} title={fb.label} rows={fb.rows} />
                ))}
              </div>
            </section>
          )}

          {/* Category breakdown — which value of each categorical column converts best */}
          {analysisResult.categoricalBreakdown.length > 0 && (
            <section aria-labelledby="categorical-heading">
              <div className="mb-4 flex items-center gap-2">
                <h2 id="categorical-heading" className="text-[18px] font-semibold text-foreground">Category Breakdown</h2>
                <FormulaTooltip title="Category Breakdown" lines={[
                  'For each categorical column (Industry, Region, Lead Source, etc.), leads are grouped by value.',
                  'Conversion Rate = converted ÷ total leads in that group.',
                  'SQL Rate = SQL leads ÷ OPEN leads in that group — which values are worth prioritizing right now.',
                  'Groups smaller than 3 leads are hidden — too small to be meaningful.',
                ]} />
              </div>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {analysisResult.categoricalBreakdown.map((cb) => (
                  <BreakdownTable key={cb.column} title={cb.label} rows={cb.rows} />
                ))}
              </div>
            </section>
          )}

          {/* AI insights */}
          {insightState === 'loading' && <AIInsightsPanelLoading />}
          {insightState === 'error' && (
            <AIInsightsPanelError error={insightError ?? 'Unknown error'} onRetry={onRetryInsights} />
          )}
          {insightState === 'done' && insights && <AIInsightsPanelReady insights={insights} />}

          {/* Ask AI — always available once analysis is done, independent of
              whether the executive summary itself succeeded or is still loading */}
          <AskAIPanel
            context={analysisResult.aiPayload}
            suggestedQuestions={insights?.suggestedQuestions}
          />
        </>
        )
      })()}
    </>
  )
}
