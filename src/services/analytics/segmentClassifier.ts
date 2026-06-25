import { percentile } from '@/utils/percentile'
import type { Lead } from '@/types/lead'
import type { LeadScore, SegmentConfig, SegmentResult } from '@/types/analysis'
import { DEFAULT_SEGMENT_CONFIG } from '@/types/analysis'

// Used only when a dataset has zero converted leads (nothing to learn a
// profile from) — falls back to ranking open leads against each other so the
// feature still works, just without historical grounding.
const FALLBACK_SQL_PERCENTILE_OF_OPEN = 0.85
const FALLBACK_MQL_PERCENTILE_OF_OPEN = 0.70

// SQL/MQL/Nurture only make sense for leads that haven't converted yet — a
// converted lead is already won and doesn't need to be prioritized. Rather
// than a fixed "top 15%" cutoff, thresholds are learned from where leads that
// ACTUALLY converted scored: e.g. if 75% of historical converters scored 60+,
// an open lead scoring 60+ matches that profile and becomes SQL.
export function classifySegments(
  leads: Lead[],
  leadScores: LeadScore[],
  config: SegmentConfig = DEFAULT_SEGMENT_CONFIG,
): SegmentResult {
  const converted: number[] = []
  const openScores: LeadScore[] = []

  for (const ls of leadScores) {
    if (leads[ls.index]?.converted) {
      converted.push(ls.index)
    } else {
      openScores.push(ls)
    }
  }

  if (openScores.length === 0) {
    return { converted, sql: [], mql: [], nurture: [], sqlThreshold: 0, mqlThreshold: 0 }
  }

  // If every open lead scored identically (e.g. a dataset with zero converted
  // leads, so feature importance — and therefore every score — collapses to
  // 0), there's no actual signal to prioritize on. Without this guard the
  // percentile threshold equals that same constant value, and `score >=
  // threshold` would classify 100% of leads as SQL — a false signal that's
  // worse than no signal at all.
  const hasScoreSpread = openScores.some((ls) => ls.score !== openScores[0].score)
  if (!hasScoreSpread) {
    return { converted, sql: [], mql: [], nurture: openScores.map((ls) => ls.index), sqlThreshold: 0, mqlThreshold: 0 }
  }

  const scoreByIndex = new Map(leadScores.map((ls) => [ls.index, ls.score]))
  const convertedScoresAsc = converted.map((i) => scoreByIndex.get(i) ?? 0).sort((a, b) => a - b)

  let sqlThreshold: number
  let mqlThreshold: number

  if (convertedScoresAsc.length > 0) {
    sqlThreshold = Math.round(percentile(convertedScoresAsc, config.sqlConvertedPercentile))
    mqlThreshold = Math.round(percentile(convertedScoresAsc, config.mqlConvertedPercentile))
  } else {
    const sortedOpenDesc = [...openScores].sort((a, b) => b.score - a.score)
    sqlThreshold = percentileScoreDesc(sortedOpenDesc, FALLBACK_SQL_PERCENTILE_OF_OPEN)
    mqlThreshold = percentileScoreDesc(sortedOpenDesc, FALLBACK_MQL_PERCENTILE_OF_OPEN)
  }

  // Guard against a misconfigured pair (mql percentile set above sql percentile).
  if (mqlThreshold > sqlThreshold) {
    [sqlThreshold, mqlThreshold] = [mqlThreshold, sqlThreshold]
  }

  const sql: number[] = []
  const mql: number[] = []
  const nurture: number[] = []

  for (const { index, score } of openScores) {
    if (score >= sqlThreshold) {
      sql.push(index)
    } else if (score >= mqlThreshold) {
      mql.push(index)
    } else {
      nurture.push(index)
    }
  }

  return { converted, sql, mql, nurture, sqlThreshold, mqlThreshold }
}

function percentileScoreDesc(sortedDesc: LeadScore[], percentileOfOpen: number): number {
  const cutoffIndex = Math.floor(sortedDesc.length * (1 - percentileOfOpen))
  const idx = Math.min(cutoffIndex, sortedDesc.length - 1)
  return sortedDesc[idx]?.score ?? 0
}
