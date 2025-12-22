
/*******************************************************
 * FaithIQ Quiz App - script.js
 * Refactored: cleaner structure + readable sections
 * Note: Same functionality preserved (no breaking changes)
 *******************************************************/

/* ===================== CONSTANTS ===================== */
const QUIZ_DURATION_SECONDS = 300;       // 5 minutes (main timer)
const QUESTION_DURATION_SECONDS = 15;    // 15 sec per question (sub timer)
const QUESTIONS_PER_QUIZ_MAX = 10;       // pick up to 10 from category bank
const STORAGE_KEY_ATTEMPTS = "quizAttempts";

/* ===================== GLOBAL STATE ===================== */
let currentQuestionIndex = 0;
let score = 0;
let selectedAnswerIndex = null;
let isAnswered = false;

// Main quiz timer
let timerInterval = null;
let timeLeft = QUIZ_DURATION_SECONDS;

// Per-question timer
let questionTimerInterval = null;
let questionTimeLeft = QUESTION_DURATION_SECONDS;

// Per attempt shuffled subset
let activeQuestions = [];

/* ===================== CATEGORY SELECTION ===================== */
const params = new URLSearchParams(window.location.search);
const category = params.get("cat") || "pillars";

/* ===================== QUESTION BANK ===================== */
const questionBank = {
  pillars: [
    {
      question: "How many pillars of Islam are there?",
      options: ["3", "4", "5", "6"],
      correct: 2,
      reason: "Islam is built on five pillars: Shahada, Salah, Zakat, Sawm, and Hajj."
    },
    {
      question: "Which is the first pillar of Islam?",
      options: ["Salah", "Zakat", "Shahada", "Hajj"],
      correct: 2,
      reason: "The Shahada (Testimony of Faith) is the first and most fundamental pillar."
    },
    {
      question: "How many daily prayers are obligatory?",
      options: ["3", "4", "5", "6"],
      correct: 2,
      reason: "Muslims are required to perform five daily prayers: Fajr, Dhuhr, Asr, Maghrib, and Isha."
    },
    {
      question: "Which pillar involves fasting?",
      options: ["Zakat", "Hajj", "Sawm", "Salah"],
      correct: 2,
      reason: "Sawm refers to fasting during the daylight hours of the month of Ramadan."
    },
    {
      question: "Hajj is performed in which city?",
      options: ["Madina", "Jerusalem", "Makkah", "Taif"],
      correct: 2,
      reason: "Hajj is the pilgrimage to the Holy Kaaba located in Makkah."
    },
    {
      question: "Which pillar of Islam requires a Muslim to declare faith in Allah and His Messenger?",
      options: ["Sawm", "Shahada", "Zakat", "Hajj"],
      correct: 1,
      reason: "The Shahada is the testimony that there is no god but Allah and that Muhammad ﷺ is His Messenger."
    },
    {
      question: "Which pillar of Islam requires giving a portion of one’s wealth to the needy?",
      options: ["Salah", "Zakat", "Sawm", "Hajj"],
      correct: 1,
      reason: "Zakat is the obligatory charity given to purify one’s wealth and support those in need."
    },
    {
      question: "How many times is Hajj required in a Muslim’s lifetime if they are able?",
      options: ["Every year", "Twice", "Once", "Five times"],
      correct: 2,
      reason: "Hajj is required once in a lifetime for those who are physically and financially able."
    },
    {
      question: "Which pillar most directly builds daily discipline through regular worship?",
      options: ["Shahada", "Salah", "Sawm", "Zakat"],
      correct: 1,
      reason: "Salah, the five daily prayers, builds discipline and keeps a Muslim connected to Allah throughout the day."
    },
    {
      question: "Fasting in Ramadan mainly teaches which of the following?",
      options: ["Physical strength", "Patience and self-control", "Travel rules", "Inheritance laws"],
      correct: 1,
      reason: "Sawm teaches patience, self-control, empathy for the poor, and closeness to Allah."
    }
  ],

  prophets: [
    {
      question: "Who is the last Prophet in Islam?",
      options: ["Isa (AS)", "Musa (AS)", "Muhammad ﷺ", "Nuh (AS)"],
      correct: 2,
      reason: "Prophet Muhammad ﷺ is known as Khatam an-Nabiyyin (The Seal of the Prophets)."
    },
    {
      question: "Which Prophet built the Kaaba?",
      options: ["Adam (AS)", "Ibrahim (AS)", "Nuh (AS)", "Musa (AS)"],
      correct: 1,
      reason: "Prophet Ibrahim (AS) and his son Isma'il (AS) rebuilt the Kaaba together."
    },
    {
      question: "Which Prophet was swallowed by a whale?",
      options: ["Yunus (AS)", "Isa (AS)", "Musa (AS)", "Hud (AS)"],
      correct: 0,
      reason: "Prophet Yunus (AS) was swallowed by a large fish/whale after leaving his people."
    },
    {
      question: "Which Prophet received the Torah?",
      options: ["Isa (AS)", "Muhammad ﷺ", "Musa (AS)", "Ibrahim (AS)"],
      correct: 2,
      reason: "The Torah (Tawrat) was the holy book revealed by Allah to Prophet Musa (AS)."
    },
    {
      question: "Who was the first Prophet?",
      options: ["Nuh (AS)", "Adam (AS)", "Ibrahim (AS)", "Isa (AS)"],
      correct: 1,
      reason: "Prophet Adam (AS) was the first man created and the first Prophet of Islam."
    },
    {
      question: "Which Prophet built a large ark by Allah’s command to save the believers from a great flood?",
      options: ["Ibrahim (AS)", "Nuh (AS)", "Yusuf (AS)", "Dawud (AS)"],
      correct: 1,
      reason: "Prophet Nuh (AS) built the ark and called his people to worship Allah alone before the flood."
    },
    {
      question: "Which Prophet was known for his remarkable patience during severe trials?",
      options: ["Ayyub (AS)", "Yunus (AS)", "Ismail (AS)", "Harun (AS)"],
      correct: 0,
      reason: "Prophet Ayyub (AS) remained patient and grateful to Allah despite losing health, wealth, and family."
    },
    {
      question: "Which Prophet interpreted dreams and became a minister in Egypt?",
      options: ["Yunus (AS)", "Yusuf (AS)", "Yaqub (AS)", "Idris (AS)"],
      correct: 1,
      reason: "Prophet Yusuf (AS) was blessed with the ability to interpret dreams and later became a leader in Egypt."
    },
    {
      question: "Which Prophet spoke directly with Allah on Mount Sinai and received commandments?",
      options: ["Isa (AS)", "Musa (AS)", "Ibrahim (AS)", "Yahya (AS)"],
      correct: 1,
      reason: "Prophet Musa (AS) was spoken to directly by Allah and received the commandments on Mount Sinai."
    },
    {
      question: "Which Prophet was born without a father by the command of Allah?",
      options: ["Isa (AS)", "Yahya (AS)", "Idris (AS)", "Ismail (AS)"],
      correct: 0,
      reason: "Prophet Isa (AS) was born miraculously to Maryam (AS) without a father by Allah’s command."
    }
  ],

  quran: [
    {
      question: "How many Surahs are in the Quran?",
      options: ["112", "113", "114", "115"],
      correct: 2,
      reason: "The Holy Quran contains 114 Surahs, starting with Al-Fatiha and ending with An-Nas."
    },
    {
      question: "Which is the first Surah of the Quran?",
      options: ["Al-Baqarah", "Al-Fatiha", "Al-Ikhlas", "An-Nas"],
      correct: 1,
      reason: "Surah Al-Fatiha is the opening chapter and is recited in every unit of prayer."
    },
    {
      question: "Which is the longest Surah in the Quran?",
      options: ["Al-Imran", "An-Nisa", "Al-Baqarah", "Al-Ma'idah"],
      correct: 2,
      reason: "Surah Al-Baqarah is the longest chapter with 286 verses."
    },
    {
      question: "In which month was the Quran revealed?",
      options: ["Muharram", "Rajab", "Ramadan", "Shaban"],
      correct: 2,
      reason: "The Quran was first revealed to Prophet Muhammad ﷺ during the month of Ramadan."
    },
    {
      question: "Which Surah is known as the heart of the Quran?",
      options: ["Al-Fatiha", "Yaseen", "Rahman", "Ikhlas"],
      correct: 1,
      reason: "Surah Yaseen is often called the 'Heart of the Quran' based on various traditions."
    },
    {
      question: "In which language was the Quran originally revealed?",
      options: ["Persian", "Arabic", "Hebrew", "Syriac"],
      correct: 1,
      reason: "The Quran was revealed in clear Arabic (lisanan arabiyyan mubina) to Prophet Muhammad ﷺ."
    },
    {
      question: "What is the name of the night in which the first revelation of the Quran came down?",
      options: ["Laylat al-Qadr", "Laylat al-Isra", "Laylat al-Bara'ah", "Laylat al-Miraj"],
      correct: 0,
      reason: "The first revelation came on Laylat al-Qadr (Night of Decree) in the month of Ramadan."
    },
    {
      question: "Which Surah contains Ayat al-Kursi (The Verse of the Throne)?",
      options: ["Al-Baqarah", "Al-Imran", "An-Nisa", "Ar-Rahman"],
      correct: 0,
      reason: "Ayat al-Kursi is verse 255 of Surah Al-Baqarah, describing Allah’s majesty and knowledge."
    },
    {
      question: "Approximately how many years did it take for the Quran to be revealed completely?",
      options: ["5 years", "10 years", "23 years", "40 years"],
      correct: 2,
      reason: "The Quran was revealed gradually over about 23 years, guiding the believers step by step."
    },
    {
      question: "What is the main theme of Surah Al-Ikhlas?",
      options: ["Charity", "Patience", "Unity of Allah (Tawhid)", "Fasting"],
      correct: 2,
      reason: "Surah Al-Ikhlas emphasizes the oneness of Allah and rejects all forms of shirk (associating partners with Him)."
    }
  ]
};

