const questions = window.QUESTION_DATA || [];
const storageKey = "economics-quiz-progress-v1";

const typeLabels = {
  single: "選択",
  multiple: "複数選択",
  matching: "対応",
  text: "入力",
  free: "自由記述"
};

const state = {
  source: "all",
  type: "all",
  status: "all",
  query: "",
  mode: "quiz",
  index: 0,
  revealed: false,
  order: questions.map((_, index) => index),
  progress: loadProgress(),
  responses: {}
};

const els = {
  totalCount: document.getElementById("totalCount"),
  knownCount: document.getElementById("knownCount"),
  reviewCount: document.getElementById("reviewCount"),
  sourceFilters: document.getElementById("sourceFilters"),
  typeFilters: document.getElementById("typeFilters"),
  statusFilters: document.getElementById("statusFilters"),
  searchInput: document.getElementById("searchInput"),
  quizModeBtn: document.getElementById("quizModeBtn"),
  listModeBtn: document.getElementById("listModeBtn"),
  shuffleBtn: document.getElementById("shuffleBtn"),
  resetProgressBtn: document.getElementById("resetProgressBtn"),
  quizView: document.getElementById("quizView"),
  listView: document.getElementById("listView"),
  cardSource: document.getElementById("cardSource"),
  cardType: document.getElementById("cardType"),
  cardPosition: document.getElementById("cardPosition"),
  imageFrame: document.getElementById("imageFrame"),
  questionText: document.getElementById("questionText"),
  choiceList: document.getElementById("choiceList"),
  feedbackPanel: document.getElementById("feedbackPanel"),
  feedbackTitle: document.getElementById("feedbackTitle"),
  feedbackDetail: document.getElementById("feedbackDetail"),
  answerPanel: document.getElementById("answerPanel"),
  answerText: document.getElementById("answerText"),
  prevBtn: document.getElementById("prevBtn"),
  revealBtn: document.getElementById("revealBtn"),
  knownBtn: document.getElementById("knownBtn"),
  reviewBtn: document.getElementById("reviewBtn"),
  nextBtn: document.getElementById("nextBtn"),
  questionList: document.getElementById("questionList")
};

function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(storageKey)) || {};
  } catch {
    return {};
  }
}

function saveProgress() {
  localStorage.setItem(storageKey, JSON.stringify(state.progress));
}

function parseMatchingAnswer(answer) {
  return answer.split("/")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const [label, value] = part.split("=").map((item) => item.trim());
      return { label, value };
    });
}

function parseMatchingChoices(choices) {
  return choices.map((choice) => {
    const match = choice.match(/^([^:]+):\s*(.*)$/);
    return match ? { key: match[1], label: match[2] } : { key: choice, label: choice };
  });
}

function getResponse(question) {
  if (!state.responses[question.id]) {
    state.responses[question.id] = { selected: [], matching: {}, text: "", checked: false, correct: false };
  }
  return state.responses[question.id];
}

function correctValues(question) {
  if (question.type === "matching") {
    return parseMatchingAnswer(question.answer).map((item) => item.value);
  }
  if (question.type === "multiple") {
    return question.answer.split("/").map((item) => item.trim()).filter(Boolean);
  }
  return [question.answer.trim()];
}

function normalizeAnswer(value) {
  return value.toString().trim().replace(/\s+/g, "").toLowerCase();
}

function arraysEqual(a, b) {
  return a.length === b.length && a.every((item) => b.includes(item));
}

function judge(question) {
  const response = getResponse(question);
  let correct = false;

  if (question.type === "matching") {
    const pairs = parseMatchingAnswer(question.answer);
    correct = pairs.every((pair) => response.matching[pair.label] === pair.value);
  } else if (question.type === "multiple") {
    correct = arraysEqual(
      response.selected.map(normalizeAnswer).sort(),
      correctValues(question).map(normalizeAnswer).sort()
    );
  } else if (question.type === "text" || question.type === "free") {
    correct = normalizeAnswer(response.text) === normalizeAnswer(question.answer);
  } else {
    correct = normalizeAnswer(response.selected[0] || "") === normalizeAnswer(question.answer);
  }

  response.checked = true;
  response.correct = correct;
  if (correct) {
    state.progress[question.id] = "known";
  } else {
    state.progress[question.id] = "review";
  }
  saveProgress();
  render();
}

function unique(values) {
  return [...new Set(values)];
}

function filteredQuestions() {
  const query = state.query.trim().toLowerCase();
  return state.order
    .map((index) => questions[index])
    .filter((question) => {
      const status = state.progress[question.id] || "new";
      const text = `${question.prompt} ${question.answer} ${question.source}`.toLowerCase();
      return (state.source === "all" || question.source === state.source)
        && (state.type === "all" || question.type === state.type)
        && (state.status === "all" || status === state.status)
        && (!query || text.includes(query));
    });
}

