# DATA_SPECIFICATION.md

# GrowthPilot AI

Data Specification

Version 1.0

---

# Purpose

This document defines the complete data contract used throughout GrowthPilot AI.

It specifies:

* Accepted datasets
* Required columns
* Optional columns
* Validation rules
* Internal data structures
* Analytics outputs
* Chart data
* AI payloads

Every component in the application should follow this specification.

---

# MVP Dataset

The MVP supports one dataset.

## Historical Lead Dataset

Each row represents one company (or lead account).

Each row already contains the historical outcome.

Example:

| company_name | employees | trial_users | pricing_page_visits | daily_active_users | invited_teammates | webinar_attended | support_tickets | days_since_signup | converted |
| ------------ | --------: | ----------: | ------------------: | -----------------: | ----------------: | ---------------: | --------------: | ----------------: | --------: |
| Acme Inc     |       150 |           8 |                  12 |                 18 |                 6 |                1 |               2 |                25 |         1 |

---

# Required Columns

| Column              | Type          | Required |
| ------------------- | ------------- | -------- |
| employees           | Number        | Yes      |
| trial_users         | Number        | Yes      |
| pricing_page_visits | Number        | Yes      |
| daily_active_users  | Number        | Yes      |
| invited_teammates   | Number        | Yes      |
| webinar_attended    | Boolean / 0-1 | Yes      |
| support_tickets     | Number        | Yes      |
| days_since_signup   | Number        | Yes      |
| converted           | Boolean / 0-1 | Yes      |

---

# Optional Columns

These columns should be ignored by the analytics engine unless future versions support them.

Examples:

* Company Name
* Industry
* Country
* ARR
* CRM ID
* Email
* Phone
* Created Date

Unknown columns should never break the application.

---

# Validation Rules

The dataset must satisfy:

✓ CSV format

✓ UTF-8 encoding

✓ At least one data row

✓ Required columns exist

✓ No duplicate headers

✓ Numeric fields are numeric

✓ converted contains only 0 or 1

---

# Validation Errors

Examples

Missing Column

```text
Required column:

pricing_page_visits

was not found.
```

---

Wrong Data Type

```text
daily_active_users

must contain numeric values.
```

---

Empty Dataset

```text
Uploaded file contains no records.
```

---

Duplicate Header

```text
Duplicate column detected:

employees
```

---

# Internal Data Model

Each row becomes:

```typescript
interface Lead {

employees:number

trial_users:number

pricing_page_visits:number

daily_active_users:number

invited_teammates:number

webinar_attended:boolean

support_tickets:number

days_since_signup:number

converted:boolean

}
```

---

# Analytics Output

After analysis

The engine returns

```typescript
interface AnalysisResult {

dataset

kpis

featureImportance

leadScores

segments

charts

summary

}
```

---

# KPI Contract

KPIs include

```typescript
{

totalLeads

convertedLeads

conversionRate

averageLeadScore

sqlCount

mqlCount

}
```

---

# Feature Importance

```typescript
{

feature

importance

normalizedWeight

}
```

Example

```json
[
{
"feature":"Pricing Page Visits",

"importance":42,

"normalizedWeight":0.42
}
]
```

---

# Lead Score

Every lead receives

```text
0 — 100
```

Example

```json
{
"id":12,

"leadScore":86
}
```

---

# SQL Classification

Top 15%

↓

SQL

---

# MQL Classification

Next 15%

↓

MQL

---

# Remaining

↓

Nurture

---

# Chart Data Contracts

Every chart receives a standard format.

---

## Feature Importance

```typescript
[
{

feature

value

}
]
```

---

## SQL Distribution

```typescript
[
{

label

count

}
]
```

---

## Lead Score Histogram

```typescript
[
{

bucket

count

}
]
```

---

## Conversion Summary

```typescript
[
{

label

value

}
]
```

---

# AI Payload

Only structured analytics reach NVIDIA.

Never raw rows.

Example

```json
{

"dataset":{

"rows":1200,

"conversionRate":18.4

},

"kpis":{

"sqlCount":180,

"mqlCount":220

},

"topPredictors":[

"Pricing Page Visits",

"Daily Active Users",

"Invited Teammates"

]

}
```

---

# Expected AI Response

The frontend expects

```json
{

"executiveSummary":"...",

"keyFindings":[...],

"recommendations":[...],

"risks":[...],

"nextActions":[...]

}
```

---

# Data Flow

```text
CSV

↓

Validation

↓

Lead Objects

↓

Analytics

↓

KPIs

↓

Charts

↓

Summary JSON

↓

AI

↓

Executive Summary

↓

Dashboard
```

---

# Dataset Limits

MVP

Maximum

10,000 rows

Maximum

25 MB

Future versions may support larger datasets.

---

# Privacy

No uploaded CSV is stored.

No customer data is persisted.

Only summarized analytics are sent to the AI.

API keys remain server-side.

---

# Future Dataset Types

The architecture should support additional schemas.

Examples

## Funnel Dataset

Visitor

Signup

Activation

Paid

---

## Attribution Dataset

First Touch

Middle Touch

Last Touch

Converted

---

## Segmentation Dataset

Industry

ARR

Employees

Region

Behavior

---

## Churn Dataset

Login Frequency

NPS

Support Tickets

Renewal

Usage

---

Each future module should define its own schema while following the same validation and analytics pipeline.

---

# Source of Truth

This document is the definitive reference for all data structures, validation rules, analytics outputs, and AI payloads used throughout GrowthPilot AI.

Any change to the data model should be reflected here before implementation.
