import Link from "next/link";
import { Hammer, MessageCircle } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";

export default function MarketplacePage() {
  return (
    <PageShell
      eyebrow={{ ru: "Покупка аккаунта", en: "Account Purchase" }}
      title={{ ru: "Покупка аккаунта", en: "Account Purchase" }}
      description={{
        ru: "Раздел находится в стадии разработки.",
        en: "This section is under development."
      }}
      compact
    >
      <section className="mx-auto max-w-3xl overflow-hidden rounded-[28px] border border-relic/18 bg-[#050b12]/82 p-6 text-center shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-md sm:p-10">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-relic/25 bg-relic/10 text-relic">
          <Hammer size={30} />
        </div>
        <h2 className="mt-5 text-2xl font-black text-white sm:text-4xl">Раздел находится в стадии разработки</h2>
        <p className="mx-auto mt-4 max-w-xl text-sm font-semibold leading-7 text-zinc-400">
          Витрина аккаунтов будет открыта после финальной проверки лотов, фильтров и связи с менеджером. Пока можно оставить заявку через раздел доната или написать в поддержку.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/topup"
            className="inline-flex items-center justify-center rounded-2xl bg-[#2f7cff] px-5 py-3 text-sm font-black text-white transition hover:bg-[#63a6ff]"
          >
            Купить игровой набор
          </Link>
          <Link
            href="/chat"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-relic/28 bg-black/24 px-5 py-3 text-sm font-black text-relic transition hover:border-relic hover:bg-relic/10"
          >
            <MessageCircle size={17} />
            Написать менеджеру
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
