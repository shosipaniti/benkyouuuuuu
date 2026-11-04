const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { execFileSync } = require("node:child_process");

const root = path.resolve(__dirname, "..");
const context = vm.createContext({ window: {} });
for (const file of ["data_mining_prediction_questions.js", "data_mining_compact_questions.js", "second_semester_guides.js"]) {
  vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), context);
}
const questions = JSON.parse(JSON.stringify(context.window.DATA_MINING_COMPACT_QUESTION_DATA));
const originals = JSON.parse(JSON.stringify(context.window.DATA_MINING_PREDICTED_QUESTION_DATA));
const guides = JSON.parse(JSON.stringify(context.window.SECOND_SEMESTER_STUDY_GUIDES));
const originalById = new Map(originals.map((q) => [q.id, q]));
const guide = guides["data-mining-compact"];
assert.equal(questions.length, 30);
assert.equal(new Set(questions.map((q) => q.id)).size, 30);
assert.equal(new Set(questions.map((q) => q.prompt)).size, 30);
assert.equal(questions.filter((q) => q.sourceQuestionId).length, 25);
assert.deepEqual(questions.map((q) => q.lecture), Array.from({ length: 6 }, (_, i) => Array(5).fill(i + 1)).flat());
assert.deepEqual(guide.tabs, guides["data-mining-prediction"].tabs);
assert.deepEqual(Object.keys(guide.questionTabIds).sort(), questions.map((q) => q.id).sort());
const pageCounts = { 1: 68, 2: 51, 3: 42, 4: 63, 5: 49, 6: 56 };
const numericCases = [];
for (const q of questions) {
  assert.equal(q.category, "data-mining-compact");
  assert.equal(q.semester, "second");
  assert(!originalById.has(q.id), q.id);
  for (const key of ["prompt", "answer", "topic", "source", "explanation", "slideReference"]) assert(q[key], q.id);
  assert(q.pages.length && q.pages.every((p) => p >= 1 && p <= pageCounts[q.lecture]), q.id);
  for (const image of q.images) assert(fs.statSync(path.join(root, image)).isFile(), image);
  assert(guide.tabs.some((tab) => tab.id === guide.questionTabIds[q.id]), q.id);
  if (q.sourceQuestionId) {
    const original = originalById.get(q.sourceQuestionId);
    assert(original, q.id);
    const { id, category, source, number, sourceQuestionId, ...preserved } = q;
    const { id: ignoredId, category: ignoredCategory, source: ignoredSource, number: ignoredNumber, ...content } = original;
    assert.deepEqual(preserved, content, q.id);
    assert.equal(id, original.id.replace("data-mining-pred-", "data-mining-compact-"));
    assert.equal(guide.questionTabIds[q.id], guides["data-mining-prediction"].questionTabIds[q.sourceQuestionId], q.id);
  } else {
    assert.equal(q.lecture, 6);
    assert.equal(guide.questionTabIds[q.id], "slides");
    if (q.type === "text") numericCases.push(q);
  }
  assert.equal(new Set(q.choices).size, q.choices.length, q.id);
  if (q.type === "single") assert(q.choices.includes(q.answer), q.id);
  else if (q.type === "multiple") assert(q.answer.split(" / ").every((a) => q.choices.includes(a)), q.id);
  else if (q.type === "matching") {
    const values = q.choices.map((choice) => choice.split(": ")[1]);
    assert(q.answer.split(" / ").every((pair) => values.includes(pair.split(" = ")[1])), q.id);
  } else {
    assert.equal(q.type, "text");
    assert.equal(q.answerFormat, "number");
    assert(q.verification, q.id);
  }
}
assert.equal(numericCases.length, 3);
const r = numericCases.map((q, i) => `cat("CASE${i}\\t");cat(local({${q.verification.r}}));cat("\\n")`).join("\n");
const output = execFileSync(process.env.RSCRIPT_BINARY || "Rscript", ["--vanilla", "-e", r], { encoding: "utf8" }).trim().split("\n");
assert.equal(output.length, numericCases.length);
output.forEach((line, i) => {
  const [key, value] = line.split("\t");
  assert.equal(key, `CASE${i}`);
  assert(Math.abs(Number(value) - Number(numericCases[i].answer)) < 1e-9, numericCases[i].id);
});
assert.equal(questions.find((q) => q.id === "data-mining-compact-06-002").answer, String(2 * 4 + 3 * 2 + 10));
assert.equal(questions.find((q) => q.id === "data-mining-compact-06-003").answer, String(1 - 2 / 8));
assert.equal(questions.find((q) => q.id === "data-mining-compact-06-004").answer, String(4 - 1));
const lines = [
  "# データマイニング 要点30問", "",
  "第1〜6回から各5問。第1〜5回は予想問題167問から25問を抜粋し、第6回は講義資料に基づく基本5問を補った。全範囲を網羅する版ではなく、短い周回用のセット。既存セットは残す。", "",
  "正解と解説、図、検証情報は抜粋元と一致する。別IDで進捗と編集を分離する。詳しい解説とスライドまとめは既存科目と共有し、第6回はスライドまとめへ対応させる。", "",
  "抜粋元の数値解答はcheck_data_mining_predictions.pyでPythonとRにより検証する。新規第6回の数値3問は、この検査でRと数式の両方を使って再計算する。第6回の用語と選択問題は講義PDF p.26, 27, 33〜35, 44〜46, 55とR公式仕様を照合した。", "",
  "- https://stat.ethz.ch/R-manual/R-devel/library/stats/html/summary.lm.html",
  "- https://stat.ethz.ch/R-manual/R-devel/library/stats/html/model.matrix.html", "",
  "| ID | 講義 | テーマ | 形式 | 元の問題 | PDFページ |",
  "| --- | --- | --- | --- | --- | --- |",
  ...questions.map((q) => `| ${q.id} | 第${q.lecture}回 | ${q.topic} | ${q.type} | ${q.sourceQuestionId || "講義に基づく新規"} | ${q.pages.join(", ")} |`)
];
fs.writeFileSync(path.join(root, "docs/data-mining-compact.md"), lines.join("\n") + "\n");
console.log("PASS: compact 30 questions, 5 per lecture; 25 exact source copies, separate IDs, guide routing, images, references and 3 new R/numeric checks.");
