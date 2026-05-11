export function normalizeEmail(email: string | null | undefined) {
  return (email ?? "").trim().toLowerCase();
}

export function emailToDocId(email: string) {
  return normalizeEmail(email).replaceAll("/", "_");
}

export function isBootstrapOwner(email: string | null | undefined) {
  const bootstrapEmail = normalizeEmail(process.env.NEXT_PUBLIC_BOOTSTRAP_ADMIN_EMAIL);

  return Boolean(bootstrapEmail) && normalizeEmail(email) === bootstrapEmail;
}
