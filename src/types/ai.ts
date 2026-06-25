export interface AIResponse {
  executiveSummary: string
  keyFindings: string[]
  recommendations: string[]
  risks: string[]
  nextActions: string[]
  suggestedQuestions?: string[]
}

export interface AnalyzeAPIResponse {
  success: boolean
  data?: AIResponse | { answer: string }
  error?: string
}
