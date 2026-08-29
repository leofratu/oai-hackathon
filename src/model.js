export const LABELS = Object.freeze(["billing", "bug", "access"]);
export const MAX_REVIEW_BATCH = 3;

export const SEED_EXAMPLES = Object.freeze([
  { id: "seed-01", text: "I was charged twice for the same monthly plan", label: "billing" },
  { id: "seed-02", text: "Please send an invoice with our company tax details", label: "billing" },
  { id: "seed-03", text: "My refund still has not reached the card", label: "billing" },
  { id: "seed-04", text: "The dashboard crashes whenever I upload a CSV", label: "bug" },
  { id: "seed-05", text: "The save button freezes after editing a report", label: "bug" },
  { id: "seed-06", text: "Exported charts are missing the final column", label: "bug" },
  { id: "seed-07", text: "My sign in code never arrives", label: "access" },
  { id: "seed-08", text: "An invited teammate cannot open the workspace", label: "access" },
  { id: "seed-09", text: "The password reset link says it has expired", label: "access" },
]);

export const REVIEW_EXAMPLES = Object.freeze([
  { id: "ticket-101", text: "The renewal price changed but there is no new invoice", groundTruth: "billing" },
  { id: "ticket-102", text: "I can log in on mobile but the desktop session rejects me", groundTruth: "access" },
  { id: "ticket-103", text: "Uploading a second attachment deletes the first one", groundTruth: "bug" },
  { id: "ticket-104", text: "A former employee still has access after removal", groundTruth: "access" },
  { id: "ticket-105", text: "The annual plan was billed before the trial ended", groundTruth: "billing" },
  { id: "ticket-106", text: "Search returns a blank screen for archived projects", groundTruth: "bug" },
  { id: "ticket-107", text: "We need the receipt split across two cost centers", groundTruth: "billing" },
  { id: "ticket-108", text: "Single sign on loops back to the login page", groundTruth: "access" },
  { id: "ticket-109", text: "Rows duplicate when I sort by the status column", groundTruth: "bug" },
  { id: "ticket-110", text: "The coupon applied but the card was charged full price", groundTruth: "billing" },
  { id: "ticket-111", text: "The owner role disappeared after changing my email", groundTruth: "access" },
  { id: "ticket-112", text: "Notification settings reset every time the page reloads", groundTruth: "bug" },
]);

export const HOLDOUT_EXAMPLES = Object.freeze([
  { text: "The card statement shows an extra subscription payment", label: "billing" },
  { text: "Can you correct the address printed on our receipt", label: "billing" },
  { text: "The credit from our cancellation is missing", label: "billing" },
  { text: "The analytics page crashes after choosing a date", label: "bug" },
  { text: "Downloaded files contain duplicated records", label: "bug" },
  { text: "The modal stays open after I press confirm", label: "bug" },
  { text: "The authentication email does not arrive", label: "access" },
  { text: "My workspace says permission denied", label: "access" },
  { text: "The login reset token is no longer valid", label: "access" },
]);

function tokenize(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 1);
}

function assertLabel(label) {
  if (!LABELS.includes(label)) throw new TypeError(`label must be one of: ${LABELS.join(", ")}.`);
}

function assertFiniteNumber(value, name, minimum, maximum) {
  if (!Number.isFinite(value) || value < minimum || value > maximum) {
    throw new RangeError(`${name} must be a number from ${minimum} to ${maximum}.`);
  }
}

function createEmptyModel() {
  return {
    documentCounts: Object.fromEntries(LABELS.map((label) => [label, 0])),
    tokenCounts: Object.fromEntries(LABELS.map((label) => [label, {}])),
    tokenTotals: Object.fromEntries(LABELS.map((label) => [label, 0])),
    vocabulary: {},
    examplesSeen: 0,
  };
}

function trainOne(model, text, label) {
  assertLabel(label);
  model.documentCounts[label] += 1;
  model.examplesSeen += 1;
  for (const token of tokenize(text)) {
    model.vocabulary[token] = true;
    model.tokenCounts[label][token] = (model.tokenCounts[label][token] || 0) + 1;
    model.tokenTotals[label] += 1;
  }
}

