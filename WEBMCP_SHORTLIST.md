# WebMCP Challenge: Cross-Agent Shortlist

Generated on 2026-08-26 from 150 ideas produced by five independent OpenCode/OxAlpha sessions. Each session nominated five ideas, then all five sessions scored the same 25 semifinalists without favoring their own batch.

## Method

Each judge scored six dimensions from 1–10:

- WebMCP leverage: 30%
- Credible eight-day execution: 20%
- Real-world impact: 20%
- Creativity: 15%
- Three-minute demo clarity: 10%
- Risk control: 5%

Judges were told to penalize generic agents, backend APIs disguised as browser apps, dependence on third-party sites that do not expose WebMCP, mock-heavy integrations, regulated-domain liability, and simulated demo outcomes.

## Consensus ranking

| Rank | Idea | Mean /100 | Judge spread | Read |
|---:|---|---:|---:|---|
| 1 | Sieve | 74.2 | 71–78 | Strongest consensus; real users/data and a dense human-feedback loop |
| 2 | Ctrl-Z City | 72.8 | 65–77 | Most memorable trust/reversibility concept; heavier build |
| 3 | Retrofit Studio | 72.7 | 69–76.5 | Best physical verification loop; narrow the fix library |
| 4 | Roommate Treaty | 71.8 | 65–77 | Novel multi-user negotiation; fairness is the product claim |
| 5 | Blind Cartographer | 70.0 | 66–78 | Best scope-to-novelty ratio; impact score is deliberately lower |
| 6 | HandOverHand | 69.4 | 66–75.5 | Emotionally strong consent-and-learning loop |
| 7 | Earshot | 67.3 | 64–74.5 | Excellent accessibility thesis; must work with real assistive tech |
| 8 | DSAR Line | 66.7 | 51–77.5 | Deep spec leverage, but mock SaaS integration scope divided judges |
| 9 | CanonLock | 66.5 | 60–72.5 | Polished and feasible, though less category-defining |
| 10 | LoreTable | 66.2 | 59.5–73 | Highly watchable shared experience; latency is critical |
| 11 | Consent Ledger | 63.7 | 56–77.5 | Brilliant browser demo, but judges disagreed on WebMCP vs extension mechanics |
| 12 | Healer | 62.2 | 50–73.5 | Visually verifiable, with substantial existing prior art |
| 13 | CliffEdge | 61.6 | 55–68.5 | High impact, but regulated data and calculator-in-disguise risks |
| 14 | DataDesk | 61.5 | 51–67.5 | Executable, but crowded BI/copilot territory |
| 15 | AppealAid | 60.5 | 58.5–62 | Consistently impactful, consistently penalized for liability/integration |
| 16 | Escalation Booth | 60.3 | 54–73.5 | Good pattern, but too abstract until tied to one task domain |
| 17 | DischargeDeck | 58.1 | 55–63 | Strong story, dangerous medical/logistics breadth |
| 18 | EmberPlan | 57.7 | 48.5–64.5 | Compelling map, but life-safety and live-data risk |
| 19 | PlanPilot | 55.0 | 49–64 | Useful but actuarial and third-party portal dependence hurt it |
| 20 | Migration Choreographer | 54.1 | 47.5–60.5 | Backend-heavy and difficult to make genuinely WebMCP-native |
| 21 | Key Carousel | 52.5 | 45.5–61 | Great theater, unrealistic infrastructure for eight days |
| 22 | SeatSense | 51.0 | 45–58.5 | Clear demo but depends on airline cooperation or fixtures |
| 23 | BasketScout | 50.3 | 45.5–56.5 | Relatable, but retailer integration makes it mock-heavy |
| 24 | SlotSniper | 49.7 | 45.5–57.5 | Strong pain point, weak ownership of the required tool surface |
| 25 | AwardAlchemy | 45.6 | 38.5–50 | Dynamic loyalty data and third-party booking make it impractical |

## Best five and their kill tests

### 1. Sieve — safest overall bet

Researchers screen abstracts while the agent explains confidence and rationale. Each human override updates visible inclusion/exclusion rules and changes the ordering of later abstracts; a PRISMA flow diagram updates live.

Kill test: after one or two human overrides, can judges see later ranking and rationales genuinely change? If the rules are cosmetic prompt text, it becomes an ordinary classifier.

Eight-day MVP: one PubMed query, 150–300 abstracts, five tools (`get_next_batch`, `submit_screening_decision`, `derive_rule_update`, `list_active_rules`, `generate_prisma_snapshot`), editable rule cards, live PRISMA counts, CSV export. Cut collaboration, query builders, and multiple databases.

### 2. Ctrl-Z City — strongest creative bet

Every spreadsheet action an agent takes is an immutable structured operation rendered as a building. The human inspects exact diffs, rewinds to any operation, forks, compares branches, and cherry-picks good changes.

Kill test: if the city is only decoration over a conventional undo list, the idea collapses. Every visual object must directly control provenance, rollback, or branching.

Eight-day MVP: values-only grid, one seeded budget, five write/rollback tools, CSS isometric blocks, two branches, exact diffs. Do not build formulas, multiplayer, import/export, or a 3D engine.

### 3. Retrofit Studio — strongest browser-native impact bet

The agent audits an owned target page, proposes an accessibility patch as a visible diff, and the human keyboard-tests the live preview before approving and propagating the fix.

Kill test: it must fix at least one structural problem such as a modal focus trap; alt text and contrast alone will look like axe-core with agent branding.

Eight-day MVP: one owned registration app with five seeded violation classes; `run_axe_audit`, `propose_fix`, `apply_fix`, `verify_fix`, and `batch_apply_pattern`; diff overlay, keyboard checklist, and re-audit. Do not claim arbitrary-site support.

### 4. Roommate Treaty — strongest multi-human concept

Each roommate privately supplies valuations in a separate tab. The agent proposes a Pareto-improving rent/chore allocation, explains the trade, accepts amendments, and requires unanimous signoff.

Kill test: one obviously unfair or Pareto-dominated proposal destroys trust. The solver and truthful explanation need deterministic tests before visual polish.

Eight-day MVP: three scripted roommates, five chores, rent split, private valuation tools, two proposal rounds, comparison cards, unanimous signatures. Avoid payments and legal-contract language.

### 5. Blind Cartographer — strongest scope-to-wow concept

The page's typed tools enforce an asymmetric-information game: the agent can answer only bounded terrain probes while the human paints a hidden island map and iteratively corrects mismatches.

Kill test: five probe exchanges must produce visible progress without leaking the answer. If the loop is confusing or slow, novelty will not save it.

Eight-day MVP: one 24×24 grid, five terrain classes, one landmark, four tools, a paint canvas, score, and mismatch overlay. Cut accounts, multiplayer, audio, and difficulty modes.

## Recommendation

Build **Sieve** if the goal is the highest consensus probability of a polished, credible submission. It had the highest average score and the lowest disagreement among the top five, uses real public data, avoids third-party WebMCP dependencies, and demonstrates repeated human-agent collaboration in a short demo.

Choose **Ctrl-Z City** instead if visual/product engineering is the team's strength and the goal is maximum memorability. Choose **Blind Cartographer** if schedule certainty and novelty matter more than direct social impact. Retrofit Studio is the best mission-driven alternative, provided the team can validate fixes with real keyboard and screen-reader behavior.

## Jury winners

The five independent panels selected different winners:

1. Sieve
2. Retrofit Studio
3. Ctrl-Z City
4. Consent Ledger
5. Blind Cartographer

That disagreement is informative: Sieve won the average through consistency, while the others are higher-variance bets with a sharper specialty.
