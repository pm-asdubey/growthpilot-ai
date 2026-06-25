# TECHNICAL_DESIGN.md

# GrowthPilot AI — Engineering Blueprint

Version 1.0

---

# 1. High-Level Architecture

## Overview

GrowthPilot AI is a client-heavy single-page application. All business logic and statistical analysis run in the browser. The backend is intentionally minimal — a single serverless function that proxies structured analytics to an AI provider and returns interpreted results.

```
┌─────────────────────────────────────────────────────────────────┐
│                          Browser (React SPA)                     │
│                                                                   │
│  ┌──────────────┐    ┌──────────────┐    ┌───────────────────┐  │
│  │  Presentation │    │   Business   │    │  Analytics Engine  │  │
│  │    Layer      │◄──►│    Layer     │◄──►│   (Pure TS)       │  │
│  │  (Components) │    │  (Hooks)     │    │  (No UI)          │  │
│  └──────────────┘    └──────────────┘    └───────────────────┘  │
│                              │                                    │
│                              │  Summary JSON (no raw CSV)        │
│                              ▼                                    │
│                     ┌──────────────┐                             │
│                     │  API Service  │                             │
│                     └──────────────┘                             │
└──────────────────────────────┬──────────────────────────────────┘
                                │ HTTPS POST /api/analyze
                                ▼
                   ┌─────────────────────────┐
                   │   Netlify Function       │
                   │   netlify/functions/     │
                   │   analyze.ts             │
                   └────────────┬────────────┘
                                │
                                ▼
                   ┌─────────────────────────┐
                   │   NVIDIA Inference API   │
                   │   (LLM)                  │
                   └────────────┬────────────┘
                                │
                                ▼
                   ┌─────────────────────────┐
                   │   AI Response JSON       │
                   │   (Structured Insights)  │
                   └─────────────────────────┘
```

## End-to-End Data Flow

```
User uploads CSV
       │
       ▼
PapaParse → raw string rows
       │
       ▼
DatasetValidator → ValidationResult (pass/fail + error list)
       │ (fail → stop, show errors)
       ▼
CSV Mapper → Lead[] (typed objects)
       │
       ▼
Analytics Engine
  ├── ConversionCalculator   → conversionRate, convertedLeads
  ├── FeatureImportanceCalc  → FeatureImportance[]
  ├── LeadScoreCalculator    → LeadScore[]
  ├── SegmentClassifier      → sql[], mql[], nurture[]
  ├── KPIGenerator           → KPISet
  └── ChartDataGenerator     → ChartDataSet
       │
       ▼
SummaryBuilder → AIRequestPayload (no raw CSV)
       │
       ▼
analyzeService.post() → Netlify Function → NVIDIA API
       │
       ▼
AIResponse → ExecutiveSummaryPanel, RecommendationsPanel
       │
       ▼
Full Dashboard rendered
```

---

# 2. Folder Structure

Only folders expected to exist during the MVP are listed. No placeholder directories.

