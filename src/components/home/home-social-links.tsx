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
  { key: "telegram", label: "TG", title: "Telegram", icon: "/icons/social/telegram.png", className: "bg-[#229ED9]" },
  { key: "vkVideo", label: "VK", title: "VK Видео", icon: "/icons/social/vk-video.png", className: "bg-[#2787F5]" },
  { key: "vkCommunity", label: "VK", title: "VK Сообщество", icon: "/icons/social/vk-community.png", className: "bg-[#1D5D9F]" },
  { key: "youtube", label: "YT", title: "YouTube", icon: "/icons/social/youtube.png", className: "bg-[#FF0033]" },
  { key: "twitch", label: "TW", title: "Twitch", icon: "/icons/social/twitch.png", className: "bg-[#9146FF]" }
] as const;

function SocialIcon({ icon, label, title }: { icon: string; label: string; title: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <span className="relative z-10">{label}</span>;
  }

  return <img src={icon} alt={title} className="relative z-10 h-6 w-6 object-contain" onError={() => setFailed(true)} />;
}

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
          className={`group relative grid h-10 w-10 place-items-center overflow-hidden rounded-full border border-white/20 text-[11px] font-black text-white shadow-[0_10px_28px_rgba(0,0,0,0.45)] transition hover:-translate-y-0.5 ${item.className}`}
        >
          <span className="absolute inset-0 bg-white opacity-0 transition group-hover:opacity-20" />
          <SocialIcon icon={item.icon} label={item.label} title={item.title} />
        </Link>
      ))}
    </div>
  );
}
