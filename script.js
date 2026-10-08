const dateEl = document.getElementById("date");

function ordinal(n) {
  if (n % 100 >= 11 && n % 100 <= 13) return n + "th";
  return n + (["th", "st", "nd", "rd"][n % 10] || "th");
}

function renderDate() {
  const now = new Date();
  const weekday = now.toLocaleDateString("en-US", { weekday: "long" });
  const month = now.toLocaleDateString("en-US", { month: "long" });
  dateEl.textContent = `${weekday}, ${month} ${ordinal(now.getDate())}, ${now.getFullYear()}`;
}

renderDate();
// refresh at midnight if the tab stays open
setInterval(renderDate, 60 * 1000);

// dark mode toggle (initial theme is applied by the inline script in <head>)
const root = document.documentElement;
const toggle = document.getElementById("theme-toggle");

function syncToggle() {
  toggle.setAttribute("aria-pressed", root.dataset.theme === "dark");
}

toggle.addEventListener("click", () => {
  const next = root.dataset.theme === "dark" ? "light" : "dark";
  if (next === "dark") root.dataset.theme = "dark";
  else delete root.dataset.theme;
  try { localStorage.setItem("theme", next); } catch (e) {}
  syncToggle();
});

syncToggle();