```
growthpilot-ai/
│
├── netlify/
│   └── functions/
│       └── analyze.ts          # Single serverless function. Receives summary JSON, calls NVIDIA, returns AI response.
│
├── docs/                       # All project documentation. Never imported by src/.
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── IMPLEMENTATION_PLAN.md
│   ├── UI_UX_GUIDELINES.md
│   └── TECHNICAL_DESIGN.md
│
├── public/                     # Static assets served as-is by Vite.
│   └── favicon.ico
│
├── src/
│   │
│   ├── assets/                 # Images, SVGs, fonts not served from public/.
│   │
│   ├── components/             # Reusable UI components. No page-specific logic.
│   │   ├── common/             # Shared across all pages: Button, Badge, Card, LoadingSpinner, EmptyState, etc.
│   │   ├── layout/             # Structural components: Sidebar, TopBar, PageWrapper.
│   │   ├── charts/             # All Recharts wrappers: FeatureImportanceChart, LeadScoreHistogram, etc.
│   │   ├── upload/             # CSV upload flow: CSVDropzone, ValidationChecklist, UploadProgress.
│   │   └── insights/           # AI output display: ExecutiveSummaryCard, RecommendationsList, RisksList.
│   │
│   ├── hooks/                  # Custom React hooks. Each hook has a single responsibility.
│   │   ├── useCSVUpload.ts     # Manages file selection, parsing, and validation state.
│   │   ├── useAnalysis.ts      # Orchestrates the full analytics pipeline.
│   │   └── useAIInsights.ts    # Manages the API call lifecycle to the Netlify function.
│   │
│   ├── pages/                  # One folder per page/route. Each page composes components.
│   │   ├── Dashboard/          # Landing page with KPI overview and recent analyses.
│   │   └── LeadIntelligence/   # Main analysis page: upload → results → insights.
│   │
│   ├── services/               # Pure logic with no React dependencies.
│   │   ├── analytics/          # The analytics engine. All deterministic calculations.
│   │   │   ├── validator.ts
│   │   │   ├── mapper.ts
│   │   │   ├── conversionCalculator.ts
│   │   │   ├── featureImportanceCalculator.ts
│   │   │   ├── leadScoreCalculator.ts
│   │   │   ├── segmentClassifier.ts
│   │   │   ├── kpiGenerator.ts
│   │   │   ├── chartDataGenerator.ts
│   │   │   └── summaryBuilder.ts
│   │   └── api/
│   │       └── analyzeService.ts   # HTTP client for the Netlify function.
│   │
│   ├── types/                  # All TypeScript interfaces and enums. No logic.
│   │   ├── lead.ts
│   │   ├── analysis.ts
│   │   ├── ai.ts
│   │   ├── chart.ts
│   │   └── validation.ts
│   │
│   ├── utils/                  # Stateless helper functions used across the app.
│   │   ├── formatting.ts       # Number, percentage, currency formatters.
│   │   └── cn.ts               # Tailwind class merging utility (from shadcn/ui).
│   │
│   ├── App.tsx                 # Root component. Defines routes.
│   └── main.tsx                # Entry point. Mounts React app.
│
├── .env.example                # Documents required environment variables. Never committed with real values.
├── .gitignore
├── index.html
├── netlify.toml                # Build config, dev proxy, function directory.
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

### Folder Rationale

- `components/` is split by domain concern (charts, upload, insights) rather than by atomic/molecule/organism. This is simpler for a single-module MVP and easier to navigate.
- `services/analytics/` contains one file per calculator. Files stay small and independently testable.
- `types/` is a dedicated layer with zero business logic. All interfaces live here and are imported from here.
- `pages/` never imports from other pages. Pages compose components and call hooks.
- `utils/` contains only pure functions — no React, no state.

---

# 3. React Component Tree

```
App
└── BrowserRouter
    └── Layout
        ├── Sidebar
        │   ├── SidebarNavItem (Dashboard)
        │   ├── SidebarNavItem (Lead Intelligence) [active]
        │   ├── SidebarDivider
        │   └── SidebarComingSoonItem × 3 (Funnel, Attribution, Segmentation)
        │
        ├── TopBar
        │   ├── ProductName
        │   ├── SearchInput (placeholder)
        │   ├── ThemeToggle
        │   └── UserAvatar (placeholder)
        │
        └── PageWrapper (main content area)
            │
            ├── <Route path="/">         → DashboardPage
            │   ├── WelcomeBanner
            │   ├── KPICardGrid
            │   │   └── KPICard × 4
            │   ├── RecentAnalysesSection
            │   │   └── EmptyState (no analyses yet)
            │   └── ComingSoonModulesGrid
            │       └── ComingSoonCard × 4
            │
            └── <Route path="/lead-intelligence"> → LeadIntelligencePage
                │
                ├── [State: idle]
                │   └── CSVUploadSection
                │       ├── CSVDropzone
                │       └── UploadInstructions
                │
                ├── [State: validating]
                │   └── ValidationChecklist
                │       └── ValidationCheckItem × N
                │
                ├── [State: validation_failed]
                │   └── ValidationErrorPanel
                │       └── ValidationErrorItem × N
                │
                └── [State: analysis_complete]
                    ├── AnalysisSummaryHeader
                    │   ├── DatasetMetaBadge
                    │   └── ResetButton
                    │
                    ├── KPICardGrid
                    │   └── KPICard × 4
                    │
                    ├── ChartsSection
                    │   ├── FeatureImportanceChart
                    │   ├── LeadScoreHistogram
                    │   ├── SQLMQLPieChart
                    │   └── ConversionLineChart
                    │
                    ├── LeadSegmentTable
                    │
                    └── AIInsightsSection
                        ├── [State: loading] → AIInsightsSkeleton
                        ├── [State: error]   → AIInsightsError
                        └── [State: ready]
                            ├── ExecutiveSummaryCard
                            ├── KeyFindingsList
                            ├── RecommendationsList
                            ├── RisksList
                            └── NextActionsList
