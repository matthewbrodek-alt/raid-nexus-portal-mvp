import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { buildProviderAuthorizationUrl } from "@/lib/auth/social-provider-handlers";
import { makeSocialState, redirectWithSocialError, setStateCookie } from "@/lib/auth/server-social-auth";
import { isSocialProvider } from "@/lib/auth/social-providers";

export async function GET(request: NextRequest, context: { params: Promise<{ provider: string }> }) {
  const { provider } = await context.params;

  if (!isSocialProvider(provider)) {
    return redirectWithSocialError(request, "Unknown social provider.");
  }

  try {
    const { state } = makeSocialState(request, provider);
    const { authorizationUrl } = buildProviderAuthorizationUrl(request, provider, state);
    const response = NextResponse.redirect(authorizationUrl);

    setStateCookie(response, state);

    return response;
  } catch (error) {
    return redirectWithSocialError(request, error instanceof Error ? error.message : "Social login is not configured.");
  }
}