function makeButton(label, active, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label;
  button.className = active ? "is-active" : "";
  button.addEventListener("click", onClick);
  return button;
}

function renderFilters() {
  els.sourceFilters.replaceChildren(
    makeButton("すべて", state.source === "all", () => setFilter("source", "all")),
    ...unique(questions.map((q) => q.source)).map((source) =>
      makeButton(source, state.source === source, () => setFilter("source", source))
    )
  );

  els.typeFilters.replaceChildren(
    makeButton("すべて", state.type === "all", () => setFilter("type", "all")),
    ...unique(questions.map((q) => q.type)).map((type) =>
      makeButton(typeLabels[type] || type, state.type === type, () => setFilter("type", type))
    )
  );

  const statuses = [
    ["all", "すべて"],
    ["new", "未着手"],
    ["known", "習得"],
    ["review", "復習"]
  ];
  els.statusFilters.replaceChildren(
    ...statuses.map(([value, label]) =>
      makeButton(label, state.status === value, () => setFilter("status", value))
    )
  );
}

function setFilter(key, value) {
  state[key] = value;
  state.index = 0;
  state.revealed = false;
  render();
}

function renderStats(items) {
  const known = questions.filter((q) => state.progress[q.id] === "known").length;
  const review = questions.filter((q) => state.progress[q.id] === "review").length;
  els.totalCount.textContent = `${items.length}/${questions.length}問`;
  els.knownCount.textContent = `${known}習得`;
  els.reviewCount.textContent = `${review}復習`;
}

function renderQuiz(items) {
  const card = els.quizView.querySelector(".quiz-card");
  let empty = document.getElementById("quizEmpty");

  if (!items.length) {
    if (card) card.hidden = true;
    if (!empty) {
      empty = document.createElement("div");
      empty.id = "quizEmpty";
      empty.className = "empty";
      empty.textContent = "条件に合う問題がありません。";
      els.quizView.appendChild(empty);
    }
    return;
  }

  if (card) card.hidden = false;
  if (empty) empty.remove();

  if (state.index >= items.length) state.index = 0;
  const question = items[state.index];
  const progress = state.progress[question.id] || "new";
  const response = getResponse(question);

  els.cardSource.textContent = question.source;
  els.cardType.textContent = typeLabels[question.type] || question.type;
  els.cardPosition.textContent = `${state.index + 1} / ${items.length}`;
  els.questionText.textContent = question.prompt;
  els.answerText.textContent = question.answer || "解答なし";
  els.answerPanel.hidden = !state.revealed;
  els.feedbackPanel.hidden = !response.checked;
  els.feedbackPanel.className = `feedback-panel ${response.correct ? "is-correct" : "is-wrong"}`;
  els.feedbackTitle.textContent = response.correct ? "正解" : "不正解";
  els.feedbackDetail.textContent = response.correct ? "その調子です。" : `正解: ${question.answer}`;
  els.revealBtn.textContent = state.revealed ? "答えを隠す" : "答えを見る";
  els.knownBtn.className = progress === "known" ? "is-active" : "";
  els.reviewBtn.className = progress === "review" ? "is-active" : "";

  els.imageFrame.replaceChildren();
  question.images.forEach((src) => {
    const img = document.createElement("img");
    img.src = src;
    img.alt = `${question.source}の図`;
    els.imageFrame.appendChild(img);
  });
  els.imageFrame.classList.toggle("has-image", question.images.length > 0);

  els.choiceList.replaceChildren();
  renderInteraction(question, response);
}

function renderInteraction(question, response) {
  if (question.type === "single") {
    question.choices.forEach((choice) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `choice-button ${response.selected.includes(choice) ? "is-selected" : ""}`;
      button.textContent = choice;
      button.addEventListener("click", () => {
        response.selected = [choice];
        judge(question);
      });
      els.choiceList.appendChild(button);
    });
    return;
  }

  if (question.type === "multiple") {
    question.choices.forEach((choice) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `choice-button ${response.selected.includes(choice) ? "is-selected" : ""}`;
      button.textContent = choice;
      button.addEventListener("click", () => {
        response.checked = false;
        response.selected = response.selected.includes(choice)
          ? response.selected.filter((item) => item !== choice)
          : [...response.selected, choice];
        render();
      });
      els.choiceList.appendChild(button);
    });
    els.choiceList.appendChild(makeJudgeButton(question, response.selected.length === 0));
    return;
  }

  if (question.type === "matching") {
    const choices = parseMatchingChoices(question.choices);
    parseMatchingAnswer(question.answer).forEach((pair) => {
      const row = document.createElement("div");
      row.className = "matching-row";

      const label = document.createElement("span");
      label.className = "matching-label";
      label.textContent = pair.label;
      row.appendChild(label);

      const buttons = document.createElement("div");
      buttons.className = "matching-options";
      choices.forEach((choice) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = `choice-button compact ${response.matching[pair.label] === choice.label ? "is-selected" : ""}`;
        button.textContent = choice.label;
        button.addEventListener("click", () => {
          response.checked = false;
          response.matching[pair.label] = choice.label;
          render();
        });
        buttons.appendChild(button);
      });
      row.appendChild(buttons);
      els.choiceList.appendChild(row);
    });
    const complete = parseMatchingAnswer(question.answer).every((pair) => response.matching[pair.label]);
    els.choiceList.appendChild(makeJudgeButton(question, !complete));
    return;
  }

  const input = document.createElement("input");
  input.className = "answer-input";
  input.type = "text";
  input.value = response.text;
  input.placeholder = question.type === "free" ? "自分の答えを入力" : "答えを入力";
  input.addEventListener("input", (event) => {
    response.checked = false;
    response.text = event.target.value;
  });
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && response.text.trim()) judge(question);
  });
  els.choiceList.appendChild(input);
  els.choiceList.appendChild(makeJudgeButton(question, !response.text.trim() || question.answer.includes("保存された解答なし")));
}

