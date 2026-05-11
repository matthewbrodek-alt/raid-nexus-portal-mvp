"use client";

import { Globe2, Languages } from "lucide-react";
import { useLanguage } from "@/lib/i18n/use-language";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex h-10 items-center rounded-md border border-white/10 bg-white/[0.04] p-1">
      <span className="grid h-8 w-8 place-items-center text-relic">
        <Globe2 size={17} />
      </span>
      {(["ru", "en"] as const).map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => setLanguage(item)}
          className={`h-8 rounded px-2 text-xs font-bold uppercase transition ${
            language === item ? "bg-relic text-black" : "text-zinc-400 hover:text-white"
          }`}
        >
          {item}
        </button>
      ))}
      <span className="hidden h-8 w-8 place-items-center text-zinc-500 sm:grid">
        <Languages size={16} />
      </span>
    </div>
  );
}
