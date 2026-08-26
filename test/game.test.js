import test from "node:test";
import assert from "node:assert/strict";

import {
  GRID_SIZE,
  CONSULT_LIMIT,
  MAX_PENDING_PROPOSALS,
  SURVEY_RADIUS,
  SURVEY_LIMIT,
  acceptProposal,
  answerHumanFocus,
  consultChart,
  createGame,
  expeditionStateForAgent,
  finishExpedition,
  focusHumanAttention,
  generateIsland,
  inspectChart,
  paintCell,
  proposeChartPatch,
  rejectProposal,
  scoreDraft,
  surveyRegion,
  toIndex,
} from "../src/game.js";

test("island generation is deterministic and uses valid terrain", () => {
  const first = generateIsland("northstar");
  const second = generateIsland("northstar");
  const different = generateIsland("southern-cross");

  assert.deepEqual(first, second);
  assert.notDeepEqual(first, different);
  assert.equal(first.length, GRID_SIZE * GRID_SIZE);
  assert.ok(first.every((terrain) => ["water", "meadow", "forest", "ridge"].includes(terrain)));
  assert.ok(first.filter((terrain) => terrain === "water").length > 20);
  assert.ok(first.filter((terrain) => terrain !== "water").length > 20);
});

test("survey spends one charge and returns bounded exact transects", () => {
  const game = createGame("survey-test");
  const result = surveyRegion(game, { row: 6, column: 6, radius: 2 });

  assert.equal(game.surveysRemaining, SURVEY_LIMIT - 1);
  assert.equal(result.radius, SURVEY_RADIUS);
  assert.equal(result.rowTransect.length, 5);
  assert.equal(result.columnTransect.length, 5);
  assert.equal(result.rowTransect[2].row, 6);
  assert.equal(result.rowTransect[2].column, 6);
  assert.equal(result.rowTransect[2].terrain, game.truth[toIndex(6, 6)]);
  assert.equal(Object.values(result.surroundingHistogram).reduce((sum, value) => sum + value, 0), 25);
});

test("survey validates coordinates and cannot exceed its budget", () => {
  const game = createGame("budget-test");
  assert.throws(() => surveyRegion(game, { row: 0, column: 4 }), /row must be/);

  for (let index = 0; index < SURVEY_LIMIT; index += 1) {
    surveyRegion(game, { row: 1 + index, column: 6, radius: 1 });
  }
  assert.equal(game.surveysRemaining, 0);
  assert.throws(() => surveyRegion(game, { row: 6, column: 6 }), /No survey charges/);
});

test("a survey center cannot be farmed twice", () => {
  const game = createGame("repeat-test");
  surveyRegion(game, { row: 6, column: 6 });
  assert.throws(() => surveyRegion(game, { row: 6, column: 6 }), /already been surveyed/);
  assert.equal(game.surveysRemaining, SURVEY_LIMIT - 1);
});

test("all seven exact transects still require human-supported interpolation to win", () => {
  const game = createGame("teamwork-test");
  const centers = [[2, 2], [2, 6], [2, 10], [6, 4], [6, 9], [10, 3], [10, 8]];
  for (const [row, column] of centers) {
    const survey = surveyRegion(game, { row, column });
    const unique = new Map();
    for (const cell of [...survey.rowTransect, ...survey.columnTransect]) {
      unique.set(`${cell.row}:${cell.column}`, { ...cell, confidence: 1, basis: "exact" });
    }
    const proposal = proposeChartPatch(game, {
      cells: [...unique.values()],
      rationale: "Commit every exact sounding.",
    });
    acceptProposal(game, proposal.proposalId);
  }
  const score = scoreDraft(game);
  assert.equal(score.accuracy, 1);
  assert.ok(score.coverage < score.coverageTarget);
  assert.equal(score.won, false);
});

test("agent proposals are staged and cannot mutate committed marks before human approval", () => {
  const game = createGame("consent-test");
  const truth = game.truth[toIndex(6, 6)];
  const proposal = proposeChartPatch(game, {
    cells: [{ row: 6, column: 6, terrain: truth, confidence: 0.95 }],
    rationale: "Exact center sounding.",
  });

  assert.equal(game.draft[toIndex(6, 6)], null);
  assert.equal(proposal.status, "awaiting_human_review");
  assert.equal(inspectChart(game).pendingProposals.length, 1);

  acceptProposal(game, proposal.proposalId);
  assert.deepEqual(game.draft[toIndex(6, 6)], {
    terrain: truth,
    source: "agent-approved",
    confidence: 0.95,
    basis: "inferred",
  });
});

