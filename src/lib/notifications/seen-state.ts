import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { collections } from "@/lib/firebase/collections";

export type NotificationSeenBucket = "threadById" | "topupById" | "offerById";

export type NotificationSeenState = {
  threadById?: Record<string, number>;
  topupById?: Record<string, number>;
  offerById?: Record<string, number>;
};

export const notificationSeenStateEvent = "raid-notification-seen-state";
const seenBuckets: NotificationSeenBucket[] = ["threadById", "topupById", "offerById"];
const maxStoredItemsPerBucket = 180;

export function notificationSeenStorageKey(uid: string) {
  return `raid-notification-seen-${uid}`;
}

function pruneBucket(bucket?: Record<string, number>) {
  if (!bucket) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(bucket)
      .filter(([id, value]) => Boolean(id) && Number.isFinite(value))
      .sort(([, first], [, second]) => second - first)
      .slice(0, maxStoredItemsPerBucket)
  );
}

function normalizeNotificationSeenState(value: unknown): NotificationSeenState {
  const source = (value && typeof value === "object" ? value : {}) as NotificationSeenState;

  return {
    threadById: pruneBucket(source.threadById),
    topupById: pruneBucket(source.topupById),
    offerById: pruneBucket(source.offerById)
  };
}

function mergeNotificationSeenStates(first: NotificationSeenState, second: NotificationSeenState): NotificationSeenState {
  const next: NotificationSeenState = {};

  for (const bucket of seenBuckets) {
    const merged: Record<string, number> = { ...(first[bucket] ?? {}) };

    for (const [id, value] of Object.entries(second[bucket] ?? {})) {
      merged[id] = Math.max(merged[id] ?? 0, value || 1);
    }

    next[bucket] = pruneBucket(merged);
  }

  return next;
}

function canPersistRemote(uid: string) {
  return Boolean(uid && uid !== "guest" && typeof window !== "undefined");
}

export function readNotificationSeenState(uid: string): NotificationSeenState {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    return normalizeNotificationSeenState(JSON.parse(window.localStorage.getItem(notificationSeenStorageKey(uid)) ?? "{}"));
  } catch {
    return {};
  }
}

export function writeNotificationSeenState(uid: string, next: NotificationSeenState) {
  if (typeof window === "undefined") {
    return;
  }

  const normalizedNext = normalizeNotificationSeenState(next);

  window.localStorage.setItem(notificationSeenStorageKey(uid), JSON.stringify(normalizedNext));
  window.dispatchEvent(
    new CustomEvent(notificationSeenStateEvent, {
      detail: { uid, state: normalizedNext }
    })
  );
}

async function readRemoteNotificationSeenState(uid: string): Promise<NotificationSeenState> {
  if (!canPersistRemote(uid)) {
    return {};
  }

  try {
    const snapshot = await getDoc(doc(db, collections.users, uid));
    return normalizeNotificationSeenState(snapshot.data()?.notificationSeenState);
  } catch {
    return {};
  }
}

async function writeRemoteNotificationSeenState(uid: string, next: NotificationSeenState) {
  if (!canPersistRemote(uid)) {
    return;
  }

  try {
    await updateDoc(doc(db, collections.users, uid), {
      notificationSeenState: normalizeNotificationSeenState(next),
      notificationSeenUpdatedAt: serverTimestamp()
    });
  } catch {
    // Local state still keeps the UI correct if Firestore rules or connection block the sync.
  }
}

export async function hydrateNotificationSeenState(uid: string) {
  const localState = readNotificationSeenState(uid);
  const remoteState = await readRemoteNotificationSeenState(uid);
  const next = mergeNotificationSeenStates(localState, remoteState);

  writeNotificationSeenState(uid, next);

  if (JSON.stringify(next) !== JSON.stringify(remoteState)) {
    void writeRemoteNotificationSeenState(uid, next);
  }

  return next;
}

export function markNotificationSeen(uid: string, bucket: NotificationSeenBucket, id: string, value: number) {
  const current = readNotificationSeenState(uid);

  if (!id) {
    return current;
  }

  const currentValue = current[bucket]?.[id] ?? 0;
  const nextValue = Math.max(currentValue, value || 1);

  if (currentValue >= nextValue) {
    return current;
  }

  const next = {
    ...current,
    [bucket]: {
      ...(current[bucket] ?? {}),
      [id]: nextValue
    }
  };

  const normalizedNext = normalizeNotificationSeenState(next);
  writeNotificationSeenState(uid, normalizedNext);
  void writeRemoteNotificationSeenState(uid, normalizedNext);

  return normalizedNext;
}

export function isNotificationSeen(state: NotificationSeenState, bucket: NotificationSeenBucket, id: string, value: number) {
  if (!id) {
    return true;
  }

  return (state[bucket]?.[id] ?? 0) >= (value || 1);
}

export function markManyNotificationsSeen(
  uid: string,
  items: Array<{ bucket: NotificationSeenBucket; id: string; value: number }>
) {
  const current = readNotificationSeenState(uid);
  let hasChanges = false;
  const next: NotificationSeenState = {
    ...current,
    threadById: { ...(current.threadById ?? {}) },
    topupById: { ...(current.topupById ?? {}) },
    offerById: { ...(current.offerById ?? {}) }
  };

  for (const item of items) {
    if (!item.id) {
      continue;
    }

    const bucket = next[item.bucket] ?? {};
    const currentValue = bucket[item.id] ?? 0;
    const nextValue = Math.max(currentValue, item.value || 1);

    if (nextValue > currentValue) {
      hasChanges = true;
    }

    bucket[item.id] = nextValue;
    next[item.bucket] = bucket;
  }

  if (!hasChanges) {
    return current;
  }

  const normalizedNext = normalizeNotificationSeenState(next);
  writeNotificationSeenState(uid, normalizedNext);
  void writeRemoteNotificationSeenState(uid, normalizedNext);

  return normalizedNext;
}
