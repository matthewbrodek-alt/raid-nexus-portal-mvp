"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/use-language";

export function LegalFooterLinks({ className = "" }: { className?: string }) {
  const { isRu } = useLanguage();

  return (
    <div className={`flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-zinc-500 ${className}`}>
      <Link href="/privacy" className="transition hover:text-relic">
        {isRu ? "Конфиденциальность" : "Privacy"}
      </Link>
      <Link href="/terms" className="transition hover:text-relic">
        {isRu ? "Соглашение" : "Terms"}
      </Link>
      <Link href="/consent" className="transition hover:text-relic">
        {isRu ? "Согласие" : "Consent"}
      </Link>
      <Link href="/cookies" className="transition hover:text-relic">
        Cookie
      </Link>
    </div>
  );
}
