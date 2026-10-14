export const STAFF_SESSION_COOKIE = '__staff_session';
export const STAFF_SESSION_TTL_MS = 24 * 60 * 60 * 1000;
const PBKDF2_ITERATIONS = 120000;

const b64 = (buf: ArrayBuffer) =>
  btoa(String.fromCharCode(...new Uint8Array(buf)));
const unb64 = (s: string) =>
  Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

export async function hashPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    key,
    256,
  );
  return { salt: b64(salt.buffer), hash: b64(bits), iter: PBKDF2_ITERATIONS };
}

export async function verifyPassword(
  password: string,
  rec: { salt: string; hash: string; iter: number },
): Promise<boolean> {
  try {
    const salt = unb64(rec.salt);
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      'PBKDF2',
      false,
      ['deriveBits'],
    );
    const bits = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt, iterations: rec.iter, hash: 'SHA-256' },
      key,
      256,
    );
    const a = new Uint8Array(bits);
    const b = unb64(rec.hash);
    if (a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
    return diff === 0;
  } catch {
    return false;
  }
}

export function parseSessionCookie(
  cookieHeader: string | null,
): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(';')) {
    const [k, ...rest] = part.trim().split('=');
    if (k === STAFF_SESSION_COOKIE) {
      const v = rest.join('=');
      if (/^[A-Za-z0-9_-]{16,128}$/.test(v)) return v;
    }
  }
  return null;
}

export function sessionCookie(token: string | null, maxAgeSec: number) {
  const value = token ?? '';
  return `${STAFF_SESSION_COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${token ? maxAgeSec : 0}`;
}
