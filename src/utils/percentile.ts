// Linear-interpolation percentile of a value already sorted ascending.
// percentile(scores, 0.25) = the value below which 25% of scores fall.
export function percentile(sortedAsc: number[], p: number): number {
  if (sortedAsc.length === 0) return 0
  if (sortedAsc.length === 1) return sortedAsc[0]

  const fraction = Math.min(1, Math.max(0, p))
  const pos = fraction * (sortedAsc.length - 1)
  const lower = Math.floor(pos)
  const upper = Math.ceil(pos)
  if (upper >= sortedAsc.length) return sortedAsc[sortedAsc.length - 1]

  const weight = pos - lower
  return sortedAsc[lower] + weight * (sortedAsc[upper] - sortedAsc[lower])
}
