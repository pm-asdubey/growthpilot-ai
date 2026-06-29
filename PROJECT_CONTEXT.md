# Project Context

GrowthPilot AI is an AI-powered Lead Intelligence platform.

The MVP is complete and deployed.

---

## What It Does

The application performs deterministic analytics on uploaded historical lead datasets.

The user uploads a CSV of historical leads (each row = one company, with behavioral signals and a known conversion outcome). The frontend computes:

- Feature importance (which signals most predicted conversion historically)
- Lead scores (0–100 per lead, weighted by feature importance)
- SQL / MQL / Nurture classification (thresholds learned from where historical converters scored)
- Ideal Customer Profile (trait ranges that historically correlate with highest conversion)
- Categorical and bucket breakdowns (per-value conversion and SQL rates)

Artificial Intelligence is only used for interpretation and executive summaries. A structured analytics summary — no raw rows — is sent to NVIDIA NIM. The model returns an executive summary, key findings, recommendations, risks, next actions, and suggested follow-up questions.

A conversational Ask AI panel allows follow-up questions with full conversation history.

No raw CSV data is ever sent to AI. No data is stored server-side.

---

## Modules

### Implemented
- Lead Intelligence (complete)

### Coming Soon
- Funnel Analysis
- Attribution Analysis
- Segmentation
- Churn Prediction

---

## Primary Technologies

- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Recharts
- PapaParse
- Netlify Functions
- NVIDIA NIM API (`meta/llama-3.1-8b-instruct`)
- localStorage (persistence, no database)

---

## Core Principle

Analytics and AI are strictly separated.

The frontend computes all statistics.

The backend (single Netlify function) only proxies structured summaries to NVIDIA.

AI explains. It never calculates.
