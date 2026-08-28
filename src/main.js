import {
  GRID_SIZE,
  CONSULT_LIMIT,
  SURVEY_LIMIT,
  TERRAINS,
  acceptProposal,
  answerHumanFocus,
  columnLetter,
  consultChart,
  createGame,
  eraseCell,
  finishExpedition,
  paintCell,
  pendingTerrainByIndex,
  rejectProposal,
  scoreDraft,
  surveyEvidenceByIndex,
  toCoordinate,
  toIndex,
} from "./game.js";
import {
  buildToolDefinitions,
  createToolHandlers,
  formatToolInput,
  registerWebMCP,
  summarizeToolEvent,
} from "./webmcp.js";

const elements = {
  accuracyUnit: document.querySelector("#accuracyUnit"),
  accuracyValue: document.querySelector("#accuracyValue"),
  chargePips: document.querySelector("#chargePips"),
  chartGrid: document.querySelector("#chartGrid"),
  columnAxis: document.querySelector("#columnAxis"),
  copyPromptButton: document.querySelector("#copyPromptButton"),
  coverageValue: document.querySelector("#coverageValue"),
  consultCount: document.querySelector("#consultCount"),
  demoTurnButton: document.querySelector("#demoTurnButton"),
  finaleDialog: document.querySelector("#finaleDialog"),
  finaleSeal: document.querySelector("#finaleSeal"),
  finaleVerdict: document.querySelector("#finaleVerdict"),
  finalCoverage: document.querySelector("#finalCoverage"),
  finalPrecision: document.querySelector("#finalPrecision"),
  finalTeamwork: document.querySelector("#finalTeamwork"),
  finaleSeed: document.querySelector("#finaleSeed"),
  focusBanner: document.querySelector("#focusBanner"),
  heroDemoNote: document.querySelector("#heroDemoNote"),
  missionDeck: document.querySelector("#missionDeck"),
  missionLinkLabel: document.querySelector("#missionLinkLabel"),
  missionPhase: document.querySelector("#missionPhase"),
  newExpeditionButton: document.querySelector("#newExpeditionButton"),
  newFromFinaleButton: document.querySelector("#newFromFinaleButton"),
  closeFinaleButton: document.querySelector("#closeFinaleButton"),
  notesFeed: document.querySelector("#notesFeed"),
  palette: document.querySelector("#palette"),
  pendingCount: document.querySelector("#pendingCount"),
  promptFeedback: document.querySelector("#promptFeedback"),
  protocolTrace: document.querySelector("#protocolTrace"),
  protocolLinkState: document.querySelector("#protocolLinkState"),
  revealButton: document.querySelector("#revealButton"),
  rowAxis: document.querySelector("#rowAxis"),
  scoreButton: document.querySelector("#scoreButton"),
  seedInput: document.querySelector("#seedInput"),
  surveyCount: document.querySelector("#surveyCount"),
  toast: document.querySelector("#toast"),
  traceCount: document.querySelector("#traceCount"),
  turnInstruction: document.querySelector("#turnInstruction"),
  runtimeProof: document.querySelector("#runtimeProof"),
  toolManifestHeading: document.querySelector("#toolManifestHeading"),
  webmcpStatus: document.querySelector("#webmcpStatus"),
};

let state = createGame(elements.seedInput.value);
let selectedTerrain = "water";
let drawing = false;
let activeGridIndex = 0;
let toastTimer;
let protocolEvents = [];
let protocolSequence = 0;
let toolInvocationSource = "site tool";

