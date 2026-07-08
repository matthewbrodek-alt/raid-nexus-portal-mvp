import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { fetchSocialProfile } from "@/lib/auth/social-provider-handlers";
import {
  clearStateCookie,
  createFirebaseCustomToken,
  getPortalOrigin,
  normalizeSocialProfile,
  redirectWithSocialError,
  setResultCookie,
  verifySocialState
} from "@/lib/auth/server-social-auth";
import { isSocialProvider } from "@/lib/auth/social-providers";

export async function GET(request: NextRequest, context: { params: Promise<{ provider: string }> }) {
  const { provider } = await context.params;

  if (!isSocialProvider(provider)) {
    return redirectWithSocialError(request, "Unknown social provider.");
  }

  try {
    const state = verifySocialState(request, provider);
    const profile = normalizeSocialProfile(await fetchSocialProfile(request, provider));
    const customToken = createFirebaseCustomToken(profile);
    const finishUrl = new URL("/auth/social/finish", getPortalOrigin(request));
    const response = NextResponse.redirect(finishUrl);

    clearStateCookie(response);
    setResultCookie(response, {
      customToken,
      profile,
      returnTo: state.returnTo
    });

    return response;
  } catch (error) {
    const response = redirectWithSocialError(request, error instanceof Error ? error.message : "Social login failed.");
    clearStateCookie(response);
    return response;
  }
}
