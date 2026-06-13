"use client";

import { Moon, SunMedium } from "lucide-react";
import { useTheme } from "@/lib/theme/use-theme";

type ThemeSwitcherProps = {
  compact?: boolean;
};

export function ThemeSwitcher({ compact = false }: ThemeSwitcherProps) {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === "light";

  return (
    <button
      type="button"
      onClick={() => void toggleTheme()}
      className={`${
        compact ? "h-9 gap-1.5 rounded-[12px] px-2 text-[11px]" : "h-10 gap-2 rounded-md px-3 text-xs"
      } inline-flex items-center border border-white/10 bg-white/[0.04] font-bold text-zinc-300 transition hover:border-relic/40 hover:text-relic`}
      aria-label={isLight ? "Включить темную тему" : "Включить светлую тему"}
      title={isLight ? "Темная тема" : "Светлая тема"}
    >
      {isLight ? <SunMedium size={compact ? 15 : 17} className="text-relic" /> : <Moon size={compact ? 15 : 17} className="text-relic" />}
      <span>{isLight ? "Light" : "Dark"}</span>
    </button>
  );
}
