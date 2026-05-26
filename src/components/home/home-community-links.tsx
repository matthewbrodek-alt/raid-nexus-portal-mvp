"use client";

import Image from "next/image";
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
    return <span className="text-[10px] font-black tracking-[0.08em] text-relic">{label}</span>;
  }

  return (
    <Image
      src={icon}
      alt={title}
      width={24}
      height={24}
      className="h-6 w-6 object-contain"
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
    <div className="mt-4 flex flex-wrap gap-3">
      {communityLinks.map((item) => {
        const href = links[item.key];
        const className =
          "group grid h-10 w-10 place-items-center rounded-full border border-relic/28 bg-black/35 shadow-[0_0_22px_rgba(200,154,61,0.1)] transition hover:-translate-y-0.5 hover:border-relic/60 hover:bg-relic/12";
        const icon = <CommunityIcon icon={item.icon} label={item.label} title={item.title} />;

        if (!href) {
          return (
            <span key={item.key} title={item.title} className={`${className} opacity-70`}>
              {icon}
            </span>
          );
        }

        return (
          <Link key={item.key} href={href} target="_blank" rel="noreferrer" title={item.title} className={className}>
            {icon}
          </Link>
        );
      })}
    </div>
  );
}
