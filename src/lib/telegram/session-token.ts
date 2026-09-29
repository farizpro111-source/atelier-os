import { createHmac, timingSafeEqual } from "node:crypto";

const lifetime = 12 * 60 * 60;
export function signSession(userId: string, secret: string, now = Date.now()) {
  const payload = Buffer.from(JSON.stringify({ sub: userId, exp: Math.floor(now / 1000) + lifetime })).toString("base64url");
  const signature = createHmac("sha256", secret).update(`atelier-session-v1.${payload}`).digest("base64url");
  return `${payload}.${signature}`;
}
export function verifySession(token: string, secret: string, now = Date.now()): string | null {
  if (!secret || token.length > 1024) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payload, sig] = parts;
  const expected = createHmac("sha256", secret).update(`atelier-session-v1.${payload}`).digest("base64url");
  if (sig.length !== expected.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const value = JSON.parse(Buffer.from(payload, "base64url").toString());
    const seconds = Math.floor(now / 1000);
    return typeof value.sub === "string" && /^[\da-f-]{36}$/i.test(value.sub) && Number.isSafeInteger(value.exp) && value.exp > seconds && value.exp <= seconds + lifetime ? value.sub : null;
  } catch { return null; }
}
