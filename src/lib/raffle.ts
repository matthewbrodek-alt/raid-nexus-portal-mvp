export const RAFFLE_DAYS = [7, 14, 21, 28] as const;
export const RAFFLE_PRIZE = "5 рубиновых подписок";

export type RaffleInfo = {
  date: Date;
  drawKey: string;
  title: string;
};

function makeDrawDate(year: number, month: number, day: number) {
  const date = new Date(year, month, day, 20, 0, 0, 0);
  return date.getMonth() === month ? date : null;
}

export function getNextRaffleInfo(now = new Date()): RaffleInfo {
  for (let monthOffset = 0; monthOffset < 3; monthOffset += 1) {
    const base = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);

    for (const day of RAFFLE_DAYS) {
      const date = makeDrawDate(base.getFullYear(), base.getMonth(), day);

      if (date && date.getTime() > now.getTime()) {
        const drawKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

        return {
          date,
          drawKey,
          title: `Розыгрыш ${drawKey}`
        };
      }
    }
  }

  const fallback = new Date(now.getFullYear(), now.getMonth() + 1, 7, 20, 0, 0, 0);
  const drawKey = `${fallback.getFullYear()}-${String(fallback.getMonth() + 1).padStart(2, "0")}-${String(fallback.getDate()).padStart(2, "0")}`;

  return {
    date: fallback,
    drawKey,
    title: `Розыгрыш ${drawKey}`
  };
}

export function getRaffleTimeLeft(deadline: Date, now = new Date()) {
  const diff = Math.max(0, deadline.getTime() - now.getTime());
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1000);

  return {
    days,
    hours,
    minutes,
    seconds,
    compact: `${days}д ${hours}ч ${minutes}м`,
    digital: `${String(days).padStart(2, "0")}:${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
  };
}
