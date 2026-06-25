# ARCHITECTURE.md

# Technical Architecture

## GrowthPilot AI

Version 1.0

---

# Purpose

This document defines the technical architecture for GrowthPilot AI.

Its purpose is to ensure that every implementation follows a consistent structure, remains modular, and is easy to extend.

The MVP only implements the **Lead Intelligence** module, but the architecture should allow future analytics modules without major refactoring.

---

# High-Level Architecture

```text
                    Browser

                       │

             React + TypeScript

                       │

        ┌──────────────┴──────────────┐

        │                             │

 Analytics Engine              UI Components

        │                             │

        └──────────────┬──────────────┘

                       │

               Summary JSON

                       │

                       ▼

            Netlify Function (/api/analyze)

                       │

                       ▼

               NVIDIA Inference API

                       │

                       ▼

             AI Generated Insights

                       │

                       ▼

                  React Dashboard
```

---

# Architectural Principles

The project follows these principles:

## 1. Separation of Concerns

Analytics

↓

AI Interpretation

↓

Presentation

must remain independent.

No component should perform multiple responsibilities.

---

## 2. Deterministic Analytics

Every business metric must be reproducible.

The frontend performs all mathematical analysis.

The backend never calculates metrics.

The AI never calculates metrics.

---

## 3. Thin Backend

The backend only:

* receives summary JSON
* calls NVIDIA
* returns AI response

Nothing else.

---

## 4. AI Augmentation

Artificial Intelligence enhances analytics.

It never replaces analytics.

---

# Project Structure

```text
growthpilot-ai/

src/

├── assets/

├── components/

│      ├── charts/

│      ├── common/

│      ├── dashboard/

│      ├── upload/

│      └── insights/

├── hooks/

├── pages/

│      ├── Dashboard/

│      ├── LeadIntelligence/

│      ├── Attribution/

│      ├── Funnel/

│      └── Segmentation/

├── services/

│      ├── analytics/

│      ├── ai/

│      ├── csv/

│      └── api/

├── types/

├── utils/

└── App.tsx

netlify/

functions/

analyze.ts
```

---

# Application Layers

The application consists of five layers.

```text
Presentation Layer

↓

Business Layer

↓

Analytics Layer

↓

API Layer

↓

AI Layer
```

---

# Presentation Layer

Responsible for:

* Pages
* Components
* Charts
* Tables
* Forms
* Navigation

No calculations should exist here.

---

# Business Layer

Responsible for:

* Orchestrating workflow
* Calling services
* Managing state
* Transforming data

---

# Analytics Layer

Responsible for:

* Statistical calculations
* Lead scoring
* Classification
* Feature importance

This is the heart of the application.

No UI should exist here.

---

# API Layer

Responsible for:

Sending summary JSON to Netlify.

Receiving AI response.

Nothing else.

---

# AI Layer

Responsible only for:

* Executive Summary
* Recommendations
* Risks
* Business Insights

---

# Analytics Engine

The Analytics Engine consists of small, focused calculators.

```text
AnalyticsEngine

│

├── DatasetValidator

├── ConversionCalculator

├── FeatureImportanceCalculator

├── LeadScoreCalculator

├── SegmentCalculator

├── ConfidenceCalculator

└── ReportGenerator
```

Each calculator has a single responsibility.

---

# Data Flow

```text
CSV Upload

↓

PapaParse

↓

JavaScript Objects

↓

Dataset Validation

↓

Analytics Engine

↓

Summary JSON

↓

Netlify Function

↓

NVIDIA API

↓

Executive Summary

↓

Dashboard
```

---

# Dataset Validation

Validation occurs before analysis.

Checks include:

* Empty file
* Invalid CSV
* Missing required columns
* Duplicate columns
* Invalid data types
* Missing values

If validation fails:

Analysis stops immediately.

---

# Analytics Pipeline

Each uploaded dataset follows the same sequence.

```
Validate Dataset

↓

Calculate Conversion Rate

↓

Calculate Feature Importance

↓

Generate Lead Scores

↓

Determine SQL Threshold

↓

Determine MQL Threshold

↓

Generate KPIs

↓

Generate Charts

↓

Generate Summary JSON
```

---

# Summary JSON Contract

The frontend sends structured analytics.

Example:

```json
{
  "dataset": {
    "rows": 1200,
    "conversionRate": 18.4
  },
  "featureImportance": [
    {
      "feature": "pricing_page_visits",
      "importance": 0.42
    }
  ],
  "segments": {
    "sql": 180,
    "mql": 220
  }
}
```

Raw CSV data must never be sent.

---

# Netlify Function

Endpoint:

```
POST /api/analyze
```

Responsibilities:

* Validate request
* Call NVIDIA API
* Return AI summary

No calculations.

No business logic.

---

# AI Prompt

The AI receives only structured analytics.

Expected response:

* Executive Summary
* Key Findings
* Recommendations
* Risks
* Suggested Next Actions

---

# State Management

Use React state where possible.

Avoid unnecessary global state.

Introduce Context only when multiple pages require shared information.

---

# Error Handling

Support:

* Invalid CSV
* Empty datasets
* API failures
* Timeout
* Missing AI response
* Network failure

Each error should have a user-friendly message.

---

# Performance

Goals:

* Analyze datasets under 10,000 rows in under 2 seconds.
* Avoid unnecessary re-renders.
* Memoize expensive calculations.
* Lazy load heavy components where appropriate.

---

# Security

* Never expose NVIDIA API keys.
* Use environment variables.
* Perform AI requests only through Netlify Functions.
* Never send raw customer data to AI.

---

# Coding Standards

* Functional Components
* TypeScript Strict Mode
* Small reusable components
* Pure utility functions
* Consistent naming
* Avoid duplicate logic

---

# Git Workflow

Each feature should follow:

```
Implement

↓

Run Build

↓

Run TypeScript Check

↓

Review

↓

Commit

↓

Push
```

Commit messages should follow Conventional Commits.

Examples:

```
feat: implement CSV upload

feat: add analytics engine

feat: integrate NVIDIA AI

fix: improve validation

refactor: simplify lead scoring service
```

---

# Extensibility

Although only Lead Intelligence is implemented today, the architecture should support future modules without changing the existing analytics pipeline.

Future modules:

* Funnel Analytics
* Attribution
* Segmentation
* Churn Prediction

These should reuse the same UI framework, API layer, and AI interpretation workflow.

---

# Definition of Done

A feature is complete only if:

* Product requirements are satisfied.
* UI matches design guidelines.
* Code is modular.
* TypeScript passes.
* Build succeeds.
* Error states are handled.
* Documentation remains accurate.
* Code is ready for production review.
