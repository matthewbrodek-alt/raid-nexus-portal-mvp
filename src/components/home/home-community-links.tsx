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
  { key: "telegram", title: "Telegram", icon: "/icons/social/telegram.png" },
  { key: "vkVideo", title: "VK Video", icon: "/icons/social/vk-video.png" },
  { key: "vkCommunity", title: "VK Community", icon: "/icons/social/vk-community.png" },
  { key: "youtube", title: "YouTube", icon: "/icons/social/youtube.png" },
  { key: "twitch", title: "Twitch", icon: "/icons/social/twitch.png" }
] as const;

function CommunityIcon({ icon, title }: { icon: string; title: string }) {
  return (
    // A plain image keeps local public assets visible even before Next optimizes them.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={icon}
      alt={title}
      className="relative z-10 h-[94%] w-[94%] object-contain brightness-125 contrast-110 saturate-125 drop-shadow-[0_0_10px_rgba(231,193,106,0.35)] transition duration-200 group-hover:scale-105 group-hover:brightness-150"
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
    <div className="relative z-20 mt-5 grid grid-cols-5 gap-2">
      {communityLinks.map((item) => {
        const href = links[item.key];
        const className =
          "group relative z-20 aspect-square min-h-0 scale-[0.92] overflow-hidden rounded-[13px] bg-[#07101b]/80 shadow-[inset_0_0_10px_rgba(231,193,106,0.06),0_0_16px_rgba(0,0,0,0.36)] transition duration-200 hover:-translate-y-0.5 hover:scale-100 hover:bg-[#0d1826] hover:shadow-[inset_0_0_14px_rgba(231,193,106,0.12),0_0_18px_rgba(231,193,106,0.18)]";
        const icon = <CommunityIcon icon={item.icon} title={item.title} />;

        if (!href) {
          return (
            <span key={item.key} title={item.title} className={`${className} grid place-items-center opacity-100`}>
              <span className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_20%,rgba(231,193,106,0.12),transparent_58%)] opacity-70" />
              {icon}
            </span>
          );
        }

        return (
          <Link key={item.key} href={href} target="_blank" rel="noreferrer" title={item.title} className={`${className} grid place-items-center`}>
            <span className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_20%,rgba(231,193,106,0.12),transparent_58%)] opacity-70 transition group-hover:opacity-100" />
            {icon}
          </Link>
        );
      })}
    </div>
  );
}
