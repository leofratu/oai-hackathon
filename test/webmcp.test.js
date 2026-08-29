import test from "node:test";
import assert from "node:assert/strict";

import { confirmHumanLabel, createTrainingSession } from "../src/model.js";
import {
  buildToolDefinitions,
  createToolHandlers,
  formatToolInput,
  registerWebMCP,
  summarizeToolEvent,
} from "../src/webmcp.js";

test("all nine handlers emit compact read and write trace events", async () => {
  const state = createTrainingSession();
  const events = [];
  let changes = 0;
  const handlers = createToolHandlers(() => state, () => { changes += 1; }, (event) => events.push(event));

  await handlers.get_training_state();
  const uncertain = await handlers.inspect_uncertain_samples({ limit: 2 });
  await handlers.queue_label_review({ sampleIds: [uncertain.samples[0].id], note: "Request one uncertain label." });
  confirmHumanLabel(state, uncertain.samples[0].id, "billing");
  await handlers.train_confirmed_batch({ maximum: 1 });
  await handlers.evaluate_model();
  await handlers.propose_model_config({ alpha: 0.8, reviewThreshold: 0.78, rationale: "Test staged settings." });
  await handlers.inspect_training_history();
  await handlers.predict_ticket({ text: "The export button crashes" });
  await handlers.inspect_model_diagnostics({ featureLimit: 4 });

  assert.deepEqual(events.map(({ name, access, status }) => ({ name, access, status })), [
    { name: "get_training_state", access: "read", status: "success" },
    { name: "inspect_uncertain_samples", access: "read", status: "success" },
    { name: "queue_label_review", access: "write", status: "success" },
    { name: "train_confirmed_batch", access: "write", status: "success" },
    { name: "evaluate_model", access: "read", status: "success" },
    { name: "propose_model_config", access: "write", status: "success" },
    { name: "inspect_training_history", access: "read", status: "success" },
    { name: "predict_ticket", access: "read", status: "success" },
    { name: "inspect_model_diagnostics", access: "read", status: "success" },
  ]);
  assert.equal(changes, 3);
  assert.equal(JSON.stringify(events).includes("groundTruth"), false);
});

test("failed tools are traced without rendering a mutation", async () => {
  const state = createTrainingSession();
  const events = [];
  let changes = 0;
  const handlers = createToolHandlers(() => state, () => { changes += 1; }, (event) => events.push(event));
  await assert.rejects(
    handlers.queue_label_review({ sampleIds: ["missing"], note: "Invalid sample." }),
    /Unknown sample/,
  );
  assert.equal(changes, 0);
  assert.equal(events[0].status, "error");
  assert.equal(events[0].access, "write");
});

test("trace projections stay concise", () => {
  assert.equal(formatToolInput("inspect_uncertain_samples", { limit: 3 }), "{ limit: 3 }");
  assert.equal(formatToolInput("evaluate_model", {}), "{}");
  assert.equal(
    summarizeToolEvent({ name: "evaluate_model", result: { accuracy: 0.8, macroF1: 0.75 } }),
    "80% accuracy / 75% macro F1",
  );
});

test("registration exposes all definitions and reports native status", async () => {
  const registered = [];
  const signals = [];
  const statuses = [];
  const previousDocument = globalThis.document;
  globalThis.document = {
    modelContext: {
      async registerTool(definition, options) {
        registered.push(definition.name);
        signals.push(options.signal);
      },
    },
  };
  try {
    const handlers = createToolHandlers(() => createTrainingSession(), () => {});
    const connected = await registerWebMCP(buildToolDefinitions(handlers), (status) => statuses.push(status));
    assert.equal(connected, true);
    assert.equal(registered.length, 9);
    assert.ok(signals.every((signal) => signal instanceof AbortSignal && !signal.aborted));
    assert.deepEqual(statuses, [{ state: "ready", message: "WebMCP live / 9 tools" }]);
  } finally {
    globalThis.document = previousDocument;
  }
});

test("registration aborts partial tools after a failure", async () => {
  const statuses = [];
  const signals = [];
  const previousDocument = globalThis.document;
  const previousConsoleError = console.error;
  console.error = () => {};
  globalThis.document = {
    modelContext: {
      async registerTool(definition, options) {
        signals.push(options.signal);
        if (definition.name === "evaluate_model") throw new Error("invalid schema");
      },
    },
  };
  try {
    const handlers = createToolHandlers(() => createTrainingSession(), () => {});
    const connected = await registerWebMCP(buildToolDefinitions(handlers), (status) => statuses.push(status));
    assert.equal(connected, false);
    assert.ok(signals.every((signal) => signal.aborted));
    assert.deepEqual(statuses, [{ state: "error", message: "WebMCP registration failed" }]);
  } finally {
    globalThis.document = previousDocument;
    console.error = previousConsoleError;
  }
});

test("render failures do not turn completed writes into failed tool calls", async () => {
  const state = createTrainingSession();
  const events = [];
  const previousConsoleError = console.error;
  console.error = () => {};
  const handlers = createToolHandlers(
    () => state,
    () => { throw new Error("render failed"); },
    (event) => events.push(event),
  );
  try {
    const uncertain = await handlers.inspect_uncertain_samples({ limit: 1 });
    const result = await handlers.queue_label_review({ sampleIds: [uncertain.samples[0].id], note: "Test rendering isolation." });
    assert.equal(result.ok, true);
    assert.equal(state.reviewQueue.length, 1);
    assert.equal(events.at(-1).status, "success");
  } finally {
    console.error = previousConsoleError;
  }
});
