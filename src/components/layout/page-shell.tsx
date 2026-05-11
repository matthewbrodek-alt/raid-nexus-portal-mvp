import { Navigation } from "@/components/layout/navigation";

const sections = [
  { label: "Донат", icon: "coins" as const, href: "/donate" },
  { label: "Useful", icon: "zap" as const, href: "/useful" },
  { label: "Marketplace", icon: "shoppingBag" as const, href: "/marketplace" },
  { label: "Hero DB", icon: "database" as const, href: "/heroes" },
  { label: "Chat", icon: "messageSquare" as const, href: "/chat" }
];

type PageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
  compact?: boolean;
};

export function PageShell({ eyebrow, title, description, children, compact = false }: PageShellProps) {
  return (
    <main className="min-h-screen bg-raid-radial text-pale">
      <Navigation sections={sections} />
      <section className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${compact ? "py-4" : "py-10"}`}>
        {!compact ? (
          <div className="mb-8 max-w-4xl">
            <p className="text-sm uppercase tracking-[0.24em] text-relic">{eyebrow}</p>
            <h1 className="mt-3 break-words font-[var(--font-cinzel)] text-3xl font-black text-white sm:text-5xl">{title}</h1>
            <p className="mt-4 text-base leading-8 text-zinc-300">{description}</p>
          </div>
        ) : null}
        {children}
      </section>
    </main>
  );
}