function softmax(logScores) {
  const maximum = Math.max(...Object.values(logScores));
  const exponentials = Object.fromEntries(
    LABELS.map((label) => [label, Math.exp(logScores[label] - maximum)]),
  );
  const total = Object.values(exponentials).reduce((sum, value) => sum + value, 0);
  return Object.fromEntries(LABELS.map((label) => [label, exponentials[label] / total]));
}

export function predictText(state, text) {
  const tokens = tokenize(text);
  const vocabularySize = Math.max(1, Object.keys(state.model.vocabulary).length);
  const totalDocuments = state.model.examplesSeen;
  const alpha = state.config.alpha;
  const logScores = {};
  for (const label of LABELS) {
    const prior = (state.model.documentCounts[label] + alpha) / (totalDocuments + alpha * LABELS.length);
    let score = Math.log(prior);
    for (const token of tokens) {
      const count = state.model.tokenCounts[label][token] || 0;
      const likelihood = (count + alpha) / (state.model.tokenTotals[label] + alpha * vocabularySize);
      score += Math.log(likelihood);
    }
    logScores[label] = score;
  }
  const probabilities = softmax(logScores);
  const label = LABELS.reduce((best, candidate) =>
    probabilities[candidate] > probabilities[best] ? candidate : best,
  );
  const entropy = -LABELS.reduce((sum, candidate) => {
    const probability = probabilities[candidate];
    return sum + probability * Math.log(probability);
  }, 0) / Math.log(LABELS.length);
  return {
    label,
    confidence: probabilities[label],
    entropy,
    probabilities,
    requiresReview: probabilities[label] < state.config.reviewThreshold,
  };
}

export function evaluateModel(state) {
  let correct = 0;
  let confidenceTotal = 0;
  let logLossTotal = 0;
  const byLabel = Object.fromEntries(
    LABELS.map((label) => [label, { truePositive: 0, falsePositive: 0, falseNegative: 0 }]),
  );
  for (const example of HOLDOUT_EXAMPLES) {
    const prediction = predictText(state, example.text);
    const isCorrect = prediction.label === example.label;
    if (isCorrect) correct += 1;
    confidenceTotal += prediction.confidence;
    logLossTotal -= Math.log(Math.max(1e-9, prediction.probabilities[example.label]));
    for (const label of LABELS) {
      if (prediction.label === label && example.label === label) byLabel[label].truePositive += 1;
      if (prediction.label === label && example.label !== label) byLabel[label].falsePositive += 1;
      if (prediction.label !== label && example.label === label) byLabel[label].falseNegative += 1;
    }
  }
  const perLabel = Object.fromEntries(LABELS.map((label) => {
    const counts = byLabel[label];
    const precision = counts.truePositive / Math.max(1, counts.truePositive + counts.falsePositive);
    const recall = counts.truePositive / Math.max(1, counts.truePositive + counts.falseNegative);
    const f1 = precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall);
    return [label, { precision, recall, f1 }];
  }));
  return {
    holdoutSize: HOLDOUT_EXAMPLES.length,
    accuracy: correct / HOLDOUT_EXAMPLES.length,
    macroF1: LABELS.reduce((sum, label) => sum + perLabel[label].f1, 0) / LABELS.length,
    averageConfidence: confidenceTotal / HOLDOUT_EXAMPLES.length,
    logLoss: logLossTotal / HOLDOUT_EXAMPLES.length,
    perLabel,
  };
}

function refreshPredictions(state) {
  for (const sample of state.samples) {
    sample.prediction = predictText(state, sample.text);
  }
}

