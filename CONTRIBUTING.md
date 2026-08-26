# Contributing

Thanks for improving Seven Transects.

## Development

```bash
npm install
npm run dev
```

Before opening a pull request, run:

```bash
npm test
npm run build
```

Keep game rules in `src/game.js`, call those same operations from both the human UI and WebMCP handlers, and add regression tests for every new invariant. Tool schemas should remain narrow, disclose side effects, and never expose the truth map or exact live correctness.

Use focused commits and explain changes to the human-agent contract in the pull request description.
