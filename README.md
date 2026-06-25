# GrowthPilot AI

> AI-powered Lead Intelligence Platform for Marketing Operations Teams

---

## Overview

GrowthPilot AI is an AI-assisted analytics platform designed to help Marketing Operations teams identify high-quality leads from historical marketing data.

Instead of manually analyzing spreadsheets, GrowthPilot AI automatically performs statistical analysis on uploaded lead datasets and generates executive-ready business insights using Large Language Models (LLMs).

The MVP focuses on **Lead Intelligence**, while the platform architecture is intentionally designed to support additional analytics modules such as Funnel Analytics, Attribution Analysis, Customer Segmentation, and Churn Prediction.

---

# Product Vision

Marketing Operations teams spend significant time answering questions such as:

* Which leads should Sales prioritize?
* Which customer behaviors best predict conversion?
* Which factors contribute most to becoming a paying customer?
* How should Marketing Qualified Leads (MQLs) and Sales Qualified Leads (SQLs) be classified?
* How can these findings be communicated to business stakeholders?

GrowthPilot AI transforms raw CSV exports into interactive dashboards and AI-generated executive summaries in minutes.

---

# Core Philosophy

GrowthPilot AI separates **analytics** from **artificial intelligence**.

The application performs all statistical calculations locally using deterministic algorithms.

Artificial Intelligence is used only to:

* Interpret analytical results
* Generate executive summaries
* Explain findings
* Recommend business actions

The AI **never performs calculations** and **never receives raw CSV data**.

This architecture improves:

* Trust
* Explainability
* Consistency
* Cost efficiency

---

# MVP Scope

The first release implements one fully functional module.

## ✅ Lead Intelligence

Features include:

* CSV Upload
* Dataset Validation
* Historical Conversion Analysis
* Feature Importance Analysis
* Explainable Lead Scoring
* SQL / MQL Classification
* Interactive Dashboards
* AI Executive Summary
* Business Recommendations
* Exportable Report

---

## 🚧 Future Modules

The application has been architected to support additional analytics capabilities.

Planned modules include:

* Funnel Analytics
* Attribution Analysis
* Customer Segmentation
* Churn Prediction
* Revenue Intelligence
* Campaign Analytics

These modules intentionally appear within the application as **Coming Soon** to communicate the long-term product vision.

---

# Product Workflow

```text
Dashboard

↓

Lead Intelligence

↓

Upload Historical Lead Dataset (.csv)

↓

Dataset Validation

↓

Deterministic Analytics Engine

↓

Generate Business Metrics

↓

Generate Structured JSON Summary

↓

AI Insight Engine

↓

Interactive Dashboard

↓

Executive Summary

↓

Recommendations

↓

Download Report
```

---

# Technology Stack

## Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* shadcn/ui

## Data Processing

* PapaParse
* Native TypeScript Analytics Engine

## Visualizations

* Recharts

## Backend

* Netlify Functions

## AI

* NVIDIA Inference API

## Deployment

* Netlify

## Version Control

* Git + GitHub

---

# Repository Structure

```text
growthpilot-ai/

├── README.md
├── CLAUDE.md
├── PROMPTS.md
├── DATASETS.md

├── docs/
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── IMPLEMENTATION_PLAN.md
│   └── UI_UX_GUIDELINES.md

├── src/
│   ├── assets/
│   ├── components/
│   ├── hooks/
│   ├── pages/
│   ├── services/
│   ├── types/
│   └── utils/

├── public/

└── netlify/
    └── functions/
```

---

# Documentation

The project is documented in detail to support AI-assisted development.

| Document                 | Purpose                                         |
| ------------------------ | ----------------------------------------------- |
| `PRD.md`                 | Product requirements and business context       |
| `ARCHITECTURE.md`        | Technical architecture and data flow            |
| `IMPLEMENTATION_PLAN.md` | Development phases and milestones               |
| `UI_UX_GUIDELINES.md`    | Design system and user experience               |
| `CLAUDE.md`              | Development guidelines for Claude Code          |
| `PROMPTS.md`             | Reusable prompts for AI-assisted implementation |
| `DATASETS.md`            | Dataset schemas and validation rules            |

---

# Development Principles

This project follows several engineering principles.

## Build Incrementally

Features should be implemented in small, reviewable phases.

---

## Reusable Components

UI components should be modular and reusable wherever possible.

---

## Type Safety

Avoid the `any` type.

Prefer strict TypeScript interfaces.

---

## Explainable Analytics

Every metric should be reproducible.

Business recommendations must always reference measurable data.

---

## AI-Assisted Development

Artificial Intelligence should accelerate development without replacing engineering judgment.

Developers are expected to:

* Review generated code
* Refactor duplicated logic
* Validate outputs
* Test functionality
* Maintain clean architecture

---

# Non-Goals

The MVP intentionally excludes:

* Authentication
* Database
* CRM Integrations
* Multi-user Workspaces
* Billing
* Real-time Analytics
* Scheduled Reports
* Marketing Campaign Execution

These capabilities belong to future releases.

---

# Long-Term Vision

GrowthPilot AI aims to become an AI-native analytics workspace for Marketing Operations teams.

Future versions will provide a unified environment for:

* Lead Intelligence
* Funnel Optimization
* Attribution Modeling
* Customer Segmentation
* Revenue Analytics
* Predictive Insights
* AI-powered Business Recommendations

The long-term objective is to help Marketing teams make faster, data-driven decisions while reducing reliance on spreadsheets and manual analysis.

---

# License

This project is intended as a portfolio and demonstration application showcasing AI-assisted product development, analytics workflows, and modern frontend engineering practices.

It is not affiliated with or endorsed by any commercial marketing automation platform.
