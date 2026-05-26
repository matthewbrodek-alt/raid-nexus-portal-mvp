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
  if (!id) {
    return;
  }

  const current = readNotificationSeenState(uid);

  writeNotificationSeenState(uid, {
    ...current,
    [bucket]: {
      ...(current[bucket] ?? {}),
      [id]: value || 1
    }
  });
}
