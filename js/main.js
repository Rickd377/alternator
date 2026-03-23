// ======= variables =======

const navEls = document.querySelectorAll(".nav-selections ul li");
const navSettings = document.querySelectorAll(".nav-settings ul li");
const timeOptions = document.querySelector(".time-options");
const timeNavEls = timeOptions.querySelectorAll("ul li");
const repOptions = document.querySelector(".repetitions-options");
const repNavEls = repOptions.querySelectorAll("ul li");
const statsModal = document.getElementById("statsModal");
const finishModal = document.getElementById("finishModal");
const output = document.querySelector(".output-display");
const progLabel = document.querySelector(".progress-label");
const canvas = document.querySelector(".live-graph");
const ctx = canvas.getContext("2d");

let lastKey = null;
let allowedKeys = [];
const allowedKeyList = ["w", "arrowup"];

let mode = "time"; // html default
let sessionEnded = false;

let maxReps = 10; // html default
let currentReps = 0;

let maxTime = 5; // html default
let timeRunning = false;
let timeEnded = false;
let timer = null;
let timeLeft = maxTime;
let startTime = null;

let graphPoints = [];
let graphRunning = false;
let isHolding = false;
let graphY = 0; // middle
let graphSpeed = 5; // changable speed
let canvasWidth = 0;
let canvasHeight = 0;
let animationFrame;
let lastTime = 0;
let playerX = 0;
const dotRadius = 12.5;
const canvasPadding = 10;

// ======= load localStorage =======

function loadSettings() {
  const savedMode = localStorage.getItem("mode");
  const savedTime = localStorage.getItem("maxTime");
  const savedReps = localStorage.getItem("maxReps");

  if (savedMode) mode = savedMode;
  if (savedTime) maxTime = Number(savedTime);
  if (savedReps) maxReps = Number(savedReps);
}
loadSettings();

// ======= apply localStorage =======

function applyActiveStates() {
  navEls.forEach((el) => {
    el.classList.toggle(
      "active",
      (mode === "time" && el.classList.contains("time")) ||
      (mode === "reps" && el.classList.contains("repetitions"))
    );
  });

  timeNavEls.forEach((el) => {
    el.classList.toggle("active", Number(el.dataset.seconds) === maxTime);
  });

  repNavEls.forEach((el) => {
    el.classList.toggle("active", Number(el.dataset.reps) === maxReps);
  });

  timeOptions.style.display = mode === "time" ? "flex" : "none";
  repOptions.style.display = mode === "reps" ? "flex" : "none";

  progLabel.textContent =
    mode === "time" ? `${timeLeft}s` : `0/${maxReps}`;
}
applyActiveStates();

// ======= statsModal click events =======

function showStatsModal(activeBtn) {
  navSettings.forEach((item) => item.classList.remove("active"));
  if (activeBtn) activeBtn.classList.add("active");
  statsModal.style.display = "flex";
}

document.getElementById("saveStatsBtn").addEventListener("click", () => {
  saveStats();
  closeStatsModal();
});

function closeStatsModal() {
  statsModal.style.display = "none";
  navSettings.forEach((item) => item.classList.remove("active"));
}

document.querySelectorAll("#closeStatsModal").forEach((btn) => {
  btn.addEventListener("click", closeStatsModal);
});

// ======= finishModal click events =======

function showFinishModal() {
  const keysPressed = document.querySelector(".sesh-keys-pressed");
  const speedEl = document.querySelector(".sesh-speed");

  keysPressed.textContent = output.childElementCount + 1;

  const duration = (Date.now() - startTime) / 1000;
  speedEl.textContent = duration.toFixed(2) + "s";

  calcAccuracy();

  finishModal.style.display = "flex";
  if (mode === "time") {
    speedEl.closest("div").style.display = "none";
  } else if (mode === "reps") {
    keysPressed.closest("div").style.display = "none";
  }
}

function closeFinishModal() {
  finishModal.style.display = "none";
}

document.getElementById("restartBtn").addEventListener("click", () => {
  closeFinishModal();
  resetSession();
});