```

---

# 4. Pages

## 4.1 DashboardPage

**Route:** `/`

**Purpose:** Product landing screen. Orients new users and surfaces the platform's value and scope.

**Responsibilities:**
- Render a welcome banner with product name and a brief description.
- Display four KPI cards. In the MVP these are static placeholders (no stored analysis history).
- Show a "Recent Analyses" section. Since the MVP has no persistence, this always renders an EmptyState with a call-to-action directing users to Lead Intelligence.
- Show a Coming Soon grid advertising future modules (Funnel, Attribution, Segmentation, Churn Prediction).

**Components used:** `WelcomeBanner`, `KPICard`, `EmptyState`, `ComingSoonCard`

**State:** None. This page is entirely presentational in the MVP.

**Future extensibility:** When localStorage or a backend is added, recent analyses can be fetched and listed here. KPIs can be aggregated across all past runs.

---

## 4.2 LeadIntelligencePage

**Route:** `/lead-intelligence`

**Purpose:** The core product experience. Users upload a CSV, receive a full analytical breakdown, and read AI-generated business insights.

**Responsibilities:**
- Manage the upload-to-analysis workflow through a defined set of UI states: `idle`, `validating`, `validation_failed`, `analyzing`, `analysis_complete`, `ai_loading`, `ai_ready`, `ai_failed`.
- Delegate upload/validation state to `useCSVUpload`.
- Delegate analytics orchestration to `useAnalysis`.
- Delegate AI request lifecycle to `useAIInsights`.
- Never perform calculations directly — consume results from hooks.
- Handle every failure scenario gracefully with user-friendly messages.

**Components used:** `CSVDropzone`, `ValidationChecklist`, `ValidationErrorPanel`, `KPICard`, `FeatureImportanceChart`, `LeadScoreHistogram`, `SQLMQLPieChart`, `ConversionLineChart`, `LeadSegmentTable`, `ExecutiveSummaryCard`, `KeyFindingsList`, `RecommendationsList`, `RisksList`, `NextActionsList`

**State:** Controlled by its three hooks. Page itself holds only the current `WorkflowState` enum value to drive conditional rendering.

**Future extensibility:** Additional analytics modules follow the exact same page structure. Only the hooks and chart components change. The upload → validate → analyze → visualize → AI insight flow is the reusable template.

---

# 5. Component Responsibilities

## 5.1 Layout/Sidebar

**Purpose:** Fixed left-side navigation present on all pages.

**Props:** `currentPath: string`

**Renders:** Navigation items. Active item is derived from `currentPath`. Coming Soon items are visually distinct and non-interactive.

**State:** None. Stateless component driven by props.

**Events:** `onNavigate(path: string)` delegated to React Router's `useNavigate`.

---

## 5.2 Layout/TopBar

**Purpose:** Fixed top bar with product identity and global UI controls.

**Props:** None in MVP (all content is static or derived from global context).

**Renders:** Product name, search input (disabled placeholder), theme toggle, user avatar placeholder.

**State:** `isDarkMode` toggled locally. If dark mode needs to persist or be shared, elevate to context.

---

## 5.3 common/KPICard

**Purpose:** Displays a single business metric.

**Props:**
```
title: string
value: string | number
trend?: { direction: 'up' | 'down' | 'neutral'; label: string }
icon?: LucideIcon
isLoading?: boolean
```

**State:** None.

**Rendering:** When `isLoading` is true, renders a skeleton. When `trend` is provided, renders directional indicator with colour coding (green for up, red for down).

**Reused in:** DashboardPage (placeholders), LeadIntelligencePage (live metrics).

---

## 5.4 common/EmptyState

**Purpose:** Consistent placeholder for sections with no data.

**Props:**
```
title: string
description: string
action?: { label: string; onClick: () => void }
```

**State:** None.

---

## 5.5 common/ComingSoonCard

**Purpose:** Communicates future module availability. Polished but non-interactive.

**Props:**
```
moduleName: string
description: string
```

**State:** None. No click events.

---

## 5.6 upload/CSVDropzone

**Purpose:** File selection via drag-and-drop or browse button.

**Props:**
```
onFileSelected: (file: File) => void
isDisabled?: boolean
```

**State:** `isDragging: boolean` (local — controls drag-over visual).

**Events:** `onFileSelected` fires with the raw `File` object. No parsing occurs here. Parsing is the hook's responsibility.

**Constraints:** Accepts only `.csv` files. Enforced via the `accept` attribute and a file-type check before calling `onFileSelected`.

---

## 5.7 upload/ValidationChecklist

**Purpose:** Shows per-rule validation status during and after validation.

**Props:**
```
checks: ValidationCheck[]
```

Where `ValidationCheck` is:
```
{ label: string; status: 'pending' | 'pass' | 'fail'; message?: string }
```

**State:** None. Purely driven by props.

---

## 5.8 charts/FeatureImportanceChart

**Purpose:** Horizontal bar chart showing feature importance scores.

**Props:**
```
data: FeatureImportanceChartData[]
isLoading?: boolean
```

**State:** None.

**Chart library:** Recharts `BarChart` (horizontal). Uses brand blue (`#2563EB`).

---

## 5.9 charts/LeadScoreHistogram

**Purpose:** Histogram showing distribution of lead scores across 10-point buckets.

**Props:**
```
data: LeadScoreHistogramData[]
isLoading?: boolean
```

**State:** None.

**Chart library:** Recharts `BarChart`. Buckets are: 0-10, 10-20, ..., 90-100.

---

## 5.10 charts/SQLMQLPieChart

**Purpose:** Pie chart showing proportion of SQL, MQL, and Nurture leads.

**Props:**
```
data: SegmentDistributionData[]
isLoading?: boolean
```

**State:** None.

**Chart library:** Recharts `PieChart`. Three segments: SQL (blue), MQL (amber), Nurture (slate).

---

## 5.11 charts/ConversionLineChart

**Purpose:** Shows converted vs. non-converted lead counts by a groupable dimension. In MVP, groups by `days_since_signup` in 30-day buckets.

**Props:**
```
data: ConversionTrendData[]
isLoading?: boolean
```

**State:** None.

---

## 5.12 insights/ExecutiveSummaryCard

**Purpose:** Displays the AI-generated executive summary as a formatted prose block.

**Props:**
```
summary: string
```

**State:** None. Never renders raw markdown — renders sanitised plain text.

---

## 5.13 insights/RecommendationsList / RisksList / NextActionsList

These three components share an identical shape.

**Props:**
```
items: string[]
isLoading?: boolean
```

**State:** None. Each item renders in a styled list with an appropriate icon.

---

# 6. Hooks

## 6.1 useCSVUpload

**Purpose:** Manages the entire file selection → parsing → validation lifecycle.

