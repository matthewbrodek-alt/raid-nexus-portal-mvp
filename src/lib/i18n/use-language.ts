"use client";

import { useEffect, useState } from "react";

export type Language = "ru" | "en";

const storageKey = "raid-nexus-language";

export function useLanguage() {
  const [language, setLanguageState] = useState<Language>("ru");

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    const initialLanguage = saved === "ru" || saved === "en" ? saved : "ru";

    setLanguageState(initialLanguage);
    document.documentElement.lang = initialLanguage;

    function handleLanguageChange(event: Event) {
      const customEvent = event as CustomEvent<Language>;

      if (customEvent.detail === "ru" || customEvent.detail === "en") {
        setLanguageState(customEvent.detail);
        document.documentElement.lang = customEvent.detail;
      }
    }

    function handleStorageChange(event: StorageEvent) {
      if (event.key !== storageKey) {
        return;
      }

      if (event.newValue === "ru" || event.newValue === "en") {
        setLanguageState(event.newValue);
        document.documentElement.lang = event.newValue;
      }
    }

    window.addEventListener("raid-language-change", handleLanguageChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("raid-language-change", handleLanguageChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  function setLanguage(nextLanguage: Language) {
    setLanguageState(nextLanguage);
    window.localStorage.setItem(storageKey, nextLanguage);
    document.documentElement.lang = nextLanguage;
    window.dispatchEvent(new CustomEvent("raid-language-change", { detail: nextLanguage }));
  }

  return {
    language,
    setLanguage,
    isRu: language === "ru"
  };
}
