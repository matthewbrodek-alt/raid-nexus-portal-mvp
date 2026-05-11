export type UserRole = "user" | "admin" | "owner";

export type UserProfile = {
  uid: string;
  email: string;
  displayName: string;
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
