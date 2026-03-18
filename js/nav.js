const navEls = document.querySelectorAll(".nav-selections ul li");
const timeOptions = document.querySelector(".time-options");
const timeNavEls = timeOptions.querySelectorAll("li");
const repOptions = document.querySelector(".repetitions-options");
const repNavEls = repOptions.querySelectorAll("li");

navEls.forEach((el) => {
  el.addEventListener("click", () => {
    navEls.forEach((item) => item.classList.remove("active"));
    el.classList.add("active");

    if (el.classList.contains("active") && el.classList.contains("time")) {
      timeOptions.style.display = "flex";
      repOptions.style.display = "none";
    } else if (el.classList.contains("active") && el.classList.contains("repetitions")) {
      repOptions.style.display = "flex";
      timeOptions.style.display = "none";
    }
  });
});

timeNavEls.forEach((el) => {
  el.addEventListener("click", () => {
    timeNavEls.forEach((item) => item.classList.remove("time-active"));
    el.classList.add("time-active");
  });
});

repNavEls.forEach((el) => {
  el.addEventListener("click", () => {
    repNavEls.forEach((item) => item.classList.remove("rep-active"));
    el.classList.add("rep-active");
  });
});