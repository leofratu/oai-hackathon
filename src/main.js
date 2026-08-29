import {
  LABELS,
  confirmHumanLabel,
  createTrainingSession,
  evaluateModel,
  inspectModelDiagnostics,
  inspectTrainingHistory,
  inspectUncertainSamples,
  predictTicket,
  resolveConfigProposal,
} from "./model.js";
import {
  buildToolDefinitions,
  createToolHandlers,
  formatToolInput,
  registerWebMCP,
  summarizeToolEvent,
} from "./webmcp.js";

const elements = Object.fromEntries([
  "accuracyValue", "activityList", "alphaValue", "checkpointValue", "classMetrics", "configProposal",
  "confusionGrid", "calibrationStats", "emptyReview", "examplesSeen", "f1Value", "featureGrid", "heroNote", "historyCaption", "historyChart", "pendingLabelCount",
  "poolCount", "predictionOutput", "promptFeedback", "proofState", "queueValue", "replayButton", "reviewQueue",
  "sampleList", "thresholdValue", "ticketInput", "toast", "traceCount", "traceList", "vocabValue", "webmcpStatus",
].map((id) => [id, document.querySelector(`#${id}`)]));

let state = createTrainingSession();
let toolSource = "site tool";
let traceEvents = [];
let traceSequence = 0;
let toastTimer;

function percent(value, digits = 0) {
  return `${(value * 100).toFixed(digits)}%`;
}

function showToast(message) {
  clearTimeout(toastTimer);
  elements.toast.textContent = message;
  elements.toast.classList.add("is-visible");
  toastTimer = setTimeout(() => elements.toast.classList.remove("is-visible"), 2800);
}

function setSiteToolStatus({ state: status, message }) {
  elements.webmcpStatus.dataset.state = status;
  elements.webmcpStatus.querySelector("span:last-child").textContent = message;
  elements.proofState.textContent = status === "ready" ? "Native tools live" : status === "fallback" ? "Replay mode" : status;
  elements.heroNote.textContent = status === "ready"
    ? "Native WebMCP is connected. Ask ChatGPT to use this page's Site tools."
    : status === "fallback"
      ? "This browser has no native WebMCP. Local replay calls the production handlers and labels every event."
      : "WebMCP registration did not complete. The local replay remains available.";
  document.querySelector("#runtimeProof").innerHTML = status === "ready"
    ? "Native <code>document.modelContext</code> registered all nine tools."
    : "Open this URL in ChatGPT's browser or Chrome with WebMCP testing enabled for native tools.";
}

function recordToolEvent(event) {
  traceSequence += 1;
  traceEvents.unshift({
    sequence: traceSequence,
    source: toolSource,
    name: event.name,
    access: event.access,
    status: event.status,
    input: formatToolInput(event.name, event.input),
    summary: summarizeToolEvent(event),
  });
  traceEvents = traceEvents.slice(0, 12);
  renderTrace();
}

function renderMetrics() {
  const metrics = evaluateModel(state);
  elements.examplesSeen.textContent = state.model.examplesSeen;
  elements.accuracyValue.textContent = percent(metrics.accuracy);
  elements.f1Value.textContent = percent(metrics.macroF1);
  elements.queueValue.textContent = state.reviewQueue.length;
  elements.alphaValue.textContent = state.config.alpha.toFixed(2);
  elements.vocabValue.textContent = Object.keys(state.model.vocabulary).length;
  elements.thresholdValue.textContent = percent(state.config.reviewThreshold);
  elements.checkpointValue.textContent = state.trainingHistory.length;
  elements.pendingLabelCount.textContent = `${state.reviewQueue.length} waiting`;
  const unlabeled = state.samples.filter((sample) => sample.status === "unlabeled").length;
  elements.poolCount.textContent = `${unlabeled} unlabeled`;

  const fragment = document.createDocumentFragment();
  for (const label of LABELS) {
    const row = document.createElement("div");
    row.className = "class-row";
    row.dataset.label = label;
    const name = document.createElement("span");
    name.textContent = label;
    const bar = document.createElement("div");
    bar.className = "bar";
    const fill = document.createElement("i");
    fill.style.width = percent(metrics.perLabel[label].f1);
    bar.append(fill);
    const value = document.createElement("strong");
    value.textContent = percent(metrics.perLabel[label].f1);
    row.append(name, bar, value);
    fragment.append(row);
  }
  elements.classMetrics.replaceChildren(fragment);
  renderHistory();
}

