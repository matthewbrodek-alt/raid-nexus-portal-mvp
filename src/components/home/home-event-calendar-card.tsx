"use client";

import { CalendarDays, ImagePlus, X } from "lucide-react";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { db } from "@/lib/firebase/client";
import { collections } from "@/lib/firebase/collections";
import { useLanguage } from "@/lib/i18n/use-language";

type CalendarImage = {
  secureUrl?: string;
  url?: string;
  alt?: string;
};

type HomeEventCalendar = {
  title?: string;
  description?: string;
  image?: CalendarImage | null;
  imageUrl?: string;
};

function getImageUrl(data: HomeEventCalendar | null) {
  return data?.image?.secureUrl ?? data?.image?.url ?? data?.imageUrl ?? "";
}

export function HomeEventCalendarCard() {
  const { language } = useLanguage();
  const [data, setData] = useState<HomeEventCalendar | null>(null);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    return onSnapshot(doc(db, collections.siteSettings, "homeEventCalendar"), (snapshot) => {
      setData((snapshot.data() as HomeEventCalendar | undefined) ?? null);
    });
  }, []);

  const imageUrl = getImageUrl(data);
  const title = data?.title?.trim() || (language === "ru" ? "Календарь событий" : "Event Calendar");
  const description =
    data?.description?.trim() ||
    (language === "ru" ? "Админ может загрузить сюда актуальный календарь или афишу события." : "Admin can upload the current event calendar or promo image here.");

  const modal = useMemo(() => {
    if (!open) {
      return null;
    }

    return (
      <div className="fixed inset-0 z-[2147483647] flex items-center justify-center bg-black/86 p-4 backdrop-blur-xl" role="dialog" aria-modal="true">
        <div className="relative max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-[28px] border border-relic/35 bg-[#03070d]/96 shadow-[0_30px_90px_rgba(0,0,0,0.72)]">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute right-4 top-4 z-10 grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-black/70 text-white transition hover:border-relic/60 hover:text-relic"
            aria-label={language === "ru" ? "Закрыть" : "Close"}
          >
            <X size={20} />
          </button>
          <div className="max-h-[72vh] bg-black/42 p-3">
            {imageUrl ? (
              <img src={imageUrl} alt={data?.image?.alt ?? title} className="mx-auto max-h-[68vh] w-full rounded-[18px] object-contain" />
            ) : (
              <div className="grid min-h-[340px] place-items-center rounded-[18px] border border-dashed border-relic/28 bg-black/40 text-center text-zinc-400">
                <div>
                  <ImagePlus className="mx-auto mb-3 text-relic" size={34} />
                  {language === "ru" ? "Картинка календаря еще не загружена" : "Calendar image is not uploaded yet"}
                </div>
              </div>
            )}
          </div>
          <div className="p-5 sm:p-7">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-relic">{language === "ru" ? "Календарь событий" : "Event Calendar"}</p>
            <h3 className="raid-title-metal mt-2 text-2xl font-black sm:text-3xl">{title}</h3>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-300">{description}</p>
          </div>
        </div>
      </div>
    );
  }, [data?.image?.alt, description, imageUrl, language, open, title]);

  return (
    <>
      <section className="raid-ornate-panel overflow-hidden p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-relic">{language === "ru" ? "Афиша" : "Schedule"}</p>
            <h2 className="raid-title-metal mt-2 text-2xl font-black">{language === "ru" ? "Календарь событий" : "Event Calendar"}</h2>
          </div>
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[16px] border border-relic/30 bg-black/40 text-relic">
            <CalendarDays size={22} />
          </span>
        </div>

        <button type="button" onClick={() => setOpen(true)} className="group block w-full text-left">
          <div className="relative overflow-hidden rounded-[22px] border border-relic/24 bg-black/42">
            {imageUrl ? (
              <img src={imageUrl} alt={data?.image?.alt ?? title} className="h-64 w-full object-contain transition duration-300 group-hover:scale-[1.015] sm:h-72" />
            ) : (
              <div className="grid h-64 place-items-center bg-[url('/images/raid-castle-bg-optimized.jpg')] bg-cover bg-center text-center sm:h-72">
                <div className="absolute inset-0 bg-black/62" />
                <div className="relative px-6 text-zinc-300">
                  <ImagePlus className="mx-auto mb-3 text-relic" size={32} />
                  {language === "ru" ? "Загрузите картинку календаря в админ-панели" : "Upload a calendar image in admin panel"}
                </div>
              </div>
            )}
          </div>
        </button>
      </section>

      {mounted && modal ? createPortal(modal, document.body) : null}
    </>
  );
}