document.querySelectorAll("#closeFinishModal").forEach((btn) => {
  btn.addEventListener("click", closeFinishModal);
});

// ======= statsModal functions =======
// WIP
function saveStats() {
  console.log("Stats saved");
}

// ======= finishModal functions =======

function calcAccuracy() {
  const accuracy = document.querySelector(".sesh-accuracy");

  const correctAmt = output.querySelectorAll(":scope > .correct").length;
  const incorrectAmt = output.querySelectorAll(":scope > .incorrect").length;
  const total = correctAmt + incorrectAmt;
  const percentage = total === 0 ? 0 : (correctAmt / total) * 100;

  accuracy.textContent = percentage.toFixed(1) + "%";
}

// ======= general functions =======

function createPlaceholder() {
  const placeholder = document.createElement("span");
  placeholder.classList.add("output-placeholder");
  placeholder.innerHTML = `use keys: <kbd>${allowedKeyList[0]}</kbd> + <kbd>${allowedKeyList[1]}</kbd>`;
  output.appendChild(placeholder);
}
createPlaceholder();

document.querySelector(".keybinds-used").innerHTML = `<kbd>${allowedKeyList[0]}</kbd> + <kbd>${allowedKeyList[1]}</kbd>`;

navSettings.forEach((btn) => {
  btn.addEventListener("click", () => {
    showStatsModal(btn);
  });
});

function setActive(selector) {
  selector.forEach((el) => {
    el.addEventListener("click", () => {
      selector.forEach((item) => item.classList.remove("active"));
      el.classList.add("active");
      resetSession();
    });
  });
}

setActive(navEls);
setActive(timeNavEls);
setActive(repNavEls);

function checkOverflow(el) {
  const isOverflowing = el.scrollWidth > el.clientWidth;

  const overflowLeft = el.scrollLeft > 0;
  const overflowRight =
    el.scrollLeft + el.clientWidth < el.scrollWidth - 1;

  el.classList.remove("overflow-left", "overflow-right", "overflow-both");

  if (!isOverflowing) return;

  if (overflowLeft && overflowRight) {
    el.classList.add("overflow-both");
  } else if (overflowLeft) {
    el.classList.add("overflow-left");
  } else if (overflowRight) {
    el.classList.add("overflow-right");
  }
}

output.addEventListener("scroll", () => {
  checkOverflow(output);
});

navEls.forEach((el) => {
  el.addEventListener("click", () => {
    mode = el.classList.contains("time") ? "time" : "reps";

    localStorage.setItem("mode", mode);
    
    resetSession();
    
    progLabel.textContent = mode === "time" ? `${timeLeft}s` : `0/${maxReps}`;
    timeOptions.style.display = mode === "time" ? "flex" : "none";
    repOptions.style.display = mode === "reps" ? "flex" : "none";
  });
});

repNavEls.forEach((el) => {
  el.addEventListener("click", () => {
    maxReps = Number(el.dataset.reps);
    localStorage.setItem("maxReps", maxReps);
    resetSession();
  });
});

timeNavEls.forEach((el) => {
  el.addEventListener("click", () => {
    maxTime = Number(el.dataset.seconds);
    localStorage.setItem("maxTime", maxTime);
    resetSession();
  });
});

progLabel.textContent = mode === "time" ? `${timeLeft}s` : `0/${maxReps}`;

function resizeCanvas() {
  const rect = canvas.parentElement.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const width = rect.width;
  const height = Math.max(0, 150 - canvasPadding * 2);

  canvas.width = width * dpr;
  canvas.height = height * dpr;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  canvasWidth = width;
  canvasHeight = height;
  playerX = canvasWidth * 0.2;
  graphY = clampY(canvasHeight / 2);
}

window.addEventListener("load", resizeCanvas);
window.addEventListener("resize", resizeCanvas);

function clampY(y) {
  if (y < canvasPadding) return canvasPadding;
  if (y > canvasHeight - canvasPadding) return canvasHeight - canvasPadding;
  return y;
}

