export const GRID_SIZE = 12;
export const SURVEY_LIMIT = 7;
export const SURVEY_RADIUS = 2;
export const TARGET_COVERAGE = 0.5;
export const TARGET_ACCURACY = 0.88;
export const MAX_PROPOSAL_CELLS = 32;
export const MAX_PENDING_PROPOSALS = 3;
export const CONSULT_LIMIT = 2;

export const TERRAINS = Object.freeze({
  water: { label: "Water", symbol: "≈" },
  meadow: { label: "Meadow", symbol: "." },
  forest: { label: "Forest", symbol: "♠" },
  ridge: { label: "Ridge", symbol: "▲" },
});

const TERRAIN_NAMES = Object.keys(TERRAINS);

function hashSeed(value) {
  let hash = 2166136261;
  for (const character of String(value)) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed) {
  return function random() {
    let value = (seed += 0x6d2b79f5);
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function cellNoise(row, column, salt) {
  const value = Math.sin((row + 1) * 12.9898 + (column + 1) * 78.233 + salt * 0.731) * 43758.5453;
  return value - Math.floor(value);
}

function assertInteger(value, name, minimum, maximum) {
  if (!Number.isInteger(value) || value < minimum || value > maximum) {
    throw new RangeError(`${name} must be an integer from ${minimum} to ${maximum}.`);
  }
}

function assertTerrain(terrain) {
  if (!TERRAIN_NAMES.includes(terrain)) {
    throw new TypeError(`terrain must be one of: ${TERRAIN_NAMES.join(", ")}.`);
  }
}

export function toIndex(row, column) {
  return (row - 1) * GRID_SIZE + (column - 1);
}

export function toCoordinate(index) {
  return {
    row: Math.floor(index / GRID_SIZE) + 1,
    column: (index % GRID_SIZE) + 1,
  };
}

export function generateIsland(seed = "northstar") {
  const normalizedSeed = String(seed || "northstar").trim().slice(0, 32) || "northstar";
  const numericSeed = hashSeed(normalizedSeed);
  const random = mulberry32(numericSeed);
  const centerX = 5.5 + (random() - 0.5) * 1.2;
  const centerY = 5.5 + (random() - 0.5) * 1.2;
  const width = 4.55 + random() * 0.65;
  const height = 4.25 + random() * 0.75;
  const ridgeX = centerX + (random() - 0.5) * 2.3;
  const ridgeY = centerY + (random() - 0.5) * 2.3;
  const salt = numericSeed % 997;
  const truth = [];

  for (let row = 0; row < GRID_SIZE; row += 1) {
    for (let column = 0; column < GRID_SIZE; column += 1) {
      const dx = (column - centerX) / width;
      const dy = (row - centerY) / height;
      const coastNoise = (cellNoise(row, column, salt) - 0.5) * 0.2;
      const wave = Math.sin((row + salt) * 0.82) * 0.045 + Math.cos((column - salt) * 0.7) * 0.04;
      const distance = Math.sqrt(dx * dx + dy * dy) + coastNoise + wave;

      if (distance > 1) {
        truth.push("water");
        continue;
      }

      const ridgeDistance = Math.hypot(column - ridgeX, row - ridgeY);
      const texture = cellNoise(row, column, salt + 311);
      if (ridgeDistance < 1.65 + texture * 0.7 || (distance < 0.42 && texture > 0.52)) {
        truth.push("ridge");
      } else if (texture > 0.5 || (row + column + Math.floor(random() * 3)) % 7 === 0) {
        truth.push("forest");
      } else {
        truth.push("meadow");
      }
    }
  }

  return truth;
}

export function generateFieldLens(truth, seed = "northstar") {
  const salt = hashSeed(`${seed}:field-lens`) % 1543;
  return truth.map((terrain, index) => {
    const { row, column } = toCoordinate(index);
    const confidence = 0.52 + cellNoise(row, column, salt + 91) * 0.32;
    const isReliable = cellNoise(row, column, salt) < confidence;
    if (isReliable) return { terrain, confidence, reliable: true };
    const alternatives = TERRAIN_NAMES.filter((candidate) => candidate !== terrain);
    const alternativeIndex = Math.floor(cellNoise(row, column, salt + 417) * alternatives.length);
    return { terrain: alternatives[alternativeIndex], confidence, reliable: false };
  });
}

export function createGame(seed = "northstar") {
  const normalizedSeed = String(seed || "northstar").trim().slice(0, 32) || "northstar";
  const truth = generateIsland(normalizedSeed);
  return {
    seed: normalizedSeed,
    truth,
    fieldLens: generateFieldLens(truth, normalizedSeed),
    draft: Array(GRID_SIZE * GRID_SIZE).fill(null),
    surveysRemaining: SURVEY_LIMIT,
    consultationsRemaining: CONSULT_LIMIT,
    lastConsultation: null,
    surveys: [],
    proposals: [],
    focus: null,
    humanObservations: [],
    revealed: false,
    activity: [
      {
        id: "launch",
        type: "system",
        message: `Operation "${normalizedSeed}" is live. Seven scan windows remain.`,
      },
    ],
    sequence: 0,
  };
}

function addActivity(state, type, message, detail = null) {
  state.sequence += 1;
  state.activity.unshift({
    id: `activity-${state.sequence}`,
    type,
    message,
    detail,
  });
}

function collectTransect(state, row, column, radius, axis) {
  const cells = [];
  for (let offset = -radius; offset <= radius; offset += 1) {
    const nextRow = axis === "row" ? row : row + offset;
    const nextColumn = axis === "row" ? column + offset : column;
    if (nextRow < 1 || nextRow > GRID_SIZE || nextColumn < 1 || nextColumn > GRID_SIZE) continue;
    cells.push({
      row: nextRow,
      column: nextColumn,
      terrain: state.truth[toIndex(nextRow, nextColumn)],
    });
  }
  return cells;
}

export function surveyRegion(state, input) {
  if (state.revealed) throw new Error("This expedition is already finished.");
  if (state.surveysRemaining <= 0) throw new Error("No survey charges remain.");

  const row = Number(input?.row);
  const column = Number(input?.column);
  assertInteger(row, "row", 1, GRID_SIZE);
  assertInteger(column, "column", 1, GRID_SIZE);
  if (state.surveys.some((survey) => survey.row === row && survey.column === column)) {
    throw new Error(`Sector ${columnLetter(column)}${row} has already been surveyed.`);
  }

  const radius = SURVEY_RADIUS;

  const rowTransect = collectTransect(state, row, column, radius, "row");
  const columnTransect = collectTransect(state, row, column, radius, "column");
  const histogram = Object.fromEntries(TERRAIN_NAMES.map((terrain) => [terrain, 0]));

  for (let checkRow = Math.max(1, row - radius); checkRow <= Math.min(GRID_SIZE, row + radius); checkRow += 1) {
    for (
      let checkColumn = Math.max(1, column - radius);
      checkColumn <= Math.min(GRID_SIZE, column + radius);
      checkColumn += 1
    ) {
      const terrain = state.truth[toIndex(checkRow, checkColumn)];
      histogram[terrain] += 1;
    }
  }

  const dominantTerrain = TERRAIN_NAMES.reduce((best, terrain) =>
    histogram[terrain] > histogram[best] ? terrain : best,
  );
  const survey = {
    id: `survey-${state.surveys.length + 1}`,
    row,
    column,
    radius,
    rowTransect,
    columnTransect,
    histogram,
    dominantTerrain,
  };
  state.surveys.push(survey);
  state.surveysRemaining -= 1;
  addActivity(
    state,
    "survey",
    `Remote surveyor scanned sector ${columnLetter(column)}${row}. ${state.surveysRemaining} signal windows remain.`,
    `${TERRAINS[dominantTerrain].label} dominates the surrounding square.`,
  );

  return {
    ok: true,
    surveyId: survey.id,
    center: { row, column },
    radius,
    rowTransect,
    columnTransect,
    surroundingHistogram: histogram,
    dominantTerrain,
    surveysRemaining: state.surveysRemaining,
    instruction:
      "Use the exact transect cells as evidence. Infer between them cautiously, then stage a proposal for the human to review.",
  };
}

export function proposeChartPatch(state, input) {
  if (state.revealed) throw new Error("This expedition is already finished.");
  if (state.proposals.filter((proposal) => proposal.status === "pending").length >= MAX_PENDING_PROPOSALS) {
    throw new Error(`Resolve a pending proposal before staging another. At most ${MAX_PENDING_PROPOSALS} may wait.`);
  }
  if (!Array.isArray(input?.cells) || input.cells.length === 0) {
    throw new TypeError("cells must be a non-empty array.");
  }
  if (input.cells.length > MAX_PROPOSAL_CELLS) {
    throw new RangeError(`A proposal may contain at most ${MAX_PROPOSAL_CELLS} cells.`);
  }

  const unique = new Map();
  for (const candidate of input.cells) {
    const row = Number(candidate?.row);
    const column = Number(candidate?.column);
    const terrain = candidate?.terrain;
    const confidence = candidate?.confidence === undefined ? 0.7 : Number(candidate.confidence);
    const basis = candidate?.basis || "inferred";
    assertInteger(row, "row", 1, GRID_SIZE);
    assertInteger(column, "column", 1, GRID_SIZE);
    assertTerrain(terrain);
    if (!Number.isFinite(confidence) || confidence < 0 || confidence > 1) {
      throw new RangeError("confidence must be a number from 0 to 1.");
    }
    if (!["exact", "inferred", "human-reading"].includes(basis)) {
      throw new TypeError("basis must be exact, inferred, or human-reading.");
    }
    unique.set(`${row}:${column}`, { row, column, terrain, confidence, basis });
  }

  const rationale = String(input.rationale || "Evidence from the latest survey.").trim().slice(0, 240);
  const cells = [...unique.values()];
  const signature = cells
    .map((cell) => `${cell.row}:${cell.column}:${cell.terrain}`)
    .sort()
    .join("|");
  if (state.proposals.some((proposal) => proposal.status === "pending" && proposal.signature === signature)) {
    throw new Error("An identical proposal is already awaiting human review.");
  }
  const conflicts = cells.filter((cell) => {
    const existing = state.draft[toIndex(cell.row, cell.column)];
    return existing && existing.terrain !== cell.terrain;
  }).length;
  const proposal = {
    id: `proposal-${state.proposals.length + 1}`,
    status: "pending",
    cells,
    rationale,
    conflicts,
    signature,
    resolution: null,
  };
  state.proposals.push(proposal);
  addActivity(
    state,
    "proposal",
    `Remote surveyor staged ${cells.length} landing-chart marks.`,
    conflicts ? `${conflicts} conflict with committed marks.` : "No committed marks are overwritten yet.",
  );

  return {
    ok: true,
    proposalId: proposal.id,
    stagedCells: cells.length,
    conflicts,
    status: "awaiting_human_review",
    instruction: "Ask mission control to inspect the translucent patch and accept or reject it in the Operations log.",
  };
}

export function acceptProposal(state, proposalId, options = {}) {
  if (state.revealed) throw new Error("This expedition is already finished.");
  const proposal = state.proposals.find((item) => item.id === proposalId);
  if (!proposal) throw new Error(`Unknown proposal: ${proposalId}`);
  if (proposal.status !== "pending") throw new Error(`Proposal ${proposalId} is already ${proposal.status}.`);

  const requestedKeys = Array.isArray(options.cellKeys) ? new Set(options.cellKeys) : null;
  const minimumConfidence = options.minimumConfidence === undefined ? null : Number(options.minimumConfidence);
  const acceptedCells = proposal.cells.filter((cell) => {
    if (requestedKeys && !requestedKeys.has(`${cell.row}:${cell.column}`)) return false;
    if (minimumConfidence !== null && cell.confidence < minimumConfidence) return false;
    return true;
  });
  if (!acceptedCells.length) throw new Error("Select at least one proposed cell to accept.");

  const currentConflicts = acceptedCells.filter((cell) => {
    const existing = state.draft[toIndex(cell.row, cell.column)];
    return existing && existing.terrain !== cell.terrain;
  });
  if (currentConflicts.length && !options.allowOverwrite) {
    throw new Error(`${currentConflicts.length} selected cells now conflict with committed marks.`);
  }

  for (const cell of acceptedCells) {
    state.draft[toIndex(cell.row, cell.column)] = {
      terrain: cell.terrain,
      source: "agent-approved",
      confidence: cell.confidence,
      basis: cell.basis,
    };
  }
  proposal.status = "accepted";
  proposal.resolution = {
    acceptedCells: acceptedCells.map(({ row, column }) => ({ row, column })),
    rejectedCount: proposal.cells.length - acceptedCells.length,
    reason: options.reason || (acceptedCells.length === proposal.cells.length ? "Accepted all" : "Accepted selected cells"),
  };
  addActivity(
    state,
    "human",
    `Human accepted ${acceptedCells.length} of ${proposal.cells.length} proposed marks.`,
    proposal.resolution.reason,
  );
  return scoreDraft(state);
}

export function rejectProposal(state, proposalId, reason = "Needs stronger evidence") {
  if (state.revealed) throw new Error("This expedition is already finished.");
  const proposal = state.proposals.find((item) => item.id === proposalId);
  if (!proposal) throw new Error(`Unknown proposal: ${proposalId}`);
  if (proposal.status !== "pending") throw new Error(`Proposal ${proposalId} is already ${proposal.status}.`);
  proposal.status = "rejected";
  proposal.resolution = { acceptedCells: [], rejectedCount: proposal.cells.length, reason: String(reason).slice(0, 120) };
  addActivity(state, "human", `Human rejected ${proposal.cells.length} proposed marks.`, proposal.resolution.reason);
}

export function paintCell(state, row, column, terrain) {
  if (state.revealed) return;
  assertInteger(row, "row", 1, GRID_SIZE);
  assertInteger(column, "column", 1, GRID_SIZE);
  assertTerrain(terrain);
  state.draft[toIndex(row, column)] = { terrain, source: "human", confidence: 1 };
}

export function eraseCell(state, row, column) {
  if (state.revealed) return;
  assertInteger(row, "row", 1, GRID_SIZE);
  assertInteger(column, "column", 1, GRID_SIZE);
  state.draft[toIndex(row, column)] = null;
}

export function focusHumanAttention(state, input) {
  if (state.revealed) throw new Error("This expedition is already finished.");
  if (state.focus?.status === "pending") {
    throw new Error("A human field reading is already awaiting an answer.");
  }
  const row = Number(input?.row);
  const column = Number(input?.column);
  assertInteger(row, "row", 1, GRID_SIZE);
  assertInteger(column, "column", 1, GRID_SIZE);
  const note = String(input?.note || "Please inspect this region.").trim().slice(0, 160);
  const options = Array.isArray(input?.options) && input.options.length
    ? [...new Set(input.options)].slice(0, 4)
    : TERRAIN_NAMES;
  options.forEach(assertTerrain);
  state.focus = { id: `question-${state.humanObservations.length + 1}`, row, column, note, options, status: "pending" };
  addActivity(state, "focus", `Remote surveyor requested mission-control judgment at ${columnLetter(column)}${row}.`, note);
  return {
    ok: true,
    focusedCell: { row, column },
    note,
    options,
    status: "human_attention_requested",
  };
}

export function answerHumanFocus(state, terrain, confidence = 0.65) {
  if (state.revealed) throw new Error("This expedition is already finished.");
  if (!state.focus || state.focus.status !== "pending") throw new Error("No human field reading is pending.");
  assertTerrain(terrain);
  if (!state.focus.options.includes(terrain)) throw new Error("That terrain was not offered for this reading.");
  const normalizedConfidence = Number(confidence);
  if (!Number.isFinite(normalizedConfidence) || normalizedConfidence < 0 || normalizedConfidence > 1) {
    throw new RangeError("confidence must be a number from 0 to 1.");
  }
  const observation = {
    id: state.focus.id,
    row: state.focus.row,
    column: state.focus.column,
    question: state.focus.note,
    terrain,
    confidence: normalizedConfidence,
  };
  state.humanObservations.push(observation);
  state.focus = null;
  addActivity(
    state,
    "human",
    `Mission control read ${TERRAINS[terrain].label.toLowerCase()} at ${columnLetter(observation.column)}${observation.row}.`,
    `Spectral-layer reading / ${Math.round(normalizedConfidence * 100)}% confidence.`,
  );
  return { ok: true, observation, status: "available_to_agent_via_inspect_chart" };
}

export function scoreDraft(state) {
  let marked = 0;
  let correct = 0;
  for (let index = 0; index < state.draft.length; index += 1) {
    const mark = state.draft[index];
    if (!mark) continue;
    marked += 1;
    if (mark.terrain === state.truth[index]) correct += 1;
  }
  const coverage = marked / state.draft.length;
  const accuracy = marked === 0 ? null : correct / marked;
  const won = coverage >= TARGET_COVERAGE && accuracy !== null && accuracy >= TARGET_ACCURACY;
  return {
    marked,
    correct,
    totalCells: state.draft.length,
    coverage,
    accuracy,
    won,
    coverageTarget: TARGET_COVERAGE,
    accuracyTarget: TARGET_ACCURACY,
  };
}

function precisionBand(accuracy) {
  if (accuracy === null) return { id: "empty", label: "No marks to verify" };
  if (accuracy >= 0.93) return { id: "exceptional", label: "Exceptional confidence" };
  if (accuracy >= TARGET_ACCURACY) return { id: "seal-ready", label: "Seal-ready confidence" };
  if (accuracy >= 0.78) return { id: "uncertain", label: "Promising but uncertain" };
  return { id: "danger", label: "Contradictions detected" };
}

export function consultChart(state) {
  if (state.revealed) {
    const score = scoreDraft(state);
    return { ok: true, final: true, coverage: score.coverage, precision: score.accuracy, won: score.won };
  }
  if (state.consultationsRemaining <= 0) throw new Error("No compass consultations remain.");
  const score = scoreDraft(state);
  const band = precisionBand(score.accuracy);
  state.consultationsRemaining -= 1;
  state.lastConsultation = {
    band,
    marked: score.marked,
    coverage: score.coverage,
    consultationsRemaining: state.consultationsRemaining,
  };
  addActivity(
    state,
    "consult",
    `Safety check: ${band.label.toLowerCase()}.`,
    `${Math.round(score.coverage * 100)}% charted / ${state.consultationsRemaining} safety check${state.consultationsRemaining === 1 ? "" : "s"} remain.`,
  );
  return { ok: true, ...state.lastConsultation };
}

export function finishExpedition(state) {
  state.revealed = true;
  const score = scoreDraft(state);
  addActivity(
    state,
    "finish",
    score.won ? "Landing clearance granted. The fleet has its chart." : "Transmission closed before the chart was safe.",
    `${Math.round(score.coverage * 100)}% charted at ${score.accuracy === null ? 0 : Math.round(score.accuracy * 100)}% precision.`,
  );
  return score;
}

export function expeditionStateForAgent(state) {
  const score = scoreDraft(state);
  return {
    name: "Seven Transects rescue cartography operation",
    grid: { rows: GRID_SIZE, columns: GRID_SIZE, coordinates: "Rows are 1-12; columns are 1-12." },
    terrainValues: TERRAIN_NAMES,
    objective: {
      coverageAtLeast: TARGET_COVERAGE,
      precisionAtLeast: TARGET_ACCURACY,
      note: "Mission control owns committed marks and final landing-chart transmission.",
    },
    surveysRemaining: state.surveysRemaining,
    consultationsRemaining: state.consultationsRemaining,
    completedSurveys: state.surveys.map(({ id, row, column, radius, dominantTerrain }) => ({
      id,
      row,
      column,
      radius,
      dominantTerrain,
    })),
    pendingProposalIds: state.proposals.filter((proposal) => proposal.status === "pending").map((proposal) => proposal.id),
    chart: {
      marked: score.marked,
      totalCells: score.totalCells,
      coverage: score.coverage,
      latestPrecisionBand: state.lastConsultation?.band || null,
    },
    pendingHumanQuestion: state.focus
      ? { row: state.focus.row, column: state.focus.column, note: state.focus.note, options: state.focus.options }
      : null,
    humanObservationCount: state.humanObservations.length,
    collaborationRules: [
      "Use survey_region strategically; it spends one of seven charges.",
      "Never claim knowledge outside returned survey evidence.",
      "Use propose_chart_patch to stage marks. Only the human can accept them.",
      "Exact transect evidence alone cannot reach the coverage target; ask for human field-lens readings to interpolate.",
      "Use focus_human_attention when visual judgment is needed, then call inspect_chart to read the answer.",
    ],
  };
}

export function inspectChart(state) {
  const committedCells = [];
  state.draft.forEach((mark, index) => {
    if (!mark) return;
    committedCells.push({ ...toCoordinate(index), ...mark });
  });
  return {
    ok: true,
    committedCells,
    pendingProposals: state.proposals
      .filter((proposal) => proposal.status === "pending")
      .map(({ id, cells, rationale, conflicts }) => ({ id, cells, rationale, conflicts })),
    resolvedProposals: state.proposals
      .filter((proposal) => proposal.status !== "pending")
      .map(({ id, status, cells, resolution }) => ({ id, status, cells, resolution })),
    surveys: state.surveys.map(({ id, row, column, radius, rowTransect, columnTransect }) => ({
      id,
      row,
      column,
      radius,
      rowTransect,
      columnTransect,
    })),
    humanObservations: state.humanObservations,
    pendingHumanQuestion: state.focus,
    progress: {
      marked: scoreDraft(state).marked,
      totalCells: GRID_SIZE * GRID_SIZE,
      coverage: scoreDraft(state).coverage,
      latestPrecisionBand: state.lastConsultation?.band || null,
      consultationsRemaining: state.consultationsRemaining,
    },
  };
}

export function surveyEvidenceByIndex(state) {
  const result = new Map();
  for (const survey of state.surveys) {
    for (const cell of [...survey.rowTransect, ...survey.columnTransect]) {
      result.set(toIndex(cell.row, cell.column), { ...cell, surveyId: survey.id });
    }
  }
  return result;
}

export function pendingTerrainByIndex(state) {
  const result = new Map();
  for (const proposal of state.proposals) {
    if (proposal.status !== "pending") continue;
    for (const cell of proposal.cells) {
      result.set(toIndex(cell.row, cell.column), { ...cell, proposalId: proposal.id });
    }
  }
  return result;
}

export function columnLetter(column) {
  return String.fromCharCode(64 + column);
}
