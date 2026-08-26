# Why Seven Transects won the final idea debate

## Decision

Build **Seven Transects**, evolved from the original “Blind Cartographer” concept, instead of the numerical consensus winner Sieve.

## Evidence that changed the ranking

The initial five-agent jury ranked Sieve first, followed by Ctrl-Z City, Retrofit Studio, Roommate Treaty, and Blind Cartographer. A subsequent prior-art check found:

- **Sieve:** the category is mature. ASReview, Rayyan, Covidence, AbstrackR, Colandr, and other products already perform active-learning abstract screening; some already re-rank after each decision and generate PRISMA flows.
- **Ctrl-Z City:** the 2026 Microsoft Research project Pista specifically studies auditable, controllable spreadsheet-agent actions. Linhagem, Rockhopper, TreBranch, and other products already provide spreadsheet diffs, history, rollback, or branching.
- **Retrofit Studio:** automated or AI-assisted accessibility audit/remediation is an active commercial and research category. The human keyboard-verification loop is good, but the base product is familiar.
- **Roommate Treaty:** private-preference rent splitting, fair-division solvers, AI mediation, and AI roommate apps all exist. The WebMCP orchestration is new, but not the job-to-be-done.
- **Blind Cartographer:** existing cartography games share individual ingredients, and the original name is already used by a Valheim mod. No close result combined a browser agent, a human painter, tool-enforced limited information, staged map patches, and explicit human approval.

## What is genuinely distinctive

Seven Transects does not merely let an agent play a human game through tools. The tool surface creates the game:

1. `survey_region` is an epistemic boundary. The agent cannot inspect the truth map and must budget limited evidence.
2. `propose_chart_patch` separates suggestion from commitment. Agent marks are visible but unreal until accepted.
3. Human drawing is not fallback UI; it is a complementary capability used for spatial interpolation.
4. `focus_human_attention` makes agent-to-human handoff a first-class map event.
5. The same page becomes the shared artifact, permission boundary, evidence log, and score board.

This makes the WebMCP implementation non-trivial while keeping the app self-contained and reliable enough for an eight-day build.

## Remaining uniqueness caveat

No search can prove a concept has never been attempted. Nearby precedents include blind-map games, collaborative cartography games, and WebMCP games such as Tic-Tac-Toe demos. The defensible novelty claim is the **combination and interaction contract**, not the invention of map games or hidden information.

## Naming

“Blind Cartographer” was dropped because it is already the name of a Valheim mod and can be misread as referring to disability. “Fogline” was also dropped after a final check found existing games using that name. “Seven Transects” describes the limited survey mechanic directly; an exact-phrase product/game search returned no competing result as of August 26, 2026.
