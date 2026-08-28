# Devpost submission draft

## Project details

- Project: Seven Transects
- Tagline: A playable test of human approval for browser agents
- Live app: https://leofratu.github.io/oai-hackathon/
- Source: https://github.com/leofratu/oai-hackathon
- Demo video: Add the public YouTube URL after upload
- License: MIT

## Short description

Seven Transects is a rescue-mapping game and WebMCP reference app. A browser agent has seven exact scans of a 12 by 12 island. The person sees a noisy field layer and controls every committed map change. The team must mark 72 cells while keeping precision at or above 88%.

The page registers six imperative WebMCP tools. The tools read bounded state, spend limited scans, stage evidence-backed patches, request a human reading, consume the person's answer, and return a broad safety band. A visible trace records the source and result of each tool call.

## Why this use case fits WebMCP

The game depends on shared live page state and different responsibilities. The agent needs exact, structured evidence and bounded actions. The person needs a visible chart, a review step, and control over committed marks. WebMCP connects these roles without asking the agent to infer the meaning of 144 grid buttons.

`survey_region` returns typed cells and spends a scarce charge. `propose_chart_patch` may stage a change but cannot commit it. `focus_human_attention` pins a question on the chart, and `inspect_chart` returns the person's authorized answer. Each side contributes information the other side does not own.

## Better user experience

The person can see what the agent read, what it changed, and which evidence supports each proposed mark. Exact scans, agent inference, and human readings use separate labels. Risky actions spend visible budgets. The person can accept verified evidence, reject a patch, or accept every proposed cell. Errors remain on the same page instead of being hidden in a model transcript.

## What the person and agent can do together

A normal browser agent could click cells, but it would have no reliable contract for scan budgets, evidence provenance, proposal status, or human answers. Here, the agent can reason over typed survey results while the person interprets the field layer and authorizes state changes. The resulting chart records both contributions.

The app is also a small training and reference project for developers testing approval boundaries, limited agent actions, and shared browser state.

## WebMCP implementation

The top-level page calls `document.modelContext.registerTool` for six tools. Each tool has a JSON Schema, a concise description, runtime validation, and a `readOnlyHint` where applicable. Write tools call the same state functions used by the visible interface. Registration uses an `AbortController` so a failed batch does not leave partial tools registered.

The hidden truth map, seed, and exact live precision are excluded from tool output. Exact and human-reading provenance is checked against completed surveys and recorded answers. Agent proposals remain reversible until a person accepts them.

## Judge testing instructions

1. Open the live app as a top-level page in ChatGPT's in-app browser.
2. Open Site tools in the address bar and confirm six registered tools.
3. Select **Copy ChatGPT mission** and send the copied prompt.
4. Confirm `get_expedition_state` and `inspect_chart` appear as reads in the page trace.
5. Let the agent call `survey_region`. Confirm one scan is spent and exact evidence appears on the chart.
6. Let the agent call `propose_chart_patch`. Choose **Accept verified** and confirm only survey evidence or authorized human readings commit.
7. Answer a question created by `focus_human_attention`, then let the agent call `inspect_chart` to read the answer.
8. Call `consult_compass` and confirm it spends one of two checks without revealing exact mistakes.

Chrome testing requires Chrome 149 or newer with `chrome://flags/#enable-webmcp-testing` enabled.

## Submission checklist

- [x] Public source repository
- [x] Complete source, assets, build instructions, and tests
- [x] MIT license detected by GitHub
- [x] Imperative `document.modelContext.registerTool` implementation
- [x] Working HTTPS deployment
- [x] Required four-part text description
- [ ] Native Site tools check in ChatGPT's in-app browser
- [ ] Public YouTube demo shorter than three minutes
- [ ] Confirm entrant is above the age of majority and not in an excluded location

The official deadline is September 3, 2026 at 1:00 PM PDT. In Bangkok, that is September 4, 2026 at 3:00 AM ICT. Do not change the submitted repository, live site, or Devpost entry after the deadline while judging is active.

Sources: [official rules](https://webmcp.devpost.com/rules), [challenge resources](https://webmcp.devpost.com/resources), [Chrome WebMCP documentation](https://developer.chrome.com/docs/ai/webmcp), [OpenAI Site tools documentation](https://learn.chatgpt.com/docs/webmcp).
