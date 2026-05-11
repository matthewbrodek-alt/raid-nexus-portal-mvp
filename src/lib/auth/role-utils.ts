export function normalizeEmail(email: string | null | undefined) {
  return (email ?? "").trim().toLowerCase();
}

export function emailToDocId(email: string) {
  return normalizeEmail(email).replaceAll("/", "_");
}
