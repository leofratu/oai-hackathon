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

export function createToolHandlers(getState, onChange) {
  const run = (operation) => {
    const result = operation(getState());
    onChange();
    return result;
  };

  return {
    get_expedition_state: async () => expeditionStateForAgent(getState()),
    survey_region: async (input) => run((state) => surveyRegion(state, input)),
    inspect_chart: async () => inspectChart(getState()),
    propose_chart_patch: async (input) => run((state) => proposeChartPatch(state, input)),
    focus_human_attention: async (input) => run((state) => focusHumanAttention(state, input)),
    consult_compass: async () => run((state) => consultChart(state)),
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
      title: "Spend a survey charge",
      description:
        "Spend one limited survey charge at a grid coordinate. Returns exact horizontal and vertical terrain transects plus an aggregate histogram for the surrounding square. This visibly pins a survey to the shared chart.",
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
        "Stage up to 32 translucent terrain marks with confidence and a short rationale. This does not commit any mark. The human must accept or reject the proposal in the visible Field notes panel.",
      inputSchema: {
        type: "object",
        properties: {
          cells: {
            type: "array",
            minItems: 1,
            maxItems: 32,
            items: {
              type: "object",
              properties: {
                row: { type: "integer", minimum: 1, maximum: GRID_SIZE },
                column: { type: "integer", minimum: 1, maximum: GRID_SIZE },
                terrain: { type: "string", enum: ["water", "meadow", "forest", "ridge"] },
                confidence: { type: "number", minimum: 0, maximum: 1 },
                basis: { type: "string", enum: ["exact", "inferred", "human-reading"] },
              },
              required: ["row", "column", "terrain"],
              additionalProperties: false,
            },
          },
          rationale: { type: "string", minLength: 1, maxLength: 240 },
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
          row: { type: "integer", minimum: 1, maximum: GRID_SIZE },
          column: { type: "integer", minimum: 1, maximum: GRID_SIZE },
          note: { type: "string", minLength: 1, maxLength: 160 },
          options: {
            type: "array",
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
      title: "Consult the precision compass",
      description:
        "Spend one of two consultations to receive chart coverage and a broad precision band. It never reveals exact correctness or individual mistakes.",
      inputSchema: emptySchema,
      annotations: { readOnlyHint: false },
      execute: handlers.consult_compass,
    },
  ];
}

export async function registerWebMCP(definitions, onStatus) {
  const modelContext = document.modelContext ?? navigator.modelContext ?? globalThis.modelContext;
  if (typeof modelContext?.registerTool !== "function") {
    onStatus({ state: "fallback", message: "Site tools unavailable · preview mode" });
    return false;
  }

  try {
    await Promise.all(definitions.map((definition) => modelContext.registerTool(definition)));
    onStatus({ state: "ready", message: `${definitions.length} site tools ready` });
    return true;
  } catch (error) {
    console.error("Seven Transects could not register WebMCP tools", error);
    onStatus({ state: "error", message: "Site tool registration failed" });
    return false;
  }
}