function setSiteToolStatus({ state: statusState, message }) {
  elements.webmcpStatus.dataset.state = statusState;
  elements.webmcpStatus.querySelector("span:last-child").textContent = message;
  elements.runtimeProof.dataset.state = statusState;
  elements.toolManifestHeading.textContent = statusState === "ready"
    ? "Registered by this page"
    : statusState === "fallback"
      ? "Declared here / replay mode"
      : "Tool contract declared here";
  elements.protocolLinkState.textContent = statusState === "ready"
    ? "Native tools live"
    : statusState === "fallback"
      ? "Replay only"
      : statusState === "error"
        ? "Registration error"
        : "Checking";
  elements.missionLinkLabel.textContent = statusState === "ready"
    ? "Native WebMCP state"
    : statusState === "fallback"
      ? "Local replay state"
      : "WebMCP connection state";
  elements.runtimeProof.textContent = statusState === "ready"
    ? "Native WebMCP is active: an external agent can discover these six tools on this page."
    : statusState === "fallback"
      ? "Native WebMCP is unavailable in this browser. Open this URL in ChatGPT's in-app browser (or Chrome with WebMCP testing enabled) to connect an external agent. The demo below replays the same handlers locally."
      : statusState === "error"
        ? "Native WebMCP registration failed. The local replay remains available for testing."
        : "Checking whether this browser exposes native WebMCP...";
  elements.heroDemoNote.textContent = statusState === "ready"
    ? "Native WebMCP is connected. Copy the mission and ask ChatGPT to use this page's Site tools."
    : statusState === "fallback"
      ? "No native WebMCP was found in this browser. Local replay calls the production handlers and labels its trace."
      : statusState === "error"
        ? "Tool registration failed in this browser. Local replay is still available for deterministic testing."
        : "Checking for native WebMCP before starting...";
}

function showToast(message) {
  clearTimeout(toastTimer);
  elements.toast.textContent = message;
  elements.toast.classList.add("is-visible");
  toastTimer = setTimeout(() => elements.toast.classList.remove("is-visible"), 2600);
}

function renderProtocolTrace() {
  elements.traceCount.textContent = `${protocolSequence} ${protocolSequence === 1 ? "call" : "calls"}`;
  if (!protocolEvents.length) {
    const empty = document.createElement("p");
    empty.className = "protocol-trace-empty";
    empty.textContent = "No calls yet. Use ChatGPT Site tools, or run the clearly labeled local replay.";
    elements.protocolTrace.replaceChildren(empty);
    return;
  }

  const fragment = document.createDocumentFragment();
  for (const event of protocolEvents) {
    const article = document.createElement("article");
    article.className = `trace-event trace-${event.status}`;

    const heading = document.createElement("div");
    heading.className = "trace-event-heading";
    const badge = document.createElement("span");
    badge.className = `trace-access trace-access-${event.access}`;
    badge.textContent = event.access;
    const sequence = document.createElement("span");
    sequence.textContent = `#${String(event.sequence).padStart(2, "0")}`;
    const source = document.createElement("span");
    source.className = "trace-origin";
    source.textContent = event.source;
    heading.append(badge, source, sequence);

    const call = document.createElement("code");
    const toolName = document.createElement("strong");
    toolName.textContent = event.name;
    const input = document.createElement("span");
    input.textContent = `(${event.input})`;
    call.append(toolName, input);

    const result = document.createElement("p");
    result.textContent = `${event.status === "error" ? "Error" : "Result"}: ${event.summary}`;
    article.append(heading, call, result);
    fragment.append(article);
  }
  elements.protocolTrace.replaceChildren(fragment);
}

function recordToolEvent(event) {
  protocolSequence += 1;
  protocolEvents.unshift({
    access: event.access,
    input: formatToolInput(event.name, event.input),
    name: event.name,
    sequence: protocolSequence,
    source: toolInvocationSource,
    status: event.status,
    summary: summarizeToolEvent(event),
  });
  protocolEvents = protocolEvents.slice(0, 8);
  renderProtocolTrace();
}

function formatPercent(value) {
  const percent = value * 100;
  return Number.isInteger(percent) ? percent : Math.floor(percent * 10) / 10;
}

function terrainLabel(terrain) {
  return TERRAINS[terrain]?.label || terrain;
}

function renderAxes() {
  elements.columnAxis.replaceChildren();
  elements.rowAxis.replaceChildren();
  for (let index = 1; index <= GRID_SIZE; index += 1) {
    const column = document.createElement("span");
    column.textContent = columnLetter(index);
    elements.columnAxis.append(column);

    const row = document.createElement("span");
    row.textContent = String(index).padStart(2, "0");
    elements.rowAxis.append(row);
  }
}

