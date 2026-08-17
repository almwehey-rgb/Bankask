const screenStart = document.getElementById("screen-start");
const screenQuiz = document.getElementById("screen-quiz");
const screenResult = document.getElementById("screen-result");

const quizBadge = document.getElementById("quiz-badge");
const quizProgress = document.getElementById("quiz-progress");
const quizScore = document.getElementById("quiz-score");
const progressFill = document.getElementById("progress-fill");
const questionText = document.getElementById("question-text");
const optionsContainer = document.getElementById("options-container");
const nextBtn = document.getElementById("next-btn");

const resultEmoji = document.getElementById("result-emoji");
const resultTitle = document.getElementById("result-title");
const resultScore = document.getElementById("result-score");
const resultSub = document.getElementById("result-sub");
const retryBtn = document.getElementById("retry-btn");
const homeBtn = document.getElementById("home-btn");

let state = {
  level: null,
  questions: [],
  index: 0,
  score: 0,
  correctCount: 0,
  answered: false,
};

function showScreen(screen) {
  [screenStart, screenQuiz, screenResult].forEach((s) => s.classList.add("hidden"));
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

const QUESTIONS_PER_QUIZ = 10;

function startLevel(level) {
  const bank = QUESTION_BANK[level];
  state = {
    level,
    questions: shuffle(bank.questions).slice(0, QUESTIONS_PER_QUIZ),
    index: 0,
    score: 0,
    correctCount: 0,
    answered: false,
  };
  showScreen(screenQuiz);
  renderQuestion();
}

function renderQuestion() {
  const bank = QUESTION_BANK[state.level];
  const q = state.questions[state.index];

  quizBadge.textContent = bank.label;
  quizBadge.className = "badge " + state.level;
  quizProgress.textContent = `السؤال ${state.index + 1} من ${state.questions.length}`;
  quizScore.textContent = `النقاط: ${state.score}`;
  progressFill.style.width = `${(state.index / state.questions.length) * 100}%`;

  questionText.textContent = q.q;
  optionsContainer.innerHTML = "";
  state.answered = false;
  nextBtn.disabled = true;
  nextBtn.textContent = state.index === state.questions.length - 1 ? "عرض النتيجة" : "التالي";

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

  const bank = QUESTION_BANK[state.level];
  const q = state.questions[state.index];
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

  nextBtn.disabled = false;
}

nextBtn.addEventListener("click", () => {
  if (state.index < state.questions.length - 1) {
    state.index += 1;
    renderQuestion();
  } else {
    finishQuiz();
  }
});

function finishQuiz() {
  progressFill.style.width = "100%";
  const total = state.questions.length;
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

  showScreen(screenResult);
}

retryBtn.addEventListener("click", () => startLevel(state.level));
homeBtn.addEventListener("click", () => showScreen(screenStart));

document.querySelectorAll(".level-btn").forEach((btn) => {
  btn.addEventListener("click", () => startLevel(btn.dataset.level));
});
