export type NotificationSeenBucket = "threadById" | "topupById" | "offerById";

export type NotificationSeenState = {
  threadById?: Record<string, number>;
  topupById?: Record<string, number>;
  offerById?: Record<string, number>;
};

export const notificationSeenStateEvent = "raid-notification-seen-state";

export function notificationSeenStorageKey(uid: string) {
  return `raid-notification-seen-${uid}`;
}

export function readNotificationSeenState(uid: string): NotificationSeenState {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    return JSON.parse(window.localStorage.getItem(notificationSeenStorageKey(uid)) ?? "{}") as NotificationSeenState;
  } catch {
    return {};
  }
}

export function writeNotificationSeenState(uid: string, next: NotificationSeenState) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(notificationSeenStorageKey(uid), JSON.stringify(next));
  window.dispatchEvent(
    new CustomEvent(notificationSeenStateEvent, {
      detail: { uid, state: next }
    })
  );
}

export function markNotificationSeen(uid: string, bucket: NotificationSeenBucket, id: string, value: number) {
  const current = readNotificationSeenState(uid);

  if (!id) {
    return current;
  }

  const nextValue = Math.max(current[bucket]?.[id] ?? 0, value || 1);
  const next = {
    ...current,
    [bucket]: {
      ...(current[bucket] ?? {}),
      [id]: nextValue
    }
  };

  writeNotificationSeenState(uid, next);
  return next;
}
