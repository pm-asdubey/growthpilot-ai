import { useMemo, useState } from 'react'
import { Settings2, X } from 'lucide-react'
import { percentile } from '@/utils/percentile'
import type { SegmentConfig } from '@/types/analysis'

interface SegmentSettingsPopoverProps {
  config: SegmentConfig
  onChange: (config: SegmentConfig) => void
  convertedScoresAsc: number[]  // sorted ascending — scores of leads that actually converted
  openScores: number[]          // scores of leads that haven't converted yet
}

export function SegmentSettingsPopover({ config, onChange, convertedScoresAsc, openScores }: SegmentSettingsPopoverProps) {
  const [open, setOpen] = useState(false)
  const [sqlPct, setSqlPct] = useState(Math.round(config.sqlConvertedPercentile * 100))
  const [mqlPct, setMqlPct] = useState(Math.round(config.mqlConvertedPercentile * 100))

  const isValid = sqlPct >= 0 && mqlPct >= 0 && mqlPct < sqlPct && sqlPct <= 100

  const preview = useMemo(() => {
    if (convertedScoresAsc.length === 0) return null
    const sqlThreshold = Math.round(percentile(convertedScoresAsc, sqlPct / 100))
    const mqlThreshold = Math.round(percentile(convertedScoresAsc, mqlPct / 100))
    const sqlCount = openScores.filter((s) => s >= sqlThreshold).length
    const mqlCount = openScores.filter((s) => s >= mqlThreshold && s < sqlThreshold).length
    const nurtureCount = openScores.length - sqlCount - mqlCount
    return { sqlThreshold, mqlThreshold, sqlCount, mqlCount, nurtureCount }
  }, [convertedScoresAsc, openScores, sqlPct, mqlPct])

  const apply = () => {
    if (!isValid) return
    onChange({ sqlConvertedPercentile: sqlPct / 100, mqlConvertedPercentile: mqlPct / 100 })
    setOpen(false)
  }

  return (
    <div className="relative inline-flex">
      <button
        type="button"
        aria-label="Adjust how SQL and MQL thresholds are learned from conversion history"
        aria-expanded={open}
        onClick={() => { setOpen((o) => !o) }}
        className="flex items-center gap-1.5 rounded-[8px] border border-warning/30 bg-warning/5 px-3 py-2 text-[13px] font-medium text-warning transition-colors hover:bg-warning/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Settings2 size={15} aria-hidden="true" />
        Adjust SQL / MQL Thresholds
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" aria-hidden="true" onClick={() => { setOpen(false) }} />

          <div role="dialog" aria-label="Segment configuration" className="absolute right-0 top-9 z-50 w-96 rounded-[10px] border border-border bg-card p-4 shadow-lg">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[13px] font-semibold text-foreground">Prioritization thresholds</p>
              <button type="button" aria-label="Close" onClick={() => { setOpen(false) }} className="text-muted-foreground hover:text-foreground focus-visible:outline-none">
                <X size={14} />
              </button>
            </div>

            <p className="mb-4 text-[11px] leading-relaxed text-muted-foreground">
              Thresholds are learned from your {convertedScoresAsc.length.toLocaleString()} historically converted
              leads, not a fixed percentage. A lower number = a stricter, more demanding bar.
            </p>

            <div className="space-y-4">
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label htmlFor="sql-pct" className="text-[12px] font-medium text-foreground">
                    SQL bar — {100 - sqlPct}% of converters scored at/above
                  </label>
                  <span className="text-[12px] font-semibold text-primary">
                    {preview ? `≥ ${String(preview.sqlThreshold)}` : '—'}
                  </span>
                </div>
                <input
                  id="sql-pct"
                  type="range"
                  min={0}
                  max={90}
                  value={sqlPct}
                  onChange={(e) => { setSqlPct(Number(e.target.value)) }}
                  className="w-full accent-primary"
                  aria-valuetext={`${String(100 - sqlPct)} percent of converters`}
                />
                {preview && (
                  <p className="mt-1 text-[11px] text-muted-foreground">{preview.sqlCount.toLocaleString()} open leads qualify</p>
                )}
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label htmlFor="mql-pct" className="text-[12px] font-medium text-foreground">
                    MQL bar — {100 - mqlPct}% of converters scored at/above
                  </label>
                  <span className="text-[12px] font-semibold text-warning">
                    {preview ? `≥ ${String(preview.mqlThreshold)}` : '—'}
                  </span>
                </div>
                <input
                  id="mql-pct"
                  type="range"
                  min={0}
                  max={90}
                  value={mqlPct}
                  onChange={(e) => { setMqlPct(Number(e.target.value)) }}
                  className="w-full accent-warning"
                  aria-valuetext={`${String(100 - mqlPct)} percent of converters`}
                />
                {preview && (
                  <p className="mt-1 text-[11px] text-muted-foreground">{preview.mqlCount.toLocaleString()} open leads qualify</p>
                )}
              </div>

              {preview && (
                <div className="flex items-center justify-between rounded-[8px] bg-muted px-3 py-2">
                  <span className="text-[11px] text-muted-foreground">Nurture (remaining open leads)</span>
                  <span className="text-[12px] font-semibold text-foreground">{preview.nurtureCount.toLocaleString()} leads</span>
                </div>
              )}

              {convertedScoresAsc.length === 0 && (
                <p className="text-[11px] text-muted-foreground">
                  No converted leads in this dataset — thresholds will fall back to ranking open leads against each other.
                </p>
              )}

              {!isValid && (
                <p role="alert" className="text-[11px] text-error">The MQL slider must stay below the SQL slider, so the MQL score threshold stays beneath the SQL bar.</p>
              )}

              <button
                type="button"
                onClick={apply}
                disabled={!isValid}
                className="w-full rounded-[8px] bg-primary px-3 py-2 text-[12px] font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Apply & Recalculate
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
