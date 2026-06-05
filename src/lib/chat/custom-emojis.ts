export type CustomChatEmoji = {
  id: string;
  label: string;
  code: string;
  url: string;
};

export type CustomEmojiTextPart = { type: "text"; value: string } | { type: "emoji"; emoji: CustomChatEmoji };

function slugifyEmojiCode(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9а-яё]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 28);
}

export function makeCustomEmojiCode(value: string) {
  const slug = slugifyEmojiCode(value) || "emoji";
  return `:${slug}:`;
}

export function normalizeCustomChatEmojis(items?: CustomChatEmoji[]) {
  return (Array.isArray(items) ? items : [])
    .map((item, index) => {
      const label = String(item?.label ?? "").trim().slice(0, 32);
      const url = String(item?.url ?? "").trim();
      const code = String(item?.code ?? makeCustomEmojiCode(label || item?.id || `emoji-${index}`)).trim();

      if (!label || !url || !code.startsWith(":") || !code.endsWith(":")) {
        return null;
      }

      return {
        id: String(item?.id ?? `${Date.now()}-${index}`),
        label,
        code,
        url
      };
    })
    .filter((item): item is CustomChatEmoji => Boolean(item))
    .slice(0, 24);
}

export function splitCustomEmojiText(text: string, emojis: CustomChatEmoji[]) {
  if (!text || emojis.length === 0) {
    return [{ type: "text", value: text }] satisfies CustomEmojiTextPart[];
  }

  const byCode = new Map(emojis.map((emoji) => [emoji.code, emoji]));
  const pattern = new RegExp(`(${emojis.map((emoji) => emoji.code.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "g");
  const parts: CustomEmojiTextPart[] = [];
  let cursor = 0;

  for (const match of text.matchAll(pattern)) {
    const index = match.index ?? 0;
    const value = match[0];

    if (index > cursor) {
      parts.push({ type: "text", value: text.slice(cursor, index) });
    }

    const emoji = byCode.get(value);
    if (emoji) {
      parts.push({ type: "emoji", emoji });
    } else {
      parts.push({ type: "text", value });
    }

    cursor = index + value.length;
  }

  if (cursor < text.length) {
    parts.push({ type: "text", value: text.slice(cursor) });
  }

  return parts.length ? parts : [{ type: "text", value: text }];
}