function renderGrid() {
  const restoreFocus = Boolean(document.activeElement?.closest?.(".chart-cell"));
  const pending = pendingTerrainByIndex(state);
  const evidence = surveyEvidenceByIndex(state);
  const surveyedCenters = new Set(state.surveys.map((survey) => toIndex(survey.row, survey.column)));
  const focusedIndex = state.focus ? toIndex(state.focus.row, state.focus.column) : -1;
  const fragment = document.createDocumentFragment();
  let rowElement;

  for (let index = 0; index < GRID_SIZE * GRID_SIZE; index += 1) {
    if (index % GRID_SIZE === 0) {
      rowElement = document.createElement("div");
      rowElement.className = "chart-row";
      rowElement.setAttribute("role", "row");
      fragment.append(rowElement);
    }
    const coordinate = toCoordinate(index);
    const mark = state.draft[index];
    const proposal = pending.get(index);
    const exactEvidence = evidence.get(index);
    const lens = state.fieldLens[index];
    const truth = state.truth[index];
    const terrain = state.revealed ? truth : mark?.terrain || proposal?.terrain || null;
    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = "chart-cell";
    cell.dataset.row = coordinate.row;
    cell.dataset.column = coordinate.column;
    cell.dataset.index = index;
    cell.tabIndex = index === activeGridIndex ? 0 : -1;
    cell.setAttribute("role", "gridcell");
    cell.setAttribute(
      "aria-label",
      `${columnLetter(coordinate.column)}${coordinate.row}: ${terrain ? terrainLabel(terrain) : "uncharted"}${proposal ? ", agent proposal" : ""}${exactEvidence ? `, exact survey evidence says ${terrainLabel(exactEvidence.terrain)}` : `, field lens suggests ${terrainLabel(lens.terrain)}`}`,
    );

    if (!state.revealed) cell.classList.add(`lens-${lens.terrain}`);
    if (terrain) cell.classList.add(`is-${terrain}`);
    if (mark?.source === "human") cell.classList.add("is-human");
    if (mark?.source === "agent-approved") cell.classList.add("is-agent-approved");
    if (proposal && !state.revealed) cell.classList.add("is-proposed");
    if (proposal) cell.style.setProperty("--proposal-confidence", proposal.confidence);
    if (exactEvidence && !state.revealed) cell.classList.add("has-evidence", `evidence-${exactEvidence.terrain}`);
    if (surveyedCenters.has(index)) cell.classList.add("is-survey-center");
    if (focusedIndex === index) {
      cell.classList.add("is-focused");
      cell.title = state.focus.note;
    }
    if (state.revealed && mark && mark.terrain !== truth) cell.classList.add("is-error");
    if (state.revealed && !mark) cell.classList.add("is-unmapped");

    const glyph = document.createElement("span");
    glyph.className = "terrain-glyph";
    glyph.textContent = terrain ? TERRAINS[terrain].symbol : "";
    cell.append(glyph);
    if (exactEvidence && !state.revealed) {
      const evidenceGlyph = document.createElement("span");
      evidenceGlyph.className = "evidence-glyph";
      evidenceGlyph.textContent = TERRAINS[exactEvidence.terrain].symbol;
      evidenceGlyph.title = `Exact ${terrainLabel(exactEvidence.terrain)} evidence from ${exactEvidence.surveyId}`;
      cell.append(evidenceGlyph);
    }
    rowElement.append(cell);
  }

  elements.chartGrid.replaceChildren(fragment);
  if (restoreFocus) {
    elements.chartGrid.querySelector(`[data-index="${activeGridIndex}"]`)?.focus({ preventScroll: true });
  }
}

function noteCard(activity) {
  const article = document.createElement("article");
  article.className = `note-card note-${activity.type}`;
  const marker = document.createElement("span");
  marker.className = "note-marker";
  marker.textContent =
    activity.type === "survey"
      ? "S"
      : activity.type === "proposal"
        ? "P"
        : activity.type === "human"
          ? "H"
          : activity.type === "focus"
            ? "?"
            : activity.type === "consult"
              ? "C"
            : activity.type === "finish"
              ? "OK"
              : ".";
  const copy = document.createElement("div");
  const message = document.createElement("strong");
  message.textContent = activity.message;
  copy.append(message);
  if (activity.detail) {
    const detail = document.createElement("p");
    detail.textContent = activity.detail;
    copy.append(detail);
  }
  article.append(marker, copy);
  return article;
}

