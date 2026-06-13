"use client";

import { Globe2, Languages } from "lucide-react";
import { useLanguage } from "@/lib/i18n/use-language";

type LanguageSwitcherProps = {
  compact?: boolean;
};

export function LanguageSwitcher({ compact = false }: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage();

  return (
    <div className={`${compact ? "h-9 rounded-[12px] p-0.5" : "h-10 rounded-md p-1"} flex items-center border border-white/10 bg-white/[0.04]`}>
      <span className={`${compact ? "h-8 w-7" : "h-8 w-8"} grid place-items-center text-relic`}>
        <Globe2 size={compact ? 15 : 17} />
      </span>
      {(["ru", "en"] as const).map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => setLanguage(item)}
          className={`${compact ? "h-8 px-1.5 text-[11px]" : "h-8 px-2 text-xs"} rounded font-bold uppercase transition ${
            language === item ? "bg-relic text-black" : "text-zinc-400 hover:text-white"
          }`}
        >
          {item}
        </button>
      ))}
      <span className={`${compact ? "hidden" : "hidden h-8 w-8 place-items-center text-zinc-500 sm:grid"}`}>
        <Languages size={16} />
      </span>
    </div>
  );
}
