const STORAGE_RESULTS_KEY = "bankask_results";
const STORAGE_NAME_KEY = "bankask_player_name";

const screenStart = document.getElementById("screen-start");
const screenQuiz = document.getElementById("screen-quiz");
const screenResult = document.getElementById("screen-result");
const screenLog = document.getElementById("screen-log");

const playerNameInput = document.getElementById("player-name");
const nameError = document.getElementById("name-error");
const showLogBtn = document.getElementById("show-log-btn");
const resultLogBtn = document.getElementById("result-log-btn");
const logBackBtn = document.getElementById("log-back-btn");
const clearLogBtn = document.getElementById("clear-log-btn");
const logTable = document.getElementById("log-table");
const logBody = document.getElementById("log-body");
const logEmpty = document.getElementById("log-empty");

const quizBadge = document.getElementById("quiz-badge");
const quizProgress = document.getElementById("quiz-progress");
const quizScore = document.getElementById("quiz-score");
const progressFill = document.getElementById("progress-fill");
const questionText = document.getElementById("question-text");
const optionsContainer = document.getElementById("options-container");
const nextBtn = document.getElementById("next-btn");
const skipBtn = document.getElementById("skip-btn");

const resultEmoji = document.getElementById("result-emoji");
const resultTitle = document.getElementById("result-title");
const resultScore = document.getElementById("result-score");
const resultSub = document.getElementById("result-sub");
const retryBtn = document.getElementById("retry-btn");
const homeBtn = document.getElementById("home-btn");

let state = {
  level: null,
  playerName: "",
  queue: [],
  total: 0,
  answeredCount: 0,
  score: 0,
  correctCount: 0,
  answered: false,
};

playerNameInput.value = localStorage.getItem(STORAGE_NAME_KEY) || "";

function showScreen(screen) {
  [screenStart, screenQuiz, screenResult, screenLog].forEach((s) => s.classList.add("hidden"));
  screen.classList.remove("hidden");
}

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function loadResults() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_RESULTS_KEY)) || [];
  } catch {
    return [];
  }
}

function saveResult(entry) {
  const results = loadResults();
  results.push(entry);
  localStorage.setItem(STORAGE_RESULTS_KEY, JSON.stringify(results));
}

