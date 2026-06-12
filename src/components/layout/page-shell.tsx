"use client";

import { HomeSearch } from "@/components/home/home-search";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { Navigation } from "@/components/layout/navigation";
import { SiteSidebar } from "@/components/layout/site-sidebar";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { useLanguage, type Language } from "@/lib/i18n/use-language";

const sections = [
  { label: "Home", icon: "home" as const, href: "/" },
  { label: "Donate", icon: "coins" as const, href: "/donate" },
  { label: "Useful", icon: "zap" as const, href: "/useful" },
  { label: "Account Purchase", icon: "shoppingBag" as const, href: "/marketplace" },
  { label: "Hero DB", icon: "database" as const, href: "/heroes" },
  { label: "Clans", icon: "shield" as const, href: "/clans" },
  { label: "Chat", icon: "messageSquare" as const, href: "/chat" },
  { label: "Live", icon: "radio" as const, href: "/stream" }
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
    <main className="min-h-screen overflow-x-hidden bg-raid-radial text-pale">
      <div className="raid-dashboard-shell relative z-10 min-h-screen lg:grid lg:grid-cols-[300px_minmax(0,1fr)]">
        <SiteSidebar />
        <div className="min-w-0">
          <div className="lg:hidden">
            <Navigation sections={sections} />
          </div>
          <header className="hidden h-24 items-center gap-5 px-4 sm:px-6 lg:flex lg:px-8">
            <HomeSearch />
            <div className="ml-auto flex items-center gap-3">
              <LanguageSwitcher />
              <ThemeSwitcher />
            </div>
          </header>
          <section className={`mx-auto min-w-0 max-w-7xl px-4 sm:px-6 lg:px-8 ${compact ? "py-4" : "py-10"}`}>
            {!compact ? (
              <div className="mb-8 max-w-4xl rounded-[24px] border border-relic/20 bg-[#04070d]/88 p-5 shadow-[0_22px_70px_rgba(0,0,0,0.62)] backdrop-blur-md sm:p-6">
                <p className="text-sm font-semibold tracking-[0.14em] text-relic drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]">{resolveText(eyebrow, language)}</p>
                <h1 className="mt-3 break-words font-[var(--font-display)] text-3xl font-light leading-tight text-white drop-shadow-[0_3px_14px_rgba(0,0,0,0.95)] sm:text-5xl">{resolveText(title, language)}</h1>
                {resolvedDescription ? <p className="mt-4 text-base font-medium leading-8 text-zinc-100 drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">{resolvedDescription}</p> : null}
              </div>
            ) : null}
            {children}
          </section>
        </div>
      </div>
    </main>
  );
}