export function createTrainingSession() {
  const state = {
    model: createEmptyModel(),
    config: { alpha: 1, reviewThreshold: 0.72 },
    samples: REVIEW_EXAMPLES.map((example) => ({ ...example, status: "unlabeled", humanLabel: null, prediction: null })),
    reviewQueue: [],
    configProposal: null,
    trainingHistory: [],
    sequence: 0,
    activity: [],
  };
  for (const example of SEED_EXAMPLES) trainOne(state.model, example.text, example.label);
  refreshPredictions(state);
  const metrics = evaluateModel(state);
  state.trainingHistory.push({ step: 0, examplesSeen: state.model.examplesSeen, trainedBatch: 0, ...metrics });
  state.activity.push({ id: "launch", type: "system", message: "Online classifier initialized with 9 seed labels." });
  return state;
}

function addActivity(state, type, message) {
  state.sequence += 1;
  state.activity.unshift({ id: `activity-${state.sequence}`, type, message });
}

function publicSample(sample) {
  return {
    id: sample.id,
    text: sample.text,
    status: sample.status,
    humanLabel: sample.humanLabel,
    prediction: sample.prediction,
  };
}

export function trainingStateForAgent(state) {
  const counts = Object.fromEntries(["unlabeled", "awaiting-human", "confirmed", "trained"].map((status) => [
    status,
    state.samples.filter((sample) => sample.status === status).length,
  ]));
  return {
    name: "Label Loop online support classifier",
    task: "Route support tickets into billing, bug, or access.",
    model: { family: "online multinomial Naive Bayes", examplesSeen: state.model.examplesSeen, vocabularySize: Object.keys(state.model.vocabulary).length },
    labels: LABELS,
    config: { ...state.config },
    queue: { maximum: MAX_REVIEW_BATCH, activeSampleIds: [...state.reviewQueue] },
    sampleCounts: counts,
    metrics: evaluateModel(state),
    pendingConfigProposal: state.configProposal,
    collaborationRules: [
      "Use inspect_uncertain_samples to select high-entropy review candidates.",
      "Only the person can assign a label. queue_label_review cannot label samples.",
      "train_confirmed_batch consumes only human-confirmed labels.",
      "propose_model_config stages settings. Only the person can apply them.",
    ],
  };
}

export function inspectUncertainSamples(state, input = {}) {
  const limit = input.limit === undefined ? 5 : input.limit;
  if (!Number.isInteger(limit) || limit < 1 || limit > 8) throw new RangeError("limit must be an integer from 1 to 8.");
  const samples = state.samples
    .filter((sample) => sample.status === "unlabeled")
    .sort((left, right) => right.prediction.entropy - left.prediction.entropy)
    .slice(0, limit)
    .map(publicSample);
  return {
    ok: true,
    samples,
    acquisitionRule: "Highest normalized predictive entropy first.",
    note: "Predictions are suggestions. Queue samples for a person instead of assigning labels directly.",
  };
}

export function queueLabelReview(state, input) {
  if (!Array.isArray(input?.sampleIds) || input.sampleIds.length < 1 || input.sampleIds.length > MAX_REVIEW_BATCH) {
    throw new RangeError(`sampleIds must contain 1 to ${MAX_REVIEW_BATCH} items.`);
  }
  if (new Set(input.sampleIds).size !== input.sampleIds.length) throw new Error("sampleIds must be unique.");
  if (typeof input.note !== "string" || !input.note.trim() || input.note.trim().length > 180) {
    throw new RangeError("note must contain 1 to 180 characters.");
  }
  if (state.reviewQueue.length) throw new Error("Resolve the current human review queue before adding another.");
  const selected = input.sampleIds.map((id) => {
    const sample = state.samples.find((candidate) => candidate.id === id);
    if (!sample) throw new Error(`Unknown sample: ${id}`);
    if (sample.status !== "unlabeled") throw new Error(`${id} is already ${sample.status}.`);
    return sample;
  });
  for (const sample of selected) sample.status = "awaiting-human";
  state.reviewQueue = selected.map((sample) => sample.id);
  addActivity(state, "agent", `Agent queued ${selected.length} uncertain sample${selected.length === 1 ? "" : "s"} for human labels.`);
  return { ok: true, queuedSamples: selected.map(publicSample), note: input.note.trim(), status: "awaiting_human_labels" };
}

