"use client";

import Link from "next/link";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase/client";
import { collections } from "@/lib/firebase/collections";

type SocialLinks = {
  telegram?: string;
  vkVideo?: string;
  vkCommunity?: string;
  youtube?: string;
  twitch?: string;
};

const communityLinks = [
  { key: "telegram", label: "TG", title: "Telegram", icon: "/icons/social/telegram.png" },
  { key: "vkVideo", label: "VK", title: "VK Video", icon: "/icons/social/vk-video.png" },
  { key: "vkCommunity", label: "VK", title: "VK Community", icon: "/icons/social/vk-community.png" },
  { key: "youtube", label: "YT", title: "YouTube", icon: "/icons/social/youtube.png" },
  { key: "twitch", label: "TW", title: "Twitch", icon: "/icons/social/twitch.png" }
] as const;

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

  useEffect(() => {
    return onSnapshot(
      doc(db, collections.siteSettings, "socialLinks"),
      (snapshot) => setLinks((snapshot.data() as SocialLinks | undefined) ?? {}),
      () => setLinks({})
    );
  }, []);

  return (
    <div className="relative z-20 mt-5 flex flex-wrap gap-4">
      {communityLinks.map((item) => {
        const href = links[item.key];
        const className =
          "group relative z-20 grid h-12 w-12 place-items-center overflow-hidden rounded-[15px] border border-relic/42 bg-[#07101b]/92 shadow-[inset_0_0_16px_rgba(231,193,106,0.08),0_0_24px_rgba(0,0,0,0.45)] transition duration-200 hover:-translate-y-0.5 hover:border-relic/80 hover:bg-[#0d1826] hover:shadow-[inset_0_0_18px_rgba(231,193,106,0.16),0_0_22px_rgba(231,193,106,0.22)]";
        const icon = <CommunityIcon icon={item.icon} label={item.label} title={item.title} />;

        if (!href) {
          return (
            <span key={item.key} title={item.title} className={`${className} opacity-70`}>
              <span className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_20%,rgba(231,193,106,0.22),transparent_56%),linear-gradient(135deg,rgba(255,255,255,0.08),transparent_48%)] opacity-80" />
              {icon}
            </span>
          );
        }

        return (
          <Link key={item.key} href={href} target="_blank" rel="noreferrer" title={item.title} className={className}>
            <span className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_20%,rgba(231,193,106,0.22),transparent_56%),linear-gradient(135deg,rgba(255,255,255,0.08),transparent_48%)] opacity-80 transition group-hover:opacity-100" />
            {icon}
          </Link>
        );
      })}
    </div>
  );
}
