# WebMCP verification record

## Automated checks

Run:

```bash
npm run verify
```

The current suites verify:

- deterministic game generation and scoring;
- scan and consultation budgets;
- proposal staging and human approval;
- exact and human-reading provenance;
- strict runtime validation for bounded inputs;
- exclusion of the truth map, seed, and exact live precision from tool output;
- trace source, read/write class, result, and error behavior;
- registration of all six definitions through a `document.modelContext` contract stub;
- cleanup after partial registration failure; and
- isolation of UI render failures after a completed mutation.

The registration test is a contract test. It does not prove native browser support.

## Native check required before submission

Use ChatGPT's in-app browser, or Chrome 149 or newer with `chrome://flags/#enable-webmcp-testing` enabled.

1. Open the deployed HTTPS URL as the top-level page.
2. Confirm the page badge reads `WebMCP live / 6 tools`.
3. Confirm these tools appear in Site tools or Chrome's WebMCP inspector:
   - `get_expedition_state`
   - `survey_region`
   - `inspect_chart`
   - `propose_chart_patch`
   - `focus_human_attention`
   - `consult_compass`
4. Invoke every tool once through the native interface.
5. Confirm read and write events appear in the visible trace with source `site tool`.
6. Confirm a scan changes the chart and spends one charge.
7. Confirm a patch remains pending until a person accepts it.
8. Confirm a human answer appears in the next `inspect_chart` result.
9. Confirm invalid coordinates, duplicate surveys, omitted rationale, and forged exact evidence return clear errors.
10. Reload and complete one turn from the copied natural-language mission prompt.

Record the native tool list and one full agent-human turn for the demo video. Do not use the local replay as footage of native discovery.

## Current environment limit

The development machine has Chrome 145. The challenge requires Chrome 149 or newer for local WebMCP testing. Automated behavior and registration-contract checks pass here, but the native checklist remains open until it is run in ChatGPT's browser or a supported Chrome build.

References: [Chrome WebMCP](https://developer.chrome.com/docs/ai/webmcp), [imperative API](https://developer.chrome.com/docs/ai/webmcp/imperative-api), [WebMCP debugging](https://developer.chrome.com/docs/devtools/application/webmcp).
