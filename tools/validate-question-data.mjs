import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const supportedTypes = new Set(["single", "multiple", "matching", "text", "free"]);

function loadQuestionScript(fileName) {
  const filePath = path.join(rootDir, fileName);
  const code = fs.readFileSync(filePath, "utf8");
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(code, context, { filename: fileName });
  return context.window.QUESTION_DATA || context.window.PREDICTED_QUESTION_DATA || [];
}

function normalize(items, fallbackCategory) {
  return items.map((question, index) => ({
    ...question,
    id: question.id || `${fallbackCategory}-${index + 1}`,
    source: question.source || "未分類",
    category: question.category || fallbackCategory,
    number: question.number || index + 1,
    prompt: question.prompt || "",
    answer: question.answer || "",
    type: question.type || "single",
    choices: Array.isArray(question.choices) ? question.choices : [],
    images: Array.isArray(question.images) ? question.images : []
  }));
}

function parseMatchingAnswer(answer) {
  return String(answer)
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const [label, value] = part.split("=").map((item) => item.trim());
      return { label, value };
    });
}

function validate(items) {
  const issues = [];
  const ids = new Set();

  items.forEach((question, index) => {
    const label = question.id || `${index + 1}問目`;

    if (!question.id) issues.push(`${label}: id が空です。`);
    if (ids.has(question.id)) issues.push(`${label}: id が重複しています。`);
    ids.add(question.id);

    if (!String(question.prompt).trim()) issues.push(`${label}: prompt が空です。`);
    if (!String(question.answer).trim()) issues.push(`${label}: answer が空です。`);
    if (!supportedTypes.has(question.type)) issues.push(`${label}: type が未対応です。`);

    if ((question.type === "single" || question.type === "multiple") && question.choices.length === 0) {
      issues.push(`${label}: ${question.type} には choices が必要です。`);
    }

    if (question.type === "matching") {
      const pairs = parseMatchingAnswer(question.answer);
      const valid = pairs.length > 0 && pairs.every((pair) => pair.label && pair.value);
      if (!valid) issues.push(`${label}: matching の answer は「① = 用語 / ② = 用語」形式にしてください。`);
    }

    question.images.forEach((src) => {
      if (!src || typeof src !== "string") {
        issues.push(`${label}: images に空の値があります。`);
        return;
      }

      if (!fs.existsSync(path.join(rootDir, src))) {
        issues.push(`${label}: 画像ファイルが存在しません: ${src}`);
      }
    });
  });

  return issues;
}

const questions = [
  ...normalize(loadQuestionScript("questions.js"), "quiz"),
  ...normalize(loadQuestionScript("predicted_questions.js"), "prediction")
];

const issues = validate(questions);

if (issues.length) {
  console.error(`Question data validation failed: ${issues.length} issue(s)`);
  issues.forEach((issue) => console.error(`- ${issue}`));
  process.exit(1);
}

console.log(`Question data validation passed: ${questions.length} question(s)`);