/* ===================== DOM HELPERS ===================== */
function byId(id) {
  return document.getElementById(id);
}
function qsa(sel) {
  return Array.from(document.querySelectorAll(sel));
}

/* ===================== UTILITIES ===================== */
function capitalize(text) {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : "";
}
function shuffle(arr) {
  // Fisher–Yates shuffle (more stable than sort random)
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function getAttempts() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY_ATTEMPTS)) || [];
}
function setAttempts(attempts) {
  localStorage.setItem(STORAGE_KEY_ATTEMPTS, JSON.stringify(attempts));
}

/* ===================== QUIZ PREP (SHUFFLE + SUBSET) ===================== */
function prepareQuizQuestions() {
  const all = questionBank[category] || [];
  const count = Math.min(QUESTIONS_PER_QUIZ_MAX, all.length);
  activeQuestions = shuffle(all).slice(0, count);
}

/* ===================== QUIZ RENDER ===================== */
function resetExplanationBox() {
  const expBox = byId("explanation-container");
  if (!expBox) return;
  expBox.style.display = "none";
  expBox.innerHTML = "";
  expBox.classList.remove("explanation-true", "explanation-false");
}

function updateProgressBar(total) {
  const bar = byId("progressBar");
  if (!bar) return;
  const progress = (currentQuestionIndex / total) * 100;
  bar.style.width = progress + "%";
}

