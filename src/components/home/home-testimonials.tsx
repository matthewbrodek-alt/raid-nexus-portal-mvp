"use client";

import { Star } from "lucide-react";
import { useLanguage } from "@/lib/i18n/use-language";

const reviews = {
  ru: [
    {
      name: "Bumpy клиент",
      text: "Заявка ушла быстро, менеджер сразу уточнил набор и статус появился в кабинете."
    },
    {
      name: "Raid игрок",
      text: "Удобно видеть этапы заказа и не искать переписку по разным каналам."
    },
    {
      name: "Партнер BP",
      text: "Реферальная ссылка и Bumpy Coins делают повторные покупки понятнее."
    }
  ],
  en: [
    {
      name: "Bumpy client",
      text: "The request was sent fast, the manager confirmed the pack and the status appeared in the dashboard."
    },
    {
      name: "Raid player",
      text: "It is useful to see order stages without searching through different chats."
    },
    {
      name: "BP partner",
      text: "The referral link and Bumpy Coins make repeat purchases clearer."
    }
  ]
};

export function HomeTestimonials() {
  const { language } = useLanguage();
  const items = reviews[language];

  return (
    <section className="mb-5 grid gap-3 md:grid-cols-3">
      {items.map((item) => (
        <article key={item.name} className="rounded-[20px] border border-relic/18 bg-black/30 p-4 shadow-[0_18px_44px_rgba(0,0,0,0.28)] backdrop-blur-md">
          <div className="mb-3 flex gap-1 text-relic">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star key={index} size={14} fill="currentColor" />
            ))}
          </div>
          <p className="text-sm leading-6 text-zinc-200">{item.text}</p>
          <p className="mt-3 text-xs font-bold tracking-[0.12em] text-relic">{item.name}</p>
        </article>
      ))}
    </section>
  );
}
