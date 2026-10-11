const dateEl = document.getElementById("date");

function ordinal(n) {
  if (n % 100 >= 11 && n % 100 <= 13) return n + "th";
  return n + (["th", "st", "nd", "rd"][n % 10] || "th");
}

function renderDate() {
  if (!dateEl) return;
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
const systemDark = window.matchMedia ? matchMedia("(prefers-color-scheme: dark)") : null;

function hasSavedChoice() {
  try { return localStorage.getItem("theme") !== null; } catch (e) { return false; }
}

function setTheme(theme) {
  if (theme === "dark") root.dataset.theme = "dark";
  else delete root.dataset.theme;
  toggle.setAttribute("aria-pressed", theme === "dark");
}

toggle.addEventListener("click", () => {
  const next = root.dataset.theme === "dark" ? "light" : "dark";
  setTheme(next);
  try { localStorage.setItem("theme", next); } catch (e) {}
});

// until the visitor clicks the switch, keep following the system setting
if (systemDark) {
  systemDark.addEventListener("change", (e) => {
    if (!hasSavedChoice()) setTheme(e.matches ? "dark" : "light");
  });
}

setTheme(root.dataset.theme === "dark" ? "dark" : "light");
