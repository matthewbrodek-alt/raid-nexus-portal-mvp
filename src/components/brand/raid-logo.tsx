import Image from "next/image";

type RaidLogoProps = {
  compact?: boolean;
  className?: string;
  imageClassName?: string;
};

export function RaidLogo({ compact = false, className = "", imageClassName = "" }: RaidLogoProps) {
  const imageSize = compact ? "h-14 sm:h-16" : "h-28 sm:h-32";

  return (
    <span className={`inline-flex max-w-full items-center justify-center leading-none ${className}`} aria-label="RAID Shadow Legends">
      <Image
        src="/images/raid-shadow-legends-logo-optimized.png"
        alt="RAID Shadow Legends"
        width={512}
        height={341}
        sizes={compact ? "(max-width: 768px) 112px, 144px" : "(max-width: 768px) 180px, 220px"}
        priority={compact}
        className={`block w-auto max-w-full object-contain drop-shadow-[0_0_22px_rgba(47,124,255,0.2)] ${imageSize} ${imageClassName}`}
      />
    </span>
  );
}
