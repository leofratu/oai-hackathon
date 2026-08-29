import {
  evaluateModel,
  inspectTrainingHistory,
  inspectUncertainSamples,
  proposeModelConfig,
  queueLabelReview,
  trainConfirmedBatch,
  trainingStateForAgent,
} from "./model.js";

const emptySchema = { type: "object", properties: {}, additionalProperties: false };

export function summarizeToolEvent({ name, result, error }) {
  if (error) return error;
  switch (name) {
    case "get_training_state":
      return `${result.model.examplesSeen} examples / ${Math.round(result.metrics.accuracy * 100)}% holdout accuracy`;
    case "inspect_uncertain_samples":
      return `${result.samples.length} samples ranked by entropy`;
    case "queue_label_review":
      return `${result.queuedSamples.length} samples awaiting human labels`;
    case "train_confirmed_batch":
      return `${result.trainedSampleIds.length} labels trained / ${Math.round(result.metrics.accuracy * 100)}% accuracy`;
    case "evaluate_model":
      return `${Math.round(result.accuracy * 100)}% accuracy / ${Math.round(result.macroF1 * 100)}% macro F1`;
    case "propose_model_config":
      return `alpha ${result.proposal.alpha} / awaiting human approval`;
    case "inspect_training_history":
      return `${result.history.length} checkpoints / ${result.trainedSamples.length} human labels trained`;
    default:
      return "Tool completed";
  }
}

export function formatToolInput(name, input = {}) {
  if (name === "inspect_uncertain_samples") return `{ limit: ${input.limit ?? 5} }`;
  if (name === "queue_label_review") return `{ samples: ${input.sampleIds?.length || 0}, note: ... }`;
  if (name === "train_confirmed_batch") return `{ maximum: ${input.maximum ?? 3} }`;
  if (name === "propose_model_config") return `{ alpha: ${input.alpha}, threshold: ${input.reviewThreshold} }`;
  return "{}";
}

export function createToolHandlers(getState, onChange, onToolEvent = () => {}) {
  const notify = (event) => {
    try {
      onToolEvent(event);
    } catch (observerError) {
      console.error("Label Loop could not render a WebMCP trace event", observerError);
    }
  };
  const invoke = (name, input, operation, mutates = false) => {
    try {
      const result = operation(getState());
      if (mutates) {
        try {
          onChange();
        } catch (renderError) {
          console.error("Label Loop could not render a completed WebMCP action", renderError);
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
    get_training_state: async (input = {}) => invoke("get_training_state", input, trainingStateForAgent),
    inspect_uncertain_samples: async (input = {}) =>
      invoke("inspect_uncertain_samples", input, (state) => inspectUncertainSamples(state, input)),
    queue_label_review: async (input) =>
      invoke("queue_label_review", input, (state) => queueLabelReview(state, input), true),
    train_confirmed_batch: async (input = {}) =>
      invoke("train_confirmed_batch", input, (state) => trainConfirmedBatch(state, input), true),
    evaluate_model: async (input = {}) => invoke("evaluate_model", input, evaluateModel),
    propose_model_config: async (input) =>
      invoke("propose_model_config", input, (state) => proposeModelConfig(state, input), true),
    inspect_training_history: async (input = {}) => invoke("inspect_training_history", input, inspectTrainingHistory),
  };
}

export function buildToolDefinitions(handlers) {
  return [
    {
      name: "get_training_state",
      title: "Read online training state",
      description:
        "Read the Label Loop task, online Naive Bayes model, label queue, current configuration, and aggregate holdout metrics. Hidden holdout labels and unresolved human labels are excluded.",
      inputSchema: emptySchema,
      annotations: { readOnlyHint: true },
      execute: handlers.get_training_state,
    },
    {
      name: "inspect_uncertain_samples",
      title: "Rank uncertain samples",
      description:
        "Return unlabeled support tickets ranked by normalized predictive entropy. Use this to select the most informative samples for human review.",
      inputSchema: {
        type: "object",
        properties: {
          limit: { type: "integer", minimum: 1, maximum: 8, description: "Number of uncertain samples to return." },
        },
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true },
      execute: handlers.inspect_uncertain_samples,
    },
    {
      name: "queue_label_review",
      title: "Request human labels",
      description:
        "Queue one to three unlabeled samples for the person. This tool cannot assign labels. The review appears on the shared page and must be completed by the person.",
      inputSchema: {
        type: "object",
        properties: {
          sampleIds: {
            type: "array",
            minItems: 1,
            maxItems: 3,
            uniqueItems: true,
            items: { type: "string", pattern: "^ticket-[0-9]{3}$" },
            description: "Unlabeled sample IDs returned by inspect_uncertain_samples.",
          },
          note: { type: "string", minLength: 1, maxLength: 180, description: "Why these labels would improve the model." },
        },
        required: ["sampleIds", "note"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false },
      execute: handlers.queue_label_review,
    },
    {
      name: "train_confirmed_batch",
      title: "Train on confirmed labels",
      description:
        "Incrementally update the in-browser classifier with up to eight labels already confirmed by the person. Unreviewed and agent-predicted labels are never trained.",
      inputSchema: {
        type: "object",
        properties: {
          maximum: { type: "integer", minimum: 1, maximum: 8, description: "Maximum confirmed examples to consume." },
        },
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false },
      execute: handlers.train_confirmed_batch,
    },
    {
      name: "evaluate_model",
      title: "Evaluate the classifier",
      description:
        "Return aggregate accuracy, macro F1, confidence, log loss, and per-label metrics on a fixed hidden holdout set. Individual holdout examples and answers are never returned.",
      inputSchema: emptySchema,
      annotations: { readOnlyHint: true },
      execute: handlers.evaluate_model,
    },
    {
      name: "propose_model_config",
      title: "Propose model settings",
      description:
        "Stage new smoothing and low-confidence review settings with a rationale. The proposal does not change the classifier until the person accepts it on the page.",
      inputSchema: {
        type: "object",
        properties: {
          alpha: { type: "number", minimum: 0.1, maximum: 3, description: "Laplace smoothing strength." },
          reviewThreshold: { type: "number", minimum: 0.5, maximum: 0.95, description: "Predictions below this confidence require human review." },
          rationale: { type: "string", minLength: 1, maxLength: 220, description: "Why the proposed settings fit the current evidence." },
        },
        required: ["alpha", "reviewThreshold", "rationale"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false },
      execute: handlers.propose_model_config,
    },
    {
      name: "inspect_training_history",
      title: "Inspect training history",
      description:
        "Read metric checkpoints and the provenance of examples trained during this session. This never reveals hidden holdout answers.",
      inputSchema: emptySchema,
      annotations: { readOnlyHint: true },
      execute: handlers.inspect_training_history,
    },
  ];
}

export async function registerWebMCP(definitions, onStatus) {
  if (typeof document.modelContext?.registerTool !== "function") {
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
    console.error("Label Loop could not register WebMCP tools", error);
    onStatus({ state: "error", message: "WebMCP registration failed" });
    return false;
  }
}
