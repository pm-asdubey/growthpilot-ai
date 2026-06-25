// Typed representation of one row from the historical lead CSV.
// Schema defined in DATASETS.md.
export interface Lead {
  employees: number
  trial_users: number
  pricing_page_visits: number
  daily_active_users: number
  invited_teammates: number
  webinar_attended: boolean
  support_tickets: number
  days_since_signup: number
  converted: boolean
}

// Column names exactly as they must appear in the CSV header (case-insensitive match).
export const REQUIRED_COLUMNS = [
  'employees',
  'trial_users',
  'pricing_page_visits',
  'daily_active_users',
  'invited_teammates',
  'webinar_attended',
  'support_tickets',
  'days_since_signup',
  'converted',
] as const

export type RequiredColumn = (typeof REQUIRED_COLUMNS)[number]
