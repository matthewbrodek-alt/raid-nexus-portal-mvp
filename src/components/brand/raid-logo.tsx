type RaidLogoProps = {
  compact?: boolean;
  className?: string;
  withBumpyPay?: boolean;
};

export function RaidLogo({ compact = false, className = "", withBumpyPay = false }: RaidLogoProps) {
  const imageSize = withBumpyPay ? (compact ? "h-11 sm:h-12" : "h-14 sm:h-16") : compact ? "h-16" : "h-24 sm:h-28";

  return (
    <span className={`inline-flex max-w-full items-center gap-1.5 leading-none ${className}`} aria-label="RAID Shadow Legends x BumpyPay">
      <img
        src="/images/raid-shadow-legends-logo.png"
        alt="RAID Shadow Legends"
        className={`block w-auto max-w-full object-contain drop-shadow-[0_0_22px_rgba(216,168,71,0.2)] ${imageSize}`}
      />
      {withBumpyPay ? (
        <span className="flex min-w-0 items-baseline gap-1.5 whitespace-nowrap">
          <span className="font-[var(--font-cinzel)] text-sm font-black uppercase tracking-[0.16em] text-relic/70 sm:text-base">x</span>
          <span className="bg-gradient-to-b from-[#fff3c4] via-[#e7c16a] to-[#a56a2a] bg-clip-text font-[var(--font-cinzel)] text-lg font-black uppercase tracking-[0.06em] text-transparent drop-shadow-[0_0_16px_rgba(216,168,71,0.28)] sm:text-xl">
            BumpyPay
          </span>
        </span>
      ) : null}
    </span>
  );
}
