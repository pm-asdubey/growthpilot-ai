# Architecture Decisions

---

## ADR-001 — Deterministic Analytics Instead of AI Calculations

**Decision:** All statistical calculations (feature importance, lead scoring, segment classification) run in the browser using pure TypeScript. AI receives only the pre-computed summary.

**Reason:** AI-generated numbers are non-deterministic — the same dataset can produce different results on different runs. Sales teams need to trust and explain every number. Deterministic client-side analytics means every KPI is reproducible, auditable, and traceable back to the uploaded file.

**Consequence:** The analytics engine is the core product. AI is a presentation layer on top of verified numbers.

---

## ADR-002 — Netlify Functions as Backend

**Decision:** A single Netlify Function (`analyze.ts`) acts as the only backend component.

**Reason:** The application needs a server-side component only to keep the NVIDIA API key out of the browser bundle. Netlify Functions provide this with zero infrastructure overhead and co-location with the frontend deployment.

**Consequence:** No server to maintain. No database. No auth infrastructure. The backend does exactly one thing: proxy structured analytics to NVIDIA and return the response.

---

## ADR-003 — NVIDIA NIM API

**Decision:** NVIDIA NIM (`meta/llama-3.1-8b-instruct`) is the AI provider.

**Reason:** Fast inference latency suitable for real-time dashboard use. The 8B parameter model is sufficient for interpreting structured analytics summaries — a much simpler task than open-ended reasoning. Cost-effective for a portfolio-scale application.

**Consequence:** Single API dependency. If NVIDIA is unavailable, the analytics dashboard remains fully functional — AI insights are supplementary, never required.

---

## ADR-004 — React + Vite

**Decision:** React 18 with Vite as the build tool, TypeScript strict mode throughout.

**Reason:** React's component model maps naturally to the dashboard's modular card layout. Vite provides sub-second HMR and fast production builds. TypeScript strict mode catches type errors that would otherwise surface as runtime bugs in the analytics calculations.

**Consequence:** Strong type safety across the analytics pipeline. All analytics inputs and outputs have explicit interfaces (`Lead`, `AnalysisResult`, `AIRequestPayload`, etc.).

---

## ADR-005 — No Database

**Decision:** No server-side storage. Analysis history and AI insights are persisted in localStorage only.

**Reason:** The MVP needs no user accounts, no multi-device sync, and no data retention. localStorage gives session persistence without any infrastructure. More importantly, it means customer lead data never touches a server — a significant privacy advantage for enterprise users.

**Consequence:** History is device-local and browser-local. Clearing browser data loses history. Acceptable trade-off for MVP scope.

---

## ADR-006 — Learned SQL/MQL Thresholds Instead of Fixed Percentiles

**Decision:** SQL and MQL thresholds are derived from the score distribution of historically converted leads in the uploaded dataset, not from a fixed "top 15%" rule.

**Reason:** A fixed percentile creates a false signal. On a dataset where all open leads score between 40–45, the "top 15%" are still labelled SQL even though none of them match the historical conversion profile. By learning the threshold from where actual converters scored, the classification is grounded in observed behavior.

**Edge case handled:** If all open leads score identically (zero score spread — e.g. a dataset with no converted leads), the system detects this and routes all leads to Nurture rather than produce a meaningless priority queue.

---

## ADR-007 — Modular Analytics Engine

**Decision:** The analytics engine is split into 11 single-responsibility modules rather than one large calculator class.

**Reason:** Each calculator can be tested, replaced, and reasoned about independently. The feature importance calculation algorithm (currently mean-diff with min-max normalization) can be swapped for a more sophisticated approach (e.g. SHAP values) without touching the scoring or classification logic. This separation also makes it straightforward to add new analytics modules (Funnel, Attribution) that share the same pipeline structure.

**Modules:** validator → mapper → conversionCalculator → featureImportanceCalculator → leadScoreCalculator → segmentClassifier → kpiGenerator → chartDataGenerator → summaryBuilder → categoricalAnalyzer → featureBucketAnalyzer.

---

## ADR-008 — Min-Max Normalization in Feature Importance

**Decision:** Feature importance normalizes all columns to a 0–1 range before comparing converted vs non-converted means.

**Reason:** Without normalization, a feature like `employees` (range: 5–3,500) produces an absolute mean difference of hundreds, while a binary feature like `webinar_attended` (range: 0–1) produces a difference of at most 1.0. This would make `employees` appear dominant in importance purely because of its unit scale, not because it actually predicts conversion better. Normalization puts every feature on the same footing before comparison.

**Consequence:** Feature importance reflects genuine predictive signal, not measurement scale.

---

## ADR-009 — Single Netlify Function with Mode Switching

**Decision:** Both the executive summary (`mode: 'analyze'`) and conversational Ask AI (`mode: 'question'`) use the same `/api/analyze` endpoint, differentiated by a `mode` field in the request body.

**Reason:** Reduces deployment surface. Both modes share the same NVIDIA API setup, authentication, timeout handling, and error formatting. The difference is only in prompt construction and response parsing.

**Consequence:** One function to maintain and monitor. Adding a new AI capability means adding a new mode, not a new function.
