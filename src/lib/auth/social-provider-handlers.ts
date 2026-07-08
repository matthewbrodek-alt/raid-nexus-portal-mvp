import { createHash, createHmac } from "crypto";
import type { NextRequest } from "next/server";
import { getPortalOrigin, makeCallbackUrl } from "@/lib/auth/server-social-auth";
import type { SocialProfileSeed, SocialProvider } from "@/lib/auth/social-providers";

type ProviderAuthConfig = {
  authorizationUrl: string;
};

function requireEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not configured.`);
  }

  return value;
}

function safeName(parts: Array<string | undefined>) {
  return parts.filter(Boolean).join(" ").trim();
}

function makeStableCallbackUrl(request: NextRequest, provider: SocialProvider) {
  return new URL(`/api/auth/social/${provider}/callback`, getPortalOrigin(request)).toString();
}

export function buildProviderAuthorizationUrl(request: NextRequest, provider: SocialProvider, state: string): ProviderAuthConfig {
  const callbackUrl = provider === "telegram" ? makeCallbackUrl(request, provider, state) : makeStableCallbackUrl(request, provider);

  if (provider === "discord") {
    const url = new URL("https://discord.com/api/oauth2/authorize");
    url.searchParams.set("client_id", requireEnv("DISCORD_CLIENT_ID"));
    url.searchParams.set("redirect_uri", callbackUrl);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "identify email");
    url.searchParams.set("state", state);

    return { authorizationUrl: url.toString() };
  }

  if (provider === "vk") {
    const url = new URL("https://oauth.vk.com/authorize");
    url.searchParams.set("client_id", requireEnv("VK_CLIENT_ID"));
    url.searchParams.set("redirect_uri", callbackUrl);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "email");
    url.searchParams.set("state", state);
    url.searchParams.set("display", "page");
    url.searchParams.set("v", "5.199");

    return { authorizationUrl: url.toString() };
  }

  const botToken = requireEnv("TELEGRAM_BOT_TOKEN");
  const botId = botToken.split(":")[0];
  const url = new URL("https://oauth.telegram.org/auth");
  url.searchParams.set("bot_id", botId);
  url.searchParams.set("origin", new URL(callbackUrl).origin);
  url.searchParams.set("return_to", callbackUrl);
  url.searchParams.set("request_access", "write");

  return { authorizationUrl: url.toString() };
}

export async function fetchSocialProfile(request: NextRequest, provider: SocialProvider): Promise<SocialProfileSeed> {
  if (provider === "discord") {
    return fetchDiscordProfile(request);
  }

  if (provider === "vk") {
    return fetchVkProfile(request);
  }

  return fetchTelegramProfile(request);
}

async function fetchDiscordProfile(request: NextRequest): Promise<SocialProfileSeed> {
  const code = request.nextUrl.searchParams.get("code");

  if (!code) {
    throw new Error("Discord code is missing.");
  }

  const redirectUri = makeStableCallbackUrl(request, "discord");
  const body = new URLSearchParams({
    client_id: requireEnv("DISCORD_CLIENT_ID"),
    client_secret: requireEnv("DISCORD_CLIENT_SECRET"),
    code,
    grant_type: "authorization_code",
    redirect_uri: redirectUri
  });
  const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
    body,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    method: "POST"
  });

  if (!tokenResponse.ok) {
    throw new Error("Discord token exchange failed.");
  }

  const token = (await tokenResponse.json()) as { access_token?: string };

  if (!token.access_token) {
    throw new Error("Discord access token is missing.");
  }

  const userResponse = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${token.access_token}` }
  });

  if (!userResponse.ok) {
    throw new Error("Discord profile request failed.");
  }

  const user = (await userResponse.json()) as {
    avatar?: string | null;
    discriminator?: string;
    email?: string | null;
    global_name?: string | null;
    id: string;
    username?: string;
  };
  const avatarUrl = user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256` : undefined;

  return {
    provider: "discord",
    providerUserId: user.id,
    username: user.username,
    email: user.email || undefined,
    displayName: user.global_name || user.username || "Discord player",
    avatarUrl
  };
}

async function fetchVkProfile(request: NextRequest): Promise<SocialProfileSeed> {
  const code = request.nextUrl.searchParams.get("code");

  if (!code) {
    throw new Error("VK code is missing.");
  }

  const redirectUri = makeStableCallbackUrl(request, "vk");
  const tokenUrl = new URL("https://oauth.vk.com/access_token");
  tokenUrl.searchParams.set("client_id", requireEnv("VK_CLIENT_ID"));
  tokenUrl.searchParams.set("client_secret", requireEnv("VK_CLIENT_SECRET"));
  tokenUrl.searchParams.set("redirect_uri", redirectUri);
  tokenUrl.searchParams.set("code", code);

  const tokenResponse = await fetch(tokenUrl);

  if (!tokenResponse.ok) {
    throw new Error("VK token exchange failed.");
  }

  const token = (await tokenResponse.json()) as {
    access_token?: string;
    email?: string;
    user_id?: number;
  };

  if (!token.access_token || !token.user_id) {
    throw new Error("VK access token is missing.");
  }

  const userUrl = new URL("https://api.vk.com/method/users.get");
  userUrl.searchParams.set("access_token", token.access_token);
  userUrl.searchParams.set("fields", "photo_200,screen_name");
  userUrl.searchParams.set("user_ids", String(token.user_id));
  userUrl.searchParams.set("v", "5.199");
  const userResponse = await fetch(userUrl);

  if (!userResponse.ok) {
    throw new Error("VK profile request failed.");
  }

  const userPayload = (await userResponse.json()) as {
    response?: Array<{
      first_name?: string;
      id: number;
      last_name?: string;
      photo_200?: string;
      screen_name?: string;
    }>;
  };
  const user = userPayload.response?.[0];

  if (!user) {
    throw new Error("VK profile is missing.");
  }

  return {
    provider: "vk",
    providerUserId: String(user.id),
    username: user.screen_name,
    email: token.email,
    displayName: safeName([user.first_name, user.last_name]) || user.screen_name || "VK player",
    avatarUrl: user.photo_200
  };
}

function fetchTelegramProfile(request: NextRequest): SocialProfileSeed {
  const params = request.nextUrl.searchParams;
  const hash = params.get("hash");

  if (!hash) {
    throw new Error("Telegram hash is missing.");
  }

  const entries = Array.from(params.entries())
    .filter(([key]) => key !== "hash" && key !== "state")
    .sort(([a], [b]) => a.localeCompare(b));
  const dataCheckString = entries.map(([key, value]) => `${key}=${value}`).join("\n");
  const secretKey = createHash("sha256").update(requireEnv("TELEGRAM_BOT_TOKEN")).digest();
  const calculatedHash = createHmac("sha256", secretKey).update(dataCheckString).digest("hex");

  if (calculatedHash !== hash) {
    throw new Error("Telegram signature is invalid.");
  }

  const authDate = Number(params.get("auth_date") || "0");

  if (!authDate || Date.now() / 1000 - authDate > 60 * 60 * 24) {
    throw new Error("Telegram auth data is expired.");
  }

  const id = params.get("id");

  if (!id) {
    throw new Error("Telegram user id is missing.");
  }

  const firstName = params.get("first_name") || "";
  const lastName = params.get("last_name") || "";
  const username = params.get("username") || undefined;

  return {
    provider: "telegram",
    providerUserId: id,
    username,
    displayName: safeName([firstName, lastName]) || username || "Telegram player",
    avatarUrl: params.get("photo_url") || undefined
  };
}
