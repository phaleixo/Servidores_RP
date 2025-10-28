// Lógica de alternância de tema (dark/light)
(function () {
  // Aplica o tema e atualiza o ícone (se existir)
  function setTheme(isDark) {
    try {
      if (isDark) document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");

      const themeIcon = document.getElementById("theme-icon");
      if (themeIcon) {
        themeIcon.classList.toggle("fa-sun", isDark);
        themeIcon.classList.toggle("fa-moon", !isDark);
      }
    } catch (e) {
      // não crítico
    }
  }

  // Decide o tema inicial: localStorage > prefers-color-scheme > light
  function applySavedTheme() {
    try {
      const saved = localStorage.getItem("theme");
      if (saved === "dark") setTheme(true);
      else if (saved === "light") setTheme(false);
      else {
        const prefersDark =
          window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: dark)").matches;
        setTheme(prefersDark);
      }
    } catch (e) {
      // não crítico
    }
  }

  function initThemeToggle() {
    const themeToggle = document.getElementById("theme-toggle");
    if (!themeToggle) return;

    themeToggle.addEventListener("click", function () {
      try {
        const isDark = document.documentElement.classList.contains("dark");
        setTheme(!isDark);
        localStorage.setItem("theme", !isDark ? "dark" : "light");
      } catch (e) {
        // não crítico
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    applySavedTheme();
    initThemeToggle();
  });
})();