export function confirmHumanLabel(state, sampleId, label) {
  assertLabel(label);
  const sample = state.samples.find((candidate) => candidate.id === sampleId);
  if (!sample) throw new Error(`Unknown sample: ${sampleId}`);
  if (sample.status !== "awaiting-human") throw new Error(`${sampleId} is not awaiting a human label.`);
  sample.humanLabel = label;
  sample.status = "confirmed";
  state.reviewQueue = state.reviewQueue.filter((id) => id !== sampleId);
  addActivity(state, "human", `Human labeled ${sampleId} as ${label}.`);
  return publicSample(sample);
}

export function trainConfirmedBatch(state, input = {}) {
  const maximum = input.maximum === undefined ? MAX_REVIEW_BATCH : input.maximum;
  if (!Number.isInteger(maximum) || maximum < 1 || maximum > 8) throw new RangeError("maximum must be an integer from 1 to 8.");
  const batch = state.samples.filter((sample) => sample.status === "confirmed").slice(0, maximum);
  if (!batch.length) throw new Error("No human-confirmed labels are ready for training.");
  for (const sample of batch) {
    trainOne(state.model, sample.text, sample.humanLabel);
    sample.status = "trained";
  }
  refreshPredictions(state);
  const metrics = evaluateModel(state);
  state.trainingHistory.push({
    step: state.trainingHistory.length,
    examplesSeen: state.model.examplesSeen,
    trainedBatch: batch.length,
    ...metrics,
  });
  addActivity(state, "training", `Model trained incrementally on ${batch.length} human-confirmed label${batch.length === 1 ? "" : "s"}.`);
  return { ok: true, trainedSampleIds: batch.map((sample) => sample.id), examplesSeen: state.model.examplesSeen, metrics };
}

export function proposeModelConfig(state, input) {
  const alpha = input?.alpha;
  const reviewThreshold = input?.reviewThreshold;
  assertFiniteNumber(alpha, "alpha", 0.1, 3);
  assertFiniteNumber(reviewThreshold, "reviewThreshold", 0.5, 0.95);
  if (typeof input?.rationale !== "string" || !input.rationale.trim() || input.rationale.trim().length > 220) {
    throw new RangeError("rationale must contain 1 to 220 characters.");
  }
  if (state.configProposal?.status === "pending") throw new Error("A model configuration proposal is already pending.");
  state.configProposal = {
    id: `config-${state.sequence + 1}`,
    status: "pending",
    alpha,
    reviewThreshold,
    rationale: input.rationale.trim(),
  };
  addActivity(state, "agent", "Agent staged a model configuration proposal for human review.");
  return { ok: true, proposal: { ...state.configProposal }, status: "awaiting_human_approval" };
}

export function resolveConfigProposal(state, accept) {
  if (!state.configProposal || state.configProposal.status !== "pending") throw new Error("No configuration proposal is pending.");
  state.configProposal.status = accept ? "accepted" : "rejected";
  if (accept) {
    state.config.alpha = state.configProposal.alpha;
    state.config.reviewThreshold = state.configProposal.reviewThreshold;
    refreshPredictions(state);
    state.trainingHistory.push({
      step: state.trainingHistory.length,
      examplesSeen: state.model.examplesSeen,
      trainedBatch: 0,
      configChanged: true,
      ...evaluateModel(state),
    });
  }
  addActivity(state, "human", `Human ${accept ? "accepted" : "rejected"} the model configuration proposal.`);
  return { ...state.configProposal };
}

export function inspectTrainingHistory(state) {
  return {
    ok: true,
    history: state.trainingHistory.map((entry) => ({ ...entry })),
    trainedSamples: state.samples.filter((sample) => sample.status === "trained").map(publicSample),
    labelProvenance: "Seed examples are bundled with the page. Incremental examples require a human-confirmed label.",
  };
}
