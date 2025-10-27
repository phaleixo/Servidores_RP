// Lógica de alternância de tema (dark/light)
(function () {
  function applySavedTheme() {
    const themeIcon = document.getElementById("theme-icon");
    if (!themeIcon) return;

    if (localStorage.getItem("theme") === "dark") {
      document.documentElement.classList.add("dark");
      themeIcon.classList.remove("fa-moon");
      themeIcon.classList.add("fa-sun");
    } else {
      document.documentElement.classList.remove("dark");
      themeIcon.classList.remove("fa-sun");
      themeIcon.classList.add("fa-moon");
    }
  }

  function initThemeToggle() {
    const themeToggle = document.getElementById("theme-toggle");
    const themeIcon = document.getElementById("theme-icon");
    if (!themeToggle || !themeIcon) return;

    themeToggle.addEventListener("click", function () {
      if (document.documentElement.classList.contains("dark")) {
        document.documentElement.classList.remove("dark");
        themeIcon.classList.remove("fa-sun");
        themeIcon.classList.add("fa-moon");
        localStorage.setItem("theme", "light");
      } else {
        document.documentElement.classList.add("dark");
        themeIcon.classList.remove("fa-moon");
        themeIcon.classList.add("fa-sun");
        localStorage.setItem("theme", "dark");
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    applySavedTheme();
    initThemeToggle();
  });
})();
