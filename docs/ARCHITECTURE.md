# Architecture

Seven Transects is a client-only Vite application. The human interface and the WebMCP tools operate on the same in-memory expedition state.

## Runtime layers

1. `src/game.js` owns deterministic generation, validation, surveys, proposals, human observations, consultations, and scoring.
2. `src/webmcp.js` wraps those operations in six narrow JSON Schema tool definitions.
3. `src/main.js` renders the state and connects human actions to the same engine functions.
4. `index.html` and `src/styles.css` provide the accessible shared workspace.

There is no backend, account system, database, or model API. The deployed artifact is the static `dist` directory.

## Information boundary

The agent-facing functions never return the truth map, island seed, or exact live precision. The agent receives sparse exact transects. The person receives a noisy visual field lens and controls every committed proposal. Structured human observations return to the agent through `inspect_chart`.

This is a game boundary implemented through the WebMCP contract, not a cryptographic boundary against a user inspecting downloaded client code.

## State flow

```text
Agent tool call ─┐
                 ├─> validated game operation ─> expedition state ─> render
Human UI action ─┘
```

The shared operation layer prevents the WebMCP path from bypassing UI permissions or game invariants.