function updateQuestionCounter(total) {
  if (byId("currentQ")) byId("currentQ").innerText = String(currentQuestionIndex + 1);
  if (byId("totalQ")) byId("totalQ").innerText = String(total);
}

function loadQuestion() {
  isAnswered = false;
  selectedAnswerIndex = null;

  const questions = activeQuestions.length ? activeQuestions : (questionBank[category] || []);
  const current = questions[currentQuestionIndex];
  if (!current) {
    endQuiz();
    return;
  }

  // Text + counters
  if (byId("questionText")) byId("questionText").innerText = current.question;
  updateQuestionCounter(questions.length);

  // Reset explanation
  resetExplanationBox();

  // Reset option buttons
  const buttons = qsa(".option-btn");
  buttons.forEach((btn, i) => {
    btn.innerText = current.options[i] ?? "";
    btn.classList.remove("selected", "correct", "wrong");
    btn.disabled = false;
  });

  updateProgressBar(questions.length);

  // Start 15 sec per-question timer
  startQuestionTimer();
}

/* ===================== ANSWER HANDLING ===================== */
function selectAnswer(btn) {
  if (isAnswered) return;

  const buttons = qsa(".option-btn");
  selectedAnswerIndex = buttons.indexOf(btn);
  isAnswered = true;

  // Stop per-question timer once answered
  clearInterval(questionTimerInterval);

  const currentData = activeQuestions[currentQuestionIndex];
  const correctIndex = currentData.correct;
  const expBox = byId("explanation-container");

  if (expBox) expBox.classList.remove("explanation-true", "explanation-false");

  if (selectedAnswerIndex === correctIndex) {
    btn.classList.add("correct");
    score++;

    if (expBox) {
      expBox.innerHTML = `<strong>(True)</strong> ${currentData.reason}`;
      expBox.classList.add("explanation-true");
      expBox.style.display = "block";
    }
  } else {
    btn.classList.add("wrong");
    if (buttons[correctIndex]) buttons[correctIndex].classList.add("correct");

    if (expBox) {
      expBox.innerHTML = `<strong>(False)</strong> ${currentData.reason}`;
      expBox.classList.add("explanation-false");
      expBox.style.display = "block";
    }
  }

  if (byId("score")) byId("score").innerText = String(score);
  buttons.forEach(b => (b.disabled = true));
}

