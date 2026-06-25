# PROMPTS.md

# GrowthPilot AI

## Claude Code Prompt Library

Version 1.0

---

# Purpose

This document contains reusable prompts for Claude Code throughout the development of GrowthPilot AI.

The objective is to encourage incremental development, maintain architectural consistency, and prevent unnecessary rewrites.

Each prompt assumes Claude has access to the repository and all project documentation.

---

# General Rules

Before every implementation:

1. Read the relevant documentation.
2. Understand the current implementation.
3. Explain the proposed approach.
4. Implement only the requested phase.
5. Stop after completion.

Never implement multiple phases in a single response unless explicitly instructed.

---

# Prompt 1 – Repository Understanding

```text
Read the following documents completely:

README.md

CLAUDE.md

docs/PRD.md

docs/ARCHITECTURE.md

docs/UI_UX_GUIDELINES.md

docs/IMPLEMENTATION_PLAN.md

Do not write any code.

Inspect the repository structure.

Explain:

• Current architecture

• Missing implementation

• Suggested development order

• Potential risks

Wait for my confirmation before implementing anything.
```

---

# Prompt 2 – Implementation Planning

```text
Based on the documentation and repository, create a detailed implementation plan for the current phase.

Identify:

• Files to create

• Files to modify

• Components

• Services

• Utilities

• Types

Explain your reasoning.

Do not generate code yet.
```

---

# Prompt 3 – Implement Current Phase

```text
Implement only the current phase from IMPLEMENTATION_PLAN.md.

Requirements:

• Follow the architecture document.

• Follow the UI guidelines.

• Use reusable components.

• Keep components under approximately 300 lines.

• Use strict TypeScript.

• Do not implement future phases.

After implementation:

• Explain what changed.

• List every file modified.

• Suggest a Git commit message.

Stop.
```

---

# Prompt 4 – Build Validation

```text
Review the current implementation.

Check:

• TypeScript errors

• Build errors

• Import issues

• Dead code

• Duplicate code

• Unused variables

Suggest fixes before writing additional features.
```

---

# Prompt 5 – UI Review

```text
Review the user interface against UI_UX_GUIDELINES.md.

Evaluate:

• Color consistency

• Typography

• Spacing

• Card layout

• Responsiveness

• Accessibility

• Navigation

Suggest improvements.

Do not change functionality.
```

---

# Prompt 6 – Architecture Review

```text
Review the repository as a Staff Engineer.

Evaluate:

• Folder structure

• Component hierarchy

• Separation of concerns

• State management

• Service organization

• Reusability

• Future scalability

Recommend improvements.

Do not write code unless requested.
```

---

# Prompt 7 – Refactoring

```text
Review the entire repository.

Identify:

• Duplicate code

• Large components

• Better abstractions

• Naming inconsistencies

• Type improvements

• Performance optimizations

Refactor only where it improves maintainability.

Do not change application behaviour.
```

---

# Prompt 8 – Analytics Validation

```text
Review the Analytics Engine.

Verify:

• Conversion rate calculation

• Feature importance calculation

• Lead scoring

• SQL threshold

• MQL threshold

• Confidence score

Ensure every calculation is deterministic.

Explain the mathematics behind each calculation.

Suggest improvements if appropriate.
```

---

# Prompt 9 – AI Integration Review

```text
Review the AI implementation.

Ensure:

• Raw CSV data is never sent.

• Only summary JSON reaches the AI.

• AI performs no calculations.

• Prompt engineering follows project philosophy.

• API keys remain secure.

Suggest improvements.
```

---

# Prompt 10 – Production Readiness Review

```text
Review the application as if it were about to be deployed.

Evaluate:

• Code quality

• Security

• Error handling

• Performance

• Accessibility

• Responsiveness

• Maintainability

• Documentation

List issues in order of severity.

Recommend final improvements before deployment.
```

---

# Prompt 11 – Pull Request Review

```text
Act as a Senior Frontend Engineer reviewing a pull request.

Review:

• Architecture

• Readability

• Type safety

• React best practices

• User experience

• Error handling

• Edge cases

Provide constructive feedback.

Do not rewrite the implementation unless necessary.
```

---

# Prompt 12 – Product Manager Review

```text
Review the implementation from a Product Manager's perspective.

Evaluate:

• Does the workflow match the PRD?

• Does the product solve the intended problem?

• Is the user journey intuitive?

• Are there unnecessary steps?

• Are there opportunities to simplify?

Suggest product improvements without changing technical architecture.
```

---

# Prompt 13 – Final Demonstration Preparation

```text
Prepare this project for a portfolio demonstration.

Generate:

• Product overview

• Architecture explanation

• AI workflow explanation

• Technical highlights

• Product decisions

• Future roadmap

Assume the audience is a Product Manager interviewing for an AI-first SaaS company.

Keep explanations concise, practical, and technically accurate.
```

---

# Development Workflow

For every implementation cycle, use the prompts in this order:

1. Repository Understanding
2. Implementation Planning
3. Implement Current Phase
4. Build Validation
5. UI Review
6. Commit Changes

At major milestones, additionally run:

* Architecture Review
* Refactoring
* Analytics Validation
* Production Readiness Review

This workflow keeps the project modular, reviewable, and aligned with the product vision while taking advantage of Claude Code's strengths in planning, implementation, and code review.
