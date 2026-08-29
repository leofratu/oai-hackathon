# Contributing

## Development

```bash
npm install
npm run dev
```

Before opening a pull request, run:

```bash
npm run verify
```

Keep classifier and permission rules in `src/model.js`. Human UI actions and WebMCP handlers should call those shared operations. Add a regression test for each new model invariant or tool boundary.

Tool schemas should use narrow inputs, identify read and write behavior, and avoid exposing reference labels or individual holdout rows. Update the visible trace projection when a tool result changes.

Read `docs/AI_WRITING_TROPES.md` before editing human-facing copy.
