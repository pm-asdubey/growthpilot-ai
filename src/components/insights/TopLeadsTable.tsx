import { useMemo, useState } from 'react'
import { SectionCard } from '@/components/common/SectionCard'
import { FormulaTooltip } from '@/components/common/FormulaTooltip'
import { cn } from '@/lib/utils'
import type { FeatureImportance, LeadScore, SegmentResult } from '@/types/analysis'
import type { Lead } from '@/types/lead'

interface TopLeadsTableProps {
  leads: Lead[]
  leadScores: LeadScore[]
  segments: SegmentResult
  categoricalData: Record<string, string>[]
  topFeatures: FeatureImportance[]
}

type SegmentFilter = 'sql' | 'mql' | 'nurture' | 'all'

const PAGE_SIZE = 25

// Tries to find a column that identifies the lead to a human (company name,
// account, contact name, email) so the table reads as a real call list
// instead of anonymous row numbers.
const IDENTIFIER_PRIORITY = ['company', 'account', 'organization', 'name', 'contact', 'email', 'lead_id', 'id']

function findIdentifierColumn(categoricalData: Record<string, string>[]): string | null {
  if (categoricalData.length === 0) return null
  const cols = Object.keys(categoricalData[0])
  for (const want of IDENTIFIER_PRIORITY) {
    const match = cols.find((c) => c === want || c.includes(want))
    if (match) return match
  }
  return null
}

function formatFeatureValue(v: number | boolean | undefined): string {
  if (v === undefined) return '—'
  if (typeof v === 'boolean') return v ? 'Yes' : 'No'
  return Number.isInteger(v) ? String(v) : v.toFixed(1)
}

const SEGMENT_STYLES: Record<string, string> = {
  Converted: 'bg-success/10 text-success',
  SQL: 'bg-primary/10 text-primary',
  MQL: 'bg-warning/10 text-warning',
  Nurture: 'bg-muted text-muted-foreground',
}

export function TopLeadsTable({ leads, leadScores, segments, categoricalData, topFeatures }: TopLeadsTableProps) {
  const [filter, setFilter] = useState<SegmentFilter>('sql')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const identifierCol = useMemo(() => findIdentifierColumn(categoricalData), [categoricalData])
  const sqlSet = useMemo(() => new Set(segments.sql), [segments.sql])
  const mqlSet = useMemo(() => new Set(segments.mql), [segments.mql])
  const convertedSet = useMemo(() => new Set(segments.converted), [segments.converted])
  const displayFeatures = topFeatures.slice(0, 3)

  const filteredSorted = useMemo(() => {
    return leadScores
      .filter((ls) => {
        if (filter === 'all') return true
        if (filter === 'sql') return sqlSet.has(ls.index)
        if (filter === 'mql') return mqlSet.has(ls.index)
        return !sqlSet.has(ls.index) && !mqlSet.has(ls.index) && !convertedSet.has(ls.index)
      })
      .sort((a, b) => b.score - a.score)
  }, [leadScores, filter, sqlSet, mqlSet, convertedSet])

  const visible = filteredSorted.slice(0, visibleCount)
  const remaining = filteredSorted.length - visible.length

  const setFilterAndReset = (f: SegmentFilter) => {
    setFilter(f)
    setVisibleCount(PAGE_SIZE)
  }

  return (
    <SectionCard>
      <div className="mb-1 flex items-center gap-2">
        <h2 className="text-[16px] font-semibold text-foreground">Top Priority Leads</h2>
        <FormulaTooltip title="Top Priority Leads" lines={[
          'Sorted by lead score, descending, within the selected segment.',
          `Showing ${identifierCol ? 'an identifying column from your CSV' : 'row position'} plus your top 3 most important features per lead.`,
          'This is the actionable call/email list — use the segment tabs to focus on SQL first.',
        ]} />
      </div>
      <p className="mb-4 text-[13px] text-muted-foreground">Your highest-scoring leads, ready to act on.</p>

      <div className="mb-4 flex gap-1.5">
        {(['sql', 'mql', 'nurture', 'all'] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => { setFilterAndReset(f) }}
            className={cn(
              'rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors',
              filter === f ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent',
            )}
          >
            {f.toUpperCase()}
          </button>
        ))}
      </div>

      {filteredSorted.length === 0 ? (
        <p className="py-6 text-center text-[13px] text-muted-foreground">No leads in this segment.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-wide text-muted-foreground">
                  <th className="pb-2 font-medium">{identifierCol ? 'Lead' : 'Row'}</th>
                  <th className="pb-2 font-medium text-right">Score</th>
                  <th className="pb-2 font-medium">Segment</th>
                  {displayFeatures.map((fi) => (
                    <th key={fi.feature} className="pb-2 font-medium text-right">{fi.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map((ls) => {
                  const lead = leads[ls.index]
                  const seg = convertedSet.has(ls.index) ? 'Converted' : sqlSet.has(ls.index) ? 'SQL' : mqlSet.has(ls.index) ? 'MQL' : 'Nurture'
                  const rawIdentifier = identifierCol ? categoricalData[ls.index]?.[identifierCol] : undefined
                  const identifier = rawIdentifier && rawIdentifier.length > 0 ? rawIdentifier : undefined
                  return (
                    <tr key={ls.index} className="border-t border-border/60">
                      <td className="py-2 pr-2 font-medium text-foreground">{identifier ?? `Lead #${String(ls.index + 1)}`}</td>
                      <td className="py-2 text-right font-semibold text-foreground">{ls.score}</td>
                      <td className="py-2">
                        <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-medium', SEGMENT_STYLES[seg])}>{seg}</span>
                      </td>
                      {displayFeatures.map((fi) => (
                        <td key={fi.feature} className="py-2 text-right text-muted-foreground">{formatFeatureValue(lead[fi.feature])}</td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {remaining > 0 && (
            <button
              type="button"
              onClick={() => { setVisibleCount((c) => c + PAGE_SIZE) }}
              className="mt-3 w-full rounded-[8px] border border-border bg-background py-2 text-[12px] font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Show {Math.min(PAGE_SIZE, remaining)} more ({remaining.toLocaleString()} remaining)
            </button>
          )}
        </>
      )}
    </SectionCard>
  )
}
