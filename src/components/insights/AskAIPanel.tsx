import { useState } from 'react'
import { Loader2, Send, Sparkles } from 'lucide-react'
import { SectionCard } from '@/components/common/SectionCard'
import { askQuestion } from '@/services/api/analyzeService'
import type { AIRequestPayload } from '@/types/analysis'

interface QAEntry {
  question: string
  answer: string
}

interface AskAIPanelProps {
  context: AIRequestPayload
  suggestedQuestions?: string[]
}

export function AskAIPanel({ context, suggestedQuestions = [] }: AskAIPanelProps) {
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<QAEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (question: string) => {
    const q = question.trim()
    if (!q || loading) return
    setInput('')
    setError(null)
    setLoading(true)

    const result = await askQuestion(q, context)
    setLoading(false)

    if (result.success && result.data && 'answer' in result.data) {
      setHistory((h) => [...h, { question: q, answer: String((result.data as { answer: unknown }).answer) }])
    } else {
      setError(result.error ?? 'Something went wrong. Please retry.')
    }
  }

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault()
    void submit(input)
  }

  return (
    <SectionCard
      title="Ask AI about your data"
      description="Ask any question about your lead dataset. The AI answers using only your analytics results."
    >
      <div className="space-y-4">
        {/* Suggested questions */}
        {suggestedQuestions.length > 0 && history.length === 0 && (
          <div>
            <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Suggested questions
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => { void submit(q) }}
                  disabled={loading}
                  className="rounded-full border border-border bg-background px-3 py-1.5 text-[12px] text-foreground transition-colors hover:bg-accent hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Q&A history */}
        {history.length > 0 && (
          <div className="space-y-4">
            {history.map((entry, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-start gap-2">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                    Q
                  </span>
                  <p className="text-[13px] font-medium text-foreground">{entry.question}</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/10 text-[10px] font-bold text-success">
                    A
                  </span>
                  <p className="text-[13px] leading-relaxed text-muted-foreground">{entry.answer}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center gap-2 text-[13px] text-muted-foreground" aria-live="polite">
            <Loader2 size={14} className="animate-spin text-primary" aria-hidden="true" />
            Thinking…
          </div>
        )}

        {/* Error */}
        {error && (
          <p role="alert" className="text-[12px] text-error">{error}</p>
        )}

        {/* Input form */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <div className="relative flex-1">
            <Sparkles size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" aria-hidden="true" />
            <input
              type="text"
              value={input}
              onChange={(e) => { setInput(e.target.value) }}
              placeholder="Ask a question about your leads…"
              aria-label="Ask a question about your lead data"
              disabled={loading}
              className="w-full rounded-[10px] border border-border bg-background py-2 pl-8 pr-3 text-[13px] text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || loading}
            aria-label="Submit question"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-primary text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"
          >
            <Send size={14} aria-hidden="true" />
          </button>
        </form>

        <p className="text-[11px] text-muted-foreground/60">
          Answers are generated from your analytics metrics only. No raw data is sent.
        </p>
      </div>
    </SectionCard>
  )
}
