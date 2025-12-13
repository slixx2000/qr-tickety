// src/components/ThemeToggle.jsx
import React from "react";

export default function ThemeToggle({ theme, setTheme }) {
  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="px-3 py-2 rounded-md border dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? "Switch to Light" : "Switch to Dark"}
    </button>
  );
}

