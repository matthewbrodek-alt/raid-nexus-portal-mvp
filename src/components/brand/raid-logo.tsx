type RaidLogoProps = {
  compact?: boolean;
  className?: string;
  imageClassName?: string;
};

export function RaidLogo({ compact = false, className = "", imageClassName = "" }: RaidLogoProps) {
  const imageSize = compact ? "h-14 sm:h-16" : "h-28 sm:h-32";

  return (
    <span className={`inline-flex max-w-full items-center justify-center leading-none ${className}`} aria-label="RAID Shadow Legends">
      <img
        src="/images/raid-shadow-legends-logo.png"
        alt="RAID Shadow Legends"
        className={`block w-auto max-w-full object-contain drop-shadow-[0_0_22px_rgba(216,168,71,0.2)] ${imageSize} ${imageClassName}`}
      />
    </span>
  );
}
