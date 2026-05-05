import { afterEach, describe, expect, it, vi } from 'vitest';
import { generateCorrelationId } from '../correlationId';

const UUID_V4_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe('generateCorrelationId', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('returns a valid RFC 4122 v4 UUID', () => {
    const id = generateCorrelationId();
    expect(id).toMatch(UUID_V4_RE);
  });

  it('produces unique values across many calls', () => {
    const set = new Set<string>();
    for (let i = 0; i < 1000; i++) set.add(generateCorrelationId());
    expect(set.size).toBe(1000);
  });

  it('falls back to getRandomValues when crypto.randomUUID is missing (non-secure context)', () => {
    const realCrypto = globalThis.crypto;
    vi.stubGlobal('crypto', {
      getRandomValues: realCrypto.getRandomValues.bind(realCrypto),
    } as Crypto);

    const id = generateCorrelationId();
    expect(id).toMatch(UUID_V4_RE);
  });

  it('falls back to Math.random when no crypto APIs are available', () => {
    vi.stubGlobal('crypto', undefined);

    const id = generateCorrelationId();
    expect(id).toMatch(UUID_V4_RE);
  });

  it('does not throw when crypto.randomUUID throws at runtime', () => {
    const realCrypto = globalThis.crypto;
    vi.stubGlobal('crypto', {
      randomUUID: () => {
        throw new TypeError('not allowed in this context');
      },
      getRandomValues: realCrypto.getRandomValues.bind(realCrypto),
    } as Crypto);

    expect(() => generateCorrelationId()).not.toThrow();
    expect(generateCorrelationId()).toMatch(UUID_V4_RE);
  });
});
