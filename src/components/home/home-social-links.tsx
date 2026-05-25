"use client";

import Link from "next/link";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { db } from "@/lib/firebase/client";
import { collections } from "@/lib/firebase/collections";

type SocialLinks = {
  telegram?: string;
  vkVideo?: string;
  vkCommunity?: string;
  youtube?: string;
  twitch?: string;
};

const socialMeta = [
  { key: "telegram", label: "TG", title: "Telegram", className: "bg-[#229ED9]" },
  { key: "vkVideo", label: "VK", title: "VK Видео", className: "bg-[#2787F5]" },
  { key: "vkCommunity", label: "VK", title: "VK Сообщество", className: "bg-[#1D5D9F]" },
  { key: "youtube", label: "YT", title: "YouTube", className: "bg-[#FF0033]" },
  { key: "twitch", label: "TW", title: "Twitch", className: "bg-[#9146FF]" }
] as const;

export function HomeSocialLinks() {
  const [links, setLinks] = useState<SocialLinks>({});

  useEffect(() => {
    return onSnapshot(
      doc(db, collections.siteSettings, "socialLinks"),
      (snapshot) => setLinks((snapshot.data() as SocialLinks | undefined) ?? {}),
      () => setLinks({})
    );
  }, []);

  const visibleLinks = useMemo(
    () => socialMeta.map((item) => ({ ...item, href: links[item.key] })).filter((item) => Boolean(item.href)),
    [links]
  );

  if (!visibleLinks.length) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-30 flex flex-col gap-2 sm:bottom-6 sm:left-6">
      {visibleLinks.map((item) => (
        <Link
          key={item.key}
          href={item.href ?? "#"}
          target="_blank"
          rel="noreferrer"
          title={item.title}
          className={`grid h-10 w-10 place-items-center rounded-full border border-white/20 text-[11px] font-black text-white shadow-[0_10px_28px_rgba(0,0,0,0.45)] transition hover:-translate-y-0.5 ${item.className}`}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}
