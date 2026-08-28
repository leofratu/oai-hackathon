# Seven Transects

Seven Transects is a rescue-mapping game for the 2026 WebMCP Challenge. A fleet is approaching an uncharted island with seven scan windows left. Your goal is to correctly color 72 of 144 squares while staying above 88% precision. The browser agent finds exact evidence, and you decide which marks stay on the chart. The target requires both inputs.

The MVP is a static Vite app with no backend, account, model API key, or paid service.

**Live app:** https://leofratu.github.io/oai-hackathon/

## WebMCP in 30 seconds

When the page opens, it registers six tools through `document.modelContext.registerTool`. A compatible browser agent discovers those tools and calls them against the page's live game state. Tool results contain structured data with bounded side effects.

The player flow is:

1. Open the page in ChatGPT's browser, copy the mission prompt, and ask ChatGPT to use the page's Site tools. For deterministic testing in another browser, choose **Run local tool replay**.
2. Review the gold-striped proposal. Accept strong marks, reject it, or accept the whole patch.
3. Answer the pinned spectral-layer question, then dispatch again. Keep going until 72 squares are correct.

The agent first reads bounded state and spends a survey. The result appears on the shared chart. The agent can stage a confidence-coded patch, but only the person can commit it. After the decision, the agent calls `inspect_chart` to read the answer and prepare its next proposal.

The in-app **WebMCP call trace** shows each read/write invocation, compact input, typed result, and consent boundary. The local demo drives the exact same handlers as native WebMCP so the protocol remains inspectable in an ordinary browser; it does not replace external agent discovery or reasoning.

## Why the game requires WebMCP

Most agent-enabled games expose ordinary moves. Seven Transects uses the tool contract to define information asymmetry:

- The hidden truth map is private application state and is never returned wholesale.
- `survey_region` spends one of seven charges and returns fixed five-cell transects. Even seven non-overlapping surveys cannot reach the 50% coverage target alone.
- `propose_chart_patch` creates a translucent overlay; it cannot commit cells.
- Exact evidence is rendered on the shared chart, while inference confidence and basis remain auditable.
- The human can accept only high-confidence cells, reject with feedback, or manually correct a patch.
- `focus_human_attention` asks a structured question about the human-owned visual clue; `inspect_chart` returns the person's authorized answer to the agent.
- `consult_compass` spends one of only two checks and returns a broad confidence band, preventing score-oracle probing.

WebMCP provides external agent discovery, structured evidence exchange, and the agent-human handoff used by the game.

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

Open the printed local URL. Without a WebMCP-capable browser, the full human UI and **Run the WebMCP demo** trace replay still work.

## Test

```bash
npm test
npm run build
npm run preview
```

The suites cover deterministic generation, survey bounds and budgets, staged consent, proposal conflicts, the human-answer handoff, consultation privacy, state freezing, payload leak guards, all six handler traces, read/write classification, error visibility, observer isolation, and native registration.

### Test native WebMCP

In ChatGPT's built-in desktop browser, open the deployed site and inspect **Site tools** in the address bar. The OpenAI documentation currently recommends GPT-5.6 Sol or Terra for site tools.

Suggested prompt:

> Join my Seven Transects game as the survey agent. First call get_expedition_state. The chart needs 50% coverage and 88% precision. Each survey returns one exact cross and spends one of seven scans. Label exact cells with basis "exact" and estimates with basis "inferred". Use focus_human_attention when you need my field-layer reading, then call inspect_chart to read my answer. Stage small patches and wait for my decision before continuing.

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

The repository's `public/_headers` file is copied into the build and enables an origin-keyed agent cluster and the `tools` permissions policy. Cloudflare Pages' current Free plan allows 500 builds per month, 20,000 files per site, and files up to 25 MiB. This project is well below those limits.

### Alternatives

- Vercel Hobby auto-detects Vite when you import the repository. Hobby is restricted to non-commercial personal use.
- Netlify Free can use the existing `netlify.toml` build and security-header configuration.
- GitHub Pages can deploy the public repository through a Vite GitHub Actions workflow.

## Demo arc (under three minutes)

1. Let a judge name a fresh operation callsign, then show the six site tools.
2. Ask the agent to spend one survey; watch a charge pip drain and exact evidence appear.
3. Agent stages a confidence-coded patch with one deliberately uncertain interpolation.
4. Accept only cells at or above 80%. Answer the survey agent's pinned field-layer question.
5. The agent calls `inspect_chart`, incorporates the human answer, and continues on a different sector.
6. Spend one scarce compass consultation near the target.
7. Finish and show the exact score, mistakes, and handoff count.

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
- [Devpost submission draft](docs/SUBMISSION.md)
- [Verification record](docs/VERIFICATION.md)
- [Deployment](docs/DEPLOYMENT.md)
- [OxAlpha review summary](docs/OXALPHA_REVIEW.md)
- [Security model](SECURITY.md)
- [Contributing](CONTRIBUTING.md)
- [Changelog](CHANGELOG.md)

## License

MIT. See [LICENSE](LICENSE).
