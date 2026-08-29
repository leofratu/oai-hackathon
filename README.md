# Label Loop

Label Loop is an online machine-learning workbench built for the 2026 WebMCP Challenge. A multinomial Naive Bayes classifier runs in the browser and routes support tickets into `billing`, `bug`, or `access`. A browser agent ranks uncertain samples, asks a person for labels, trains on confirmed examples, evaluates the result, and can stage model-setting changes for approval.

There is no backend, account, model API, or paid service.

Live app: https://leofratu.github.io/oai-hackathon/

## What is actually machine learning

The classifier stores class document counts, token counts, token totals, and a vocabulary in page memory. Every accepted training example updates those counts incrementally. Predictions use multinomial Naive Bayes with configurable Laplace smoothing. The page calculates normalized class probabilities, predictive entropy, accuracy, macro F1, per-class F1, mean confidence, and log loss.

The initial model has nine seed examples. Twelve new tickets form the active-learning pool, and nine fixed examples form the evaluation holdout. Holdout results are returned as aggregate metrics; individual holdout answers are not exposed through WebMCP.

## Why WebMCP matters

The page registers seven typed tools with `document.modelContext.registerTool`. A compatible browser agent works with the live model state through those tools instead of reading cards or guessing button behavior.

The contract also divides authority:

- The agent can rank uncertain tickets and request up to three labels.
- Only the person can assign the authoritative label.
- Training rejects samples that have not received a human label.
- The agent can stage smoothing and review-threshold changes.
- Settings remain unchanged until the person accepts the proposal.
- A visible trace records the name, read or write class, source, and result of each tool call.

The local replay uses the production handlers for browsers without WebMCP. Every replay event is labeled `local replay`; it is not presented as a native agent call.

## Site tools

| Tool | Access | Purpose |
|---|---|---|
| `get_training_state` | Read | Read task, model, queue, configuration, and current aggregate metrics. |
| `inspect_uncertain_samples` | Read | Rank unlabeled tickets by normalized predictive entropy. |
| `queue_label_review` | Write | Ask the person to label one to three selected tickets. |
| `train_confirmed_batch` | Write | Update the model with human-confirmed labels only. |
| `evaluate_model` | Read | Return accuracy, macro F1, confidence, log loss, and per-class metrics. |
| `propose_model_config` | Write | Stage Laplace alpha and review-threshold changes. |
| `inspect_training_history` | Read | Return metric checkpoints and training provenance. |

## Run locally

Requires Node.js 20.19 or newer.

```bash
npm install
npm run dev
```

Open the printed URL. Use `Run local tool replay` if the browser does not expose WebMCP.

## Verify

```bash
npm run verify
```

This runs unit tests, a headless browser workflow, and the production build. The browser test registers a `document.modelContext` contract stub, invokes all seven tools, completes a human label, trains the model, evaluates it, and approves a staged configuration.

For native testing, open the deployed app in ChatGPT's in-app browser or enable `chrome://flags/#enable-webmcp-testing` in a supported Chrome build. Confirm that the page badge reads `WebMCP live / 7 tools` and that all seven names appear in the browser's tool interface.

Suggested task:

> Open Label Loop and act as the training agent. Call get_training_state, inspect_uncertain_samples, then queue at most two high-entropy samples. Wait for me to label them. After I finish, call train_confirmed_batch, evaluate_model, and inspect_training_history. You may propose model settings, but do not claim that a label or setting was approved until the page reports it.

## Deploy for free

The repository includes GitHub Pages deployment and Netlify configuration. Cloudflare Pages and Vercel can also build the static app with:

```text
Build command: npm run build
Output directory: dist
```

## Project structure

```text
index.html               Shared human-agent training workspace
src/model.js             Online classifier, evaluation, and approval rules
src/webmcp.js            Seven schemas, handlers, trace projection, registration
src/main.js              UI rendering and human actions
src/styles.css           Responsive visual system
test/model.test.js       Model and authority-boundary tests
test/webmcp.test.js      Tool contract and registration tests
scripts/browser-flow.mjs End-to-end browser verification
public/_headers          WebMCP and security response headers
```

More detail is in [Architecture](docs/ARCHITECTURE.md), [WebMCP contract](docs/WEBMCP_CONTRACT.md), [verification](docs/VERIFICATION.md), [demo script](docs/DEMO_SCRIPT.md), and the [Devpost draft](docs/SUBMISSION.md).

## License

MIT. See [LICENSE](LICENSE).