**Returns:**
```
{
  handleFileSelected: (file: File) => void
  validationResult: ValidationResult | null
  parsedLeads: Lead[] | null
  uploadState: 'idle' | 'parsing' | 'validating' | 'done' | 'error'
  reset: () => void
}
```

**Internal behaviour:**
1. Receives a `File` from `CSVDropzone`.
2. Calls PapaParse to parse the file asynchronously.
3. Passes parsed rows to `DatasetValidator`.
4. If validation passes, maps rows to `Lead[]` via `csvMapper`.
5. If validation fails, sets `validationResult` with the list of errors.

**Dependencies:** `services/analytics/validator.ts`, `services/analytics/mapper.ts`, `papaparse`

**State kept here because:** Upload state is only needed in `LeadIntelligencePage`. No other page requires it.

---

## 6.2 useAnalysis

**Purpose:** Runs the full analytics pipeline on a validated `Lead[]` array.

**Inputs:**
```
leads: Lead[] | null
```

**Returns:**
```
{
  analysisResult: AnalysisResult | null
  analysisState: 'idle' | 'running' | 'done' | 'error'
  error: string | null
}
```

**Internal behaviour:**
1. Watches for `leads` to become non-null.
2. Runs the analytics pipeline synchronously (for datasets under 10,000 rows this is fast enough to not require a Web Worker in the MVP).
3. Returns the complete `AnalysisResult`.

**Performance note:** If user testing reveals performance problems at scale, wrap the pipeline call in `useMemo` keyed on `leads`. If that is still insufficient, move to a Web Worker. Do not optimise prematurely.

**Dependencies:** All calculator modules in `services/analytics/`.

---

## 6.3 useAIInsights

**Purpose:** Manages the HTTP request to the Netlify function.

**Inputs:**
```
payload: AIRequestPayload | null
```

**Returns:**
```
{
  insights: AIResponse | null
  insightState: 'idle' | 'loading' | 'done' | 'error'
  error: string | null
  retry: () => void
}
```

**Internal behaviour:**
1. Watches for `payload` to become non-null.
2. Calls `analyzeService.post(payload)`.
3. Handles timeout (15 seconds), network failure, and malformed responses as distinct error states.
4. Exposes a `retry` function for the user to re-request insights without re-uploading the CSV.

**Important:** If the AI call fails, the analytics dashboard remains fully functional. Only the insights panel shows an error state. This must not degrade the analytics experience.

**Dependencies:** `services/api/analyzeService.ts`

---

# 7. Analytics Engine Design

The analytics engine lives entirely in `src/services/analytics/`. Every module is a pure TypeScript function. No React. No side effects. All functions are deterministic — the same input always produces the same output.

---

## 7.1 DatasetValidator

**File:** `validator.ts`

**Input:** Raw parsed rows from PapaParse (`Record<string, string>[]`) and the list of headers.

**Output:** `ValidationResult`
```
{
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}
```

**Checks performed (in order):**
1. File is not empty (at least one data row).
2. All required columns are present (case-insensitive match).
3. No duplicate header names.
4. Numeric columns contain only numeric values (empty cells in numeric columns are flagged as errors).
5. `converted` column contains only `0`, `1`, `"0"`, `"1"`, `"true"`, or `"false"`.

**Behaviour:** Collects all errors before returning. Does not stop at the first failure, so the user sees the complete list of issues at once.

---

## 7.2 CSV Mapper

**File:** `mapper.ts`

**Input:** Validated raw rows (`Record<string, string>[]`)

**Output:** `Lead[]`

**Responsibility:** Converts string values from PapaParse into the typed `Lead` interface. Coerces numeric strings to numbers, boolean strings to booleans. This runs only after validation has passed.

**Contract:** `mapper.ts` must never be called if `ValidationResult.isValid` is false.

---

## 7.3 ConversionCalculator

**File:** `conversionCalculator.ts`

**Input:** `Lead[]`

**Output:**
```
{
  totalLeads: number
  convertedLeads: number
  nonConvertedLeads: number
  conversionRate: number          // Percentage, 2 decimal places
  conversionByDaysBucket: ConversionTrendData[]
}
```

**Method:**
- `conversionRate = (convertedLeads / totalLeads) * 100`
- For the trend chart, group leads into 30-day `days_since_signup` buckets and calculate the conversion rate within each bucket.

---

## 7.4 FeatureImportanceCalculator

**File:** `featureImportanceCalculator.ts`

**Input:** `Lead[]`

**Output:** `FeatureImportance[]` sorted by `importance` descending.

**Method (Point-Biserial Correlation):**

For each numeric feature column (all except `converted`):
1. Calculate the mean value of the feature among converted leads.
2. Calculate the mean value among non-converted leads.
3. The "importance" score is the absolute difference in means, normalised across all features so that all scores sum to 1.0.

This is a simple, explainable, and reproducible proxy for feature importance — appropriate for an MVP. It avoids the complexity of mutual information or decision trees without sacrificing interpretability.

**Output contract:**
```
[
  { feature: 'pricing_page_visits', importance: 42, normalizedWeight: 0.42 },
  ...
]
```

`importance` is a rounded integer percentage (0–100). `normalizedWeight` is the raw 0–1 float.

---