function proposalCard(proposal) {
  const article = document.createElement("article");
  article.className = "proposal-card";

  const meta = document.createElement("div");
  meta.className = "proposal-meta";
  const label = document.createElement("span");
  label.textContent = `${proposal.cells.length} proposed marks`;
  const conflict = document.createElement("span");
  const liveConflicts = proposal.cells.filter((cell) => {
    const mark = state.draft[toIndex(cell.row, cell.column)];
    return mark && mark.terrain !== cell.terrain;
  }).length;
  conflict.textContent = liveConflicts ? `${liveConflicts} conflicts` : "clear overlay";
  meta.append(label, conflict);

  const rationale = document.createElement("p");
  rationale.textContent = proposal.rationale;

  const terrainSummary = proposal.cells.reduce((summary, cell) => {
    summary[cell.terrain] = (summary[cell.terrain] || 0) + 1;
    return summary;
  }, {});
  const chips = document.createElement("div");
  chips.className = "proposal-chips";
  for (const [terrain, count] of Object.entries(terrainSummary)) {
    const chip = document.createElement("span");
    const terrainChip = document.createElement("i");
    terrainChip.className = `terrain-chip terrain-${terrain}`;
    chip.append(terrainChip, `${count} ${terrainLabel(terrain).toLowerCase()}`);
    chips.append(chip);
  }

  const confidence = document.createElement("div");
  confidence.className = "confidence-row";
  const averageConfidence = proposal.cells.reduce((sum, cell) => sum + cell.confidence, 0) / proposal.cells.length;
  const basisCounts = proposal.cells.reduce(
    (counts, cell) => {
      counts[cell.basis] = (counts[cell.basis] || 0) + 1;
      return counts;
    },
    {},
  );
  const confidenceBreakdown = document.createElement("span");
  confidenceBreakdown.textContent = [
    basisCounts.exact && `${basisCounts.exact} exact`,
    basisCounts.inferred && `${basisCounts.inferred} inferred`,
    basisCounts["human-reading"] && `${basisCounts["human-reading"]} human`,
  ]
    .filter(Boolean)
    .join(" / ");
  const confidenceAverage = document.createElement("strong");
  confidenceAverage.textContent = `${Math.round(averageConfidence * 100)}% avg`;
  confidence.append(confidenceBreakdown, confidenceAverage);
  const meter = document.createElement("i");
  meter.style.setProperty("--confidence", averageConfidence);
  confidence.append(meter);

  const actions = document.createElement("div");
  actions.className = "proposal-actions";
  const reject = document.createElement("button");
  reject.type = "button";
  reject.textContent = "Reject";
  reject.setAttribute("aria-label", `Reject agent proposal of ${proposal.cells.length} marks`);
  reject.addEventListener("click", () => {
    rejectProposal(state, proposal.id, "Human declined: strengthen the evidence or ask for a field reading.");
    render();
  });
  const acceptCertain = document.createElement("button");
  acceptCertain.type = "button";
  acceptCertain.textContent = "Accept verified";
  acceptCertain.setAttribute("aria-label", `Accept exact scans and authorized human readings from proposal of ${proposal.cells.length} marks`);
  acceptCertain.addEventListener("click", () => {
    try {
      const score = acceptProposal(state, proposal.id, {
        allowedBases: ["exact", "human-reading"],
        reason: "Accepted exact scans and authorized human readings; inferred cells need more evidence.",
      });
      showToast(`Evidence-backed marks committed / ${formatPercent(score.coverage)}% charted`);
      render();
    } catch (error) {
      showToast(error.message);
    }
  });
  const accept = document.createElement("button");
  accept.type = "button";
  accept.className = "accept-button";
  accept.textContent = "Accept patch";
  accept.setAttribute("aria-label", `Accept all ${proposal.cells.length} marks in agent proposal`);
  accept.addEventListener("click", () => {
    try {
      const allowOverwrite = liveConflicts
        ? window.confirm(`${liveConflicts} marks may overwrite your chart. Accept anyway?`)
        : false;
      if (liveConflicts && !allowOverwrite) return;
      const score = acceptProposal(state, proposal.id, { allowOverwrite });
      showToast(`${proposal.cells.length} marks committed / ${formatPercent(score.coverage)}% charted`);
      render();
    } catch (error) {
      showToast(error.message);
    }
  });
  actions.append(reject, acceptCertain, accept);
  article.append(meta, rationale, chips, confidence, actions);
  return article;
}

