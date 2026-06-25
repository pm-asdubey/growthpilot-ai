export interface AIResponse {
  executiveSummary: string
  keyFindings: string[]
  recommendations: string[]
  risks: string[]
  nextActions: string[]
  suggestedQuestions?: string[]
}

export interface QAAnswer {
  answer: string
  followUpQuestions?: string[]
}

export interface AnalyzeAPIResponse {
  success: boolean
  data?: AIResponse | QAAnswer
  error?: string
}
