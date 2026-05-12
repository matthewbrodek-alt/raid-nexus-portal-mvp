"use client";

import { Navigation } from "@/components/layout/navigation";
import { useLanguage, type Language } from "@/lib/i18n/use-language";

const sections = [
  { label: "Donate", icon: "coins" as const, href: "/donate" },
  { label: "Useful", icon: "zap" as const, href: "/useful" },
  { label: "Marketplace", icon: "shoppingBag" as const, href: "/marketplace" },
  { label: "Hero DB", icon: "database" as const, href: "/heroes" },
  { label: "Chat", icon: "messageSquare" as const, href: "/chat" }
];

type LocalizedText = string | Record<Language, string>;

type PageShellProps = {
  eyebrow: LocalizedText;
  title: LocalizedText;
  description: LocalizedText;
  children: React.ReactNode;
  compact?: boolean;
};

function resolveText(value: LocalizedText, language: Language) {
  return typeof value === "string" ? value : value[language];
}

export function PageShell({ eyebrow, title, description, children, compact = false }: PageShellProps) {
  const { language } = useLanguage();
  const resolvedDescription = resolveText(description, language);

  return (
    <main className="min-h-screen bg-raid-radial text-pale">
      <Navigation sections={sections} />
      <section className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${compact ? "py-4" : "py-10"}`}>
        {!compact ? (
          <div className="mb-8 max-w-4xl">
            <p className="text-sm uppercase tracking-[0.24em] text-relic">{resolveText(eyebrow, language)}</p>
            <h1 className="mt-3 break-words font-[var(--font-cinzel)] text-3xl font-black text-white sm:text-5xl">{resolveText(title, language)}</h1>
            {resolvedDescription ? <p className="mt-4 text-base leading-8 text-zinc-300">{resolvedDescription}</p> : null}
          </div>
        ) : null}
        {children}
      </section>
    </main>
  );
}
