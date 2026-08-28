import {
  GRID_SIZE,
  expeditionStateForAgent,
  focusHumanAttention,
  inspectChart,
  proposeChartPatch,
  consultChart,
  surveyRegion,
} from "./game.js";

const emptySchema = {
  type: "object",
  properties: {},
  additionalProperties: false,
};

export function summarizeToolEvent({ name, result, error }) {
  if (error) return error;

  switch (name) {
    case "get_expedition_state":
      return `${result.surveysRemaining} surveys / ${result.chart.marked}/${result.chart.totalCells} cells committed`;
    case "survey_region":
      return `${result.rowTransect.length + result.columnTransect.length - 1} exact cells / ${result.surveysRemaining} charges left`;
    case "inspect_chart":
      return `${result.committedCells.length} committed / ${result.humanObservations.length} human readings`;
    case "propose_chart_patch":
      return `${result.stagedCells} cells staged / awaiting human approval`;
    case "focus_human_attention":
      return `question pinned at row ${result.focusedCell.row}, column ${result.focusedCell.column} / awaiting human`;
    case "consult_compass":
      return `${result.band.label} / ${result.consultationsRemaining} checks left`;
    default:
      return "Tool completed";
  }
}

export function formatToolInput(name, input = {}) {
  if (name === "survey_region") return `{ row: ${input.row}, column: ${input.column} }`;
  if (name === "propose_chart_patch") return `{ cells: ${input.cells?.length || 0}, rationale: ... }`;
  if (name === "focus_human_attention") return `{ row: ${input.row}, column: ${input.column}, note: ... }`;
  return "{}";
}

export function createToolHandlers(getState, onChange, onToolEvent = () => {}) {
  const notify = (event) => {
    try {
      onToolEvent(event);
    } catch (observerError) {
      console.error("Seven Transects could not render a WebMCP trace event", observerError);
    }
  };

  const invoke = (name, input, operation, mutates = false) => {
    try {
      const result = operation(getState());
      if (mutates) {
        try {
          onChange();
        } catch (renderError) {
          console.error("Seven Transects could not render a completed WebMCP action", renderError);
        }
      }
      notify({ name, input: input || {}, result, access: mutates ? "write" : "read", status: "success" });
      return result;
    } catch (cause) {
      notify({
        name,
        input: input || {},
        error: cause instanceof Error ? cause.message : String(cause),
        access: mutates ? "write" : "read",
        status: "error",
      });
      throw cause;
    }
  };

  return {
    get_expedition_state: async (input = {}) =>
      invoke("get_expedition_state", input, (state) => expeditionStateForAgent(state)),
    survey_region: async (input) => invoke("survey_region", input, (state) => surveyRegion(state, input), true),
    inspect_chart: async (input = {}) => invoke("inspect_chart", input, (state) => inspectChart(state)),
    propose_chart_patch: async (input) =>
      invoke("propose_chart_patch", input, (state) => proposeChartPatch(state, input), true),
    focus_human_attention: async (input) =>
      invoke("focus_human_attention", input, (state) => focusHumanAttention(state, input), true),
    consult_compass: async (input = {}) => invoke("consult_compass", input, (state) => consultChart(state), true),
  };
}

