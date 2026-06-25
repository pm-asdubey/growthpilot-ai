import { Download } from 'lucide-react'
import type { Lead } from '@/types/lead'
import type { LeadScore, SegmentResult } from '@/types/analysis'

interface DownloadLeadsButtonProps {
  leads: Lead[] | null
  leadScores: LeadScore[]
  segments: SegmentResult
  featureColumns: string[]
}

function segmentLabelFor(index: number, segments: SegmentResult): string {
  if (segments.converted.includes(index)) return 'Converted'
  if (segments.sql.includes(index)) return 'SQL'
  if (segments.mql.includes(index)) return 'MQL'
  return 'Nurture'
}

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function buildCSV(leads: Lead[], leadScores: LeadScore[], segments: SegmentResult, featureColumns: string[]): string {
  const scoreByIndex = new Map(leadScores.map((ls) => [ls.index, ls.score]))
  const header = [...featureColumns, 'converted', 'lead_score', 'segment']
  const rows = [header.join(',')]

  leads.forEach((lead, index) => {
    const row = [
      ...featureColumns.map((col) => {
        const v = lead[col]
        return escapeCSV(typeof v === 'boolean' ? (v ? '1' : '0') : String(v))
      }),
      lead.converted ? '1' : '0',
      String(scoreByIndex.get(index) ?? ''),
      segmentLabelFor(index, segments),
    ]
    rows.push(row.join(','))
  })

  return rows.join('\n')
}

export function DownloadLeadsButton({ leads, leadScores, segments, featureColumns }: DownloadLeadsButtonProps) {
  const isAvailable = leads !== null

  const handleDownload = () => {
    if (!leads) return
    const csv = buildCSV(leads, leadScores, segments, featureColumns)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const timestamp = new Date().toISOString().slice(0, 10)
    link.href = url
    link.download = `growthpilot_leads_categorized_${timestamp}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={!isAvailable}
      aria-label={isAvailable ? 'Download categorized leads as CSV' : 'Download unavailable for saved analyses'}
      title={isAvailable ? undefined : 'Only available right after a fresh upload — raw rows aren\'t kept in saved history'}
      className="flex items-center gap-1.5 rounded-[8px] border border-primary/30 bg-primary/5 px-3 py-2 text-[13px] font-medium text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:border-border disabled:bg-transparent disabled:text-muted-foreground disabled:opacity-60"
    >
      <Download size={15} aria-hidden="true" />
      Download Categorized Leads (CSV)
    </button>
  )
}
