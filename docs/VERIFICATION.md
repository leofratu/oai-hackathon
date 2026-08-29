# Verification

## Automated check

Run:

```bash
npm run verify
```

The command verifies:

- deterministic seed training and normalized probabilities;
- entropy ordering and review batch limits;
- exclusion of reference labels from tool output;
- rejection of training without human-confirmed labels;
- incremental count updates and metric checkpoints;
- configuration proposal and human approval behavior;
- all nine read/write trace events and concise summaries;
- native registration against a `document.modelContext` contract stub;
- cleanup after partial registration failure;
- a browser workflow covering uncertainty, review, training, evaluation, and configuration approval; and
- a production Vite build.

## Native browser check

Use ChatGPT's in-app browser or Chrome with `chrome://flags/#enable-webmcp-testing` enabled.

1. Open the deployed HTTPS URL as the top-level page.
2. Confirm the badge reads `WebMCP live / 9 tools`.
3. Confirm the browser lists the nine tool names in [WEBMCP_CONTRACT.md](WEBMCP_CONTRACT.md).
4. Call `get_training_state` and confirm the trace source reads `site tool`.
5. Call `inspect_uncertain_samples` with a limit of 3.
6. Queue two returned IDs with `queue_label_review`.
7. Confirm that the agent did not assign either label.
8. Label both tickets in the page UI.
9. Call `train_confirmed_batch`, then `evaluate_model` and `inspect_training_history`.
10. Call `inspect_model_diagnostics` and verify learned tokens and aggregate confusion counts.
11. Call `predict_ticket` on new text and verify the probabilities and review decision.
12. Stage settings with `propose_model_config` and confirm the values remain unchanged until the person accepts them.

Record the native tool list and one human-agent training cycle for the submission video. Local replay footage must retain its visible source label.

## Current native result

On August 29, 2026, the deployed page was opened in Chrome 152 with WebMCP enabled. `document.modelContext` was present, `registerTool` was a function, and the app completed registration with the badge `WebMCP live / 9 tools`. The registered definitions contained six reads and three writes, including model diagnostics and direct inference. The console remained free of errors. A final external-agent invocation capture in ChatGPT is still required for the submission video.
