# WebMCP contract

Seven Transects registers six site tools with `document.modelContext.registerTool` when the browser supports WebMCP.

| Tool | Reads or writes | Contract |
|---|---|---|
| `get_expedition_state` | Read | Returns objectives, public progress, budgets, and collaboration rules. |
| `survey_region` | Write | Spends one of seven charges and returns a fixed cross-transect. Duplicate centers are rejected. |
| `inspect_chart` | Read | Returns committed marks, evidence, human observations, and resolved decisions. |
| `propose_chart_patch` | Write | Stages bounded confidence-coded marks; it never commits them. |
| `focus_human_attention` | Write | Creates one structured visual-reading question for the person. |
| `consult_compass` | Write | Spends one of two consultations and returns a broad precision band. |

## Invariants

- The truth array and seed never appear in agent-facing payloads.
- Exact live correctness is unavailable before the final reveal.
- At most three proposals and one human question may be pending.
- Proposal conflicts are recalculated when the person accepts.
- All mutating operations freeze after the expedition finishes.
- Seven exact transects alone cannot meet the coverage target.

## Fallback

When WebMCP is unavailable, the app remains playable and provides **Simulate next agent move**. The fallback calls the same tool handlers used by a compatible browser agent.
