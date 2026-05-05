/**
 * Cross-environment RFC 4122 v4 UUID generator.
 *
 * Why this exists:
 *   `crypto.randomUUID()` is restricted to **secure contexts** (HTTPS or localhost).
 *   When the app is served over plain HTTP from a LAN/internal IP
 *   (e.g. http://20.20.20.160:8080), `crypto.randomUUID` is `undefined` and
 *   any caller throws `TypeError`. This caused every Axios request to fail
 *   inside the request interceptor, leaving all data grids empty.
 *
 * Strategy (best-available, never throws):
 *   1. Native `crypto.randomUUID()` — fastest, available in secure contexts and Node ≥19.
 *   2. `crypto.getRandomValues()` + manual RFC 4122 v4 assembly — available in
 *      every modern browser regardless of secure context.
 *   3. `Math.random()` — last-resort fallback for ancient/sandboxed environments.
 *      Not cryptographically strong, but a correlation ID does not need to be.
 */

const HEX = '0123456789abcdef';

function bytesToUuidV4(bytes: Uint8Array): string {
  // Set version (4) and variant (RFC 4122) bits per spec.
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  let out = '';
  for (let i = 0; i < 16; i++) {
    const b = bytes[i];
    out += HEX[b >> 4] + HEX[b & 0x0f];
    if (i === 3 || i === 5 || i === 7 || i === 9) out += '-';
  }
  return out;
}

function fromMathRandom(): string {
  const bytes = new Uint8Array(16);
  for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
  return bytesToUuidV4(bytes);
}

export function generateCorrelationId(): string {
  const c: Crypto | undefined = typeof globalThis !== 'undefined' ? globalThis.crypto : undefined;

  if (c && typeof c.randomUUID === 'function') {
    try {
      return c.randomUUID();
    } catch {
      // Fall through to next strategy.
    }
  }

  if (c && typeof c.getRandomValues === 'function') {
    try {
      const bytes = new Uint8Array(16);
      c.getRandomValues(bytes);
      return bytesToUuidV4(bytes);
    } catch {
      // Fall through to Math.random fallback.
    }
  }

  return fromMathRandom();
}