function nextQuestion() {
  if (!isAnswered) {
    alert("Please select an answer first!");
    return;
  }

  currentQuestionIndex++;
  if (currentQuestionIndex < activeQuestions.length) {
    loadQuestion();
  } else {
    endQuiz();
  }
}

/* ===================== MAIN QUIZ TIMER (5 min) ===================== */
function startTimer() {
  clearInterval(timerInterval);
  timeLeft = QUIZ_DURATION_SECONDS;

  const timerEl = byId("timer");
  if (timerEl) timerEl.classList.remove("red");

  timerInterval = setInterval(() => {
    timeLeft--;

    if (timeLeft < 0) {
      clearInterval(timerInterval);
      endQuiz();
      return;
    }

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    if (timerEl) {
      timerEl.innerText = `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
      if (timeLeft <= 60) timerEl.classList.add("red");
    }
  }, 1000);
}

/* ===================== PER-QUESTION TIMER (15 sec) ===================== */
function startQuestionTimer() {
  clearInterval(questionTimerInterval);
  questionTimeLeft = QUESTION_DURATION_SECONDS;

  const qtEl = byId("questionTimer");
  if (qtEl) {
    qtEl.innerText = String(questionTimeLeft);
    qtEl.classList.remove("red");
  }

  questionTimerInterval = setInterval(() => {
    questionTimeLeft--;

    if (qtEl) {
      qtEl.innerText = String(questionTimeLeft);
      if (questionTimeLeft <= 5) qtEl.classList.add("red");
    }

    if (questionTimeLeft <= 0) {
      clearInterval(questionTimerInterval);
      handleQuestionTimeout();
    }
  }, 1000);
}

function handleQuestionTimeout() {
  if (isAnswered) return;

  const currentData = activeQuestions[currentQuestionIndex];
  const buttons = qsa(".option-btn");
  const correctIndex = currentData.correct;
  const expBox = byId("explanation-container");

  // Disable buttons + show correct answer
  buttons.forEach((btn, i) => {
    btn.disabled = true;
    btn.classList.remove("selected", "correct", "wrong");
    if (i === correctIndex) btn.classList.add("correct");
  });

  if (expBox) {
    expBox.innerHTML = `<strong>(Time up)</strong> ${currentData.reason}`;
    expBox.classList.remove("explanation-true", "explanation-false");
    expBox.classList.add("explanation-false");
    expBox.style.display = "block";
  }

  isAnswered = true;

  // Auto-next after a short delay
  setTimeout(() => nextQuestion(), 1200);
}

/* ===================== END / RESET / QUIT ===================== */
function endQuiz() {
  clearInterval(timerInterval);
  clearInterval(questionTimerInterval);

  const totalQs = activeQuestions.length || (questionBank[category] || []).length;
  const percent = totalQs ? Math.round((score / totalQs) * 100) : 0;

  // Save attempt
  const attempts = getAttempts();
  attempts.push({
    category,
    score,
    total: totalQs,
    date: new Date().toLocaleDateString()
  });
  setAttempts(attempts);

  // Toggle UI
  const quizSection = document.querySelector(".quiz-section");
  const resultScreen = byId("resultScreen");
  if (quizSection) quizSection.classList.add("d-none");
  if (resultScreen) resultScreen.classList.remove("d-none");

  // Result values
  if (byId("finalScore")) byId("finalScore").innerText = String(score);
  if (byId("finalTotal")) byId("finalTotal").innerText = String(totalQs);
  if (byId("finalPercent")) byId("finalPercent").innerText = percent + "%";
  if (byId("finalCategory")) byId("finalCategory").innerText = capitalize(category);

  // Result message
  let title = "Quiz Completed!";
  let subtitle = "Nice effort! Knowledge se Iman mazboot banta hai, keep going.";

  if (percent === 100) {
    title = "MashaAllah! Perfect Score 🏅";
    subtitle = "Zabardast! Saare answers sahi. Ab dusre category try karo.";
  } else if (percent >= 80) {
    title = "Great Job! 🌟";
    subtitle = "Bas thoda sa aur practice, almost perfect ho gaye ho.";
  } else if (percent >= 50) {
    title = "Good Try 👍";
    subtitle = "Practice se hi mastery aati hai. Ek aur round karte hain?";
  } else {
    title = "Keep Going 💪";
    subtitle = "No worries, har attempt ek step aage hai. Dobara try karo InshaAllah.";
  }

  if (byId("resultTitle")) byId("resultTitle").innerText = title;
  if (byId("resultSubtitle")) byId("resultSubtitle").innerText = subtitle;

  // If user is on scoreboard page, refresh table
  renderScoreboard();
}

function resetQuiz() {
  if (!confirm("Do you want to reset the quiz?")) return;

  clearInterval(timerInterval);
  clearInterval(questionTimerInterval);

  currentQuestionIndex = 0;
  score = 0;
  timeLeft = QUIZ_DURATION_SECONDS;

  if (byId("score")) byId("score").innerText = "0";
  if (byId("timer")) byId("timer").innerText = "5:00";
  if (byId("questionTimer")) byId("questionTimer").innerText = String(QUESTION_DURATION_SECONDS);

  const resultScreen = byId("resultScreen");
  const quizSection = document.querySelector(".quiz-section");
  if (resultScreen) resultScreen.classList.add("d-none");
  if (quizSection) quizSection.classList.remove("d-none");

  prepareQuizQuestions();
  loadQuestion();
  startTimer();
}

function quitQuiz() {
  if (!confirm("Are you sure you want to quit the quiz?")) return;
  clearInterval(timerInterval);
  clearInterval(questionTimerInterval);
  window.location.href = "index.html";
}

/* ===================== SCOREBOARD ===================== */
function loadScoreboard() {
  const attempts = getAttempts();
  updateStats(attempts);
  renderTable(attempts);
}

function renderScoreboard() {
  if (window.location.pathname.includes("scoreboard.html")) {
    loadScoreboard();
  }
}

function updateStats(attempts) {
  let totalCorrect = 0;
  let totalQuestions = 0;

  attempts.forEach(a => {
    totalCorrect += a.score;
    totalQuestions += a.total;
  });

  if (byId("totalAttempts")) byId("totalAttempts").innerText = String(attempts.length);
  if (byId("totalCorrect")) byId("totalCorrect").innerText = String(totalCorrect);
  if (byId("totalWrong")) byId("totalWrong").innerText = String(totalQuestions - totalCorrect);

  const accuracy = totalQuestions ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  if (byId("accuracy")) byId("accuracy").innerText = accuracy + "%";
}

function renderTable(attempts) {
  const tbody = byId("scoreHistory");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (!attempts.length) {
    tbody.innerHTML = `<tr><td colspan="5">No attempts yet</td></tr>`;
    return;
  }

  attempts.slice().reverse().forEach((a, i) => {
    const ratio = a.total ? a.score / a.total : 0;
    const colorClass = ratio >= 0.8 ? "green" : ratio >= 0.6 ? "yellow" : "red";

    tbody.innerHTML += `
      <tr>
        <td>${i + 1}</td>
        <td>${capitalize(a.category)}</td>
        <td><span class="${colorClass}-badge">${a.score}</span></td>
        <td>${a.total}</td>
        <td>${a.date}</td>
      </tr>
    `;
  });
}

function clearHistory() {
  if (!confirm("Are you sure you want to clear all history?")) return;
  localStorage.removeItem(STORAGE_KEY_ATTEMPTS);
  loadScoreboard();
}

/* ===================== INIT ===================== */
function initQuiz() {
  const isQuizPage = !!byId("questionText");
  const isScoreboardPage = window.location.pathname.includes("scoreboard.html");

  if (isQuizPage) {
    currentQuestionIndex = 0;
    score = 0;
    timeLeft = QUIZ_DURATION_SECONDS;

    prepareQuizQuestions();

    if (byId("score")) byId("score").innerText = "0";
    if (byId("timer")) byId("timer").innerText = "5:00";
    if (byId("questionTimer")) byId("questionTimer").innerText = String(QUESTION_DURATION_SECONDS);

    loadQuestion();
    startTimer();
  }

  if (isScoreboardPage) {
    loadScoreboard();
  }
}

// Ensure safe init (Netlify fast loads)
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initQuiz);
} else {
  initQuiz();
}

console.log("FaithIQ – script.js Refactored ✅");
