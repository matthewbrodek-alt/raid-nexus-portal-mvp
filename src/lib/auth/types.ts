export type UserRole = "user" | "admin" | "owner";
export type UserTheme = "dark" | "light";

export type UserProfile = {
  uid: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  avatarPreset?: string;
  avatarFrame?: string;
  avatarHiddenByAdmin?: boolean;
  nicknameStyle?:
    | "plain"
    | "violet"
    | "purple"
    | "fuchsia"
    | "blue"
    | "cyan"
    | "emerald"
    | "amber"
    | "orange"
    | "crimson"
    | "relic"
    | "ember"
    | "rgb";
  bpStatus?: "bronze" | "silver" | "gold" | "platinum";
  totalSpentRub?: number;
  referralCode?: string;
  referredByCode?: string;
  referredByUid?: string;
  bumpyCoinsBalance?: number;
  bumpyCoinsEarnedTotal?: number;
  bumpyCoinsSpentTotal?: number;
  notificationSeenState?: {
    threadById?: Record<string, number>;
    topupById?: Record<string, number>;
    offerById?: Record<string, number>;
  };
  notificationSeenUpdatedAt?: unknown;
  theme?: UserTheme;
  role: UserRole;
  status: "active" | "blocked" | "pending";
  activityStats?: {
    forumThreadsCount?: number;
    marketplaceViewsCount?: number;
    messagesCount?: number;
    topupRequestsCount?: number;
  };
  createdAt?: unknown;
  updatedAt?: unknown;
};
