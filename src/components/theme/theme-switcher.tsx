"use client";

import { Moon, SunMedium } from "lucide-react";
import { useTheme } from "@/lib/theme/use-theme";

export function ThemeSwitcher() {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === "light";

  return (
    <button
      type="button"
      onClick={() => void toggleTheme()}
      className="inline-flex h-10 items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-3 text-xs font-bold text-zinc-300 transition hover:border-relic/40 hover:text-relic"
      aria-label={isLight ? "Включить темную тему" : "Включить светлую тему"}
      title={isLight ? "Темная тема" : "Светлая тема"}
    >
      {isLight ? <SunMedium size={17} className="text-relic" /> : <Moon size={17} className="text-relic" />}
      <span>{isLight ? "Light" : "Dark"}</span>
    </button>
  );
}
