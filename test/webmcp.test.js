import test from "node:test";
import assert from "node:assert/strict";

import { createGame } from "../src/game.js";
import {
  buildToolDefinitions,
  createToolHandlers,
  formatToolInput,
  registerWebMCP,
  summarizeToolEvent,
} from "../src/webmcp.js";

test("all six handlers emit compact read/write trace events", async () => {
  const state = createGame("trace-contract");
  const events = [];
  let changes = 0;
  const handlers = createToolHandlers(
    () => state,
    () => {
      changes += 1;
    },
    (event) => events.push(event),
  );

  await handlers.get_expedition_state();
  const survey = await handlers.survey_region({ row: 6, column: 6 });
  await handlers.inspect_chart();
  await handlers.propose_chart_patch({
    cells: [{ ...survey.rowTransect[0], confidence: 1, basis: "exact" }],
    rationale: "Exercise the review boundary.",
  });
  await handlers.focus_human_attention({ row: 7, column: 7, note: "What does your lens suggest?" });
  await handlers.consult_compass();

  assert.deepEqual(
    events.map(({ name, access, status }) => ({ name, access, status })),
    [
      { name: "get_expedition_state", access: "read", status: "success" },
      { name: "survey_region", access: "write", status: "success" },
      { name: "inspect_chart", access: "read", status: "success" },
      { name: "propose_chart_patch", access: "write", status: "success" },
      { name: "focus_human_attention", access: "write", status: "success" },
      { name: "consult_compass", access: "write", status: "success" },
    ],
  );
  assert.equal(changes, 4);
  assert.equal(JSON.stringify(events).includes('"truth"'), false);
  assert.equal(JSON.stringify(events).includes("trace-contract"), false);
});

test("failed tools are traced and preserve the original error", async () => {
  const state = createGame("trace-errors");
  const events = [];
  let changes = 0;
  const handlers = createToolHandlers(
    () => state,
    () => {
      changes += 1;
    },
    (event) => events.push(event),
  );

  await assert.rejects(handlers.survey_region({ row: 0, column: 99 }), /row must be an integer/);
  assert.equal(changes, 0);
  assert.equal(events.length, 1);
  assert.equal(events[0].status, "error");
  assert.equal(events[0].access, "write");
});

test("a broken trace observer cannot break a successful tool call", async () => {
  const state = createGame("observer-isolation");
  const originalConsoleError = console.error;
  console.error = () => {};
  try {
    const handlers = createToolHandlers(
      () => state,
      () => {},
      () => {
        throw new Error("renderer failed");
      },
    );
    const result = await handlers.get_expedition_state();
    assert.equal(result.surveysRemaining, 7);
  } finally {
    console.error = originalConsoleError;
  }
});

test("trace projections stay concise and allowlisted", () => {
  assert.equal(formatToolInput("survey_region", { row: 6, column: 9 }), "{ row: 6, column: 9 }");
  assert.equal(formatToolInput("inspect_chart", {}), "{}");
  assert.equal(
    summarizeToolEvent({
      name: "inspect_chart",
      result: { committedCells: [{}, {}], humanObservations: [{}] },
    }),
    "2 committed · 1 human readings",
  );
});

test("native registration exposes every definition and reports WebMCP status", async () => {
  const registered = [];
  const statuses = [];
  const previousDocument = globalThis.document;
  globalThis.document = {
    modelContext: {
      registerTool: async (definition) => registered.push(definition.name),
    },
  };

  try {
    const handlers = createToolHandlers(() => createGame("registration"), () => {});
    const definitions = buildToolDefinitions(handlers);
    const connected = await registerWebMCP(definitions, (status) => statuses.push(status));
    assert.equal(connected, true);
    assert.equal(registered.length, 6);
    assert.deepEqual(statuses, [{ state: "ready", message: "WebMCP connected · 6 tools" }]);
  } finally {
    globalThis.document = previousDocument;
  }
});
