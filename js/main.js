const navEls = document.querySelectorAll(".nav-selections ul li");
const navSettings = document.querySelectorAll(".nav-settings ul li");
const timeOptions = document.querySelector(".time-options");
const timeNavEls = timeOptions.querySelectorAll("ul li");
const repOptions = document.querySelector(".repetitions-options");
const repNavEls = repOptions.querySelectorAll("ul li");
const settingsModal = document.getElementById("settingsModal");
const finishModal = document.getElementById("finishModal");
const output = document.querySelector(".output-display");
const progLabel = document.querySelector(".progress-label");

let lastKey = null;
let allowedKeys = [];

let mode = "time"; // default

let maxReps = 10; // default
let currentReps = 0;

let maxTime = 5; // default
let timeRunning = false;
let timeEnded = false;
let timer = null;
let timeLeft = maxTime;

navSettings.forEach((el) => {
  el.addEventListener("click", () => {
    settingsModal.style.display = "flex";
    navSettings.forEach((item) => item.classList.remove("active"));
    el.classList.add("active");
  });
});

document.querySelectorAll("#closeSettingsModal").forEach((btn) => {
  btn.addEventListener("click", () => {
    settingsModal.style.display = "none";
    navSettings.forEach((item) => item.classList.remove("active"));
  });
});

document.getElementById("saveSettings").addEventListener("click", () => {
  // saveSettings();
  
  settingsModal.style.display = "none";
  navSettings.forEach((item) => item.classList.remove("active"));
});

function showFinishModal() {
  finishModal.style.display = "flex";

  document.getElementById("closeFinishModal").addEventListener("click", () => {
    finishModal.style.display = "none";
    resetSession();
  });
}

// function saveSettings() {

// }

navEls.forEach((el) => {
  el.addEventListener("click", () => {
    mode = el.classList.contains("time") ? "time" : "reps";
    
    resetSession();
    
    progLabel.textContent = mode === "time" ? `${timeLeft}s` : `${currentReps}/${maxReps}`;
    timeOptions.style.display = mode === "time" ? "flex" : "none";
    repOptions.style.display = mode === "reps" ? "flex" : "none";
  });
});

function setActive(selector) {
  selector.forEach((el) => {
    el.addEventListener("click", () => {
      selector.forEach((item) => item.classList.remove("active"));
      el.classList.add("active");
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

progLabel.textContent = mode === "time" ? `${timeLeft}s` : `${currentReps + 1}/${maxReps}`;

function resetSession() {
  clearInterval(timer);
  timeRunning = false;
  timeEnded = false;
  currentReps = 0;
  allowedKeys = [];
  lastKey = null;

  output.innerHTML = "";
  output.scrollLeft = 0;

  if (mode === "time") {
    timeLeft = maxTime;
    progLabel.textContent = `${timeLeft}s`;
  } else {
    progLabel.textContent = `${currentReps}/${maxReps}`;
  }
}

document.addEventListener("keydown", (e) => {
  if (mode === "reps" && currentReps >= maxReps) return;
  if (mode === "time" && timeEnded) return;

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
        showFinishModal();
      }
    }, 1000);
  }

  const map = {
    " ": "space",
    arrowup: "up",
    arrowdown: "down",
    arrowleft: "left",
    arrowright: "right"
  };

  const key = map[e.key.toLowerCase()] || e.key.toLowerCase();

  if (["shift", "control", "alt", "meta"].includes(key)) return;

  const span = document.createElement("span");
  span.classList.add("key");

  const lastEl = output.firstElementChild;

  if (!allowedKeys.includes(key)) {
    allowedKeys.push(key);
  }

  if (allowedKeys.length > 2) {
    span.classList.add("wrong");

    if (lastEl) {
      lastEl.classList.remove("correct", "incorrect", "wrong");
      lastEl.classList.add("wrong");
    }

    allowedKeys = [key];
  } else if (key === lastKey) {
    span.classList.add("incorrect");
  } else {
    span.classList.add("correct");
  }
  
  output.prepend(span);
  checkOverflow(output);

  lastKey = key;

  if (mode === "reps") {
    currentReps++;
    progLabel.textContent = `${currentReps}/${maxReps}`;

    if (currentReps >= maxReps) {
      showFinishModal();
    }
  }
});

output.addEventListener("scroll", () => {
  checkOverflow(output);
});