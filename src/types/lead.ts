// Lead is now flexible — any numeric/boolean column is a valid feature.
// Only `converted` is structurally required (it is the classification target).
export interface Lead {
  converted: boolean
  [featureName: string]: number | boolean
}

// The single required column.
export const CONVERTED_COLUMN = 'converted' as const

// Columns we know about from the original spec. Used for display labels and
// as a hint during validation — but their absence is a warning, not an error.
export const KNOWN_FEATURE_COLUMNS = [
  'employees',
  'trial_users',
  'pricing_page_visits',
  'daily_active_users',
  'invited_teammates',
  'webinar_attended',
  'support_tickets',
  'days_since_signup',
] as const

export const KNOWN_FEATURE_LABELS: Record<string, string> = {
  employees:            'Company Size',
  trial_users:          'Trial Users',
  pricing_page_visits:  'Pricing Page Visits',
  daily_active_users:   'Daily Active Users',
  invited_teammates:    'Invited Teammates',
  webinar_attended:     'Webinar Attended',
  support_tickets:      'Support Tickets',
  days_since_signup:    'Days Since Signup',
}

// All expected columns (including the target) — used for legacy compatibility.
export const REQUIRED_COLUMNS = [...KNOWN_FEATURE_COLUMNS, CONVERTED_COLUMN] as const
