export const socialProviders = ["telegram", "vk", "discord"] as const;

export type SocialProvider = (typeof socialProviders)[number];

export type SocialProfileSeed = {
  provider: SocialProvider;
  providerUserId: string;
  username?: string;
  email?: string;
  displayName: string;
  avatarUrl?: string;
};

export function isSocialProvider(value: string | undefined): value is SocialProvider {
  return value === "telegram" || value === "vk" || value === "discord";
}

export function getSocialProviderLabel(provider: SocialProvider) {
  if (provider === "telegram") {
    return "Telegram";
  }

  if (provider === "vk") {
    return "VK";
  }

  return "Discord";
}

export function makeSocialUid(provider: SocialProvider, providerUserId: string) {
  return `social_${provider}_${providerUserId}`.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 120);
}

export function makeSocialEmailFallback(provider: SocialProvider, providerUserId: string) {
  return `${provider}-${providerUserId}@social.bumpypay.local`.toLowerCase();
}
