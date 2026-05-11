export type UserRole = "user" | "admin" | "owner";

export type UserProfile = {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  status: "active" | "blocked" | "pending";
  createdAt?: unknown;
  updatedAt?: unknown;
};
