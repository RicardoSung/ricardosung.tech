(function () {
  var storageKey = "theme-storage";

  function getStoredTheme() {
    try {
      return localStorage.getItem(storageKey);
    } catch (error) {
      return null;
    }
  }

  function storeTheme(mode) {
    try {
      localStorage.setItem(storageKey, mode);
    } catch (error) {
      /* Ignore unavailable storage, e.g. strict privacy modes. */
    }
  }

  function getDarkStyle() {
    return document.getElementById("darkModeStyle");
  }

  function getToggle() {
    return document.getElementById("dark-mode-toggle");
  }

  function updateToggle(mode) {
    var toggle = getToggle();
    var isDark = mode === "dark";

    if (!toggle) {
      return;
    }

    toggle.textContent = isDark ? "Light" : "Dark";
    toggle.style.cursor = "pointer";
    toggle.setAttribute("role", "button");
    toggle.setAttribute("tabindex", "0");
    toggle.setAttribute("aria-pressed", isDark ? "true" : "false");
    toggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
    toggle.setAttribute("title", isDark ? "Switch to light mode" : "Switch to dark mode");
  }

  function setTheme(mode) {
    var nextMode = mode === "dark" ? "dark" : "light";
    var darkStyle = getDarkStyle();

    if (darkStyle) {
      darkStyle.disabled = nextMode !== "dark";
    }

    if (document.body) {
      document.body.classList.toggle("dark-active", nextMode === "dark");
    }

    storeTheme(nextMode);
    updateToggle(nextMode);
  }

  function getInitialTheme() {
    var storedTheme = getStoredTheme();

    if (storedTheme === "dark" || storedTheme === "light") {
      return storedTheme;
    }

    return "light";
  }

  window.setTheme = setTheme;
  window.toggleTheme = function () {
    var darkStyle = getDarkStyle();
    var isDark = darkStyle ? !darkStyle.disabled : getStoredTheme() === "dark";

    window.setTheme(isDark ? "light" : "dark");
  };

  function initThemeToggle() {
    var toggle = getToggle();

    setTheme(getInitialTheme());

    if (!toggle || toggle.dataset.themeToggleBound === "true") {
      return;
    }

    toggle.dataset.themeToggleBound = "true";
    toggle.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        window.toggleTheme();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initThemeToggle);
  } else {
    initThemeToggle();
  }
}());
