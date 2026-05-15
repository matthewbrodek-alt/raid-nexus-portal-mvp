type RaidLogoProps = {
  compact?: boolean;
  className?: string;
};

export function RaidLogo({ compact = false, className = "" }: RaidLogoProps) {
  return (
    <span className={`block leading-none ${className}`} aria-label="RAID Shadow Legends">
      <img
        src="/images/raid-shadow-legends-logo.png"
        alt="RAID Shadow Legends"
        className={`block w-auto object-contain drop-shadow-[0_0_18px_rgba(216,168,71,0.18)] ${compact ? "h-10" : "h-14 sm:h-16"}`}
      />
    </span>
  );
}
