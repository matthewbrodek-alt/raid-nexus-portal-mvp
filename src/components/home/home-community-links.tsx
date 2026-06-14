"use client";

import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
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

type HomeCommunityLinksProps = {
  variant?: "desktop" | "mobile";
};

const communityLinks = [
  { key: "telegram", title: "Telegram", icon: "/icons/social/telegram.png" },
  { key: "vkVideo", title: "VK Video", icon: "/icons/social/vk-video.png" },
  { key: "vkCommunity", title: "VK Community", icon: "/icons/social/vk-community.png" },
  { key: "youtube", title: "YouTube", icon: "/icons/social/youtube.png" },
  { key: "twitch", title: "Twitch", icon: "/icons/social/twitch.png" }
] as const;

function CommunityIcon({ icon, title, variant }: { icon: string; title: string; variant: "desktop" | "mobile" }) {
  return (
    // A plain image keeps local public assets visible even before Next optimizes them.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={icon}
      alt={title}
      className={`z-10 max-w-none rounded-[7px] brightness-110 contrast-105 saturate-125 transition duration-200 group-hover:scale-110 group-hover:brightness-125 ${
        variant === "mobile"
          ? "h-6 w-6 object-cover opacity-100 drop-shadow-none"
          : "h-6 w-6 object-cover opacity-95 drop-shadow-none"
      }`}
    />
  );
}

export function HomeCommunityLinks({ variant = "desktop" }: HomeCommunityLinksProps) {
  const [links, setLinks] = useState<SocialLinks>({});

  useEffect(() => {
    let active = true;

    getDoc(doc(db, collections.siteSettings, "socialLinks"))
      .then((snapshot) => {
        if (active) {
          setLinks((snapshot.data() as SocialLinks | undefined) ?? {});
        }
      })
      .catch(() => {
        if (active) {
          setLinks({});
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className={`relative z-20 ${variant === "mobile" ? "mt-4 flex flex-wrap items-center gap-4" : "mt-4 flex items-center gap-4"}`}>
      {communityLinks.map((item) => {
        const href = links[item.key];
        const className =
          `group relative z-20 min-h-0 overflow-hidden rounded-[9px] bg-transparent transition duration-200 hover:-translate-y-0.5 ${
            variant === "mobile"
              ? "grid h-8 w-8 place-items-center opacity-100 hover:scale-105"
              : "grid h-7 w-7 place-items-center opacity-95 hover:scale-105"
          }`;
        const icon = <CommunityIcon icon={item.icon} title={item.title} variant={variant} />;

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
