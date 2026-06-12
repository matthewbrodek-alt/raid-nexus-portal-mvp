"use client";

import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import type { UserTheme } from "@/lib/auth/types";
import { db } from "@/lib/firebase/client";
import { collections } from "@/lib/firebase/collections";

type ThemeContextValue = {
  setTheme: (theme: UserTheme) => Promise<void>;
  theme: UserTheme;
  toggleTheme: () => Promise<void>;
};

const storageKey = "raid-nexus-theme";
const ThemeContext = createContext<ThemeContextValue | null>(null);

function normalizeTheme(value?: string | null): UserTheme | null {
  return value === "light" || value === "dark" ? value : null;
}

function applyTheme(nextTheme: UserTheme) {
  document.documentElement.dataset.theme = nextTheme;
  document.documentElement.style.colorScheme = nextTheme;
  window.localStorage.setItem(storageKey, nextTheme);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { profile, user } = useAuth();
  const [theme, setThemeState] = useState<UserTheme>("dark");

  useEffect(() => {
    const savedTheme = normalizeTheme(window.localStorage.getItem(storageKey));
    const nextTheme = normalizeTheme(profile?.theme) ?? savedTheme ?? "dark";

    setThemeState(nextTheme);
    applyTheme(nextTheme);
  }, [profile?.theme]);

  const setTheme = useCallback(async (nextTheme: UserTheme) => {
    setThemeState(nextTheme);
    applyTheme(nextTheme);

    if (!user?.uid) {
      return;
    }

    await updateDoc(doc(db, collections.users, user.uid), {
      theme: nextTheme,
      updatedAt: serverTimestamp()
    }).catch(() => undefined);
  }, [user?.uid]);

  const toggleTheme = useCallback(async () => {
    await setTheme(theme === "dark" ? "light" : "dark");
  }, [setTheme, theme]);

  const value = useMemo(
    () => ({
      setTheme,
      theme,
      toggleTheme
    }),
    [setTheme, theme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }

  return context;
}