function focusQuestionCard() {
  if (!state.focus || state.revealed) return null;
  const article = document.createElement("article");
  article.className = "focus-card";
  const coordinate = `${columnLetter(state.focus.column)}${state.focus.row}`;
  const title = document.createElement("strong");
  title.textContent = `Agent needs your eyes at ${coordinate}`;
  const question = document.createElement("p");
  question.textContent = state.focus.note;
  const choices = document.createElement("div");
  choices.className = "focus-choices";
  for (const terrain of state.focus.options) {
    const button = document.createElement("button");
    button.type = "button";
    const terrainChip = document.createElement("i");
    terrainChip.className = `terrain-chip terrain-${terrain}`;
    button.append(terrainChip, terrainLabel(terrain));
    button.addEventListener("click", () => {
      answerHumanFocus(state, terrain, 0.68);
      showToast(`${terrainLabel(terrain)} reading sent back to the agent.`);
      render();
    });
    choices.append(button);
  }
  article.append(title, question, choices);
  return article;
}

function renderFocusBanner() {
  if (!state.focus || state.revealed) {
    elements.focusBanner.hidden = true;
    elements.focusBanner.replaceChildren();
    return;
  }
  elements.focusBanner.hidden = false;
  const coordinate = document.createElement("strong");
  coordinate.textContent = `Human reading requested / ${columnLetter(state.focus.column)}${state.focus.row}`;
  const note = document.createElement("span");
  note.textContent = state.focus.note;
  elements.focusBanner.replaceChildren(coordinate, note);
}

function renderNotes() {
  const pending = state.proposals.filter((proposal) => proposal.status === "pending");
  elements.pendingCount.textContent = `${pending.length} pending`;
  const fragment = document.createDocumentFragment();

  const focusCard = focusQuestionCard();
  if (focusCard) fragment.append(focusCard);
  if (!state.revealed) {
    for (const proposal of pending) fragment.append(proposalCard(proposal));
  }
  for (const activity of state.activity.slice(0, 8)) fragment.append(noteCard(activity));
  elements.notesFeed.replaceChildren(fragment);
  renderFocusBanner();
}

function renderStats() {
  const score = scoreDraft(state);
  elements.surveyCount.textContent = state.surveysRemaining;
  elements.coverageValue.textContent = formatPercent(score.coverage);
  elements.chargePips.replaceChildren();
  for (let index = 0; index < SURVEY_LIMIT; index += 1) {
    const pip = document.createElement("i");
    pip.classList.toggle("is-spent", index >= state.surveysRemaining);
    elements.chargePips.append(pip);
  }
  if (state.revealed) {
    elements.accuracyValue.textContent = score.accuracy === null ? "--" : formatPercent(score.accuracy);
    elements.accuracyUnit.textContent = score.accuracy === null ? "" : "%";
  } else {
    elements.accuracyValue.textContent = state.lastConsultation?.band.label || "Unverified";
    elements.accuracyUnit.textContent = "";
  }
  elements.consultCount.textContent = state.consultationsRemaining;
  elements.revealButton.disabled = state.revealed;
  elements.scoreButton.disabled = state.revealed || state.consultationsRemaining === 0;
  const hasUncommittedReading = state.humanObservations.some((observation) => {
    const mark = state.draft[toIndex(observation.row, observation.column)];
    return !mark || mark.terrain !== observation.terrain;
  });
  elements.demoTurnButton.disabled = state.revealed || (state.surveysRemaining === 0 && !hasUncommittedReading);
  elements.missionPhase.textContent = state.revealed
    ? "Chart transmitted"
    : state.focus
      ? "Human reading required"
      : state.proposals.some((proposal) => proposal.status === "pending")
        ? "Authorization required"
        : state.surveysRemaining === SURVEY_LIMIT
          ? "Awaiting dispatch"
          : state.surveysRemaining === 0
            ? "Final evidence ready"
            : "Ready for next scan";

  renderTurnInstruction();
}

