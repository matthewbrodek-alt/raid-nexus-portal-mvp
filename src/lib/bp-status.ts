export type BpStatusId = "bronze" | "silver" | "gold" | "platinum";

export type OrderStageId = "new" | "payment" | "in_progress" | "completed" | "cancelled";

export const bpStatuses = [
  {
    id: "bronze",
    label: "Бронзовый пользователь BP",
    shortLabel: "Bronze BP",
    minTotalRub: 0,
    nextTotalRub: 100_000,
    frameClass: "border-[#a97142] shadow-[0_0_22px_rgba(169,113,66,0.22)]"
  },
  {
    id: "silver",
    label: "Серебряный пользователь BP",
    shortLabel: "Silver BP",
    minTotalRub: 100_000,
    nextTotalRub: 300_000,
    frameClass: "border-[#cfd8e3] shadow-[0_0_24px_rgba(207,216,227,0.26)]"
  },
  {
    id: "gold",
    label: "Золотой пользователь BP",
    shortLabel: "Gold BP",
    minTotalRub: 300_000,
    nextTotalRub: 777_777,
    frameClass: "border-[#e7c16a] shadow-[0_0_28px_rgba(231,193,106,0.34)]"
  },
  {
    id: "platinum",
    label: "Платиновый пользователь BP",
    shortLabel: "Platinum BP",
    minTotalRub: 777_777,
    nextTotalRub: null,
    frameClass: "border-[#9ee7ff] shadow-[0_0_32px_rgba(158,231,255,0.36)]"
  }
] as const;

export const orderStages = [
  {
    id: "new",
    label: "1 этап: создание заявки",
    clientLabel: "Заявка создана"
  },
  {
    id: "payment",
    label: "2 этап: оплата заказа",
    clientLabel: "Ожидается оплата"
  },
  {
    id: "in_progress",
    label: "3 этап: выполнение работы",
    clientLabel: "Заказ выполняется"
  },
  {
    id: "completed",
    label: "4 этап: заявка выполнена",
    clientLabel: "Заявка выполнена"
  },
  {
    id: "cancelled",
    label: "Отменено",
    clientLabel: "Заявка отменена"
  }
] as const;

export function getBpStatus(totalRub: number) {
  return [...bpStatuses].reverse().find((status) => totalRub >= status.minTotalRub) ?? bpStatuses[0];
}

export function getBpProgress(totalRub: number) {
  const status = getBpStatus(totalRub);

  if (!status.nextTotalRub) {
    return {
      status,
      progressPercent: 100,
      remainingRub: 0,
      nextTotalRub: null
    };
  }

  const range = status.nextTotalRub - status.minTotalRub;
  const progress = Math.max(0, Math.min(1, (totalRub - status.minTotalRub) / range));

  return {
    status,
    progressPercent: Math.round(progress * 100),
    remainingRub: Math.max(0, status.nextTotalRub - totalRub),
    nextTotalRub: status.nextTotalRub
  };
}

export function normalizeOrderStage(status?: string): OrderStageId {
  const normalized = (status ?? "new").toLowerCase();

  if (["done", "paid", "closed", "processed", "complete", "completed"].includes(normalized)) {
    return "completed";
  }

  if (["payment", "waitingpayment", "waiting_payment", "invoice", "payment_pending"].includes(normalized)) {
    return "payment";
  }

  if (["progress", "in_progress", "work", "working"].includes(normalized)) {
    return "in_progress";
  }

  if (["cancelled", "canceled"].includes(normalized)) {
    return "cancelled";
  }

  return "new";
}

export function getOrderStage(status?: string) {
  const stage = normalizeOrderStage(status);
  return orderStages.find((item) => item.id === stage) ?? orderStages[0];
}

export function isCompletedOrder(status?: string) {
  return normalizeOrderStage(status) === "completed";
}
