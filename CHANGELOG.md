# Changelog

## 0.6.0 - 2026-08-27

- Added repository writing rules in `AGENTS.md`.
- Added the trope checklist in `docs/AI_WRITING_TROPES.md`.
- Rewrote UI, README, and demo copy to remove inflated wording, slogan fragments, smart punctuation, and repeated claims.

## 0.5.0 - 2026-08-27

- Added a plain-language three-move walkthrough for first-time players.
- Added a dynamic "Your move" instruction card that explains dispatch, review, field reading, and completion states.
- Made the objective concrete as 72 of 144 correctly colored squares at 88% precision.
- Removed misleading jargon from the mission prompt and landing-chart interactions.

## 0.4.0 - 2026-08-27

- Reframed the puzzle as a rescue-mapping operation with seven signal windows and a fleet-ready landing chart.
- Reworked the interface into a dark mission-control deck with role cards, signal readouts, live-state pulse, and scanline chart treatment.
- Added a guided dispatch interaction that scrolls mission control into view after the first agent turn.
- Tightened mission copy across the human UI, game activity, tool descriptions, prompt, and demo script.

## 0.3.0 - 2026-08-26

- Moved the WebMCP value proposition above the fold with a discover/call/handoff explainer.
- Added a live, allowlisted read/write trace for every registered tool invocation.
- Expanded the demo into a state-reading loop that consumes human observations via `inspect_chart`.
- Clarified the difference between native WebMCP and the same-handler local trace replay.
- Added five protocol tests covering all handlers, failures, observer isolation, safe summaries, and registration.

## 0.2.0 - 2026-08-26

- Added the human-only noisy field lens and structured observation handoff.
- Rendered exact survey evidence and confidence-coded proposal overlays.
- Added high-confidence partial acceptance and live conflict confirmation.
- Replaced exact score checks with two broad compass consultations.
- Added charge pips and a cinematic Survey Seal finale.
- Fixed drag painting, reveal mutation, keyboard focus, ARIA grid navigation, and responsive overflow.
- Added CSP, expanded documentation, and thirteen regression tests.

## 0.1.0 - 2026-08-26

- Built the initial deterministic cartography engine and six WebMCP tools.
- Added the human chart interface, proposal consent flow, tests, and deployment configuration.
