# UI_UX_GUIDELINES.md

# GrowthPilot AI

## UI / UX Design System

Version 1.0

---

# Design Philosophy

GrowthPilot AI should feel like a premium B2B SaaS application used daily by Marketing Operations teams.

The interface should prioritize:

* Simplicity
* Clarity
* Trust
* Calmness
* Data readability
* Professional appearance

The application should avoid visual clutter.

Every screen should emphasize whitespace and hierarchy.

Reference inspiration:

* Linear
* Stripe Dashboard
* Vercel Dashboard
* Notion
* Attio CRM

---

# Design Principles

## Calm UI

The interface should never overwhelm users.

Prefer fewer visual elements with stronger hierarchy.

---

## Analytics First

Charts and business metrics are always the primary focus.

Decorative elements should be minimal.

---

## AI is Secondary

The AI panel supports the analytics.

It should never dominate the page.

---

# Color System

## Primary Brand

Primary Blue

HEX

```text
#2563EB
```

Used for:

* Primary buttons
* Active navigation
* Charts
* Selected cards

---

Hover

```text
#1D4ED8
```

---

Accent Blue

```text
#60A5FA
```

---

# Success

```text
#10B981
```

Used for:

* Positive KPIs
* Success badges
* Completed analyses

---

# Warning

```text
#F59E0B
```

---

# Error

```text
#EF4444
```

---

# Background

```text
#F8FAFC
```

---

# Card Background

```text
#FFFFFF
```

---

# Borders

```text
#E2E8F0
```

---

# Primary Text

```text
#0F172A
```

---

# Secondary Text

```text
#64748B
```

---

# Typography

Font

Inter

---

Page Title

36px

Bold

---

Section Heading

24px

Semibold

---

Card Heading

18px

Semibold

---

Body

15px

Regular

---

Caption

13px

Medium

---

Line Height

1.6

---

# Layout

Maximum Width

1440px

Centered

---

Page Padding

40px

---

Card Padding

24px

---

Grid

12 Column Responsive

---

Spacing Scale

4

8

12

16

24

32

48

64

Never invent custom spacing.

---

# Navigation

Left Sidebar

Width

280px

Contains

Dashboard

Lead Intelligence

────────────

Coming Soon

• Funnel Analysis

• Attribution

• Segmentation

────────────

Settings

Sidebar should remain fixed.

---

Top Navigation

Contains

Product Name

Search

Theme Toggle

User Avatar (placeholder)

---

# Cards

Border Radius

12px

---

Border

1px Solid

Border Color

```text
#E2E8F0
```

---

Shadow

Very subtle

Only on hover

---

Hover

Slight elevation

150ms transition

---

# Buttons

Primary

Blue background

White text

Rounded 10px

---

Secondary

White

Blue border

---

Danger

Red

---

Disabled

Grey

No hover

---

Loading

Spinner

Disabled

---

# Dashboard Layout

Top

Welcome Header

↓

KPI Cards

↓

Recent Analysis

↓

Coming Soon Modules

---

# KPI Cards

Four cards

Responsive

Each card contains

Title

Value

Small trend indicator

Optional icon

Example

Total Leads

12,450

↑ 18%

---

# Charts

Charts should always use Recharts.

Never mix chart libraries.

---

Chart Colors

Blue

Green

Amber

Slate

Only these.

---

Animations

Enabled

300ms

Ease Out

---

Required Charts

Feature Importance

Bar Chart

Lead Score Distribution

Histogram

SQL vs MQL

Pie Chart

Conversion Overview

Line Chart

---

# Tables

Rounded

Alternating hover

Sticky header

Pagination optional

Sortable columns

---

# CSV Upload

Large upload card.

Centered.

Supports

Drag & Drop

Browse

File Name

Progress

Validation

---

Upload Icon

Large

Friendly

---

Validation

Show checklist.

✓ Required Columns

✓ Valid Types

✓ Missing Values

---

# Loading States

Every page must have skeleton loaders.

Do not use blank screens.

---

# Empty States

Example

"No analysis yet.

Upload your first lead dataset to begin."

Include illustration placeholder.

---

# AI Insights Panel

Located below analytics.

White card.

Contains

Executive Summary

Key Findings

Recommendations

Risks

Next Actions

Never display AI as a chat interface.

---

# Icons

Use Lucide React.

Consistent icon size.

20px

Avoid emojis.

---

# Modals

Rounded

Large padding

Dark overlay

ESC closes

---

# Toast Notifications

Top Right

Auto dismiss

4 seconds

---

# Forms

Labels always above inputs.

Validation below input.

Helpful messages.

---

# Animations

Hover

150ms

Page

250ms Fade

Cards

Subtle lift

Buttons

Smooth color transition

Avoid excessive motion.

---

# Responsiveness

Desktop

4 KPI cards

Sidebar visible

---

Tablet

2 KPI cards

Collapsible sidebar

---

Mobile

Single column

Drawer navigation

Charts stack vertically

---

# Accessibility

Keyboard navigation

Visible focus ring

ARIA labels

WCAG AA contrast

Clickable areas minimum 44px

---

# Future Modules

Coming Soon cards should appear polished.

Each card contains:

Module Name

Short Description

"Available in Future Release"

Disabled interaction.

---

# Overall Feeling

The application should feel:

Professional

Modern

Fast

Reliable

Calm

Executive-friendly

Minimal

Every design decision should reinforce confidence in the analytics rather than draw attention to the interface itself.
