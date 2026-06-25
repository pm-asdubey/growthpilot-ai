import { CSVDropzone } from '@/components/upload/CSVDropzone'

const HOW_IT_WORKS = [
  {
    number: '1',
    title: 'Upload & Validate',
    description: 'Drop in your CSV. Required columns, data types, and missing values are checked instantly.',
  },
  {
    number: '2',
    title: 'Analytics Engine',
    description: 'Deterministic algorithms calculate conversion rates, feature importance, and lead scores.',
  },
  {
    number: '3',
    title: 'AI Insights',
    description: 'An executive summary, business recommendations, and risk analysis are generated from your results.',
  },
]

interface UploadSectionProps {
  onFileSelected: (file: File) => void
}

export function UploadSection({ onFileSelected }: UploadSectionProps) {
  return (
    <div className="space-y-8">
      <CSVDropzone onFileSelected={onFileSelected} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {HOW_IT_WORKS.map((step) => (
          <div key={step.title} className="rounded-[10px] border border-border bg-background p-4">
            <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-[13px] font-bold text-primary">
              {step.number}
            </div>
            <p className="text-[13px] font-semibold text-foreground">{step.title}</p>
            <p className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
