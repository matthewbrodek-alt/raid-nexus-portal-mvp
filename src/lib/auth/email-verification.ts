import { sendEmailVerification, type ActionCodeSettings, type User } from "firebase/auth";

const defaultPortalOrigin = "https://raid-nexus-portal-mvp.vercel.app";

function getPortalOrigin() {
  if (typeof window === "undefined") {
    return defaultPortalOrigin;
  }

  return window.location.origin || defaultPortalOrigin;
}

export function getPortalEmailVerificationSettings(): ActionCodeSettings {
  return {
    handleCodeInApp: false,
    url: `${getPortalOrigin()}/login?emailVerified=1`
  };
}

export function sendPortalEmailVerification(user: User) {
  return sendEmailVerification(user, getPortalEmailVerificationSettings());
}
