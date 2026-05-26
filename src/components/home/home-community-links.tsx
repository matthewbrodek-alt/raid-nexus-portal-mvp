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
      className="relative z-10 h-[125%] w-[125%] max-w-none object-cover brightness-125 contrast-110 saturate-125 drop-shadow-[0_0_8px_rgba(231,193,106,0.28)] transition duration-200 group-hover:scale-105 group-hover:brightness-150"
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
          "group relative z-20 aspect-square min-h-0 scale-[0.88] overflow-hidden rounded-[12px] bg-transparent shadow-[0_0_14px_rgba(0,0,0,0.32)] transition duration-200 hover:-translate-y-0.5 hover:scale-95 hover:shadow-[0_0_18px_rgba(231,193,106,0.18)]";
        const icon = <CommunityIcon icon={item.icon} title={item.title} />;

        if (!href) {
          return (
            <span key={item.key} title={item.title} className={`${className} grid place-items-center opacity-100`}>
              {icon}
            </span>
          );
        }

        return (
          <Link key={item.key} href={href} target="_blank" rel="noreferrer" title={item.title} className={`${className} grid place-items-center`}>
            {icon}
          </Link>
        );
      })}
    </div>
  );
}
