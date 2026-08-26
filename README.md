# Seven Transects

Seven Transects is an agent-native cooperative cartography puzzle for the 2026 WebMCP Challenge. The browser agent receives seven exact but sparse surveys; the human receives a noisy visual field lens and final authority. Neither side can efficiently map the hidden island alone.

The MVP is a static Vite app with no backend, account, model API key, or paid service.

## Why WebMCP is load-bearing

Most agent-enabled games expose ordinary moves. Seven Transects uses the tool contract to define information asymmetry:

- The hidden truth map is private application state and is never returned wholesale.
- `survey_region` spends one of seven charges and returns fixed five-cell transects. Even seven non-overlapping surveys cannot reach the 50% coverage target alone.
- `propose_chart_patch` creates a translucent overlay; it cannot commit cells.
- Exact evidence is rendered on the shared chart, while inference confidence and basis remain auditable.
- The human can accept only high-confidence cells, reject with feedback, or manually correct a patch.
- `focus_human_attention` asks a structured question about the human's noisy visual clue; `inspect_chart` returns the answer to the agent.
- `consult_compass` spends one of only two checks and returns a broad confidence band, preventing score-oracle probing.

Removing WebMCP removes the surveyor role and the central collaboration mechanic.

## Site tools

| Tool | Side effect | Purpose |
|---|---|---|
| `get_expedition_state` | None | Read rules, budget, and aggregate progress |
| `survey_region` | Spends one survey charge | Receive exact fixed-radius row/column transects and a surrounding histogram |
| `inspect_chart` | None | Read committed marks, evidence, human observations, and proposal decisions |
| `propose_chart_patch` | Stages a reversible overlay | Ask the human to approve evidence-backed terrain marks |
| `focus_human_attention` | Stages one human question | Request a structured field-lens judgment at a coordinate |
| `consult_compass` | Spends one of two consultations | Receive coverage and a broad precision band without an answer oracle |

All tools call the same functions used by the human-facing interface. Inputs are bounded with JSON Schema, side effects are described, and outputs include enough state for the agent and human to verify the result.

## Run locally

Requirements: Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open the printed local URL. Without a WebMCP-capable browser, the full human UI and **Simulate next agent move** fallback still work.

## Test

```bash
npm test
npm run build
npm run preview
```

The pure game-engine suite covers deterministic generation, survey bounds and budgets, staged consent, proposal conflicts, the human-answer handoff, consultation privacy, state freezing, and payload leak guards.

### Test native WebMCP

In ChatGPT's built-in desktop browser, open the deployed site and inspect **Site tools** in the address bar. The OpenAI documentation currently recommends GPT-5.6 Sol or Terra for site tools.

Suggested prompt:

> Help me chart this Seven Transects island. First call get_expedition_state. Each survey returns a fixed cross and spends one of seven charges. Cite exact cells as basis "exact" and mark interpolations as "inferred" with honest confidence. Exact evidence alone cannot reach 50% coverage, so use focus_human_attention to ask what my noisy field lens suggests; then call inspect_chart to read my answer. Stage small auditable patches, wait for my decision, and use the two consult_compass checks sparingly. Aim for 50% coverage and 88% precision.

For Chrome local testing:

1. Open `chrome://flags/#enable-webmcp-testing`.
2. Enable the flag and relaunch Chrome.
3. Use the Model Context Tool Inspector extension to inspect and invoke tools.

## Free deployment

### Recommended: Cloudflare Pages

1. Push this repository to GitHub or GitLab.
2. In Cloudflare Pages, create a project from the repository.
3. Set build command to `npm run build`.
4. Set output directory to `dist`.
5. Deploy.

The repository's `public/_headers` file is copied into the build and explicitly enables an origin-keyed agent cluster and the `tools` permissions policy. Cloudflare Pages' current Free plan allows 500 builds per month, 20,000 files per site, and files up to 25 MiB—far above this MVP's needs.

### Alternatives

- **Vercel Hobby:** import the repository; Vite is auto-detected. Suitable for a personal hackathon project, but Hobby is restricted to non-commercial personal use.
- **Netlify Free:** `netlify.toml` already defines the build and security headers.
- **GitHub Pages:** free from a public repository; configure a GitHub Actions Vite deployment if desired.

## Demo arc (under three minutes)

1. Let a judge name a fresh island seed, then show the six site tools.
2. Ask the agent to spend one survey; watch a charge pip drain and exact evidence appear.
3. Agent stages a confidence-coded patch with one deliberately uncertain interpolation.
4. Accept only the ≥80% cells. Answer the agent's pinned field-lens question yourself.
5. The agent calls `inspect_chart`, incorporates the human answer, and continues on a different sector.
6. Spend one scarce compass consultation near the target.
7. Finish and reveal the cinematic Survey Seal, exact score, mistakes, and handoff count.

## Project structure

```text
index.html             Human interface and accessible controls
src/game.js            Deterministic island and collaboration state machine
src/webmcp.js          Tool schemas, handlers, and native registration
src/main.js            UI rendering and shared action wiring
src/styles.css         Responsive visual system
test/game.test.js      Node test suite
public/_headers        WebMCP and security response headers
netlify.toml           Optional Netlify deployment configuration
```

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [WebMCP contract](docs/WEBMCP_CONTRACT.md)
- [Three-minute demo](docs/DEMO_SCRIPT.md)
- [Deployment](docs/DEPLOYMENT.md)
- [OxAlpha review summary](docs/OXALPHA_REVIEW.md)
- [Security model](SECURITY.md)
- [Contributing](CONTRIBUTING.md)
- [Changelog](CHANGELOG.md)

## License

MIT — see [LICENSE](LICENSE).
