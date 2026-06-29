# GrowthPilot AI

> AI-powered Lead Intelligence Platform for Marketing Operations Teams

---

## Overview

GrowthPilot AI is a browser-based analytics platform that transforms historical lead CSV exports into actionable sales intelligence. All statistical analysis runs deterministically on the frontend. AI (NVIDIA NIM) is used exclusively to interpret pre-computed results and generate executive summaries — it never performs calculations and never receives raw customer data.

The MVP delivers the **Lead Intelligence** module in full. Three additional modules are present in the application as Coming Soon. Churn Prediction is shown on the Dashboard roadmap.

---

## What's Built

### Lead Intelligence

**Upload & Validation**
- Drag-and-drop or file picker CSV upload
- Full validation: required columns, data types, duplicate headers, empty files
- Inline field-level error reporting with a live validation checklist

**Analytics Engine — entirely client-side and deterministic**

- **Feature Importance** — min-max normalizes every column across the full dataset before comparing converted vs non-converted lead means. This prevents large-scale features (e.g. `employees`: 5–3,500) from dominating binary signals (e.g. `webinar_attended`: 0/1) purely because of unit scale.
- **Lead Scoring** — every lead scored 0–100 using feature importance as weights.
- **Learned Segment Thresholds** — SQL and MQL cutoffs are derived from where historical converters actually scored, not a fixed percentile. If historical winners clustered above score 60, that becomes the SQL floor for open leads.
- **Score Spread Detection** — when all open leads score identically (no signal in the data), all route to Nurture rather than produce a misleading priority queue.
- **ICP Detection** — identifies the trait ranges (trial users, daily active users, pricing page visits) that historically correlate with the highest conversion rates.
- **Categorical Breakdown** — per-value conversion rates and SQL rates for text columns (Industry, Region, Lead Source, etc.)
- **Feature Buckets** — same analysis across value ranges for numeric columns.
- **KPI Generation** — total leads, converted, conversion rate, average lead score, SQL/MQL/Nurture counts.

**Segment Settings**
- Customizable SQL and MQL percentile thresholds via a settings popover.
- Changes re-classify the full dataset instantly without re-upload.

**AI Executive Summary**
- Structured analytics summary (no raw rows) sent to NVIDIA NIM (`meta/llama-3.1-8b-instruct`).
- Returns: executive summary, key findings, recommendations, risks, next actions, suggested follow-up questions.
- System prompt instructs the model to lead with business insight and pattern recognition — not isolated statistics.
- AI insights cached in localStorage per analysis. NVIDIA is called once per analysis, not on every view.

**Ask AI — Conversational Analysis**
- After the executive summary loads, users ask follow-up questions about their specific dataset.
- Full conversation history sent with each request for coherent multi-turn dialogue.
- AI returns an answer plus 3–4 suggested follow-up question chips.
- Uses the same `/api/analyze` endpoint with `mode: 'question'`.

**Analysis History**
- Every completed analysis is automatically saved to localStorage.
- Dashboard shows history: file name, lead count, conversion rate, SQL/MQL counts, relative timestamp.
- Clicking any history entry reloads the full analysis without re-upload or re-computation.
- AI insights cached per entry — no duplicate API calls on revisit.

**Download**
- Export categorized leads as CSV with SQL/MQL/Nurture classification appended.

### Dashboard

- KPI summary from the latest analysis.
- Clickable recent analysis history.
- Coming Soon module grid: Funnel Analysis, Attribution Analysis, Segmentation, Churn Prediction.

### Coming Soon Pages

Each module has a dedicated page with description and full capability list:
- Funnel Analysis
- Attribution Analysis
- Segmentation
- Churn Prediction (Dashboard grid)

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS + shadcn/ui |
| Charts | Recharts |
| CSV Parsing | PapaParse |
| Backend | Netlify Functions — single function `analyze.ts` |
| AI | NVIDIA NIM — `meta/llama-3.1-8b-instruct` |
| Persistence | localStorage (no database) |
| Deployment | Netlify |

---

## Analytics Engine — Module Map

