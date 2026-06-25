import { FormulaTooltip } from '@/components/common/FormulaTooltip'
import type { BreakdownRow } from '@/types/analysis'

interface BreakdownTableProps {
  title: string
  rows: BreakdownRow[]
  formula?: string[]
}

export function BreakdownTable({ title, rows, formula }: BreakdownTableProps) {
  const maxRate = Math.max(...rows.map((r) => r.conversionRate), 1)
  const maxSqlRate = Math.max(...rows.map((r) => r.sqlRate), 1)

  return (
    <div className="rounded-[12px] border border-border bg-card p-5">
      <div className="mb-3 flex items-center gap-1.5">
        <h3 className="text-[14px] font-semibold text-foreground">{title}</h3>
        {formula && <FormulaTooltip title={title} lines={formula} />}
      </div>
      <table className="w-full text-[12px]">
        <thead>
          <tr className="text-left text-[10px] uppercase tracking-wide text-muted-foreground">
            <th className="pb-2 font-medium">Value</th>
            <th className="pb-2 font-medium text-right">Leads</th>
            <th className="pb-2 font-medium text-right">Conv. Rate</th>
            <th className="pb-2 font-medium text-right">SQL Rate</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-t border-border/60">
              <td className="py-2 pr-2 font-medium text-foreground">{row.label}</td>
              <td className="py-2 text-right text-muted-foreground">{row.count.toLocaleString()}</td>
              <td className="py-2 text-right">
                <span className="inline-flex items-center gap-1.5">
                  <span className="hidden h-1.5 w-10 overflow-hidden rounded-full bg-muted sm:inline-block" aria-hidden="true">
                    <span
                      className="block h-full rounded-full bg-primary"
                      style={{ width: `${String((row.conversionRate / maxRate) * 100)}%` }}
                    />
                  </span>
                  <span className="font-semibold text-foreground">{row.conversionRate}%</span>
                </span>
              </td>
              <td className="py-2 text-right">
                <span className="inline-flex items-center gap-1.5">
                  <span className="hidden h-1.5 w-10 overflow-hidden rounded-full bg-muted sm:inline-block" aria-hidden="true">
                    <span
                      className="block h-full rounded-full bg-warning"
                      style={{ width: `${String((row.sqlRate / maxSqlRate) * 100)}%` }}
                    />
                  </span>
                  <span className="font-semibold text-foreground">{row.sqlRate}%</span>
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