test("score separates chart coverage from precision", () => {
  const game = createGame("score-test");
  const firstTruth = game.truth[toIndex(1, 1)];
  const wrongTerrain = ["water", "meadow", "forest", "ridge"].find((terrain) => terrain !== firstTruth);

  paintCell(game, 1, 1, firstTruth);
  paintCell(game, 1, 2, wrongTerrain);
  const score = scoreDraft(game);

  assert.equal(score.marked, 2);
  assert.equal(score.correct, 1);
  assert.equal(score.accuracy, 0.5);
  assert.equal(score.coverage, 2 / (GRID_SIZE * GRID_SIZE));
  assert.equal(score.won, false);
});

test("proposal input is narrow and deduplicates repeated coordinates", () => {
  const game = createGame("schema-test");
  const proposal = proposeChartPatch(game, {
    cells: [
      { row: 3, column: 3, terrain: "forest", confidence: 0.4 },
      { row: 3, column: 3, terrain: "ridge", confidence: 0.8 },
    ],
    rationale: "Revised inference.",
  });

  const staged = game.proposals.find((item) => item.id === proposal.proposalId);
  assert.equal(staged.cells.length, 1);
  assert.equal(staged.cells[0].terrain, "ridge");
  assert.throws(
    () =>
      proposeChartPatch(game, {
        cells: [{ row: 2, column: 2, terrain: "lava" }],
        rationale: "Invalid terrain.",
      }),
    /terrain must be one of/,
  );
});

test("compass consultations are bounded and never expose exact correctness before reveal", () => {
  const game = createGame("consult-test");
  paintCell(game, 1, 1, game.truth[toIndex(1, 1)]);
  for (let index = 0; index < CONSULT_LIMIT; index += 1) {
    const result = consultChart(game);
    assert.equal("precision" in result, false);
    assert.equal("correct" in result, false);
    assert.equal(typeof result.band.label, "string");
  }
  assert.throws(() => consultChart(game), /No compass consultations/);
});

test("human field readings form a structured handoff back to the agent", () => {
  const game = createGame("handoff-test");
  focusHumanAttention(game, {
    row: 4,
    column: 7,
    note: "Does the lens show canopy or relief?",
    options: ["forest", "ridge"],
  });
  assert.throws(() => focusHumanAttention(game, { row: 5, column: 5, note: "Spam" }), /already awaiting/);
  const answer = answerHumanFocus(game, "forest", 0.68);
  assert.equal(answer.observation.terrain, "forest");
  assert.equal(inspectChart(game).humanObservations.length, 1);
  assert.equal(game.focus, null);
});

test("agent state withholds the seed and exact live precision", () => {
  const game = createGame("private-seed");
  paintCell(game, 1, 1, game.truth[toIndex(1, 1)]);
  const publicState = expeditionStateForAgent(game);
  assert.equal("seed" in publicState, false);
  assert.equal("precision" in publicState.chart, false);
});

test("proposal queue is bounded and acceptance rechecks live conflicts", () => {
  const game = createGame("queue-test");
  for (let index = 0; index < MAX_PENDING_PROPOSALS; index += 1) {
    proposeChartPatch(game, {
      cells: [{ row: 1, column: index + 1, terrain: "water", confidence: 0.9, basis: "exact" }],
      rationale: `Patch ${index + 1}`,
    });
  }
  assert.throws(
    () => proposeChartPatch(game, { cells: [{ row: 2, column: 2, terrain: "forest" }], rationale: "Too many" }),
    /Resolve a pending proposal/,
  );

  const proposalId = game.proposals[0].id;
  paintCell(game, 1, 1, "ridge");
  assert.throws(() => acceptProposal(game, proposalId), /now conflict/);
  acceptProposal(game, proposalId, { allowOverwrite: true });
  assert.equal(game.proposals[0].status, "accepted");
});

test("finishing freezes every mutating action", () => {
  const game = createGame("freeze-test");
  const proposal = proposeChartPatch(game, {
    cells: [{ row: 4, column: 4, terrain: "forest" }],
    rationale: "Pending at finish",
  });
  finishExpedition(game);
  assert.throws(() => acceptProposal(game, proposal.proposalId), /already finished/);
  assert.throws(() => rejectProposal(game, proposal.proposalId), /already finished/);
  assert.throws(() => surveyRegion(game, { row: 6, column: 6 }), /already finished/);
  assert.throws(() => focusHumanAttention(game, { row: 3, column: 3, note: "Too late" }), /already finished/);
  paintCell(game, 1, 1, "water");
  assert.equal(game.draft[toIndex(1, 1)], null);
});
