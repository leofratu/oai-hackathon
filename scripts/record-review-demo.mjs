import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright";
import { createServer } from "vite";

const outputDirectory = resolve("submission/render");
await mkdir(outputDirectory, { recursive: true });

const server = await createServer({ server: { host: "127.0.0.1", port: 0 } });
await server.listen();
const address = server.httpServer.address();
const origin = `http://127.0.0.1:${address.port}`;

const browser = await chromium.launch({ executablePath: "/usr/bin/google-chrome", headless: true });
const context = await browser.newContext({
  colorScheme: "dark",
  recordVideo: { dir: outputDirectory, size: { width: 1920, height: 1080 } },
  reducedMotion: "reduce",
  viewport: { width: 1920, height: 1080 },
});
const page = await context.newPage();
await page.goto(`${origin}/?debug`, { waitUntil: "networkidle" });
const video = page.video();

await page.evaluate(() => {
  const slate = document.createElement("div");
  slate.id = "captureSlate";
  Object.assign(slate.style, {
    position: "fixed",
    top: "88px",
    right: "24px",
    zIndex: "1000",
    padding: "9px 12px",
    color: "#071116",
    background: "#c5ff58",
    border: "1px solid #071116",
    borderRadius: "3px",
    font: "800 12px ui-monospace, monospace",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    boxShadow: "5px 5px 0 rgba(0, 0, 0, 0.25)",
  });
  slate.textContent = "WebMCP challenge demo";
  document.body.append(slate);
});

const startedAt = Date.now();
const waitUntil = async (seconds) => {
  const remaining = startedAt + seconds * 1000 - Date.now();
  if (remaining > 0) await page.waitForTimeout(remaining);
};
const setSlate = (text) => page.locator("#captureSlate").evaluate((element, value) => {
  element.textContent = value;
}, text);
const debugState = () => page.evaluate(() => {
  const state = window.__sevenTransects.getDebugState();
  return {
    draft: state.draft,
    fieldLens: state.fieldLens,
    focus: state.focus,
    proposals: state.proposals.map(({ id, status }) => ({ id, status })),
    surveysRemaining: state.surveysRemaining,
  };
});
const answerFocus = async () => {
  const state = await debugState();
  if (!state.focus) return;
  const index = (state.focus.row - 1) * 12 + state.focus.column - 1;
  const label = {
    water: "Water",
    meadow: "Meadow",
    forest: "Forest",
    ridge: "Ridge",
  }[state.fieldLens[index].terrain];
  await page.locator(".focus-choices button").filter({ hasText: label }).click();
};
const acceptVerified = async () => {
  const state = await debugState();
  if (!state.proposals.some((proposal) => proposal.status === "pending")) return;
  await page.getByRole("button", { name: /Accept exact scans and authorized human readings/ }).click();
};
const replayTurn = async () => {
  await page.getByRole("button", { name: "Run local tool replay" }).click();
  await page.waitForTimeout(500);
};

try {
  await waitUntil(12);
  await setSlate("Local review / native check pending");
  await page.locator(".protocol-primer").scrollIntoViewIfNeeded();

  await waitUntil(32);
  await setSlate("Local replay / production handlers");
  await replayTurn();

  await waitUntil(50);
  await setSlate("survey_region / scarce write");
  await page.locator(".map-panel").scrollIntoViewIfNeeded();

  await waitUntil(74);
  await setSlate("propose_chart_patch / human approval");
  await page.locator(".notes-panel").scrollIntoViewIfNeeded();
  await page.waitForTimeout(7000);
  await acceptVerified();

  await waitUntil(102);
  await setSlate("focus_human_attention / structured answer");
  await answerFocus();
  await page.waitForTimeout(8000);
  await replayTurn();

  await waitUntil(128);
  await setSlate("consult_compass / bounded check");
  await page.evaluate(() => window.__sevenTransects.replayTool("consult_compass"));
  await page.locator(".mission-panel").scrollIntoViewIfNeeded();

  await waitUntil(146);
  await setSlate("Later turns / clear jump cut");
  await answerFocus();
  await acceptVerified();
  while ((await debugState()).surveysRemaining > 0) {
    await replayTurn();
    await answerFocus();
    await acceptVerified();
  }
  await replayTurn();
  await acceptVerified();

  const cellsToPaint = await page.evaluate(() => {
    const state = window.__sevenTransects.getDebugState();
    const marked = state.draft.filter(Boolean).length;
    const needed = Math.max(0, 72 - marked);
    return state.draft
      .map((mark, index) => mark ? null : { index, terrain: state.fieldLens[index].terrain })
      .filter(Boolean)
      .slice(0, needed);
  });
  for (const cell of cellsToPaint) {
    await page.locator(`[data-terrain="${cell.terrain}"]`).click();
    await page.locator(`.chart-cell[data-index="${cell.index}"]`).click();
  }
  await page.locator(".map-panel").scrollIntoViewIfNeeded();

  await waitUntil(162);
  await setSlate("Final chart / 72 cells");
  await page.getByRole("button", { name: "Transmit chart" }).click();

  await waitUntil(177);
  await page.close();
  await video.saveAs(resolve(outputDirectory, "seven-transects-review.webm"));
} finally {
  await context.close();
  await browser.close();
  await server.close();
}

console.log(resolve(outputDirectory, "seven-transects-review.webm"));