## 7.5 LeadScoreCalculator

**File:** `leadScoreCalculator.ts`

**Input:** `Lead[]`, `FeatureImportance[]`

**Output:** `LeadScore[]`

**Method:**
1. For each lead, compute a weighted sum of its feature values, using `normalizedWeight` from the feature importance output as the weight.
2. Feature values are normalised to 0–1 before weighting (min-max normalisation across the dataset).
3. The weighted sum is scaled to 0–100 and rounded to the nearest integer.

**Output contract:**
```
[
  { index: 0, score: 86 },
  { index: 1, score: 43 },
  ...
]
```

`index` corresponds to the original row position in `Lead[]`, allowing the segment classifier to reference the original lead.

---

## 7.6 SegmentClassifier

**File:** `segmentClassifier.ts`

**Input:** `LeadScore[]`

**Output:**
```
{
  sql: number[]       // indices of SQL leads (top 15%)
  mql: number[]       // indices of MQL leads (next 15%)
  nurture: number[]   // indices of remaining leads
  sqlThreshold: number
  mqlThreshold: number
}
```

**Method:**
- Sort scores descending.
- SQL threshold: score at the 85th percentile.
- MQL threshold: score at the 70th percentile.
- Assign each lead to a segment based on whether its score meets the threshold.

---

## 7.7 KPIGenerator

**File:** `kpiGenerator.ts`

**Input:** `Lead[]`, `ConversionResult`, `SegmentResult`, `LeadScore[]`

**Output:** `KPISet`
```
{
  totalLeads: number
  convertedLeads: number
  conversionRate: number
  averageLeadScore: number
  sqlCount: number
  mqlCount: number
}
```

**Method:** Aggregates outputs from the other calculators into a flat KPI object. No new calculations — only assembly.

---

## 7.8 ChartDataGenerator

**File:** `chartDataGenerator.ts`

**Input:** `Lead[]`, `FeatureImportance[]`, `LeadScore[]`, `SegmentResult`, `ConversionResult`

**Output:** `ChartDataSet`
```
{
  featureImportance: FeatureImportanceChartData[]
  leadScoreHistogram: LeadScoreHistogramData[]
  segmentDistribution: SegmentDistributionData[]
  conversionTrend: ConversionTrendData[]
}
```

**Method:**
- Feature importance chart: map `FeatureImportance[]` directly to `{ feature, value }`.
- Lead score histogram: bucket scores into ten 10-point ranges, count occurrences per bucket.
- Segment distribution: count SQL, MQL, Nurture.
- Conversion trend: use `conversionByDaysBucket` from `ConversionCalculator`.

---

## 7.9 SummaryBuilder

**File:** `summaryBuilder.ts`

**Input:** `KPISet`, `FeatureImportance[]`, `SegmentResult`

**Output:** `AIRequestPayload`

**Responsibility:** Assembles the minimal structured JSON that the Netlify function needs. Explicitly excludes any data that could constitute raw customer information (names, emails, company names). Includes only aggregate statistics and top predictors.

---

# 8. TypeScript Models

All interfaces live in `src/types/`. They are the single source of truth for data shapes across the entire application.

---

## `types/lead.ts`

```typescript
interface Lead {
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
```

---

## `types/validation.ts`

```typescript
type ValidationErrorCode =
  | 'EMPTY_FILE'
  | 'MISSING_COLUMN'
  | 'DUPLICATE_COLUMN'
  | 'INVALID_TYPE'
  | 'INVALID_BOOLEAN'

interface ValidationError {
  code: ValidationErrorCode
  message: string             // Human-readable, shown directly to user
  column?: string             // Which column triggered the error
}

interface ValidationWarning {
  message: string
  column?: string
}

interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
  rowCount: number
}

// Used by ValidationChecklist component
interface ValidationCheck {
  label: string
  status: 'pending' | 'pass' | 'fail'
  message?: string
}
```

---

## `types/analysis.ts`

```typescript
interface FeatureImportance {
  feature: string
  importance: number          // Integer 0-100
  normalizedWeight: number    // Float 0-1
}

interface LeadScore {
  index: number               // Row index in original Lead[]
  score: number               // Integer 0-100
}

interface SegmentResult {
  sql: number[]               // Indices
  mql: number[]
  nurture: number[]
  sqlThreshold: number
  mqlThreshold: number
}

interface ConversionResult {
  totalLeads: number
  convertedLeads: number
  nonConvertedLeads: number
  conversionRate: number
  conversionByDaysBucket: ConversionTrendData[]
}

interface KPISet {
  totalLeads: number
  convertedLeads: number
  conversionRate: number
  averageLeadScore: number
  sqlCount: number
  mqlCount: number
}

interface ChartDataSet {
  featureImportance: FeatureImportanceChartData[]
  leadScoreHistogram: LeadScoreHistogramData[]
  segmentDistribution: SegmentDistributionData[]
  conversionTrend: ConversionTrendData[]
}

interface AnalysisResult {
  dataset: { rows: number; columns: string[] }
  kpis: KPISet
  featureImportance: FeatureImportance[]
  leadScores: LeadScore[]
  segments: SegmentResult
  charts: ChartDataSet
  summary: AIRequestPayload   // Pre-built payload, ready to send
}
```

