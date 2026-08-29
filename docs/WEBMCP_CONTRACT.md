# WebMCP contract

Label Loop registers nine imperative site tools through `document.modelContext.registerTool`.

| Tool | Access | Contract |
|---|---|---|
| `get_training_state` | Read | Returns model family, labels, counts, configuration, queue, metrics, and collaboration rules. |
| `inspect_uncertain_samples` | Read | Returns up to eight unlabeled tickets ranked by normalized predictive entropy. |
| `queue_label_review` | Write | Moves one to three selected tickets into the human review queue. It cannot assign labels. |
| `train_confirmed_batch` | Write | Incrementally trains on samples whose labels were confirmed through the human UI. |
| `evaluate_model` | Read | Returns aggregate holdout metrics and per-class precision, recall, and F1. |
| `propose_model_config` | Write | Stages Laplace alpha and low-confidence review threshold settings with a rationale. |
| `inspect_training_history` | Read | Returns metric checkpoints and the provenance of trained samples. |
| `predict_ticket` | Read | Classifies new text and returns probabilities, entropy, threshold, and the route-or-review decision. |
| `inspect_model_diagnostics` | Read | Returns learned feature weights, aggregate confusion counts, calibration gap, and log loss. |

## Invariants

- A review request contains sample IDs and a note, never a label.
- Only samples in `confirmed` state can enter a training batch.
- At most three samples can be queued for review at once.
- A second queue cannot replace unresolved human work.
- Configuration proposals do not change the model until the person accepts them.
- Individual holdout examples, holdout labels, and review reference labels are excluded from agent-facing results.
- All inputs are checked again at runtime after JSON Schema validation.

## Trace

Every handler passes through one invocation boundary. The trace includes the tool name, access class, source, compact input, status, and a short allowlisted summary. It never serializes the entire state or result.

Completed writes remain completed if trace or UI rendering fails. Tool failures are traced and rethrown.

## Registration and cleanup

All tools receive the same `AbortController` signal during registration. If one definition fails, the signal aborts the partial set. The app reports native, fallback, or failed status in the header.

## Fallback

`Run local tool replay` invokes the same handlers in a normal browser. The source column reads `local replay`. This path tests state changes and the UI but does not replace native discovery by an external agent.
