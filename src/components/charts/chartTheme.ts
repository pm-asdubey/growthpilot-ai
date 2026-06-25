// Brand colours for Recharts — hex values from UI_UX_GUIDELINES.md.
// Recharts renders SVG so it cannot read CSS variables; hex is required here.
export const CHART_COLOURS = {
  blue:       '#2563EB',
  blueLight:  '#60A5FA',
  green:      '#10B981',
  amber:      '#F59E0B',
  slate:      '#64748B',
  slateDark:  '#334155',
  border:     '#E2E8F0',
  muted:      '#F8FAFC',
  text:       '#0F172A',
  textMuted:  '#64748B',
} as const

// Segment colours — consistent across pie chart and badges.
export const SEGMENT_COLOURS: Record<string, string> = {
  SQL:     CHART_COLOURS.blue,
  MQL:     CHART_COLOURS.amber,
  Nurture: CHART_COLOURS.slate,
}