---

## `types/chart.ts`

```typescript
interface FeatureImportanceChartData {
  feature: string
  value: number               // normalizedWeight * 100
}

interface LeadScoreHistogramData {
  bucket: string              // e.g. "80-90"
  count: number
}

interface SegmentDistributionData {
  label: 'SQL' | 'MQL' | 'Nurture'
  count: number
}

interface ConversionTrendData {
  bucket: string              // e.g. "0-30 days"
  converted: number
  notConverted: number
}
```

---

## `types/ai.ts`

```typescript
interface AIRequestPayload {
  dataset: {
    rows: number
    conversionRate: number
  }
  kpis: {
    sqlCount: number
    mqlCount: number
    averageLeadScore: number
  }
  topPredictors: string[]     // Top 3-5 feature names by importance
}

interface AIResponse {
  executiveSummary: string
  keyFindings: string[]
  recommendations: string[]
  risks: string[]
  nextActions: string[]
}

// Wraps the HTTP response from the Netlify function
interface AnalyzeAPIResponse {
  success: boolean
  data?: AIResponse
  error?: string
}
```

---

# 9. API Layer

## Netlify Function: `analyze.ts`

**Endpoint:** `POST /api/analyze`

(In development, `netlify dev` proxies this via `netlify.toml`.)

**Request body:** `AIRequestPayload` (see types above)

**Success response (200):**
```json
{
  "success": true,
  "data": {
    "executiveSummary": "...",
    "keyFindings": ["..."],
    "recommendations": ["..."],
    "risks": ["..."],
    "nextActions": ["..."]
  }
}
```

**Error response:**
```json
{
  "success": false,
  "error": "AI service unavailable. Please retry."
}
```

**Function responsibilities:**
1. Validate the request body has the required fields.
2. Construct the system prompt and user message.
3. Call NVIDIA API with a 12-second timeout.
4. Parse and validate the AI response structure.
5. Return a normalised `AnalyzeAPIResponse`.

**The function must NOT:**
- Accept or process raw CSV data.
- Perform any calculations.
- Store any data.
- Expose the NVIDIA API key in any response.

---

## Client: `services/api/analyzeService.ts`