function makeJudgeButton(question, disabled) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "primary judge-button";
  button.disabled = disabled;
  button.textContent = "判定する";
  button.addEventListener("click", () => judge(question));
  return button;
}

function renderList(items) {
  if (!items.length) {
    els.questionList.innerHTML = '<div class="empty">条件に合う問題がありません。</div>';
    return;
  }

  els.questionList.replaceChildren(...items.map((question) => {
    const detail = document.createElement("details");
    detail.className = "list-item";

    const summary = document.createElement("summary");
    summary.textContent = `${question.source} / ${typeLabels[question.type] || question.type} / ${question.prompt.split("\n")[0]}`;
    detail.appendChild(summary);

    question.images.forEach((src) => {
      const img = document.createElement("img");
      img.src = src;
      img.alt = `${question.source}の図`;
      img.className = "list-image";
      detail.appendChild(img);
    });

    const prompt = document.createElement("p");
    prompt.textContent = question.prompt;
    detail.appendChild(prompt);

    if (question.choices.length) {
      const choices = document.createElement("p");
      choices.textContent = `選択肢: ${question.choices.join(" / ")}`;
      detail.appendChild(choices);
    }

    const answer = document.createElement("p");
    answer.className = "list-answer";
    answer.textContent = `答え: ${question.answer}`;
    detail.appendChild(answer);

    return detail;
  }));
}

function renderMode() {
  const quiz = state.mode === "quiz";
  els.quizView.hidden = !quiz;
  els.listView.hidden = quiz;
  els.quizModeBtn.classList.toggle("is-active", quiz);
  els.listModeBtn.classList.toggle("is-active", !quiz);
}

function render() {
  const items = filteredQuestions();
  renderFilters();
  renderStats(items);
  renderMode();
  if (state.mode === "quiz") renderQuiz(items);
  renderList(items);
}

function move(delta) {
  const count = filteredQuestions().length;
  if (!count) return;
  state.index = (state.index + delta + count) % count;
  state.revealed = false;
  render();
}

function mark(status) {
  const current = filteredQuestions()[state.index];
  if (!current) return;
  if (state.progress[current.id] === status) {
    delete state.progress[current.id];
  } else {
    state.progress[current.id] = status;
  }
  saveProgress();
  render();
}

els.searchInput.addEventListener("input", (event) => {
  state.query = event.target.value;
  state.index = 0;
  state.revealed = false;
  render();
});

els.quizModeBtn.addEventListener("click", () => {
  state.mode = "quiz";
  render();
});

els.listModeBtn.addEventListener("click", () => {
  state.mode = "list";
  render();
});

els.shuffleBtn.addEventListener("click", () => {
  state.order = state.order
    .map((value) => [Math.random(), value])
    .sort((a, b) => a[0] - b[0])
    .map((pair) => pair[1]);
  state.index = 0;
  state.revealed = false;
  render();
});

els.resetProgressBtn.addEventListener("click", () => {
  state.progress = {};
  saveProgress();
  render();
});

els.prevBtn.addEventListener("click", () => move(-1));
els.nextBtn.addEventListener("click", () => move(1));
els.revealBtn.addEventListener("click", () => {
  state.revealed = !state.revealed;
  render();
});
els.knownBtn.addEventListener("click", () => mark("known"));
els.reviewBtn.addEventListener("click", () => mark("review"));

document.addEventListener("keydown", (event) => {
  if (event.target.matches("input")) return;
  if (event.key === "ArrowRight") move(1);
  if (event.key === "ArrowLeft") move(-1);
  if (event.key === " ") {
    event.preventDefault();
    state.revealed = !state.revealed;
    render();
  }
});

render();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js").catch(() => {
      // The quiz still works online if service worker registration is unavailable.
    });
  });
}
