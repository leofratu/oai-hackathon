import { existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright";

const outputDirectory = resolve("submission/render");
const outputPath = resolve(outputDirectory, "label-loop-demo-raw.webm");
const deployedUrl = process.env.DEMO_URL || "https://leofratu.github.io/oai-hackathon/?debug";
const chrome152 = "/tmp/chrome-webmcp-browser/opt/google/chrome/google-chrome";
const executablePath = existsSync(chrome152) ? chrome152 : "/usr/bin/google-chrome";

mkdirSync(outputDirectory, { recursive: true });
const browser = await chromium.launch({
  executablePath,
  headless: true,
  args: ["--enable-features=WebMCP", "--no-first-run", "--no-default-browser-check"],
});
const context = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  recordVideo: { dir: outputDirectory, size: { width: 1920, height: 1080 } },
  deviceScaleFactor: 1,
});
const page = await context.newPage();
const video = page.video();
const startedAt = Date.now();

async function until(seconds) {
  const remaining = seconds * 1000 - (Date.now() - startedAt);
  if (remaining > 0) await page.waitForTimeout(remaining);
}

async function scrollTo(selector, position = "center") {
  await page.locator(selector).evaluate((element, block) => element.scrollIntoView({ behavior: "smooth", block }), position);
  await page.waitForTimeout(900);
}

async function spot(selector) {
  await page.evaluate((target) => {
    document.querySelectorAll(".demo-spot").forEach((element) => element.classList.remove("demo-spot"));
    document.querySelector(target)?.classList.add("demo-spot");
  }, selector);
}

async function replay(name, input = {}) {
  await page.evaluate(([toolName, toolInput]) => window.__labelLoop.replayTool(toolName, toolInput), [name, input]);
}

try {
  await page.goto(deployedUrl, { waitUntil: "networkidle" });
  await page.addStyleTag({ content: `
    html { scroll-behavior: smooth; }
    .demo-spot { outline: 4px solid #c9f36d !important; outline-offset: 7px; box-shadow: 0 0 0 10px rgba(201,243,109,.12) !important; }
    .demo-caption { position: fixed; left: 28px; bottom: 24px; z-index: 9999; padding: 10px 14px; border: 1px solid #2e5960; background: rgba(7,17,22,.94); color: #9cded8; font: 700 15px/1.2 ui-monospace, monospace; letter-spacing: .08em; text-transform: uppercase; }
  ` });
  await page.evaluate(() => {
    const label = document.createElement("div");
    label.className = "demo-caption";
    label.textContent = "Native WebMCP registration";
    document.body.append(label);
  });
  await page.getByText("WebMCP live / 7 tools").waitFor({ timeout: 15000 });
  await spot("#webmcpStatus");

  await until(15);
  await spot(".webmcp-proof");

  await until(27);
  await scrollTo(".loop-strip", "center");
  await spot(".loop-strip");

  await until(38);
  await page.evaluate(() => { document.querySelector(".demo-caption").textContent = "Labeled local handler replay"; });
  await page.locator("#replayButton").click();
  await page.getByText("2 waiting").waitFor();
  await scrollTo(".samples-panel", "start");
  await spot(".samples-panel");

  await until(52);
  await scrollTo(".human-panel", "center");
  await spot(".human-panel");

  await until(64);
  const accessCard = page.locator(".review-card").filter({ hasText: "ticket-104" });
  await accessCard.getByRole("button", { name: "access", exact: true }).click();

  await until(73);
  const bugCard = page.locator(".review-card").filter({ hasText: "ticket-106" });
  await bugCard.getByRole("button", { name: "bug", exact: true }).click();

  await until(82);
  await replay("train_confirmed_batch", { maximum: 2 });
  await replay("evaluate_model");
  await replay("inspect_training_history");
  await scrollTo(".metrics", "start");
  await spot(".metrics");

  await until(94);
  await scrollTo(".model-panel", "start");
  await spot(".history-block");

  await until(106);
  await replay("propose_model_config", {
    alpha: 0.75,
    reviewThreshold: 0.78,
    rationale: "Use less smoothing after confirmed labels and send low-confidence predictions to review.",
  });
  await scrollTo(".human-panel", "center");
  await spot(".config-proposal");

  await until(116);
  await page.getByRole("button", { name: "Accept settings" }).click();
  await spot(".config-grid");

  await until(126);
  await scrollTo(".try-model", "center");
  await spot(".try-model");
  await page.locator("#ticketInput").fill("The export button crashes the dashboard");
  await page.getByRole("button", { name: "Classify text" }).click();

  await until(136);
  await page.locator("#ticketInput").fill("The payment screen will not let me log in");
  await page.getByRole("button", { name: "Classify text" }).click();

  await until(146);
  await scrollTo(".lower-grid", "start");
  await spot(".trace-panel");

  await until(155);
  await spot(".activity-panel");

  await until(164);
  await scrollTo(".why-webmcp", "center");
  await spot(".why-webmcp");

  await until(169);
  await page.close();
  await video.saveAs(outputPath);
  console.log(outputPath);
} finally {
  await context.close().catch(() => {});
  await browser.close();
}
