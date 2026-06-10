// ===== Simple Alarm =====

const clockEl = document.getElementById("clock");
const formEl = document.getElementById("alarm-form");
const timeInput = document.getElementById("alarm-time");
const listEl = document.getElementById("alarm-list");
const overlayEl = document.getElementById("overlay");
const stopBtn = document.getElementById("stop-btn");

const STORAGE_KEY = "simple-alarm:alarms";

/** @type {string[]} 例: ["07:30", "12:00"] */
let alarms = load();
let lastTriggeredMinute = null;
let audioCtx = null;
let ringTimer = null;

// ---- 永続化 ----
function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(alarms));
}

// ---- 描画 ----
function pad(n) {
  return String(n).padStart(2, "0");
}

function renderClock() {
  const now = new Date();
  clockEl.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  checkAlarms(now);
}

function renderList() {
  listEl.innerHTML = "";
  if (alarms.length === 0) {
    const li = document.createElement("li");
    li.className = "empty";
    li.textContent = "アラームはまだ無いで";
    listEl.appendChild(li);
    return;
  }
  alarms
    .slice()
    .sort()
    .forEach((time) => {
      const li = document.createElement("li");
      li.className = "alarm-item";

      const span = document.createElement("span");
      span.className = "time";
      span.textContent = time;

      const remove = document.createElement("button");
      remove.className = "remove";
      remove.setAttribute("aria-label", "削除");
      remove.textContent = "×";
      remove.addEventListener("click", () => {
        alarms = alarms.filter((t) => t !== time);
        save();
        renderList();
      });

      li.appendChild(span);
      li.appendChild(remove);
      listEl.appendChild(li);
    });
}

// ---- アラーム判定 ----
function checkAlarms(now) {
  const current = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  if (current === lastTriggeredMinute) return;
  if (alarms.includes(current)) {
    lastTriggeredMinute = current;
    ring();
  }
}

// ---- 鳴動 ----
function beep() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.3, audioCtx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.4);
  } catch {
    /* 音が出せん環境でも画面表示は出す */
  }
}

function ring() {
  overlayEl.classList.remove("hidden");
  beep();
  ringTimer = setInterval(beep, 800);
  // 「止める」へフォーカスを当ててEnterだけで止められるように
  stopBtn.focus();
}

function stopRing() {
  overlayEl.classList.add("hidden");
  if (ringTimer) {
    clearInterval(ringTimer);
    ringTimer = null;
  }
}

// ---- イベント ----
formEl.addEventListener("submit", (e) => {
  e.preventDefault();
  const value = timeInput.value;
  if (!value) return;
  if (!alarms.includes(value)) {
    alarms.push(value);
    save();
    renderList();
  }
  timeInput.value = "";
});

stopBtn.addEventListener("click", stopRing);

// 鳴動中はどこにフォーカスがあっても Enter（または Esc）で止める
document.addEventListener("keydown", (e) => {
  if (overlayEl.classList.contains("hidden")) return;
  if (e.key === "Enter" || e.key === "Escape") {
    e.preventDefault();
    stopRing();
  }
});

// ---- 起動 ----
renderList();
renderClock();
setInterval(renderClock, 1000);
