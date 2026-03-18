const navEls = document.querySelectorAll(".nav-selections ul li");
const navSettings = document.querySelectorAll(".nav-settings ul li");
const timeOptions = document.querySelector(".time-options");
const timeNavEls = timeOptions.querySelectorAll("ul li");
const repOptions = document.querySelector(".repetitions-options");
const repNavEls = repOptions.querySelectorAll("ul li");
const modal = document.querySelector(".modal");
const output = document.querySelector(".output-display");

let lastKey = null;
let allowedKeys = [];

navSettings.forEach((el) => {
  el.addEventListener("click", () => {
    modal.style.display = "flex";
    navSettings.forEach((item) => item.classList.remove("active"));
    el.classList.add("active");
  });
});

document.querySelectorAll("#closeModal").forEach((btn) => {
  btn.addEventListener("click", () => {
    modal.style.display = "none";
    navSettings.forEach((item) => item.classList.remove("active"));
  });
});

document.getElementById("saveSettings").addEventListener("click", () => {
  // saveSettings();
  
  modal.style.display = "none";
  navSettings.forEach((item) => item.classList.remove("active"));
});

// function saveSettings() {

// }

navEls.forEach((el) => {
  el.addEventListener("click", () => {
    timeOptions.style.display = el.classList.contains("time") ? "flex" : "none";
    repOptions.style.display = el.classList.contains("repetitions") ? "flex" : "none";
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

document.addEventListener("keydown", (e) => {
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
  span.textContent = key;

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
});

output.addEventListener("scroll", () => {
  checkOverflow(output);
});