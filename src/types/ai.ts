export interface AIResponse {
  executiveSummary: string
  keyFindings: string[]
  recommendations: string[]
  risks: string[]
  nextActions: string[]
}

export interface AnalyzeAPIResponse {
  success: boolean
  data?: AIResponse
  error?: string
}
