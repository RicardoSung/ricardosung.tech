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

  function getThemeIcon(icon) {
    if (icon === "sun") {
      return '<svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg>';
    }

    return '<svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.99 12.42A8.5 8.5 0 1 1 11.58 3.01 6.5 6.5 0 0 0 20.99 12.42z"></path></svg>';
  }

  function updateToggle(mode) {
    var toggle = getToggle();
    var isDark = mode === "dark";

    if (!toggle) {
      return;
    }

    toggle.innerHTML = getThemeIcon(isDark ? "sun" : "moon");
    toggle.style.display = "inline-flex";
    toggle.style.alignItems = "center";
    toggle.style.verticalAlign = "middle";
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
