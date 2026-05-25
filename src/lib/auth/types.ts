export type UserRole = "user" | "admin" | "owner";

export type UserProfile = {
  uid: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  avatarPreset?: string;
  avatarFrame?: string;
  bpStatus?: "bronze" | "silver" | "gold" | "platinum";
  totalSpentRub?: number;
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
