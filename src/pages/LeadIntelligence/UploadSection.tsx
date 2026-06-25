import { Download, FileSpreadsheet } from 'lucide-react'
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

const SAMPLE_DATASETS = [
  {
    name: 'Basic Sample',
    description: '1,500 leads · standard 9-column schema (employees, trial activity, webinar attendance, etc.)',
    href: '/samples/sample_leads_basic.csv',
    file: 'sample_leads_basic.csv',
  },
  {
    name: 'Rich Sample',
    description: '3,000 leads · 20 columns including Industry, Region, Lead Source, and ICP/intent scores',
    href: '/samples/sample_leads_rich.csv',
    file: 'sample_leads_rich.csv',
  },
]

interface UploadSectionProps {
  onFileSelected: (file: File) => void
}

export function UploadSection({ onFileSelected }: UploadSectionProps) {
  return (
    <div className="space-y-8">
      <CSVDropzone onFileSelected={onFileSelected} />

      {/* Sample datasets — no CSV of your own needed to try the tool */}
      <div className="rounded-[10px] border border-dashed border-border bg-background p-4">
        <p className="mb-3 text-[13px] font-semibold text-foreground">
          Don&apos;t have a CSV handy? Try a sample dataset
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {SAMPLE_DATASETS.map((sample) => (
            <a
              key={sample.file}
              href={sample.href}
              download={sample.file}
              className="flex items-start gap-3 rounded-[10px] border border-border bg-card p-3 transition-colors hover:border-primary/30 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileSpreadsheet size={16} aria-hidden="true" />
              </span>
              <span className="flex-1">
                <span className="flex items-center gap-1.5 text-[13px] font-medium text-foreground">
                  {sample.name}
                  <Download size={12} className="text-muted-foreground" aria-hidden="true" />
                </span>
                <span className="mt-0.5 block text-[11px] leading-relaxed text-muted-foreground">{sample.description}</span>
              </span>
            </a>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground">
          Download, then drag it into the upload area above.
        </p>
      </div>

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