function svgElement(name, attributes = {}) {
  const element = document.createElementNS("http://www.w3.org/2000/svg", name);
  for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, value);
  return element;
}

function renderHistory() {
  const history = state.trainingHistory;
  elements.historyCaption.textContent = `${history.length} checkpoint${history.length === 1 ? "" : "s"}`;
  elements.historyChart.replaceChildren();
  for (const y of [25, 75, 125]) {
    elements.historyChart.append(svgElement("line", { x1: 22, y1: y, x2: 500, y2: y, stroke: "#254148", "stroke-width": 1 }));
  }
  const points = history.map((entry, index) => {
    const x = history.length === 1 ? 260 : 24 + (index / (history.length - 1)) * 472;
    const y = 132 - entry.accuracy * 112;
    return { x, y };
  });
  if (points.length > 1) {
    elements.historyChart.append(svgElement("polyline", {
      points: points.map((point) => `${point.x},${point.y}`).join(" "),
      fill: "none", stroke: "#c9f36d", "stroke-width": 3,
    }));
  }
  for (const point of points) {
    elements.historyChart.append(svgElement("circle", { cx: point.x, cy: point.y, r: 5, fill: "#c9f36d", stroke: "#071116", "stroke-width": 2 }));
  }
}

function predictionCard(sample) {
  const article = document.createElement("article");
  article.className = "sample-card";
  if (sample.status === "awaiting-human") article.classList.add("is-queued");
  const meta = document.createElement("div");
  meta.className = "sample-meta";
  meta.innerHTML = `<span>${sample.id}</span><span>${sample.status}</span>`;
  const quote = document.createElement("blockquote");
  quote.textContent = sample.text;
  const line = document.createElement("div");
  line.className = "prediction-line";
  const label = document.createElement("span");
  label.className = `label-pill ${sample.prediction.label}`;
  label.textContent = sample.prediction.label;
  const entropy = document.createElement("span");
  entropy.className = "entropy-bar";
  const fill = document.createElement("i");
  fill.style.width = percent(sample.prediction.entropy);
  entropy.append(fill);
  const value = document.createElement("strong");
  value.textContent = `${percent(sample.prediction.confidence)} / H ${sample.prediction.entropy.toFixed(2)}`;
  line.append(label, entropy, value);
  article.append(meta, quote, line);
  return article;
}

function renderSamples() {
  const samples = [...state.samples]
    .filter((sample) => sample.status !== "trained")
    .sort((left, right) => right.prediction.entropy - left.prediction.entropy)
    .slice(0, 8);
  elements.sampleList.replaceChildren(...samples.map(predictionCard));
}

function reviewCard(sample) {
  const article = document.createElement("article");
  article.className = "review-card";
  const meta = document.createElement("div");
  meta.className = "sample-meta";
  meta.innerHTML = `<span>${sample.id}</span><span>model: ${sample.prediction.label} ${percent(sample.prediction.confidence)}</span>`;
  const quote = document.createElement("blockquote");
  quote.textContent = sample.text;
  const buttons = document.createElement("div");
  buttons.className = "label-buttons";
  for (const label of LABELS) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.addEventListener("click", () => {
      confirmHumanLabel(state, sample.id, label);
      render();
      showToast(`${sample.id} confirmed as ${label}. The agent can train this label now.`);
    });
    buttons.append(button);
  }
  article.append(meta, quote, buttons);
  return article;
}