function renderLog() {
  const results = loadResults().slice().reverse();

  if (results.length === 0) {
    logEmpty.classList.remove("hidden");
    logTable.classList.add("hidden");
    return;
  }

  logEmpty.classList.add("hidden");
  logTable.classList.remove("hidden");
  logBody.innerHTML = "";

  results.forEach((r) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(r.name)}</td>
      <td><span class="log-level ${r.level}">${r.levelLabel}</span></td>
      <td>${r.score} / ${r.maxScore}</td>
      <td>${r.percent}%</td>
      <td>${r.date}</td>
    `;
    logBody.appendChild(tr);
  });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

const QUESTIONS_PER_QUIZ = 10;

function startLevel(level) {
  const name = playerNameInput.value.trim();
  if (!name) {
    playerNameInput.classList.add("invalid");
    nameError.classList.remove("hidden");
    playerNameInput.focus();
    return;
  }
  playerNameInput.classList.remove("invalid");
  nameError.classList.add("hidden");
  localStorage.setItem(STORAGE_NAME_KEY, name);

  const bank = QUESTION_BANK[level];
  state = {
    level,
    playerName: name,
    queue: shuffle(bank.questions).slice(0, QUESTIONS_PER_QUIZ),
    total: QUESTIONS_PER_QUIZ,
    answeredCount: 0,
    score: 0,
    correctCount: 0,
    answered: false,
  };
  showScreen(screenQuiz);
  renderQuestion();
}

function renderQuestion() {
  const bank = QUESTION_BANK[state.level];
  const q = state.queue[0];

  quizBadge.textContent = bank.label;
  quizBadge.className = "badge " + state.level;
  quizProgress.textContent = `السؤال ${state.answeredCount + 1} من ${state.total}`;
  quizScore.textContent = `النقاط: ${state.score}`;
  progressFill.style.width = `${(state.answeredCount / state.total) * 100}%`;

  questionText.textContent = q.q;
  optionsContainer.innerHTML = "";
  state.answered = false;
  nextBtn.disabled = true;
  nextBtn.textContent = state.answeredCount === state.total - 1 ? "عرض النتيجة" : "التالي";
  skipBtn.disabled = state.queue.length <= 1;

  q.options.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.textContent = opt;
    btn.addEventListener("click", () => selectAnswer(i, btn));
    optionsContainer.appendChild(btn);
  });
}

function selectAnswer(selectedIndex, btnEl) {
  if (state.answered) return;
  state.answered = true;
  skipBtn.disabled = true;

  const bank = QUESTION_BANK[state.level];
  const q = state.queue[0];
  const buttons = optionsContainer.querySelectorAll(".option-btn");

  buttons.forEach((b, i) => {
    b.disabled = true;
    if (i === q.answer) b.classList.add("correct");
    else if (i === selectedIndex) b.classList.add("wrong");
  });

  if (selectedIndex === q.answer) {
    state.score += bank.points;
    state.correctCount += 1;
    quizScore.textContent = `النقاط: ${state.score}`;
  }

  state.answeredCount += 1;
  state.queue.shift();
  nextBtn.disabled = false;
  nextBtn.textContent = state.queue.length === 0 ? "عرض النتيجة" : "التالي";
}

skipBtn.addEventListener("click", () => {
  if (state.answered || state.queue.length <= 1) return;
  const q = state.queue.shift();
  state.queue.push(q);
  renderQuestion();
});

nextBtn.addEventListener("click", () => {
  if (state.queue.length > 0) {
    renderQuestion();
  } else {
    finishQuiz();
  }
});

function finishQuiz() {
  progressFill.style.width = "100%";
  const total = state.total;
  const bank = QUESTION_BANK[state.level];
  const maxScore = total * bank.points;
  const percent = Math.round((state.correctCount / total) * 100);

  let emoji = "🙂";
  let title = "نتيجة جيدة";
  if (percent >= 90) { emoji = "🏆"; title = "ممتاز!"; }
  else if (percent >= 70) { emoji = "🎉"; title = "أحسنت!"; }
  else if (percent >= 50) { emoji = "👍"; title = "جيد، واصل!"; }
  else { emoji = "💪"; title = "حاول مرة أخرى"; }

  resultEmoji.textContent = emoji;
  resultTitle.textContent = title;
  resultScore.textContent = `${state.score} / ${maxScore}`;
  resultSub.textContent = `أجبت بشكل صحيح على ${state.correctCount} من ${total} سؤال (${percent}%) - مستوى ${bank.label}`;

  saveResult({
    name: state.playerName,
    level: state.level,
    levelLabel: bank.label,
    score: state.score,
    maxScore,
    correctCount: state.correctCount,
    total,
    percent,
    date: new Date().toLocaleString("ar-u-ca-gregory-nu-latn", { dateStyle: "medium", timeStyle: "short" }),
  });

  showScreen(screenResult);
}

retryBtn.addEventListener("click", () => startLevel(state.level));
homeBtn.addEventListener("click", () => showScreen(screenStart));

showLogBtn.addEventListener("click", () => {
  renderLog();
  showScreen(screenLog);
});

resultLogBtn.addEventListener("click", () => {
  renderLog();
  showScreen(screenLog);
});

logBackBtn.addEventListener("click", () => showScreen(screenStart));

clearLogBtn.addEventListener("click", () => {
  localStorage.removeItem(STORAGE_RESULTS_KEY);
  renderLog();
});

playerNameInput.addEventListener("input", () => {
  if (playerNameInput.value.trim()) {
    playerNameInput.classList.remove("invalid");
    nameError.classList.add("hidden");
  }
});

document.querySelectorAll(".level-btn").forEach((btn) => {
  btn.addEventListener("click", () => startLevel(btn.dataset.level));
});