function renderTurnInstruction() {
  const title = elements.turnInstruction.querySelector("strong");
  const detail = elements.turnInstruction.querySelector("p");
  if (state.revealed) {
    title.textContent = "Mission complete";
    detail.textContent = "The chart is revealed below. Start a new operation to try another island.";
    elements.turnInstruction.dataset.state = "complete";
    return;
  }
  if (state.focus) {
    title.textContent = "03 / Answer the pinned question";
    detail.textContent = "Choose the terrain your spectral layer suggests. Your answer goes back to the agent through inspect_chart.";
    elements.turnInstruction.dataset.state = "human";
    return;
  }
  if (state.proposals.some((proposal) => proposal.status === "pending")) {
    title.textContent = "02 / Review the gold-striped patch";
    detail.textContent = "Accept verified to keep exact scans and authorized human readings, accept the full patch, or reject it.";
    elements.turnInstruction.dataset.state = "review";
    return;
  }
  if (state.surveysRemaining === SURVEY_LIMIT) {
    title.textContent = "01 / Connect a browser agent";
    detail.textContent = "Copy the mission above and ask ChatGPT to use Site tools. Use local replay only when testing without native WebMCP.";
    elements.turnInstruction.dataset.state = "dispatch";
    return;
  }
  if (state.surveysRemaining === 0) {
    title.textContent = "Finish the landing chart";
    detail.textContent = "Review any final evidence, color remaining gaps with your pencil, then transmit the chart.";
    elements.turnInstruction.dataset.state = "finish";
    return;
  }
  title.textContent = "01 / Dispatch the next scan";
  detail.textContent = "You can send the agent again after resolving the current handoff.";
  elements.turnInstruction.dataset.state = "dispatch";
}

function render() {
  renderStats();
  renderGrid();
  renderNotes();
  renderProtocolTrace();
}