function renderHumanQueue() {
  const queued = state.reviewQueue
    .map((id) => state.samples.find((sample) => sample.id === id))
    .filter(Boolean);
  elements.reviewQueue.replaceChildren(...queued.map(reviewCard));
  elements.emptyReview.hidden = queued.length > 0;
  const proposal = state.configProposal;
  elements.configProposal.hidden = !proposal || proposal.status !== "pending";
  if (proposal?.status === "pending") {
    elements.configProposal.replaceChildren();
    const title = document.createElement("h3");
    title.textContent = "Model configuration proposal";
    const detail = document.createElement("p");
    detail.textContent = `Alpha ${proposal.alpha}; review threshold ${percent(proposal.reviewThreshold)}. ${proposal.rationale}`;
    const actions = document.createElement("div");
    actions.className = "proposal-actions";
    for (const [accept, text] of [[true, "Accept settings"], [false, "Reject"]]) {
      const button = document.createElement("button");
      button.className = accept ? "button button-primary" : "button button-secondary";
      button.type = "button";
      button.textContent = text;
      button.addEventListener("click", () => {
        resolveConfigProposal(state, accept);
        render();
        showToast(`Configuration proposal ${accept ? "accepted" : "rejected"}.`);
      });
      actions.append(button);
    }
    elements.configProposal.append(title, detail, actions);
  }
}

function renderTrace() {
  elements.traceCount.textContent = `${traceEvents.length} calls`;
  if (!traceEvents.length) {
    const empty = document.createElement("div");
    empty.className = "empty-trace";
    empty.textContent = "No calls yet. Use native Site tools or run the labeled local replay.";
    elements.traceList.replaceChildren(empty);
    return;
  }
  const events = traceEvents.map((event) => {
    const article = document.createElement("article");
    article.className = "trace-event";
    article.dataset.access = event.access;
    const meta = document.createElement("div");
    meta.className = "trace-meta";
    meta.innerHTML = `<span class="access-badge">${event.access}</span><span>${event.source}</span><span>#${String(event.sequence).padStart(2, "0")}</span>`;
    const call = document.createElement("code");
    call.textContent = `${event.name}(${event.input})`;
    const result = document.createElement("p");
    result.textContent = `${event.status === "error" ? "Error" : "Result"}: ${event.summary}`;
    article.append(meta, call, result);
    return article;
  });
  elements.traceList.replaceChildren(...events);
}

function renderActivity() {
  const items = state.activity.slice(0, 12).map((event) => {
    const article = document.createElement("article");
    article.className = "activity-item";
    article.dataset.type = event.type;
    const icon = document.createElement("span");
    icon.className = "activity-icon";
    icon.textContent = { human: "H", agent: "A", training: "ML", system: "S" }[event.type] || "S";
    const body = document.createElement("div");
    const label = document.createElement("strong");
    label.textContent = event.type;
    const message = document.createElement("p");
    message.textContent = event.message;
    body.append(label, message);
    article.append(icon, body);
    return article;
  });
  elements.activityList.replaceChildren(...items);
}

function renderDiagnostics() {
  const diagnostics = inspectModelDiagnostics(state, { featureLimit: 5 });
  const featureGroups = LABELS.map((label) => {
    const section = document.createElement("section");
    section.className = "feature-group";
    section.dataset.label = label;
    const heading = document.createElement("strong");
    heading.textContent = label;
    const maximum = Math.max(...diagnostics.topFeatures[label].map((feature) => feature.weight), 1);
    const list = document.createElement("div");
    list.className = "feature-list";
    for (const feature of diagnostics.topFeatures[label]) {
      const row = document.createElement("div");
      const token = document.createElement("code");
      token.textContent = feature.token;
      const bar = document.createElement("span");
      const fill = document.createElement("i");
      fill.style.width = percent(feature.weight / maximum);
      bar.append(fill);
      const weight = document.createElement("small");
      weight.textContent = feature.weight.toFixed(2);
      row.append(token, bar, weight);
      list.append(row);
    }
    section.append(heading, list);
    return section;
  });
  elements.featureGrid.replaceChildren(...featureGroups);

  const matrixCells = [];
  const corner = document.createElement("span");
  corner.className = "matrix-axis";
  corner.textContent = "A / P";
  matrixCells.push(corner);
  for (const label of LABELS) {
    const header = document.createElement("strong");
    header.textContent = label;
    matrixCells.push(header);
  }
  for (const actual of LABELS) {
    const rowLabel = document.createElement("strong");
    rowLabel.textContent = actual;
    matrixCells.push(rowLabel);
    for (const predicted of LABELS) {
      const cell = document.createElement("span");
      const count = diagnostics.confusionMatrix[actual][predicted];
      cell.textContent = count;
      cell.dataset.correct = String(actual === predicted);
      cell.style.setProperty("--matrix-strength", String(Math.max(0.08, count / 3)));
      matrixCells.push(cell);
    }
  }
  elements.confusionGrid.replaceChildren(...matrixCells);

  const calibration = diagnostics.calibration;
  const values = [
    ["Accuracy", percent(calibration.accuracy)],
    ["Mean confidence", percent(calibration.averageConfidence)],
    ["Confidence gap", `${(calibration.confidenceGap * 100).toFixed(1)} pts`],
    ["Log loss", calibration.logLoss.toFixed(3)],
  ];
  elements.calibrationStats.replaceChildren(...values.map(([label, value]) => {
    const item = document.createElement("div");
    const name = document.createElement("span");
    name.textContent = label;
    const result = document.createElement("strong");
    result.textContent = value;
    item.append(name, result);
    return item;
  }));
}

