import { createHmac, createSign, randomUUID } from "crypto";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { makeSocialEmailFallback, makeSocialUid, type SocialProfileSeed, type SocialProvider } from "@/lib/auth/social-providers";

const STATE_COOKIE = "bp_social_auth_state";
const RESULT_COOKIE = "bp_social_auth_result";
const COOKIE_MAX_AGE_SECONDS = 10 * 60;

type SocialAuthState = {
  createdAt: number;
  nonce: string;
  provider: SocialProvider;
  returnTo: string;
};

type SocialAuthResult = {
  customToken: string;
  profile: SocialProfileSeed;
  returnTo: string;
};

function base64Url(input: string | Buffer) {
  return Buffer.from(input).toString("base64url");
}

function getStateSecret() {
  const secret = process.env.SOCIAL_AUTH_STATE_SECRET || process.env.GAME_DATA_ENCRYPTION_KEY;

  if (!secret) {
    throw new Error("SOCIAL_AUTH_STATE_SECRET is not configured.");
  }

  return secret;
}

function signValue(value: string) {
  return createHmac("sha256", getStateSecret()).update(value).digest("base64url");
}

export function sealPayload<T>(payload: T) {
  const encoded = base64Url(JSON.stringify(payload));
  return `${encoded}.${signValue(encoded)}`;
}

export function openPayload<T>(sealed: string | undefined | null): T | null {
  if (!sealed) {
    return null;
  }

  const [encoded, signature] = sealed.split(".");

  if (!encoded || !signature || signValue(encoded) !== signature) {
    return null;
  }

  try {
    return JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as T;
  } catch {
    return null;
  }
}

export function getPortalOrigin(request: NextRequest) {
  return process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;
}

export function makeCallbackUrl(request: NextRequest, provider: SocialProvider, state: string) {
  const callbackUrl = new URL(`/api/auth/social/${provider}/callback`, getPortalOrigin(request));
  callbackUrl.searchParams.set("state", state);
  return callbackUrl.toString();
}

export function makeSocialState(request: NextRequest, provider: SocialProvider) {
  const rawReturnTo = request.nextUrl.searchParams.get("returnTo") || "/dashboard";
  const returnTo = rawReturnTo.startsWith("/") && !rawReturnTo.startsWith("//") ? rawReturnTo : "/dashboard";
  const state = sealPayload<SocialAuthState>({
    createdAt: Date.now(),
    nonce: randomUUID(),
    provider,
    returnTo
  });

  return { returnTo, state };
}

export function setStateCookie(response: NextResponse, state: string) {
  response.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    maxAge: COOKIE_MAX_AGE_SECONDS,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });
}

export function verifySocialState(request: NextRequest, provider: SocialProvider) {
  const state = request.nextUrl.searchParams.get("state");
  const cookieState = request.cookies.get(STATE_COOKIE)?.value;

  if (!state || !cookieState || state !== cookieState) {
    throw new Error("Invalid social auth state.");
  }

  const payload = openPayload<SocialAuthState>(state);

  if (!payload || payload.provider !== provider || Date.now() - payload.createdAt > COOKIE_MAX_AGE_SECONDS * 1000) {
    throw new Error("Expired social auth state.");
  }

  return payload;
}

export function clearStateCookie(response: NextResponse) {
  response.cookies.set(STATE_COOKIE, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });
}

export function setResultCookie(response: NextResponse, result: SocialAuthResult) {
  response.cookies.set(RESULT_COOKIE, sealPayload(result), {
    httpOnly: true,
    maxAge: COOKIE_MAX_AGE_SECONDS,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });
}

export function consumeResultCookie(request: NextRequest) {
  return openPayload<SocialAuthResult>(request.cookies.get(RESULT_COOKIE)?.value);
}

export function clearResultCookie(response: NextResponse) {
  response.cookies.set(RESULT_COOKIE, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });
}

function getServiceAccountEmail() {
  const email = process.env.FIREBASE_SERVICE_ACCOUNT_EMAIL;

  if (!email) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_EMAIL is not configured.");
  }

  return email;
}

function getServiceAccountPrivateKey() {
  const privateKey = process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!privateKey) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY is not configured.");
  }

  return privateKey;
}

export function createFirebaseCustomToken(profile: SocialProfileSeed) {
  const serviceAccountEmail = getServiceAccountEmail();
  const now = Math.floor(Date.now() / 1000);
  const uid = makeSocialUid(profile.provider, profile.providerUserId);
  const header = {
    alg: "RS256",
    typ: "JWT"
  };
  const payload = {
    aud: "https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit",
    claims: {
      provider: profile.provider,
      providerUserId: profile.providerUserId
    },
    exp: now + 60 * 60,
    iat: now,
    iss: serviceAccountEmail,
    sub: serviceAccountEmail,
    uid
  };
  const signingInput = `${base64Url(JSON.stringify(header))}.${base64Url(JSON.stringify(payload))}`;
  const signature = createSign("RSA-SHA256").update(signingInput).sign(getServiceAccountPrivateKey(), "base64url");

  return `${signingInput}.${signature}`;
}

export function normalizeSocialProfile(profile: SocialProfileSeed): SocialProfileSeed {
  return {
    ...profile,
    displayName: profile.displayName.trim() || `${profile.provider} player`,
    email: (profile.email || makeSocialEmailFallback(profile.provider, profile.providerUserId)).trim().toLowerCase()
  };
}

export function redirectWithSocialError(request: NextRequest, message: string) {
  const url = new URL("/login", getPortalOrigin(request));
  url.searchParams.set("socialError", message);
  return NextResponse.redirect(url);
}
