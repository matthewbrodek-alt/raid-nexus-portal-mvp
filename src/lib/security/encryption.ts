const encoder = new TextEncoder();
const decoder = new TextDecoder();

export async function importAesKey(rawBase64Key: string) {
  const raw = Uint8Array.from(atob(rawBase64Key), (char) => char.charCodeAt(0));

  return crypto.subtle.importKey("raw", raw, "AES-GCM", false, ["encrypt", "decrypt"]);
}

export async function encryptGameAccountData(payload: unknown, rawBase64Key: string) {
  const key = await importAesKey(rawBase64Key);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = encoder.encode(JSON.stringify(payload));
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoded);

  return {
    algorithm: "AES-GCM",
    iv: btoa(String.fromCharCode(...iv)),
    ciphertext: btoa(String.fromCharCode(...new Uint8Array(encrypted)))
  };
}

export async function decryptGameAccountData(
  encrypted: { iv: string; ciphertext: string },
  rawBase64Key: string
) {
  const key = await importAesKey(rawBase64Key);
  const iv = Uint8Array.from(atob(encrypted.iv), (char) => char.charCodeAt(0));
  const ciphertext = Uint8Array.from(atob(encrypted.ciphertext), (char) => char.charCodeAt(0));
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);

  return JSON.parse(decoder.decode(decrypted));
}
