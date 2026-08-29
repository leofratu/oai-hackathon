# Architecture

Label Loop is a client-only Vite application. The model, active-learning pool, review queue, metrics, UI, and WebMCP tools share one in-memory session.

## Runtime layers

1. `src/model.js` implements tokenization, online multinomial Naive Bayes, entropy ranking, evaluation, label provenance, and configuration approval.
2. `src/webmcp.js` exposes seven operations with JSON Schema and records compact read/write trace events.
3. `src/main.js` renders the same state and owns human-only label and configuration decisions.
4. `index.html` and `src/styles.css` provide the training console.

There is no backend, database, account, worker, or external model API. Reloading the page starts a fresh deterministic session.

## State flow

```text
Browser agent -> WebMCP schema -> validated model operation -> shared session -> render
Person        -> visible control -> validated human operation -> shared session -> render
```

Both paths call the same model functions. WebMCP cannot bypass the review queue because `queue_label_review` has no label field and `train_confirmed_batch` only consumes samples in the `confirmed` state.

## Online training

The model keeps counts rather than retraining from scratch. For each confirmed example it increments the class document count and the token counts for that class. Prediction combines the class prior with smoothed token likelihoods, then normalizes the log scores into probabilities.

Normalized predictive entropy ranks review candidates. A fixed nine-item holdout produces aggregate metrics after each training checkpoint. The tool contract does not return holdout rows or answers.

## Trust boundary

The authority boundary is enforced in application code, not by visual convention:

- Agent tools can request labels but cannot submit them.
- Human label controls are not WebMCP tools.
- Training requires a human-confirmed sample state.
- Configuration proposals remain pending until a human UI action accepts them.
- Runtime tool results omit the review pool's reference labels and holdout examples.

The source repository is public, so bundled synthetic data is not a secret. The boundary demonstrates a product permission model, not cryptographic protection against someone modifying their local JavaScript.
