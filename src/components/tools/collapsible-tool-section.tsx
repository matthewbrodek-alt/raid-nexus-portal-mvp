"use client";

import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

type CollapsibleToolSectionProps = {
  children: ReactNode;
  description: string;
  eyebrow: string;
  title: string;
};

export function CollapsibleToolSection({ children, description, eyebrow, title }: CollapsibleToolSectionProps) {
  const [open, setOpen] = useState(false);

  return (
    <section className="raid-tool-section overflow-hidden rounded-[22px] border border-relic/28 bg-[#04070d]/92 shadow-[0_24px_70px_rgba(0,0,0,0.58)] backdrop-blur-md">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="raid-tool-section-trigger flex w-full items-center justify-between gap-4 bg-[linear-gradient(135deg,rgba(47,124,255,0.09),rgba(4,7,13,0.88)_46%,rgba(0,0,0,0.58))] px-5 py-5 text-left transition hover:bg-relic/[0.08] sm:px-6"
        aria-expanded={open}
      >
        <span className="min-w-0">
          <span className="block text-xs font-bold uppercase tracking-[0.24em] text-relic">{eyebrow}</span>
          <span className="mt-1 block font-[var(--font-cinzel)] text-2xl font-black text-white">{title}</span>
          <span className="mt-2 block text-sm font-medium leading-7 text-zinc-100">{description}</span>
        </span>
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] border border-relic/40 bg-black/62 text-relic shadow-[0_0_22px_rgba(47,124,255,0.14)]">
          <ChevronDown className={`transition ${open ? "rotate-180" : ""}`} />
        </span>
      </button>

      {open ? <div className="border-t border-relic/14 p-3 sm:p-4">{children}</div> : null}
    </section>
  );
}