**Timeout:** 15 seconds (3-second buffer above the function's 12-second timeout).

**Retry behaviour (MVP):** No automatic retry. The `useAIInsights` hook exposes a manual `retry()` function. Automatic retry is deferred to avoid overwhelming the user or the AI provider.

**Error classification:**

| Scenario | Error type | User message |
|---|---|---|
| Network failure | `NETWORK_ERROR` | "Could not reach the analysis service. Check your connection." |
| Timeout | `TIMEOUT` | "The AI service took too long to respond. Please retry." |
| HTTP 500 from function | `SERVER_ERROR` | "The AI service encountered an error. Please retry." |
| Malformed response | `PARSE_ERROR` | "Received an unexpected response. Please retry." |

**Future extensibility:** The function signature is generic enough to support additional analysis types. A `type` field can be added to the request payload to route to different AI prompts without changing the endpoint.

---

# 10. State Management

## Principles

Keep state as local as possible. Elevate only when two or more components genuinely need the same value.

## State Map

| State | Location | Rationale |
|---|---|---|
| Upload file selection | `useCSVUpload` hook | Only used in `LeadIntelligencePage` |
| Validation result | `useCSVUpload` hook | Consumed only by the upload section |
| Parsed leads | `useCSVUpload` hook | Passed down to `useAnalysis` |
| Analysis result | `useAnalysis` hook | Consumed only in `LeadIntelligencePage` |
| AI insights | `useAIInsights` hook | Consumed only in `LeadIntelligencePage` |
| Dark mode | TopBar component or React Context | See note below |
| Current route | React Router | Managed by the library |

## When to Introduce React Context

Context should be introduced only in these situations:

1. **Theme (dark mode):** If theme needs to affect deeply nested components (e.g., chart colours), introduce a `ThemeContext`. Otherwise, keep it local to `TopBar` and use Tailwind's `dark:` variant with a class on `<html>`.
2. **Analysis result sharing (future):** If the Dashboard ever needs to display results from a prior analysis, introduce an `AnalysisContext`. Do not introduce this for the MVP.

## Derived State

Avoid storing values that can be derived. Examples:

- `sqlCount` is derived from `segments.sql.length` — do not store it separately.
- `isAnalysisReady` is derived from `analysisResult !== null` — do not add a separate boolean.

---

# 11. Error Handling Strategy

## Error Categories

### 11.1 Invalid File Type

**Detection:** File extension check in `CSVDropzone` before calling `onFileSelected`.

**Display:** Inline error below the dropzone: "Only .csv files are accepted."

**Recovery:** User selects a different file.

---

### 11.2 Empty CSV

**Detection:** `DatasetValidator` — row count is zero.

**Display:** `ValidationErrorPanel` with error: "Uploaded file contains no records."

**Recovery:** User uploads a different file. Reset button clears the state.

---

### 11.3 Missing Required Columns

**Detection:** `DatasetValidator` — header comparison.

**Display:** `ValidationChecklist` shows which checks failed. Error message names the missing column(s): "Required column: pricing_page_visits was not found."

**Recovery:** User corrects their CSV and re-uploads.

---

### 11.4 Duplicate Headers

**Detection:** `DatasetValidator` — header uniqueness check.

**Display:** "Duplicate column detected: employees"

**Recovery:** User fixes and re-uploads.

---

### 11.5 Invalid Data Types

**Detection:** `DatasetValidator` — per-cell type checks on required numeric columns.

**Display:** "daily_active_users must contain numeric values."

**Recovery:** User fixes and re-uploads.

---

### 11.6 Invalid `converted` Values

**Detection:** `DatasetValidator` — checks that all values are 0, 1, "true", or "false".

**Display:** "converted must contain only 0 or 1 values."

**Recovery:** User fixes and re-uploads.

---

### 11.7 Malformed CSV (Unparseable)

**Detection:** PapaParse returns errors in its callback.

**Display:** "This file could not be read as a CSV. Ensure the file is not corrupted."

**Recovery:** User re-uploads a valid CSV.

---

### 11.8 Dataset Too Large

**Detection:** File size check before parsing (> 25 MB) and row count check after parsing (> 10,000 rows).

**Display:** "Your dataset exceeds the maximum size (10,000 rows / 25 MB). Please upload a smaller file."

**Recovery:** User reduces dataset size and re-uploads.

---

### 11.9 Analytics Engine Failure (Unexpected)

**Detection:** Try/catch around the analytics pipeline in `useAnalysis`.

**Display:** "An unexpected error occurred while analysing your dataset. Please try again."

**Recovery:** Reset button allows re-upload. Error is logged to `console.error` for debugging.

---

### 11.10 AI Network Failure

**Detection:** `fetch` throws in `analyzeService.ts`.

**Display:** AI Insights panel shows: "Could not reach the analysis service. Check your connection." with a Retry button.

**Recovery:** Manual retry via `useAIInsights.retry()`. Analytics remain fully visible.

---

### 11.11 AI Timeout

**Detection:** `AbortController` with 15-second timeout in `analyzeService.ts`.

**Display:** "The AI service took too long to respond. Please retry."

**Recovery:** Manual retry.

---

### 11.12 AI Returns Malformed Response

**Detection:** Response JSON does not match `AIResponse` shape.

**Display:** "Received an unexpected response from the AI service. Please retry."

**Recovery:** Manual retry.

---

### 11.13 Netlify Function Returns 500

**Detection:** HTTP status check in `analyzeService.ts`.

**Display:** "The AI service encountered an error. Please retry."

**Recovery:** Manual retry.

---

# 12. Performance Strategy

## Dataset Processing

- **Target:** Analyse datasets of up to 10,000 rows in under 2 seconds on a mid-range laptop.
- **Approach:** All analytics run synchronously on the main thread in the MVP. At 10,000 rows, the calculations are simple enough (no matrix operations, no recursion) that a Web Worker is not needed initially.
- **Future:** If profiling reveals a blocking issue at scale, the analytics pipeline is already fully decoupled from React — moving it to a Web Worker requires only wrapping `useAnalysis` with `Comlink` or a `postMessage` bridge.

## Memoization

- The `AnalysisResult` in `useAnalysis` must be memoized (`useMemo` or ref-based) so that it is only recomputed when `leads` changes, not on every render of the parent component.
- Chart data objects should not be recreated on every render. Chart components receive stable props.
- Avoid inline object or array creation in JSX props (`<Chart data={[...]} />`). Derive chart data once in the hook, not in the render.

## Rendering

- Charts use Recharts' built-in animation (300ms ease-out). No additional animation libraries.
- The `LeadSegmentTable` is the only potentially long list in the MVP (up to 10,000 rows). Implement pagination (50 rows per page) rather than virtualisation in the MVP. Virtualisation (react-window) can be added later if needed.
- Conditional rendering is preferred over CSS `display: none` for large sections that may not be shown. Avoids mounting and computing invisible subtrees.

## Bundle

- PapaParse is lazy-loaded: import inside the hook, not at the module top level.
- Recharts is large. It can be split into a separate chunk by importing chart components lazily with `React.lazy` and `Suspense` once the application is working.
- shadcn/ui components are tree-shaken by default. Only import components that are used.

---

# 13. Security

## API Keys

- The NVIDIA API key is stored only in a Netlify environment variable (`NVIDIA_API_KEY`).
- It is never exposed to the browser. The key is accessed only inside `netlify/functions/analyze.ts`.
- During local development, the key is stored in `.env.local`, which is listed in `.gitignore`.
- `.env.example` documents the variable name without the real value.

## Data Privacy

- No uploaded CSV data is stored anywhere. PapaParse processes the file in memory. Once the page is closed or reset, all data is lost.
- The Netlify function receives only aggregated statistics (KPISet, top predictors). Raw lead records, company names, emails, and other PII never leave the browser.
- The AI prompt must not include any values that could identify individual companies or people.

## Browser Security

- The application does not make any cross-origin requests from the frontend except to `/api/analyze` (which is same-origin on Netlify).
- No external scripts or iframes are loaded at runtime.
- `dangerouslySetInnerHTML` must not be used. AI-generated text is rendered as plain text only.

## Future Authentication

When multi-user workspaces are introduced:
- Authentication should be handled at the Netlify Function level (JWT validation before processing).
- The SPA should use an auth provider (e.g., Clerk, Auth0) that issues short-lived tokens.
- No authentication logic should be mixed into the analytics services.

---

# 14. Accessibility

## Keyboard Navigation

- Every interactive element (buttons, inputs, dropzone, navigation items) must be reachable via Tab.
- The dropzone must be activatable via Space and Enter when focused.
- Modals and overlays must trap focus while open and restore focus on close.
- The sidebar navigation must support arrow-key traversal.

## ARIA

- `CSVDropzone` must have `role="button"` and `aria-label="Upload CSV file"`.
- `ValidationChecklist` items use `role="list"` and `role="listitem"`.
- KPI cards use `aria-label` that includes both the title and value (e.g. "Total Leads: 1,200").
- Charts use `role="img"` with descriptive `aria-label` values.
- Loading spinners use `aria-live="polite"` and `aria-label="Loading"`.

## Focus Management

- After a file is selected and validation completes, focus moves to the validation result section.
- After analysis completes, focus moves to the KPI section.
- Error messages are announced via an `aria-live` region.

## Colour Contrast

- All text must meet WCAG AA (4.5:1 for normal text, 3:1 for large text).
- The primary blue (`#2563EB`) on white meets AA.
- Status colours (success green `#10B981`, error red `#EF4444`) must not be the only indicator — pair colour with an icon or text label.

## Responsive Behaviour

- Interactive elements must have a minimum touch target of 44×44px.
- On mobile, the sidebar collapses to a drawer accessible via a hamburger button.
- Charts reflow to full-width single-column layout on screens below 768px.

---

# 15. Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| NVIDIA API latency degrades user experience | Medium | Medium | 15-second client timeout; show skeleton immediately; manual retry; analytics remain usable without AI. |
| NVIDIA API response format changes | Low | High | Parse and validate the AI response shape before returning it from the function. Define an explicit `AIResponse` interface. Fail gracefully rather than crash. |
| PapaParse handles edge-case CSVs unexpectedly | Medium | Medium | Always wrap PapaParse calls in try/catch. Run validation after parsing, not inside it. Test with malformed files during Phase 3. |
| Feature importance algorithm produces counterintuitive results | Medium | Low | The mean-difference approach is simple and explainable. Document the method clearly in the UI ("How is this calculated?"). The MVP does not claim statistical rigour. |
| Large CSV files (near 25 MB) cause browser memory pressure | Low | Medium | Enforce the 25 MB file size limit before parsing. PapaParse streams large files; do not load the full dataset into state beyond what is needed for analysis. |
| shadcn/ui version upgrade breaks component APIs | Low | Low | Pin shadcn/ui to a specific version. Upgrade intentionally, not automatically. |
| Netlify cold starts adding latency to function calls | Low | Low | Functions are simple with no dependencies beyond the NVIDIA HTTP call. Cold starts should be sub-second. |
| TypeScript strict mode conflicts with third-party type definitions | Low | Low | Use `@types/*` packages. Prefer `unknown` over `any` where types are uncertain. Document any necessary type assertions. |

---

# 16. Future Extensibility

The architecture is designed so that new analytics modules can be added without touching existing code.

## Adding a New Module (e.g., Funnel Analytics)

### 1. New Dataset Type

Define a new interface in `src/types/` (e.g., `FunnelRow`). Define its validation rules in a new `funnelValidator.ts` inside a `src/services/funnelAnalytics/` directory. This does not touch the lead analytics code.

### 2. New Analytics Service Directory

```
src/services/funnelAnalytics/
  validator.ts
  mapper.ts
  stageCalculator.ts
  dropoffCalculator.ts
  chartDataGenerator.ts
  summaryBuilder.ts
```

Follows the same calculator-per-responsibility pattern as the lead analytics engine.

### 3. New Page

Add `src/pages/FunnelAnalysis/`. The page structure (upload → validate → analyze → visualize → AI insight) is identical to `LeadIntelligencePage`. The only differences are the hook implementations and the specific chart components.

### 4. New Hooks

`useFunnelUpload`, `useFunnelAnalysis`, `useAIInsights` — `useAIInsights` is already generic and reusable, since it only cares about `AIRequestPayload` and `AIResponse` shapes.

### 5. Routing

Add a new `<Route>` in `App.tsx`. Remove the "Coming Soon" state from the sidebar item.

### 6. Netlify Function

The single `/api/analyze` endpoint can serve all modules if a `moduleType` field is added to `AIRequestPayload`. The function routes to a different system prompt based on the module type. No new function required.

## Shared Infrastructure That Does Not Change

- `Layout`, `Sidebar`, `TopBar` — unchanged.
- `KPICard`, `EmptyState`, `ComingSoonCard` — reused directly.
- `types/ai.ts` — `AIRequestPayload` and `AIResponse` remain the same shape.
- `analyzeService.ts` — unchanged.
- `useAIInsights` — unchanged.
- The validation pattern, mapper pattern, and calculator pattern — unchanged.

The result is that each new module is additive. Existing features cannot be broken by new module development.

---

*This document is the engineering blueprint for GrowthPilot AI. All implementation must follow this design. If implementation reveals that a design decision is wrong or impractical, this document should be updated before the implementation diverges silently.*
