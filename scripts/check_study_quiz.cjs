const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const http = require("node:http");
const path = require("node:path");
const vm = require("node:vm");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");

const root = path.resolve(__dirname, "..");
const mimeTypes = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".svg": "image/svg+xml", ".webmanifest": "application/manifest+json" };

async function startSet(page, name) {
  await page.locator("#setList .set-card").filter({ has: page.getByRole("heading", { name, exact: true }) })
    .getByRole("button", { name: "このセットで始める", exact: true }).click();
}

async function checkCurrentAnswer(page, question) {
  if (question.type === "single") {
    await page.locator("#choices select").selectOption(question.answer);
  } else if (question.type === "multiple") {
    for (const answer of question.answer.split(/\s+\/\s+/)) await page.locator("#choices").getByRole("button", { name: answer, exact: true }).click();
  } else if (question.type === "matching") {
    for (const pair of question.answer.split(/\s+\/\s+/)) {
      const separator = pair.indexOf(" = ");
      const label = pair.slice(0, separator);
      const value = pair.slice(separator + 3);
      await page.getByLabel(`${label}の回答を選ぶ`, { exact: true }).selectOption(value);
    }
  } else if (question.type === "text") {
    await page.locator("#choices input").fill(question.answer);
  }
  await page.locator("#answerButton").click();
  const feedback = await page.locator("#feedback").innerText();
  assert(feedback.startsWith(question.type === "free" ? "模範解答" : "正解"), `${question.id}: ${feedback}`);
}

