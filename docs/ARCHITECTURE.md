# Architecture

## GrowthPilot AI

Version 2.0 — reflects implemented MVP

---

## High-Level Architecture

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
│                              │  Structured JSON (no raw CSV)     │
│                              ▼                                    │
│                     ┌──────────────┐                             │
│                     │  API Service  │                             │
│                     └──────────────┘                             │
└──────────────────────────────┬──────────────────────────────────┘
                                │ POST /api/analyze
                                ▼
                   ┌─────────────────────────┐
                   │   Netlify Function       │
                   │   analyze.ts             │
                   └────────────┬────────────┘
                                │
                                ▼
                   ┌─────────────────────────┐
                   │   NVIDIA NIM             │
                   │   meta/llama-3.1-8b-     │
                   │   instruct               │
                   └────────────┬────────────┘
                                │
                                ▼
                   ┌─────────────────────────┐
                   │   AI Response JSON       │
                   └─────────────────────────┘
```

---

## Architectural Principles

### 1. Separation of Concerns

Analytics → AI Interpretation → Presentation are strictly independent layers. No component performs multiple responsibilities.

### 2. Deterministic Analytics

Every metric is reproducible. The frontend performs all mathematical analysis. AI never calculates — it only interprets pre-computed results.

### 3. Thin Backend

The Netlify function does exactly three things: receive structured JSON, call NVIDIA, return the response. No business logic, no storage, no calculations.

### 4. AI as Augmentation

AI enhances analytics. It never replaces them. The dashboard is fully functional if AI is unavailable.

---

## Data Flow

```
User uploads CSV
      │
      ▼
PapaParse → raw string rows
      │
      ▼
validator.ts → ValidationResult (pass/fail + error list)
      │ (fail → stop, show errors)
      ▼
mapper.ts → Lead[] (typed objects)
      │
      ▼
Analytics Engine (all modules run in sequence)
  ├── conversionCalculator     → conversionRate, converted/open counts
  ├── featureImportanceCalc    → FeatureImportance[] (min-max normalized)
  ├── leadScoreCalculator      → LeadScore[] (0–100 per lead)
  ├── segmentClassifier        → sql[], mql[], nurture[], learned thresholds
  ├── kpiGenerator             → KPISet
  ├── chartDataGenerator       → ChartDataSet
  ├── categoricalAnalyzer      → per-value breakdown for text columns
  └── featureBucketAnalyzer    → range breakdown for numeric columns
      │
      ▼
summaryBuilder → AIRequestPayload (aggregates only, no raw rows)
      │
      ├── Display dashboard immediately (no AI dependency)
      │
      └── analyzeService.fetchInsights() → POST /api/analyze
            │
            ▼
      Netlify Function → NVIDIA NIM
            │
            ▼
      AIResponse (executiveSummary, keyFindings, recommendations,
                  risks, nextActions, suggestedQuestions)
            │
            ▼
      Cached in localStorage → displayed in AIInsightsPanel

Ask AI (after summary loads):
      User question + context + conversation history
            │
            ▼
      POST /api/analyze (mode: 'question')
            │
            ▼
      answer + followUpQuestions → AskAIPanel
```

---

## Application Layers

### Presentation Layer

Pages, components, charts, tables, forms, navigation. No calculations. No direct API calls.

Files: `src/components/`, `src/pages/`

### Business Layer

Orchestrates workflow, manages state, calls services, transforms data.

Files: `src/hooks/useAnalysis.ts`, `useCSVUpload.ts`, `useAIInsights.ts`, `usePersistedAnalysis.ts`

### Analytics Layer

Pure TypeScript — no UI, no side effects. Every function is deterministic and independently testable.

Files: `src/services/analytics/`

### API Layer

Sends structured payload to Netlify. Handles timeout and error normalization.

Files: `src/services/api/analyzeService.ts`

### AI Layer (server-side)

NVIDIA NIM receives structured analytics JSON. Returns interpreted insights. Two modes: `analyze` (executive summary) and `question` (conversational follow-up).

Files: `netlify/functions/analyze.ts`

---

## Analytics Engine — Complete Module List

| Module | Responsibility |
|---|---|
| `validator.ts` | Required columns, data types, duplicate headers, empty files |
| `mapper.ts` | PapaParse output → typed `Lead[]` |
| `conversionCalculator.ts` | Conversion rate, converted/open split |
| `featureImportanceCalculator.ts` | Min-max normalized mean-diff importance ranking |
| `leadScoreCalculator.ts` | Weighted 0–100 score per lead |
| `segmentClassifier.ts` | Learned SQL/MQL thresholds + score spread detection |
| `kpiGenerator.ts` | KPI set: totals, counts, rates, averages |
| `chartDataGenerator.ts` | Recharts-ready data for all chart types |
| `summaryBuilder.ts` | Constructs `AIRequestPayload` (no raw rows) |
| `categoricalAnalyzer.ts` | Per-value conversion rate and SQL rate for text columns |
| `featureBucketAnalyzer.ts` | Range-based rates for numeric columns |

---

## State Management

React state via hooks. No global store. `usePersistedAnalysis` syncs analysis history and cached AI insights to localStorage. No Context API required in MVP.

---

## Error Handling

| Scenario | Behaviour |
|---|---|
| Invalid CSV | Validation stops; errors shown inline |
| Missing required column | Named in error message |
| AI timeout (60s) | Retry button shown; analytics unaffected |
| AI unavailable | Graceful degradation; dashboard still functional |
| Network failure | Error toast; retry option |
| No score spread | All open leads routed to Nurture |

---

## Performance

- Analyze datasets up to 10,000 rows in under 2 seconds (client-side).
- AI insights cached — NVIDIA called once per analysis.
- `useMemo` on expensive analytics computations.
- Recharts renders lazily.

---

## Security

- NVIDIA API key in Netlify environment variables only — never in the browser bundle.
- No raw customer data transmitted to any server.
- No authentication required (single-user, session-local).
- No persistent server-side state.

---

## Extensibility

Future modules (Funnel, Attribution, Segmentation, Churn Prediction) can reuse:
- The same AppLayout, Sidebar, and routing pattern.
- The same AI proxy endpoint (new mode value).
- The same localStorage persistence hook.
- The same validation and mapper infrastructure.

Each new module adds a new analytics service directory and a new page — no existing code needs to change.