function setSelectedTerrain(terrain) {
  selectedTerrain = terrain;
  for (const button of elements.palette.querySelectorAll("[data-terrain]")) {
    const selected = button.dataset.terrain === terrain;
    button.classList.toggle("is-selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  }
}

function paintFromElement(target) {
  const cell = target?.closest?.(".chart-cell");
  if (!cell || state.revealed) return;
  paintCell(state, Number(cell.dataset.row), Number(cell.dataset.column), selectedTerrain);
  renderStats();
  renderGrid();
}

async function copyAgentPrompt() {
  const prompt = `Join my Seven Transects rescue operation as the remote surveyor. First call get_expedition_state. The fleet needs a landing chart with 50% coverage and 88% precision before seven scan windows are spent. Each survey returns one exact cross-section. Cite exact cells as basis "exact" and mark interpolations as "inferred" with honest confidence. Use focus_human_attention when you need my noisy spectral reading, then call inspect_chart to consume my answer. Stage small auditable patches, never assume approval, and use the two safety checks sparingly.`;
  try {
    await navigator.clipboard.writeText(prompt);
    elements.promptFeedback.textContent = "Mission prompt copied. Paste it into ChatGPT beside this live page.";
  } catch {
    elements.promptFeedback.textContent = prompt;
  }
}

function deduplicateSurveyCells(surveys) {
  const cells = new Map();
  for (const survey of surveys) {
    for (const cell of [...survey.rowTransect, ...survey.columnTransect]) {
      cells.set(`${cell.row}:${cell.column}`, { ...cell, confidence: 1, basis: "exact" });
    }
  }
  return [...cells.values()];
}

async function runPreviewTurn() {
  const callLocalTool = async (name, input) => {
    toolInvocationSource = "local replay";
    try {
      return await toolHandlers[name](input);
    } finally {
      toolInvocationSource = "site tool";
    }
  };
  try {
    if (state.proposals.some((proposal) => proposal.status === "pending")) {
      showToast("Review the pending proposal before the agent takes another turn.");
      return;
    }
    if (state.focus) {
      showToast("Answer the agent's field-reading question first.");
      return;
    }
    await callLocalTool("get_expedition_state");
    const sharedChart = await callLocalTool("inspect_chart");
    const route = [
      { row: 6, column: 6 },
      { row: 3, column: 3 },
      { row: 3, column: 9 },
      { row: 9, column: 3 },
      { row: 9, column: 9 },
      { row: 6, column: 2 },
      { row: 6, column: 10 },
    ];
    const used = new Set(state.surveys.map((survey) => `${survey.row}:${survey.column}`));
    const center = route.find((candidate) => !used.has(`${candidate.row}:${candidate.column}`));
    const survey = center && state.surveysRemaining > 0 ? await callLocalTool("survey_region", center) : null;
    const cells = survey ? deduplicateSurveyCells([survey]) : [];
    const exactKeys = new Set(cells.map((cell) => `${cell.row}:${cell.column}`));
    const committedKeys = new Set(sharedChart.committedCells.map((cell) => `${cell.row}:${cell.column}:${cell.terrain}`));
    for (const observation of sharedChart.humanObservations) {
      const coordinateKey = `${observation.row}:${observation.column}`;
      if (exactKeys.has(coordinateKey) || committedKeys.has(`${coordinateKey}:${observation.terrain}`)) continue;
      cells.push({
        row: observation.row,
        column: observation.column,
        terrain: observation.terrain,
        confidence: observation.confidence,
        basis: "human-reading",
      });
    }
    if (!survey && !cells.length) {
      showToast("No new structured evidence is waiting for the agent.");
      return;
    }
    const inferenceCandidates = center
      ? [
          { row: center.row + 1, column: center.column + 1 },
          { row: center.row - 1, column: center.column + 1 },
          { row: center.row + 1, column: center.column - 1 },
        ]
      : [];
    const inferred = survey && inferenceCandidates.find(
      (cell) => cell.row >= 1 && cell.row <= GRID_SIZE && cell.column >= 1 && cell.column <= GRID_SIZE && !exactKeys.has(`${cell.row}:${cell.column}`),
    );
    if (inferred) {
      cells.push({
        ...inferred,
        terrain: survey.dominantTerrain,
        confidence: 0.52,
        basis: "inferred",
      });
    }
    await callLocalTool("propose_chart_patch", {
      cells,
      rationale: survey
        ? "Exact cross-transect readings are high confidence. Prior human field readings are carried forward, while one diagonal interpolation remains deliberately uncertain."
        : "The survey budget is spent. This final patch carries the human's structured field reading back into the shared chart.",
    });
    if (inferred) {
      await callLocalTool("focus_human_attention", {
        ...inferred,
        note: "My diagonal interpolation is uncertain. What does your noisy field lens suggest here?",
        options: ["water", "meadow", "forest", "ridge"],
      });
    }
    showToast(survey ? "Local replay spent one signal window and staged a landing patch." : "Local replay consumed the final human reading and staged it for approval.");
    requestAnimationFrame(() => {
      elements.missionDeck.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        block: "start",
      });
    });
  } catch (error) {
    showToast(error.message);
  }
}

function startNewExpedition() {
  const seed = elements.seedInput.value.trim() || "northstar";
  state = createGame(seed);
  protocolEvents = [];
  protocolSequence = 0;
  activeGridIndex = 0;
  render();
  showToast(`Operation ${state.seed.toUpperCase()} is live.`);
}

function checkScore() {
  if (!scoreDraft(state).marked) {
    showToast("The chart is still blank. Survey or draw a few cells first.");
    return;
  }
  try {
    const reading = consultChart(state);
    showToast(`${formatPercent(reading.coverage)}% charted / ${reading.band.label}`);
    render();
  } catch (error) {
    showToast(error.message);
  }
}

