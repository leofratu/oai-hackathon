# Devpost submission draft

## Project details

- Project: Label Loop
- Tagline: Train a browser classifier with human labels and WebMCP
- Live app: https://leofratu.github.io/oai-hackathon/
- Source: https://github.com/leofratu/oai-hackathon
- Demo video: Add the public YouTube URL after upload
- License: MIT

## Short description

Label Loop is an online machine-learning workbench that runs entirely in the browser. Its multinomial Naive Bayes model classifies support tickets as billing, bug, or access. A browser agent finds high-entropy samples, requests human labels, trains on confirmed examples, checks a fixed holdout, and stages model-setting changes. The person owns label truth and configuration approval.

The page registers nine WebMCP tools and shows every call in a visible trace. No account, backend, model API, or model key is required.

## Why this use case fits WebMCP

Model training is a stateful workflow with several different operations. The agent needs structured predictions, entropy values, queue state, metric checkpoints, and explicit permissions. Reading the page layout would be fragile and would not tell the agent which actions are allowed.

WebMCP gives the open page a typed training API. `inspect_uncertain_samples` returns ranked data instead of forcing the agent to scrape cards. `queue_label_review` requests human work but contains no way to assign a label. `train_confirmed_batch` rejects predictions that a person has not confirmed. `propose_model_config` creates a visible pending proposal instead of changing the model silently.

## Better user experience

The person sees the current model, learned token weights, aggregate confusion matrix, calibration gap, per-class performance, review queue, accuracy history, and every agent call in one workspace. Agent suggestions arrive at the exact point where a human decision is needed. Low-confidence test predictions are marked for review using the approved threshold.

The model update is immediate and local. After the person labels a ticket, the next training call changes token counts, recalculates predictions, and adds an evaluation checkpoint without a server round trip.

## What the person and agent do together

The agent handles repeated analysis: read state, rank uncertainty, select a bounded batch, train confirmed labels, compare metrics, and suggest settings. The person supplies the authoritative category for ambiguous tickets and decides whether a configuration change is acceptable.

Neither side completes the intended loop alone. The agent cannot create training truth, and the person does not need to calculate entropy or maintain model counts by hand.

## WebMCP implementation

The top-level page calls `document.modelContext.registerTool` for nine tools. Each definition includes JSON Schema, a specific description, read-only annotations where applicable, runtime validation, and an execute handler. All handlers operate on the same state rendered by the page.

Registration uses an `AbortController` so one failed definition removes the partial tool set. A shared invocation wrapper records compact trace events and isolates rendering errors from completed writes. Agent-facing results exclude individual holdout rows and bundled review reference labels.

## Judge testing

1. Open the live app in ChatGPT's in-app browser.
2. Confirm `WebMCP live / 9 tools` and inspect the tool list.
3. Select `Copy ChatGPT task` and send the prompt.
4. Confirm that two high-entropy tickets appear in `Label review` without assigned labels.
5. Assign both labels in the UI.
6. Ask the agent to train and evaluate. Watch training examples, metrics, history, trace, and ledger update.
7. Ask for a configuration proposal. Confirm the model does not change until `Accept settings` is selected.
8. Inspect learned features, the confusion matrix, and calibration values in `What the classifier learned`.
9. Call `predict_ticket`, then enter another ticket in `Try the current classifier` and check whether the approved threshold sends it to human review.

## Submission checklist

- [x] Public source repository
- [x] Complete source, build instructions, tests, and MIT license
- [x] Imperative `document.modelContext.registerTool` implementation
- [x] Nine non-trivial tools over shared live state
- [x] Human label and configuration approval boundaries
- [x] Required four-part text description
- [x] Verify native registration of all nine tools in Chrome 152
- [ ] Capture a full external-agent invocation cycle in ChatGPT
- [ ] Upload a public YouTube demo shorter than three minutes
- [ ] Confirm entrant age and location eligibility

The official deadline supplied by the challenge is September 3, 2026 at 10:00 PM GMT+2. That is September 4, 2026 at 3:00 AM in Bangkok.

References: [official rules](https://webmcp.devpost.com/rules), [challenge resources](https://webmcp.devpost.com/resources), [Chrome WebMCP documentation](https://developer.chrome.com/docs/ai/webmcp), [OpenAI WebMCP guide](https://learn.chatgpt.com/docs/webmcp).