function render() {
  renderMetrics();
  renderSamples();
  renderHumanQueue();
  renderDiagnostics();
  renderTrace();
  renderActivity();
}

async function callLocalTool(name, input) {
  toolSource = "local replay";
  try {
    return await toolHandlers[name](input);
  } finally {
    toolSource = "site tool";
  }
}

async function runLocalReplay() {
  try {
    if (state.reviewQueue.length) {
      showToast("Complete the human label queue before the next agent turn.");
      return;
    }
    await callLocalTool("get_training_state");
    const confirmed = state.samples.filter((sample) => sample.status === "confirmed");
    if (confirmed.length) {
      await callLocalTool("train_confirmed_batch", { maximum: 3 });
      await callLocalTool("evaluate_model");
      await callLocalTool("inspect_training_history");
      if (state.trainingHistory.length === 2 && !state.configProposal) {
        await callLocalTool("propose_model_config", {
          alpha: 0.75,
          reviewThreshold: 0.78,
          rationale: "Use slightly less smoothing after the first human batch while keeping low-confidence predictions in review.",
        });
      }
    }
    const uncertain = await callLocalTool("inspect_uncertain_samples", { limit: 5 });
    if (!uncertain.samples.length) {
      showToast("All review samples have been labeled. Inspect the final training history.");
      return;
    }
    await callLocalTool("queue_label_review", {
      sampleIds: uncertain.samples.slice(0, 2).map((sample) => sample.id),
      note: "These samples have the highest predictive entropy and should add useful class evidence.",
    });
    showToast("Local replay queued two high-entropy samples for human labels.");
    document.querySelector(".workspace").scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    showToast(error.message);
  }
}

async function copyPrompt() {
  const prompt = `Open Label Loop and act as the training agent. First call get_training_state, inspect_model_diagnostics, then inspect_uncertain_samples. Queue at most two high-entropy samples with queue_label_review and wait for me to label them. After I finish, call train_confirmed_batch, evaluate_model, and inspect_training_history. Use predict_ticket to test one new example. You may propose model settings, but never claim that a label or configuration was approved until the page reports it.`;
  try {
    await navigator.clipboard.writeText(prompt);
    elements.promptFeedback.textContent = "Task copied. Paste it into ChatGPT beside this live page.";
  } catch {
    elements.promptFeedback.textContent = prompt;
  }
}

const toolHandlers = createToolHandlers(() => state, render, recordToolEvent);
const toolDefinitions = buildToolDefinitions(toolHandlers);
window.__labelLoop = { tools: toolHandlers, toolDefinitions };
if (new URLSearchParams(location.search).has("debug")) {
  window.__labelLoop.getDebugState = () => state;
  window.__labelLoop.replayTool = callLocalTool;
}

document.querySelector("#copyPromptButton").addEventListener("click", copyPrompt);
elements.replayButton.addEventListener("click", runLocalReplay);
document.querySelector("#resetButton").addEventListener("click", () => {
  state = createTrainingSession();
  traceEvents = [];
  traceSequence = 0;
  render();
  showToast("Training session reset to the 9 seed labels.");
});
document.querySelector("#tryModelForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const prediction = predictTicket(state, { text: elements.ticketInput.value });
  const decision = prediction.requiresReview ? "send to human review" : "safe to route";
  elements.predictionOutput.textContent = `${prediction.label} / ${percent(prediction.confidence)} confidence / ${decision} / entropy ${prediction.entropy.toFixed(2)}`;
});

render();
registerWebMCP(toolDefinitions, setSiteToolStatus);