function revealTruth() {
  if (state.revealed) return;
  const score = finishExpedition(state);
  render();
  elements.finaleDialog.classList.toggle("is-won", score.won);
  elements.finaleSeal.textContent = score.won ? "VII" : "X";
  elements.finaleVerdict.textContent = score.won
    ? "Landing clearance granted. Agent scans and mission-control judgment formed a fleet-ready chart."
    : "Landing clearance denied. Coral outlines show where confidence outran evidence.";
  elements.finalCoverage.textContent = `${formatPercent(score.coverage)}%`;
  elements.finalPrecision.textContent = `${formatPercent(score.accuracy || 0)}%`;
  elements.finalTeamwork.textContent = String(state.humanObservations.length + state.proposals.filter((item) => item.status !== "pending").length);
  elements.finaleSeed.textContent = `OPERATION RECORD / ${state.seed.toUpperCase()}`;
  elements.finaleDialog.showModal();
}

elements.palette.addEventListener("click", (event) => {
  const button = event.target.closest("[data-terrain]");
  if (button) setSelectedTerrain(button.dataset.terrain);
});
elements.chartGrid.addEventListener("pointerdown", (event) => {
  if (event.pointerType === "mouse" && event.button !== 0) return;
  drawing = true;
  const cell = event.target.closest(".chart-cell");
  if (cell) activeGridIndex = Number(cell.dataset.index);
  paintFromElement(event.target);
});
elements.chartGrid.addEventListener("click", (event) => {
  if (event.detail === 0) paintFromElement(event.target);
});
elements.chartGrid.addEventListener("pointermove", (event) => {
  if (!drawing || event.buttons !== 1) return;
  paintFromElement(document.elementFromPoint(event.clientX, event.clientY));
});
window.addEventListener("pointerup", () => {
  drawing = false;
});
window.addEventListener("pointercancel", () => {
  drawing = false;
});
elements.chartGrid.addEventListener("keydown", (event) => {
  const cell = event.target.closest(".chart-cell");
  if (!cell) return;
  activeGridIndex = Number(cell.dataset.index);
  const terrainByKey = { "1": "water", "2": "meadow", "3": "forest", "4": "ridge" };
  if (terrainByKey[event.key]) {
    setSelectedTerrain(terrainByKey[event.key]);
    paintFromElement(cell);
  }
  if (event.key === "Backspace" || event.key === "Delete") {
    eraseCell(state, Number(cell.dataset.row), Number(cell.dataset.column));
    render();
  }
  const movement = {
    ArrowLeft: [0, -1],
    ArrowRight: [0, 1],
    ArrowUp: [-1, 0],
    ArrowDown: [1, 0],
  }[event.key];
  if (movement) {
    event.preventDefault();
    const nextRow = Math.max(1, Math.min(GRID_SIZE, Number(cell.dataset.row) + movement[0]));
    const nextColumn = Math.max(1, Math.min(GRID_SIZE, Number(cell.dataset.column) + movement[1]));
    const nextIndex = toIndex(nextRow, nextColumn);
    activeGridIndex = nextIndex;
    renderGrid();
    elements.chartGrid.querySelector(`[data-index="${nextIndex}"]`)?.focus();
  }
});
elements.copyPromptButton.addEventListener("click", copyAgentPrompt);
elements.demoTurnButton.addEventListener("click", runPreviewTurn);
elements.newExpeditionButton.addEventListener("click", startNewExpedition);
elements.seedInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") startNewExpedition();
});
elements.scoreButton.addEventListener("click", checkScore);
elements.revealButton.addEventListener("click", revealTruth);
elements.closeFinaleButton.addEventListener("click", () => elements.finaleDialog.close());
elements.newFromFinaleButton.addEventListener("click", () => {
  elements.finaleDialog.close();
  elements.seedInput.value = `expedition-${Math.random().toString(36).slice(2, 8)}`;
  startNewExpedition();
});

renderAxes();
render();

const toolHandlers = createToolHandlers(
  () => state,
  () => render(),
  recordToolEvent,
);
const toolDefinitions = buildToolDefinitions(toolHandlers);

window.__sevenTransects = { tools: toolHandlers, toolDefinitions };
if (new URLSearchParams(window.location.search).has("debug")) {
  window.__sevenTransects.getDebugState = () => state;
}

registerWebMCP(toolDefinitions, setSiteToolStatus);
