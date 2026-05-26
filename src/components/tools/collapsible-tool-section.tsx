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
    <section className="overflow-hidden rounded-[22px] border border-relic/20 bg-[#050a12]/76 shadow-[0_0_42px_rgba(0,0,0,0.38)]">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition hover:bg-relic/[0.06] sm:px-6"
        aria-expanded={open}
      >
        <span className="min-w-0">
          <span className="block text-xs font-bold uppercase tracking-[0.24em] text-relic">{eyebrow}</span>
          <span className="mt-1 block font-[var(--font-cinzel)] text-2xl font-black text-white">{title}</span>
          <span className="mt-2 block text-sm leading-6 text-zinc-400">{description}</span>
        </span>
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] border border-relic/30 bg-black/35 text-relic">
          <ChevronDown className={`transition ${open ? "rotate-180" : ""}`} />
        </span>
      </button>

      {open ? <div className="border-t border-relic/14 p-3 sm:p-4">{children}</div> : null}
    </section>
  );
}
