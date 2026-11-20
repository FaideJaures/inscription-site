"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

/** "auto" follows the operating system. <html data-theme> only ever gets "light" or "dark". */
export type ThemeChoice = "light" | "dark" | "auto";

export const THEME_KEY = "mbaya-theme";
export const DEFAULT_THEME: ThemeChoice = "light";
const DARK_OS = "(prefers-color-scheme: dark)";

/**
 * Inline script for <head>: applies the saved theme before the first paint so
 * the page never flashes the wrong colours. Must agree with `paint` below.
 */
export const THEME_SCRIPT = `(function(){try{var c=localStorage.getItem(${JSON.stringify(THEME_KEY)})||${JSON.stringify(DEFAULT_THEME)};if(c==="auto")c=matchMedia(${JSON.stringify(DARK_OS)}).matches?"dark":"light";document.documentElement.dataset.theme=c}catch(e){}})()`;

function paint(choice: ThemeChoice) {
  const dark = choice === "dark" || (choice === "auto" && matchMedia(DARK_OS).matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
}

function readSaved(): ThemeChoice | null {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    return saved === "light" || saved === "dark" || saved === "auto" ? saved : null;
  } catch {
    return null;
  }
}

const ThemeContext = createContext<{ choice: ThemeChoice; choose: (c: ThemeChoice) => void } | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [choice, setChoice] = useState<ThemeChoice>(DEFAULT_THEME);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = readSaved();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage is only readable after mount
    if (saved) setChoice(saved);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    paint(choice);
    try {
      localStorage.setItem(THEME_KEY, choice);
    } catch {
      // storage blocked: the choice lasts for this visit only
    }
    if (choice !== "auto") return;
    const os = matchMedia(DARK_OS);
    const repaint = () => paint("auto");
    os.addEventListener("change", repaint);
    return () => os.removeEventListener("change", repaint);
  }, [choice, loaded]);

  return <ThemeContext.Provider value={{ choice, choose: setChoice }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("useTheme() needs a <ThemeProvider> above it");
  return value;
}