export function buildToolDefinitions(handlers) {
  return [
    {
      name: "get_expedition_state",
      title: "Read expedition state",
      description:
        "Read Seven Transects' rules, grid dimensions, survey budget, completed surveys, pending proposals, and current chart score. This never reveals the hidden truth map.",
      inputSchema: emptySchema,
      annotations: { readOnlyHint: true },
      execute: handlers.get_expedition_state,
    },
    {
      name: "survey_region",
      title: "Spend a scan window",
      description:
        "Spend one limited signal window at a grid coordinate. Returns exact horizontal and vertical terrain transects plus an aggregate histogram for the surrounding square. This visibly pins a scan to the shared landing chart.",
      inputSchema: {
        type: "object",
        properties: {
          row: { type: "integer", minimum: 1, maximum: GRID_SIZE, description: "One-based chart row." },
          column: { type: "integer", minimum: 1, maximum: GRID_SIZE, description: "One-based chart column." },
        },
        required: ["row", "column"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false },
      execute: handlers.survey_region,
    },
    {
      name: "inspect_chart",
      title: "Inspect the shared chart",
      description:
        "Read human-approved chart marks, previous survey evidence, pending proposals, and progress. Hidden truth is never included.",
      inputSchema: emptySchema,
      annotations: { readOnlyHint: true },
      execute: handlers.inspect_chart,
    },
    {
      name: "propose_chart_patch",
      title: "Stage chart marks",
      description:
        "Stage up to 32 translucent terrain marks with confidence and a short rationale. This does not commit any mark. Mission control must accept or reject the proposal in the visible Operations log.",
      inputSchema: {
        type: "object",
        properties: {
          cells: {
            type: "array",
            description: "One to 32 terrain marks to stage for human review.",
            minItems: 1,
            maxItems: 32,
            items: {
              type: "object",
              properties: {
                row: { type: "integer", minimum: 1, maximum: GRID_SIZE, description: "One-based chart row." },
                column: { type: "integer", minimum: 1, maximum: GRID_SIZE, description: "One-based chart column." },
                terrain: { type: "string", enum: ["water", "meadow", "forest", "ridge"], description: "Terrain to stage at this coordinate." },
                confidence: { type: "number", minimum: 0, maximum: 1, description: "Confidence from zero to one. Omit only when 0.7 is appropriate." },
                basis: { type: "string", enum: ["exact", "inferred", "human-reading"], description: "Evidence source for this proposed mark." },
              },
              required: ["row", "column", "terrain"],
              additionalProperties: false,
            },
          },
          rationale: { type: "string", minLength: 1, maxLength: 240, description: "Short reason the human should accept or question this patch." },
        },
        required: ["cells", "rationale"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false },
      execute: handlers.propose_chart_patch,
    },
    {
      name: "focus_human_attention",
      title: "Request human judgment",
      description:
        "Highlight one chart coordinate and pin a concise question or observation for the human. Use this when visual interpolation or a tradeoff needs human judgment.",
      inputSchema: {
        type: "object",
        properties: {
          row: { type: "integer", minimum: 1, maximum: GRID_SIZE, description: "One-based row for the human to inspect." },
          column: { type: "integer", minimum: 1, maximum: GRID_SIZE, description: "One-based column for the human to inspect." },
          note: { type: "string", minLength: 1, maxLength: 160, description: "A direct question about the human-owned field layer." },
          options: {
            type: "array",
            description: "Two to four terrain answers the human can choose from.",
            minItems: 2,
            maxItems: 4,
            uniqueItems: true,
            items: { type: "string", enum: ["water", "meadow", "forest", "ridge"] },
          },
        },
        required: ["row", "column", "note"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false },
      execute: handlers.focus_human_attention,
    },
    {
      name: "consult_compass",
      title: "Run a safety check",
      description:
        "Spend one of two consultations to receive chart coverage and a broad precision band. It never reveals exact correctness or individual mistakes.",
      inputSchema: emptySchema,
      annotations: { readOnlyHint: false },
      execute: handlers.consult_compass,
    },
  ];
}

export async function registerWebMCP(definitions, onStatus) {
  const documentModelContext = document.modelContext;
  if (typeof documentModelContext?.registerTool !== "function") {
    onStatus({ state: "fallback", message: "Local replay / WebMCP off" });
    return false;
  }

  const registrationController = new AbortController();
  try {
    await Promise.all(
      definitions.map((definition) =>
        document.modelContext.registerTool(definition, { signal: registrationController.signal }),
      ),
    );
    onStatus({ state: "ready", message: `WebMCP live / ${definitions.length} tools` });
    return true;
  } catch (error) {
    registrationController.abort();
    console.error("Seven Transects could not register WebMCP tools", error);
    onStatus({ state: "error", message: "WebMCP registration failed" });
    return false;
  }
}
