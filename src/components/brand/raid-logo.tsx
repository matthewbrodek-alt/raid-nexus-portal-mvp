type RaidLogoProps = {
  compact?: boolean;
  className?: string;
};

export function RaidLogo({ compact = false, className = "" }: RaidLogoProps) {
  return (
    <span className={`block max-w-full leading-none ${className}`} aria-label="RAID Shadow Legends">
      <img
        src="/images/raid-shadow-legends-logo.png"
        alt="RAID Shadow Legends"
        className={`block max-w-full w-auto object-contain drop-shadow-[0_0_22px_rgba(216,168,71,0.2)] ${compact ? "h-16" : "h-24 sm:h-28"}`}
      />
    </span>
  );
}
