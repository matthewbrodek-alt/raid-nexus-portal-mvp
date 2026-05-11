import { createCipheriv, randomBytes } from "crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_PAYLOAD_BYTES = 4096;
const VALID_AES_KEY_LENGTHS = new Set([16, 24, 32]);

function readEncryptionKey() {
  const rawKey = process.env.GAME_DATA_ENCRYPTION_KEY;

  if (!rawKey) {
    return null;
  }

  const key = Buffer.from(rawKey, "base64");

  if (!VALID_AES_KEY_LENGTHS.has(key.length)) {
    throw new Error("GAME_DATA_ENCRYPTION_KEY must be a 128, 192, or 256-bit base64 key.");
  }

  return key;
}

export async function POST(request: Request) {
  const key = readEncryptionKey();

  if (!key) {
    return NextResponse.json({ encryptionStatus: "missing-server-key" });
  }

  const body = await request.json().catch(() => null);
  const payload = body?.payload;
  const encodedPayload = JSON.stringify(payload ?? {});

  if (Buffer.byteLength(encodedPayload, "utf8") > MAX_PAYLOAD_BYTES) {
    return NextResponse.json({ error: "Payload is too large." }, { status: 413 });
  }

  const iv = randomBytes(12);
  const cipher = createCipheriv(`aes-${key.length * 8}-gcm`, key, iv);
  const encrypted = Buffer.concat([cipher.update(encodedPayload, "utf8"), cipher.final(), cipher.getAuthTag()]);

  return NextResponse.json({
    algorithm: "AES-GCM",
    iv: iv.toString("base64"),
    ciphertext: encrypted.toString("base64")
  });
}
