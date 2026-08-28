import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { chromium } from "playwright";
import { createServer } from "vite";

const server = await createServer({
  server: { host: "127.0.0.1", port: 0 },
});
await server.listen();

const address = server.httpServer.address();
const origin = `http://127.0.0.1:${address.port}`;
const installedChrome = "/usr/bin/google-chrome";
const browser = await chromium.launch({
  executablePath: existsSync(installedChrome) ? installedChrome : undefined,
  headless: true,
});

const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.addInitScript(() => {
  const tools = new Map();
  const modelContext = {
    async registerTool(definition, options = {}) {
      tools.set(definition.name, definition);
      options.signal?.addEventListener("abort", () => tools.delete(definition.name), { once: true });
    },
    async getTools() {
      return [...tools.values()].sort((left, right) => left.name.localeCompare(right.name));
    },
    async executeTool(tool, inputJson = "{}") {
      return tools.get(tool.name).execute(JSON.parse(inputJson));
    },
  };
  Object.defineProperty(document, "modelContext", { configurable: true, value: modelContext });
});

try {
  await page.goto(origin, { waitUntil: "networkidle" });
  await page.getByText("WebMCP live / 6 tools").waitFor();

  const toolNames = await page.evaluate(async () =>
    (await document.modelContext.getTools()).map((tool) => tool.name),
  );
  assert.deepEqual(toolNames, [
    "consult_compass",
    "focus_human_attention",
    "get_expedition_state",
    "inspect_chart",
    "propose_chart_patch",
    "survey_region",
  ]);

  const state = await page.evaluate(async () => {
    const tools = await document.modelContext.getTools();
    const tool = tools.find((candidate) => candidate.name === "get_expedition_state");
    return document.modelContext.executeTool(tool, "{}");
  });
  assert.equal(state.surveysRemaining, 7);
  assert.equal("seed" in state, false);

  const survey = await page.evaluate(async () => {
    const tools = await document.modelContext.getTools();
    const tool = tools.find((candidate) => candidate.name === "survey_region");
    return document.modelContext.executeTool(tool, JSON.stringify({ row: 6, column: 6 }));
  });
  assert.equal(survey.surveysRemaining, 6);
  await page.getByText("6", { exact: true }).first().waitFor();

  await page.evaluate(async (cells) => {
    const tools = await document.modelContext.getTools();
    const tool = tools.find((candidate) => candidate.name === "propose_chart_patch");
    await document.modelContext.executeTool(
      tool,
      JSON.stringify({
        cells: cells.map((cell) => ({ ...cell, confidence: 1, basis: "exact" })),
        rationale: "Commit verified cells from the completed scan.",
      }),
    );
  }, survey.rowTransect);
  await page.getByRole("button", { name: /Accept exact scans and authorized human readings/ }).click();

  await page.evaluate(async () => {
    const tools = await document.modelContext.getTools();
    const tool = tools.find((candidate) => candidate.name === "focus_human_attention");
    await document.modelContext.executeTool(
      tool,
      JSON.stringify({
        row: 7,
        column: 7,
        note: "Which terrain does the field layer suggest?",
        options: ["meadow", "forest"],
      }),
    );
  });
  await page.locator(".focus-choices button").first().click();

  const inspection = await page.evaluate(async () => {
    const tools = await document.modelContext.getTools();
    const tool = tools.find((candidate) => candidate.name === "inspect_chart");
    return document.modelContext.executeTool(tool, "{}");
  });
  assert.equal(inspection.humanObservations.length, 1);
  assert.equal(inspection.committedCells.length, 5);

  const consultation = await page.evaluate(async () => {
    const tools = await document.modelContext.getTools();
    const tool = tools.find((candidate) => candidate.name === "consult_compass");
    return document.modelContext.executeTool(tool, "{}");
  });
  assert.equal(consultation.consultationsRemaining, 1);
  assert.equal("precision" in consultation, false);

  const traceOrigins = await page.locator(".trace-origin").allTextContents();
  assert.ok(traceOrigins.length >= 6);
  assert.ok(traceOrigins.every((source) => source === "site tool"));

  const fallbackPage = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await fallbackPage.goto(origin, { waitUntil: "networkidle" });
  await fallbackPage.getByText("Local replay / WebMCP off").waitFor();
  await fallbackPage.getByRole("button", { name: "Run local tool replay" }).click();
  const localOrigins = await fallbackPage.locator(".trace-origin").allTextContents();
  assert.ok(localOrigins.length >= 5);
  assert.ok(localOrigins.every((source) => source === "local replay"));
  await fallbackPage.close();
  console.log("Browser contract flow passed: six tools, visible writes, approval, human answer, and safety check.");
} finally {
  await browser.close();
  await server.close();
}
