"use client";

import Link from "next/link";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase/client";
import { collections } from "@/lib/firebase/collections";
import { useLanguage, type Language } from "@/lib/i18n/use-language";

type SocialLinks = {
  telegram?: string;
  vkVideo?: string;
  vkCommunity?: string;
  youtube?: string;
  twitch?: string;
};

const communityLinks = [
  { key: "telegram", label: "TG", title: "Telegram", caption: { ru: "Telegram", en: "Telegram" }, icon: "/icons/social/telegram.png" },
  { key: "vkVideo", label: "VK", title: "VK Video", caption: { ru: "VK Видео", en: "VK Video" }, icon: "/icons/social/vk-video.png" },
  { key: "vkCommunity", label: "VK", title: "VK Community", caption: { ru: "VK группа", en: "VK Group" }, icon: "/icons/social/vk-community.png" },
  { key: "youtube", label: "YT", title: "YouTube", caption: { ru: "YouTube", en: "YouTube" }, icon: "/icons/social/youtube.png" },
  { key: "twitch", label: "TW", title: "Twitch", caption: { ru: "Twitch", en: "Twitch" }, icon: "/icons/social/twitch.png" }
] as const;

const statusText: Record<Language, { open: string; soon: string }> = {
  ru: { open: "Открыть", soon: "Скоро" },
  en: { open: "Open", soon: "Soon" }
};

function CommunityIcon({ icon, label, title }: { icon: string; label: string; title: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <span className="relative z-10 text-[10px] font-black tracking-[0.08em] text-relic">{label}</span>;
  }

  return (
    // A plain image keeps local public assets visible even before Next optimizes them.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={icon}
      alt={title}
      className="relative z-10 h-8 w-8 object-contain brightness-125 contrast-110 saturate-125 drop-shadow-[0_0_12px_rgba(231,193,106,0.45)] transition duration-200 group-hover:scale-110 group-hover:brightness-150"
      onError={() => setFailed(true)}
    />
  );
}

export function HomeCommunityLinks() {
  const [links, setLinks] = useState<SocialLinks>({});
  const { language } = useLanguage();

  useEffect(() => {
    return onSnapshot(
      doc(db, collections.siteSettings, "socialLinks"),
      (snapshot) => setLinks((snapshot.data() as SocialLinks | undefined) ?? {}),
      () => setLinks({})
    );
  }, []);

  return (
    <div className="relative z-20 mt-5 grid grid-cols-2 gap-3">
      {communityLinks.map((item, index) => {
        const href = links[item.key];
        const className =
          `group relative z-20 flex min-h-14 items-center gap-3 overflow-hidden rounded-[16px] border border-relic/32 bg-[#07101b]/92 px-3 shadow-[inset_0_0_16px_rgba(231,193,106,0.08),0_0_24px_rgba(0,0,0,0.4)] transition duration-200 hover:-translate-y-0.5 hover:border-relic/80 hover:bg-[#0d1826] hover:shadow-[inset_0_0_18px_rgba(231,193,106,0.16),0_0_22px_rgba(231,193,106,0.22)] ${
            index === communityLinks.length - 1 ? "col-span-2" : ""
          }`;
        const content = (
          <>
            <span className="relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-[13px] border border-relic/32 bg-black/45">
              <CommunityIcon icon={item.icon} label={item.label} title={item.title} />
            </span>
            <span className="relative z-10 min-w-0">
              <span className="block truncate text-[11px] font-black uppercase tracking-[0.08em] text-zinc-100">{item.caption[language]}</span>
              <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.12em] text-relic/70">
                {href ? statusText[language].open : statusText[language].soon}
              </span>
            </span>
          </>
        );

        if (!href) {
          return (
            <span key={item.key} title={item.title} className={`${className} opacity-70`}>
              <span className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_20%,rgba(231,193,106,0.22),transparent_56%),linear-gradient(135deg,rgba(255,255,255,0.08),transparent_48%)] opacity-80" />
              {content}
            </span>
          );
        }

        return (
          <Link key={item.key} href={href} target="_blank" rel="noreferrer" title={item.title} className={className}>
            <span className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_20%,rgba(231,193,106,0.22),transparent_56%),linear-gradient(135deg,rgba(255,255,255,0.08),transparent_48%)] opacity-80 transition group-hover:opacity-100" />
            {content}
          </Link>
        );
      })}
    </div>
  );
}
