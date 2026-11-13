"use client";

import { HeroUIProvider } from "@heroui/react";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type ThemeMode = "dark" | "light";
export type LanguageMode = "ar" | "en";

interface ThemeContextValue {
  theme: ThemeMode;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

interface LanguageContextValue {
  lang: LanguageMode;
  isAr: boolean;
  toggleLanguage: () => void;
  setLanguage: (mode: LanguageMode) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  isDark: true,
  toggleTheme: () => {},
  setTheme: () => {},
});

const LanguageContext = createContext<LanguageContextValue>({
  lang: "ar",
  isAr: true,
  toggleLanguage: () => {},
  setLanguage: () => {},
});

const THEME_STORAGE_KEY = "elmazra3a-theme";
const LANG_STORAGE_KEY = "elmazra3a-lang";

function applyThemeToDom(mode: ThemeMode) {
  const root = document.documentElement;
  if (mode === "dark") {
    root.classList.add("dark");
    root.classList.remove("light");
  } else {
    root.classList.remove("dark");
    root.classList.add("light");
  }
  root.style.colorScheme = mode;
}

function applyLanguageToDom(mode: LanguageMode) {
  const root = document.documentElement;
  root.lang = mode;
  root.dir = mode === "ar" ? "rtl" : "ltr";
}

export function Providers({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("dark");
  const [lang, setLangState] = useState<LanguageMode>("ar");

  useEffect(() => {
    try {
      const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
      const initialTheme: ThemeMode = savedTheme === "light" ? "light" : "dark";
      setThemeState(initialTheme);
      applyThemeToDom(initialTheme);
    } catch {
      applyThemeToDom("dark");
    }

    try {
      const savedLang = window.localStorage.getItem(LANG_STORAGE_KEY);
      const initialLang: LanguageMode = savedLang === "en" ? "en" : "ar";
      setLangState(initialLang);
      applyLanguageToDom(initialLang);
    } catch {
      applyLanguageToDom("ar");
    }
  }, []);

  const setTheme = useCallback((mode: ThemeMode) => {
    setThemeState(mode);
    applyThemeToDom(mode);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch {
      // ignore storage errors
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next: ThemeMode = prev === "dark" ? "light" : "dark";
      applyThemeToDom(next);
      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {
        // ignore storage errors
      }
      return next;
    });
  }, []);

  const setLanguage = useCallback((mode: LanguageMode) => {
    setLangState(mode);
    applyLanguageToDom(mode);
    try {
      window.localStorage.setItem(LANG_STORAGE_KEY, mode);
    } catch {
      // ignore storage errors
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLangState((prev) => {
      const next: LanguageMode = prev === "ar" ? "en" : "ar";
      applyLanguageToDom(next);
      try {
        window.localStorage.setItem(LANG_STORAGE_KEY, next);
      } catch {
        // ignore storage errors
      }
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark: theme === "dark",
        toggleTheme,
        setTheme,
      }}
    >
      <LanguageContext.Provider
        value={{
          lang,
          isAr: lang === "ar",
          toggleLanguage,
          setLanguage,
        }}
      >
        <HeroUIProvider>{children}</HeroUIProvider>
      </LanguageContext.Provider>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

export function useLanguage() {
  return useContext(LanguageContext);
}
