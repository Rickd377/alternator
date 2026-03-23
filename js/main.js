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
  const keysPressed = document.querySelector(".keys-pressed");
  finishModal.style.display = "flex";
  keysPressed.textContent = output.childElementCount + 1;
  calcAccuracy();
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

navEls.forEach((el) => {
  el.addEventListener("click", () => {
    mode = el.classList.contains("time") ? "time" : "reps";
    
    resetSession();
    
    progLabel.textContent = mode === "time" ? `${timeLeft}s` : `0/${maxReps}`;
    timeOptions.style.display = mode === "time" ? "flex" : "none";
    repOptions.style.display = mode === "reps" ? "flex" : "none";
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

repNavEls.forEach((el) => {
  el.addEventListener("click", () => {
    maxReps = Number(el.dataset.reps);
    resetSession();
  });
});

timeNavEls.forEach((el) => {
  el.addEventListener("click", () => {
    maxTime = Number(el.dataset.seconds);
    resetSession();
  });
});

progLabel.textContent = mode === "time" ? `${timeLeft}s` : `0/${maxReps}`;

function resetSession() {
  clearInterval(timer);
  timeRunning = false;
  timeEnded = false;
  sessionEnded = false;
  currentReps = 0;
  allowedKeys = [];
  lastKey = null;

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
  const key = e.key.toLowerCase();

  if (!allowedKeyList.includes(key)) return;
  if (["shift", "control", "alt", "meta"].includes(key)) return;

  const placeholder = output.querySelector(".output-placeholder");
  if (placeholder) placeholder.remove();

  if (mode === "time" && !timeRunning) {
    timeRunning = true;
    timeLeft = maxTime;
    progLabel.textContent = `${timeLeft}s`;

    timer = setInterval(() => {
      timeLeft--;
      progLabel.textContent = `${timeLeft}s`;

      if (timeLeft <= 0) {
        clearInterval(timer);
        timeEnded = true;
        sessionEnded = true;
        showFinishModal();
      }
    }, 1000);
  }

  if (mode === "reps") {
    if (currentReps >= maxReps) return;

    currentReps++;
    progLabel.textContent = `${currentReps}/${maxReps}`;

    if (currentReps >= maxReps) {
      sessionEnded = true;
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