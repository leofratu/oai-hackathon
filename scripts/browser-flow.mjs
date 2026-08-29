import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { chromium } from "playwright";
import { createServer } from "vite";

const server = await createServer({ server: { host: "127.0.0.1", port: 0 } });
await server.listen();
const address = server.httpServer.address();
const origin = `http://127.0.0.1:${address.port}`;
const installedChrome = "/usr/bin/google-chrome";
const browser = await chromium.launch({ executablePath: existsSync(installedChrome) ? installedChrome : undefined, headless: true });

const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.addInitScript(() => {
  const tools = new Map();
  const modelContext = {
    async registerTool(definition, options = {}) {
      tools.set(definition.name, definition);
      options.signal?.addEventListener("abort", () => tools.delete(definition.name), { once: true });
    },
    async getTools() { return [...tools.values()].sort((left, right) => left.name.localeCompare(right.name)); },
    async executeTool(tool, inputJson = "{}") { return tools.get(tool.name).execute(JSON.parse(inputJson)); },
  };
  Object.defineProperty(document, "modelContext", { configurable: true, value: modelContext });
});

try {
  await page.goto(origin, { waitUntil: "networkidle" });
  await page.getByText("WebMCP live / 9 tools").waitFor();
  const toolNames = await page.evaluate(async () => (await document.modelContext.getTools()).map((tool) => tool.name));
  assert.deepEqual(toolNames, [
    "evaluate_model",
    "get_training_state",
    "inspect_model_diagnostics",
    "inspect_training_history",
    "inspect_uncertain_samples",
    "predict_ticket",
    "propose_model_config",
    "queue_label_review",
    "train_confirmed_batch",
  ]);

  const diagnostics = await page.evaluate(async () => {
    const tools = await document.modelContext.getTools();
    return document.modelContext.executeTool(
      tools.find((tool) => tool.name === "inspect_model_diagnostics"),
      JSON.stringify({ featureLimit: 4 }),
    );
  });
  assert.equal(diagnostics.vocabularySize, 57);
  assert.equal(JSON.stringify(diagnostics).includes("card statement"), false);

  const prediction = await page.evaluate(async () => {
    const tools = await document.modelContext.getTools();
    return document.modelContext.executeTool(
      tools.find((tool) => tool.name === "predict_ticket"),
      JSON.stringify({ text: "The export button crashes" }),
    );
  });
  assert.ok(["human_review", "route_prediction"].includes(prediction.decision));

  const trainingState = await page.evaluate(async () => {
    const tools = await document.modelContext.getTools();
    return document.modelContext.executeTool(tools.find((tool) => tool.name === "get_training_state"), "{}");
  });
  assert.equal(trainingState.model.examplesSeen, 9);
  assert.equal("samples" in trainingState, false);

  const uncertain = await page.evaluate(async () => {
    const tools = await document.modelContext.getTools();
    return document.modelContext.executeTool(
      tools.find((tool) => tool.name === "inspect_uncertain_samples"),
      JSON.stringify({ limit: 2 }),
    );
  });
  assert.equal(uncertain.samples.length, 2);
  assert.equal(JSON.stringify(uncertain).includes("groundTruth"), false);

  await page.evaluate(async (sampleId) => {
    const tools = await document.modelContext.getTools();
    return document.modelContext.executeTool(
      tools.find((tool) => tool.name === "queue_label_review"),
      JSON.stringify({ sampleIds: [sampleId], note: "Highest entropy review sample." }),
    );
  }, uncertain.samples[0].id);
  await page.getByText("1 waiting").waitFor();
  await page.locator(".review-card .label-buttons button").first().click();

  const trained = await page.evaluate(async () => {
    const tools = await document.modelContext.getTools();
    return document.modelContext.executeTool(
      tools.find((tool) => tool.name === "train_confirmed_batch"),
      JSON.stringify({ maximum: 1 }),
    );
  });
  assert.equal(trained.trainedSampleIds.length, 1);
  assert.equal(trained.examplesSeen, 10);
  await page.getByText("10", { exact: true }).first().waitFor();

  await page.evaluate(async () => {
    const tools = await document.modelContext.getTools();
    return document.modelContext.executeTool(
      tools.find((tool) => tool.name === "propose_model_config"),
      JSON.stringify({ alpha: 0.75, reviewThreshold: 0.8, rationale: "Test human configuration approval." }),
    );
  });
  await page.getByRole("button", { name: "Accept settings" }).click();
  await page.getByText("0.75", { exact: true }).waitFor();

  const origins = await page.locator(".trace-meta span:nth-child(2)").allTextContents();
  assert.ok(origins.length >= 5);
  assert.ok(origins.every((source) => source === "site tool"));

  const fallbackPage = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await fallbackPage.goto(origin, { waitUntil: "networkidle" });
  await fallbackPage.getByText("Local replay / WebMCP off").waitFor();
  await fallbackPage.getByRole("button", { name: "Run local tool replay" }).click();
  await fallbackPage.getByText("2 waiting").waitFor();
  const localOrigins = await fallbackPage.locator(".trace-meta span:nth-child(2)").allTextContents();
  assert.ok(localOrigins.length >= 3);
  assert.ok(localOrigins.every((source) => source === "local replay"));
  await fallbackPage.close();

  console.log("Browser flow passed: nine tools, diagnostics, inference, uncertainty ranking, human labels, training, metrics, and config approval.");
} finally {
  await browser.close();
  await server.close();
}
