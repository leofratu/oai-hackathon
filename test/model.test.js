import test from "node:test";
import assert from "node:assert/strict";

import {
  LABELS,
  confirmHumanLabel,
  createTrainingSession,
  evaluateModel,
  inspectTrainingHistory,
  inspectUncertainSamples,
  predictText,
  proposeModelConfig,
  queueLabelReview,
  resolveConfigProposal,
  trainConfirmedBatch,
  trainingStateForAgent,
} from "../src/model.js";

test("the seed model is deterministic and returns normalized probabilities", () => {
  const first = createTrainingSession();
  const second = createTrainingSession();
  assert.deepEqual(evaluateModel(first), evaluateModel(second));
  assert.equal(first.model.examplesSeen, 9);
  const prediction = predictText(first, "My login email has not arrived");
  assert.ok(LABELS.includes(prediction.label));
  assert.ok(prediction.confidence > 0 && prediction.confidence <= 1);
  assert.ok(prediction.entropy >= 0 && prediction.entropy <= 1);
  const total = Object.values(prediction.probabilities).reduce((sum, value) => sum + value, 0);
  assert.ok(Math.abs(total - 1) < 1e-10);
});

test("uncertainty inspection never returns hidden labels", () => {
  const state = createTrainingSession();
  const result = inspectUncertainSamples(state, { limit: 4 });
  assert.equal(result.samples.length, 4);
  assert.ok(result.samples[0].prediction.entropy >= result.samples[1].prediction.entropy);
  assert.equal(JSON.stringify(result).includes("groundTruth"), false);
  assert.throws(() => inspectUncertainSamples(state, { limit: 9 }), /limit must be/);
});

test("an agent can request labels but cannot assign them", () => {
  const state = createTrainingSession();
  const uncertain = inspectUncertainSamples(state, { limit: 2 });
  const ids = uncertain.samples.map((sample) => sample.id);
  const queued = queueLabelReview(state, { sampleIds: ids, note: "Highest entropy samples." });
  assert.equal(queued.queuedSamples.length, 2);
  assert.equal(state.reviewQueue.length, 2);
  assert.ok(queued.queuedSamples.every((sample) => sample.humanLabel === null));
  assert.throws(
    () => queueLabelReview(state, { sampleIds: ["ticket-103"], note: "Second queue." }),
    /Resolve the current human review queue/,
  );
});

test("training consumes human-confirmed labels only", () => {
  const state = createTrainingSession();
  assert.throws(() => trainConfirmedBatch(state), /No human-confirmed labels/);
  queueLabelReview(state, { sampleIds: ["ticket-101"], note: "Review one sample." });
  assert.throws(() => trainConfirmedBatch(state), /No human-confirmed labels/);
  confirmHumanLabel(state, "ticket-101", "billing");
  const trained = trainConfirmedBatch(state);
  assert.deepEqual(trained.trainedSampleIds, ["ticket-101"]);
  assert.equal(state.model.examplesSeen, 10);
  assert.equal(state.samples.find((sample) => sample.id === "ticket-101").status, "trained");
  assert.equal(state.trainingHistory.length, 2);
});

test("model configuration remains pending until human approval", () => {
  const state = createTrainingSession();
  const proposal = proposeModelConfig(state, {
    alpha: 0.6,
    reviewThreshold: 0.8,
    rationale: "Reduce smoothing after more labels arrive.",
  });
  assert.equal(proposal.status, "awaiting_human_approval");
  assert.equal(state.config.alpha, 1);
  resolveConfigProposal(state, true);
  assert.equal(state.config.alpha, 0.6);
  assert.equal(state.config.reviewThreshold, 0.8);
  assert.equal(state.configProposal.status, "accepted");
});

test("agent state and history expose metrics without holdout answers", () => {
  const state = createTrainingSession();
  const publicState = trainingStateForAgent(state);
  const history = inspectTrainingHistory(state);
  assert.equal(publicState.metrics.holdoutSize, 9);
  assert.equal("samples" in publicState, false);
  assert.equal(JSON.stringify(publicState).includes("groundTruth"), false);
  assert.equal(JSON.stringify(history).includes("groundTruth"), false);
  assert.equal(JSON.stringify(history).includes("card statement"), false);
});
