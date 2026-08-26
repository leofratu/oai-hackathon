# OxAlpha review summary

Three independent OxAlpha sessions reviewed the project from different perspectives before the second MVP pass.

## Hackathon judge

The judge found the tool-contract thesis strong but asked for visible evidence, confidence visualization, a more dramatic finale, and a demo that guarantees a meaningful human decision.

## Game and agent interaction

The game-design review showed that maximal-radius surveys and exact scoring could let the agent bypass collaboration. It recommended fixed-cost information, structured human answers, bounded proposal queues, and a non-oracular progress check.

## Engineering and accessibility

The QA review identified broken drag painting from pointer capture, post-finish proposal mutation, lost keyboard focus, excessive grid tab stops, stale conflict counts, seed leakage, and missing security hardening.

## Changes made

- Fixed-radius transects and a 50% target make human-supported inference necessary.
- Exact evidence and proposal confidence are visible on the chart.
- Human field-lens answers return through `inspect_chart`.
- The score oracle became two broad compass consultations.
- Reveal freezes the expedition and opens a cinematic finale.
- Drag, keyboard navigation, ARIA structure, responsive width, CSP, and consent conflicts were corrected.
- Regression coverage expanded to thirteen engine and integrity tests.
