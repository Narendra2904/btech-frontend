/**
 * Backbenchers Portal - Unified Theme Manager
 * Supports Dark and Light Themes across all pages with zero flicker (FOUC)
 */
(function () {
  "use strict";

  function getPreferredTheme() {
    const saved = localStorage.getItem("bb-theme");
    if (saved === "light" || saved === "dark") {
      return saved;
    }
    // Default to dark theme to preserve signature Backbenchers look
    return "dark";
  }

  function applyTheme(theme) {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    if (theme === "light") {
      root.classList.add("light");
      root.classList.remove("dark");
    } else {
      root.classList.add("dark");
      root.classList.remove("light");
    }
  }

  // Apply immediately before DOM renders to prevent flicker
  const initialTheme = getPreferredTheme();
  applyTheme(initialTheme);

  function updateIcons(theme) {
    const currentTheme = theme || document.documentElement.getAttribute("data-theme") || "dark";
    const isLight = currentTheme === "light";

    // Update all toggle buttons
    const buttons = document.querySelectorAll(".theme-toggle-btn");
    buttons.forEach((btn) => {
      btn.setAttribute("title", isLight ? "Switch to Dark Mode" : "Switch to Light Mode");
      btn.setAttribute("aria-label", isLight ? "Switch to Dark Mode" : "Switch to Light Mode");
      
      const icon = btn.querySelector("i");
      if (icon) {
        if (isLight) {
          icon.className = "fas fa-moon text-indigo-600 transition-transform duration-300";
        } else {
          icon.className = "fas fa-sun text-yellow-400 transition-transform duration-300";
        }
      }

      const label = btn.querySelector(".theme-label");
      if (label) {
        label.textContent = isLight ? "DARK" : "LIGHT";
      }
    });
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme") || "dark";
    const next = current === "dark" ? "light" : "dark";
    applyTheme(next);
    localStorage.setItem("bb-theme", next);
    updateIcons(next);

    // Optional event dispatch for any custom components
    window.dispatchEvent(new CustomEvent("themechange", { detail: { theme: next } }));
  }

  // Expose globally
  window.toggleTheme = toggleTheme;
  window.updateThemeIcons = updateIcons;

  // Sync icons once DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => updateIcons());
  } else {
    updateIcons();
  }
})();