async function run() {
  const source = await fs.readFile(path.join(root, "study-quiz-site.html"), "utf8");
  for (const match of source.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)) new vm.Script(match[1]);
  const data = { window: {} };
  vm.runInNewContext(await fs.readFile(path.join(root, "database_questions.js"), "utf8"), data);
  const questions = data.window.DATABASE_QUESTION_DATA;
  assert.equal(questions.length, 28);
  assert.equal(new Set(questions.map((q) => q.id)).size, 28);
  for (const q of questions) {
    assert(q.prompt && q.explanation && q.semester === "second");
    for (const answer of q.answer.split(/\s+\/\s+/)) assert(q.choices.includes(answer), q.id);
    for (const image of q.images) await fs.access(path.join(root, image));
  }
  vm.runInNewContext(await fs.readFile(path.join(root, "data_mining_questions.js"), "utf8"), data);
  const miningQuestions = data.window.DATA_MINING_QUESTION_DATA;
  assert.equal(miningQuestions.length, 26);
  assert.equal(new Set(miningQuestions.map((q) => q.id)).size, 26);
  assert.equal(new Set(miningQuestions.flatMap((q) => q.sourceQuestionIds)).size, 30);
  const miningAnswer = (id) => miningQuestions.find((q) => q.id === id).answer;
  assert.equal(miningAnswer("data-mining-quiz1-010"), `CL=${3.0.toFixed(1)}`);
  assert.equal(miningAnswer("data-mining-quiz1-011"), `UCL=${(3 + 3 * 0.1).toFixed(1)}`);
  assert.equal(miningAnswer("data-mining-quiz1-012"), `LCL=${(3 - 3 * 0.1).toFixed(1)}`);
  assert.equal(miningAnswer("data-mining-quiz2-011"), String((0 + 0 + 6) / 3));
  const centers = [[0, 4, 0], [5, 3, 5]];
  const assignments = [[0, 3, 0], [3, 3, 0], [6, 3, 6]].map((point, index) => {
    const squaredDistances = centers.map((center) => point.reduce((sum, value, axis) => sum + (value - center[axis]) ** 2, 0));
    return `データ${"ABC"[index]} = Clust${squaredDistances[0] < squaredDistances[1] ? 1 : 2}のクラスター`;
  });
  assert.equal(miningAnswer("data-mining-quiz2-012"), assignments.join(" / "));
  vm.runInNewContext(await fs.readFile(path.join(root, "database_prediction_questions.js"), "utf8"), data);
  const databasePredictions = data.window.DATABASE_PREDICTED_QUESTION_DATA;
  assert.equal(databasePredictions.length, 153);
  vm.runInNewContext(await fs.readFile(path.join(root, "data_mining_prediction_questions.js"), "utf8"), data);
  const miningPredictions = data.window.DATA_MINING_PREDICTED_QUESTION_DATA;
  assert.equal(miningPredictions.length, 167);

  const server = http.createServer(async (request, response) => {
    try {
      const relative = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
      let file = path.resolve(root, `.${relative}`);
      if (file !== root && !file.startsWith(root + path.sep)) throw new Error("Invalid path");
      if ((await fs.stat(file)).isDirectory()) file = path.join(file, "index.html");
      response.setHeader("Content-Type", mimeTypes[path.extname(file)] || "application/octet-stream");
      response.end(await fs.readFile(file));
    } catch {
      response.writeHead(404).end();
    }
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const url = `http://127.0.0.1:${server.address().port}/`;
  let browser;
  try {
    browser = await chromium.launch({ headless: true, channel: process.env.PLAYWRIGHT_CHANNEL || "chrome" });
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    page.setDefaultTimeout(5000);
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(url);
    await page.waitForSelector("#setList .set-card");
    assert.equal(await page.locator("#secondSemesterTab").getAttribute("aria-selected"), "true");
    assert.deepEqual(await page.locator("#setList h3").allTextContents(), ["データベース 小テスト", "データベース 予想問題", "データマイニング 小テスト", "データマイニング 予想問題"]);
    await startSet(page, "データベース 小テスト");
    assert.equal(await page.locator("#activeSetName").innerText(), "データベース 小テスト");
    assert.equal(await page.evaluate(() => filtered().length), 28);
    assert.deepEqual(await page.evaluate(() => validationIssues), []);

    for (let index = 0; index < questions.length; index += 1) {
      await page.evaluate((value) => { state.index = value; state.revealed = false; render(); }, index);
      const question = await page.evaluate(() => filtered()[state.index]);
      if (question.type === "single") {
        await page.locator("#choices select").selectOption(question.answer);
      } else {
        for (const answer of question.answer.split(/\s+\/\s+/)) {
          await page.locator("#choices").getByRole("button", { name: answer, exact: true }).click();
        }
      }
      await page.locator("#answerButton").click();
      assert((await page.locator("#feedback").innerText()).startsWith("正解"), question.id);
      await page.waitForFunction(() => [...document.querySelectorAll("#images img")].every((img) => img.complete && img.naturalWidth > 0));
    }

    await page.locator("#filterDetails summary").click();
    await page.locator("#sourceFilter").selectOption("データベース 小テスト1");
    assert.equal(await page.evaluate(() => filtered().length), 13);
    await page.locator("#sourceFilter").selectOption("データベース 小テスト2");
    assert.equal(await page.evaluate(() => filtered().length), 15);
    await page.locator("#firstSemesterTab").click();
    assert.equal(await page.locator("#setList h3").count(), 20);
    assert(!(await page.locator("#setList h3").allTextContents()).includes("データベース 小テスト"));
    await page.locator("#setList .set-card").filter({ has: page.getByRole("heading", { name: "知識工学 期末 過去問", exact: true }) })
      .getByRole("button", { name: "このセットで始める", exact: true }).click();
    await page.locator("#secondSemesterTab").click();
    assert.equal(await page.locator("#activeSetName").innerText(), "データベース 小テスト");
    assert.equal(await page.locator("#knownCount").innerText(), "28習得");
    await page.reload();
    await page.waitForSelector("#prompt");
    assert.equal(await page.locator("#activeSetName").innerText(), "データベース 小テスト");

    await page.locator("#listMode").click();
    await page.locator("#toggleCategoryEditorButton").click();
    assert.equal(await page.locator("[data-category-row]").count(), 4);
    await page.locator("[data-category-name='database-quiz']").fill("データベース 後期");
    await page.locator("#saveCategoryNamesButton").click();
    assert.equal(await page.locator("#activeSetName").innerText(), "データベース 後期");
    await page.locator("#toggleCategoryEditorButton").click();
    await page.locator("#toggleDeleteModeButton").click();
    assert.equal(await page.locator("#categoryDeleteList button").count(), 4);
    await page.locator("#selectVisibleButton").click();
    await page.evaluate(() => { window.confirm = () => true; });
    await page.locator("#deleteSelectedButton").click();
    assert.equal(await page.evaluate(() => allQuestions.filter((q) => q.category === "database-quiz").length), 0);
    await page.evaluate(() => restoreDeletedQuestions());
    await startSet(page, "データベース 後期");
    await page.locator("#archiveActiveSetButton").click();
    assert.equal(await page.locator("#archivedSetList h3").innerText(), "データベース 後期");
    await page.getByRole("button", { name: "戻して始める", exact: true }).click();

    await page.locator("#quizMode").click();
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => { state.index = 7; state.revealed = false; render(); });
    await page.waitForFunction(() => [...document.querySelectorAll("#images img")].every((img) => img.complete && img.naturalWidth > 0));
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await fs.mkdir(path.join(root, "output"), { recursive: true });
    await page.screenshot({ path: path.join(root, "output/database-mobile.png"), fullPage: true });
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.locator("#changeSetButton").click();
    await page.screenshot({ path: path.join(root, "output/semester-desktop.png"), fullPage: true });

    await page.evaluate(async () => { await navigator.serviceWorker.ready; });
    await page.reload();
    await page.waitForSelector("#prompt");
    await context.setOffline(true);
    await page.reload();
    await page.waitForSelector("#prompt");
    assert.equal(await page.evaluate(() => filtered().length), 28);
    await context.setOffline(false);

    await page.locator("#changeSetButton").click();
    await startSet(page, "データベース 予想問題");
    assert.equal(await page.evaluate(() => filtered().length), 153);
    for (let index = 0; index < databasePredictions.length; index += 1) {
      await page.evaluate((value) => { state.index = value; state.revealed = false; render(); }, index);
      const question = await page.evaluate(() => filtered()[state.index]);
      await checkCurrentAnswer(page, question);
      await page.waitForFunction(() => [...document.querySelectorAll("#images img")].every((img) => img.complete && img.naturalWidth > 0));
    }
    await page.locator("#filterDetails summary").click();
    for (const lecture of [1, 2, 3, 4, 5]) {
      const source = databasePredictions.find((q) => q.lecture === lecture).source;
      await page.locator("#sourceFilter").selectOption(source);
      assert.equal(await page.evaluate(() => filtered().length), databasePredictions.filter((q) => q.lecture === lecture).length);
    }
    await page.locator("#sourceFilter").selectOption("all");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => { state.index = filtered().findIndex((q) => q.images.length); state.revealed = false; render(); });
    await page.waitForFunction(() => [...document.querySelectorAll("#images img")].every((img) => img.complete && img.naturalWidth > 0));
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.screenshot({ path: path.join(root, "output/database-prediction-mobile.png"), fullPage: true });
    await page.evaluate(() => { state.index = filtered().findIndex((q) => q.verification && q.verification.fixture === "staff"); state.revealed = false; render(); });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.screenshot({ path: path.join(root, "output/database-prediction-sql-mobile.png"), fullPage: true });
    await context.setOffline(true);
    await page.reload();
    await page.waitForSelector("#prompt");
    assert.equal(await page.locator("#activeSetName").innerText(), "データベース 予想問題");
    assert.equal(await page.evaluate(() => filtered().length), 153);
    await context.setOffline(false);

    await page.locator("#changeSetButton").click();
    await startSet(page, "データマイニング 小テスト");
    assert.equal(await page.evaluate(() => filtered().length), 26);
    for (let index = 0; index < miningQuestions.length; index += 1) {
      await page.evaluate((value) => { state.index = value; state.revealed = false; render(); }, index);
      const question = await page.evaluate(() => filtered()[state.index]);
      if (question.type === "single") {
        await page.locator("#choices select").selectOption(question.answer);
      } else if (question.type === "multiple") {
        for (const answer of question.answer.split(/\s+\/\s+/)) await page.locator("#choices").getByRole("button", { name: answer, exact: true }).click();
      } else if (question.type === "matching") {
        for (const pair of question.answer.split(/\s+\/\s+/)) {
          const [label, value] = pair.split(" = ");
          await page.getByLabel(`${label}の回答を選ぶ`, { exact: true }).selectOption(value);
        }
      } else {
        await page.locator("#choices input").fill(question.answer);
      }
      await page.locator("#answerButton").click();
      assert((await page.locator("#feedback").innerText()).startsWith("正解"), question.id);
    }
    await page.locator("#filterDetails summary").click();
    await page.locator("#sourceFilter").selectOption("データマイニング 小テスト1");
    assert.equal(await page.evaluate(() => filtered().length), 13);
    await page.locator("#sourceFilter").selectOption("データマイニング 小テスト2");
    assert.equal(await page.evaluate(() => filtered().length), 13);
    await page.locator("#sourceFilter").selectOption("all");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => { state.index = filtered().findIndex((q) => q.id === "data-mining-quiz2-012"); render(); });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.screenshot({ path: path.join(root, "output/data-mining-mobile.png"), fullPage: true });
    await page.reload();
    await page.waitForSelector("#prompt");
    assert.equal(await page.locator("#activeSetName").innerText(), "データマイニング 小テスト");
    await context.setOffline(true);
    await page.reload();
    await page.waitForSelector("#prompt");
    assert.equal(await page.evaluate(() => filtered().length), 26);
    await context.setOffline(false);

    await page.locator("#changeSetButton").click();
    await startSet(page, "データマイニング 予想問題");
    assert.equal(await page.evaluate(() => filtered().length), 167);
    assert.equal(await page.evaluate(() => filtered().every((q) => q.category === "data-mining-prediction")), true);
    for (let index = 0; index < miningPredictions.length; index += 1) {
      await page.evaluate((value) => { state.index = value; state.revealed = false; render(); }, index);
      const question = await page.evaluate(() => filtered()[state.index]);
      await checkCurrentAnswer(page, question);
      assert((await page.locator("#feedback").innerText()).includes(question.slideReference), question.id);
      await page.waitForFunction(() => [...document.querySelectorAll("#images img")].every((img) => img.complete && img.naturalWidth > 0));
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, question.id);
    }
    await page.locator("#filterDetails summary").click();
    for (const lecture of [1, 2, 3, 4, 5]) {
      await page.locator("#sourceFilter").selectOption(miningPredictions.find((q) => q.lecture === lecture).source);
      assert.equal(await page.evaluate(() => filtered().length), miningPredictions.filter((q) => q.lecture === lecture).length);
    }
    await page.locator("#sourceFilter").selectOption("all");
    await page.locator("#filterDetails summary").click();
    for (const [name, topic] of [["dendrogram", "樹形図のクラスタ数"], ["mosaic", "モザイクの読取り"], ["calculation", "標準偏差から寄与率"], ["exercise-ppm", "飲料PPMの実図を読む"], ["exercise-scatter", "実習のラベル付き散布図"], ["exercise-code", "都市ラベルを色分けするコード"], ["exercise-snack", "お菓子の累積寄与率"]]) {
      await page.evaluate((value) => { state.index = filtered().findIndex((q) => q.topic === value); state.revealed = false; render(); }, topic);
      await page.waitForFunction(() => [...document.querySelectorAll("#images img")].every((img) => img.complete && img.naturalWidth > 0));
      const question = await page.evaluate(() => filtered()[state.index]);
      await checkCurrentAnswer(page, question);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      await page.screenshot({ path: path.join(root, `output/data-mining-prediction-${name}-mobile.png`), fullPage: true });
    }
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.screenshot({ path: path.join(root, "output/data-mining-prediction-desktop.png"), fullPage: true });
    await page.evaluate(() => { state.index = filtered().findIndex((q) => q.topic === "実習得点を標準化"); state.revealed = false; render(); });
    for (const [input, expected] of [["0.840", true], [".84", true], ["８．４e−1", true], ["0.839551", false], ["0.85", false], ["", false], ["0.84点", false], ["0.84+0", false], ["Infinity", false]]) {
      await page.locator("#choices input").fill(input);
      await page.locator("#answerButton").click();
      assert.equal((await page.locator("#feedback").innerText()).startsWith("正解"), expected, input);
    }
    await page.reload();
    await page.waitForSelector("#prompt");
    assert.equal(await page.locator("#activeSetName").innerText(), "データマイニング 予想問題");
    await context.setOffline(true);
    await page.reload();
    await page.waitForSelector("#prompt");
    assert.equal(await page.evaluate(() => filtered().length), 167);
    await context.setOffline(false);
    await page.evaluate(() => { window.confirm = () => true; });
    await page.locator("#archiveActiveSetButton").click();
    assert((await page.locator("#archivedSetList h3").allTextContents()).includes("データマイニング 予想問題"));
    assert(!(await page.locator("#setList h3").allTextContents()).includes("データマイニング 予想問題"));
    await page.locator("#archivedSetList .set-card").filter({ has: page.getByRole("heading", { name: "データマイニング 予想問題", exact: true }) })
      .getByRole("button", { name: "戻して始める", exact: true }).click();
    assert.equal(await page.evaluate(() => filtered().length), 167);

    const migrationContext = await browser.newContext();
    const legacyPage = await migrationContext.newPage();
    await legacyPage.addInitScript(() => {
      if (localStorage.getItem("test-seeded")) return;
      localStorage.setItem("test-seeded", "yes");
      localStorage.setItem("study-quiz-active-set-v1", "knowledge-final");
      localStorage.setItem("study-quiz-standalone-progress-v1", JSON.stringify({ "knowledge-final-2020-001": "known" }));
      localStorage.setItem("study-quiz-standalone-category-labels-v1", JSON.stringify({ "knowledge-final": "以前の知識工学" }));
      localStorage.setItem("study-quiz-standalone-edits-v1", JSON.stringify({ "knowledge-final-2020-001": { prompt: "保存していた問題文" } }));
      localStorage.setItem("study-quiz-archived-sets-v1", JSON.stringify(["audio"]));
    });
    await legacyPage.goto(url);
    await legacyPage.waitForSelector("#setList .set-card");
    assert.equal(await legacyPage.locator("#secondSemesterTab").getAttribute("aria-selected"), "true");
    await legacyPage.locator("#firstSemesterTab").click();
    assert((await legacyPage.locator("#archivedSetList h3").allTextContents()).includes("音声工学 中間"));
    await legacyPage.locator("#closeSetChooserButton").click();
    assert.equal(await legacyPage.locator("#activeSetName").innerText(), "以前の知識工学");
    assert.equal(await legacyPage.locator("#prompt").innerText(), "保存していた問題文");
    assert.equal(await legacyPage.locator("#knownCount").innerText(), "1習得");
    await legacyPage.locator("#secondSemesterTab").click();
    await startSet(legacyPage, "データベース 小テスト");
    await legacyPage.locator("#importDetails summary").click();
    await legacyPage.locator("#pasteInput").fill("Q: 追加テスト\nA: 確認済み");
    await legacyPage.locator("#pasteButton").click();
    assert.equal(await legacyPage.evaluate(() => filtered().length), 29);
    assert.equal(await legacyPage.locator("#secondSemesterTab").getAttribute("aria-selected"), "true");
    await legacyPage.locator("#firstSemesterTab").click();
    assert.equal(await legacyPage.locator("#activeSetName").innerText(), "以前の知識工学");
    assert.equal(await legacyPage.locator("#prompt").innerText(), "保存していた問題文");
    assert.deepEqual(errors, []);
    console.log("PASS: 28 database + 153 database-prediction + 26 data-mining + 167 data-mining-prediction answers, numeric-equivalence checks, source references, written-answer reveal, calculation checks, matching, semester isolation, legacy migration, progress, filters, category edits, deletion, archive/restore, import, mobile layout and offline reload.");
  } finally {
    if (browser) await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
}

run().catch((error) => { console.error(error); process.exitCode = 1; });
