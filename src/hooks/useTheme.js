// src/hooks/useTheme.js
import { useEffect, useState } from "react";

export default function useTheme(initial = null) {
  const saved = typeof window !== "undefined" ? localStorage.getItem("theme") : null;
  const [theme, setTheme] = useState(saved || initial || "light");

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    try {
      localStorage.setItem("theme", theme);
    } catch (e) {}
  }, [theme]);

  return { theme, setTheme };
}