```
src/services/analytics/

├── validator.ts                    — Column presence, types, encoding, duplicates
├── mapper.ts                       — PapaParse rows → typed Lead[]
├── conversionCalculator.ts         — Conversion rate, converted/open split
├── featureImportanceCalculator.ts  — Min-max normalized mean-diff importance
├── leadScoreCalculator.ts          — Weighted 0–100 score per lead
├── segmentClassifier.ts            — Learned SQL/MQL thresholds + spread detection
├── kpiGenerator.ts                 — KPI set (totals, rates, averages)
├── chartDataGenerator.ts           — Chart-ready data structures for Recharts
├── summaryBuilder.ts               — Builds AIRequestPayload (no raw CSV)
├── categoricalAnalyzer.ts          — Per-value rates for text columns
└── featureBucketAnalyzer.ts        — Range-based rates for numeric columns
```

---

## API

Single Netlify Function: `netlify/functions/analyze.ts`

**Endpoint:** `POST /api/analyze`

**`mode: 'analyze'`** — Generate executive summary. Receives analytics payload. Returns `executiveSummary`, `keyFindings`, `recommendations`, `risks`, `nextActions`, `suggestedQuestions`.

**`mode: 'question'`** — Conversational follow-up. Receives question + context + previous Q&A history. Returns `answer` and `followUpQuestions`.

Both modes never receive raw CSV rows. Timeout: 60 seconds.

---

## Required CSV Columns

| Column | Type |
|---|---|
| `employees` | Number |
| `trial_users` | Number |
| `pricing_page_visits` | Number |
| `daily_active_users` | Number |
| `invited_teammates` | Number |
| `webinar_attended` | 0 or 1 |
| `support_tickets` | Number |
| `days_since_signup` | Number |
| `converted` | 0 or 1 |

Optional columns (company name, industry, region, lead source) are used for categorical breakdown when present. Unknown columns are ignored. Maximum: 10,000 rows / 25 MB.

---

## Project Structure

```
growthpilot-ai/

├── README.md
├── CLAUDE.md
├── DECISIONS.md
├── DATASETS.md
├── PROJECT_CONTEXT.md
├── PROJECT_STATE.md
├── CURRENT_PHASE.md

├── docs/
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── TECHNICAL_DESIGN.md
│   ├── IMPLEMENTATION_PLAN.md
│   └── UI_UX_GUIDELINES.md

├── src/
│   ├── components/
│   │   ├── charts/         — ChartCard, FeatureImportanceChart, LeadScoreHistogram, ConversionTrendChart
│   │   ├── common/         — MetricCard, EmptyState, FormulaTooltip, SegmentBadge, RecentAnalysisCard
│   │   ├── insights/       — AIInsightsPanel, AskAIPanel, ICPProfileCard, TopLeadsTable,
│   │   │                     BreakdownTable, DownloadLeadsButton, SegmentSettingsPopover
│   │   ├── layout/         — AppLayout, Header, Sidebar
│   │   ├── ui/             — shadcn/ui primitives
│   │   └── upload/         — CSVDropzone, ValidationChecklist, ValidationErrorPanel
│   ├── hooks/
│   │   ├── useAnalysis.ts           — Orchestrates full analytics pipeline
│   │   ├── useAIInsights.ts         — Manages AI fetch lifecycle
│   │   ├── useCSVUpload.ts          — Upload, parsing, validation state
│   │   └── usePersistedAnalysis.ts  — localStorage read/write for history
│   ├── pages/
│   │   ├── Dashboard/
│   │   ├── LeadIntelligence/        — Upload → Validation → AnalysisResults
│   │   ├── ComingSoon/
│   │   └── Settings/
│   ├── services/
│   │   ├── analytics/               — All 11 analytics calculators
│   │   └── api/analyzeService.ts    — Netlify function client
│   ├── types/                       — Lead, AnalysisResult, AIResponse, etc.
│   └── utils/                       — percentile.ts, formatting.ts

├── netlify/
│   └── functions/
│       └── analyze.ts               — AI proxy (analyze + question modes)

└── public/
```

---

## Privacy & Security

- No uploaded CSV is stored server-side or transmitted to AI.
- Only structured analytics summaries reach NVIDIA NIM.
- NVIDIA API key lives exclusively in Netlify environment variables.
- No authentication, no database, no persistent server-side state.
- All customer data remains in the browser session only.

---

## Upcoming Modules

| Module | Status |
|---|---|
| Lead Intelligence | ✅ Complete |
| Funnel Analysis | 🚧 Coming Soon |
| Attribution Analysis | 🚧 Coming Soon |
| Segmentation | 🚧 Coming Soon |
| Churn Prediction | 📋 Planned |

---

## License

Portfolio and demonstration application showcasing AI-assisted product development, analytics engineering, and modern frontend architecture. Not affiliated with any commercial marketing automation platform.