function draw(time) {
  if (sessionEnded || !graphRunning) return;
  animationFrame = requestAnimationFrame(draw);

  if (!lastTime) lastTime = time;
  const delta = (time - lastTime) / 16.67;
  lastTime = time;

  graphY = clampY(graphY + (isHolding ? -1 : 1) * graphSpeed * delta);

  graphPoints.push({ x: playerX, y: graphY });
  graphPoints.forEach((p) => {
    p.x -= graphSpeed * delta;
    p.y = clampY(p.y);
  });
  graphPoints = graphPoints.filter((p) => p.x > 0);

  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  ctx.beginPath();
  ctx.lineWidth = 10;
  ctx.strokeStyle = "hsl(351, 100%, 67%)";
  ctx.shadowColor = "hsl(351, 100%, 85%)";
  ctx.shadowBlur = 5;

  if (graphPoints.length > 0) {
    let prev = graphPoints[0];
    ctx.moveTo(prev.x, prev.y);

    for (let i = 1; i < graphPoints.length; i++) {
      const point = graphPoints[i];
      ctx.lineTo(point.x, point.y);
    }
  }
  ctx.stroke();

  ctx.beginPath();
  ctx.fillStyle = "hsl(351, 100%, 67%)";
  ctx.arc(playerX, graphY, dotRadius, 0, Math.PI * 2);
  ctx.fill();
}

function startGraph() {
  if (graphRunning) return;
  graphRunning = true;
  lastTime = 0;
  animationFrame = requestAnimationFrame(draw);
}

function stopGraph() {
  cancelAnimationFrame(animationFrame);
  graphRunning = false;
  animationFrame = null;
}

function resetSession() {
  clearInterval(timer);
  stopGraph();
  timeRunning = false;
  timeEnded = false;
  sessionEnded = false;
  currentReps = 0;
  allowedKeys = [];
  graphPoints = [];
  lastKey = null;
  startTime = null;

  graphY = clampY(canvasHeight / 2);
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  output.innerHTML = "";
  output.scrollLeft = 0;
  output.classList.remove("overflow-left", "overflow-right", "overflow-both");

  createPlaceholder();

  if (mode === "time") {
    timeLeft = maxTime;
    progLabel.textContent = `${timeLeft}s`;
  } else {
    progLabel.textContent = `${currentReps}/${maxReps}`;
  }
}

// ======= keydown event =======

document.addEventListener("keydown", (e) => {
  if (sessionEnded) return;
  if (e.repeat) return;
  const key = e.key.toLowerCase();

  if (!allowedKeyList.includes(key)) return;
  if (["shift", "control", "alt", "meta"].includes(key)) return;

  if (!isHolding) {
    isHolding = true;
    startGraph();
  }

  const placeholder = output.querySelector(".output-placeholder");
  if (placeholder) placeholder.remove();

  if (mode === "time" && !timeRunning) {
    timeRunning = true;
    startTime = Date.now();
    timeLeft = maxTime;
    progLabel.textContent = `${timeLeft}s`;

    timer = setInterval(() => {
      timeLeft--;
      progLabel.textContent = `${timeLeft}s`;

      if (timeLeft <= 0) {
        clearInterval(timer);
        timeEnded = true;
        sessionEnded = true;
        stopGraph();
        showFinishModal();
      }
    }, 1000);
  }

  if (mode === "reps") {
    if (currentReps >= maxReps) return;

    if (currentReps === 0) {
      startTime = Date.now();
    }

    currentReps++;
    progLabel.textContent = `${currentReps}/${maxReps}`;

    if (currentReps >= maxReps) {
      sessionEnded = true;
      stopGraph();
      showFinishModal();
    }
  }

  const span = document.createElement("span");
  span.classList.add("key");
  span.classList.add(key === lastKey ? "incorrect" : "correct");

  if (!allowedKeys.includes(key)) allowedKeys.push(key);
  
  output.prepend(span);
  checkOverflow(output);

  lastKey = key;
});

// ======= keyup event =======

document.addEventListener("keyup", (e) => {
  const key = e.key.toLowerCase();
  if (!allowedKeyList.includes(key)) return;

  isHolding = false;
});