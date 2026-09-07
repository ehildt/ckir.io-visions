import { Logger } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SecretsCipherService } from './secrets-cipher.service.js';

const ACTIVE_KEY = 'a'.repeat(64); // 32 bytes hex
const PREVIOUS_KEY = 'b'.repeat(64);

function makeService(config: Record<string, unknown>) {
  return new SecretsCipherService({ config } as never);
}

describe('SecretsCipherService', () => {
  let service: SecretsCipherService;

  beforeEach(() => {
    service = makeService({ activeKey: ACTIVE_KEY });
  });

  it('is enabled when an active key is configured', () => {
    expect(service.isEnabled()).toBe(true);
  });

  it('is disabled when no active key is configured', () => {
    expect(makeService({ activeKey: undefined }).isEnabled()).toBe(false);
  });

  it('encrypts and decrypts a secret round-trip', () => {
    const payload = service.encrypt('sk-12345');

    expect(payload).toBeDefined();
    expect(service.decrypt(payload!)).toBe('sk-12345');
  });

  it('returns undefined when encrypting with the cipher disabled', () => {
    expect(
      makeService({ activeKey: undefined }).encrypt('sk-12345'),
    ).toBeUndefined();
  });

  it('returns undefined for empty plaintext', () => {
    expect(service.encrypt('')).toBeUndefined();
  });

  it('returns null when decrypting a malformed payload', () => {
    expect(service.decrypt('not-a-valid-payload')).toBeNull();
  });

  it('decrypts payloads written with the previous key after rotation', () => {
    const rotated = makeService({
      activeKey: ACTIVE_KEY,
      previousKey: PREVIOUS_KEY,
    });
    const payload = rotated.encrypt('legacy-secret');

    expect(rotated.decrypt(payload!)).toBe('legacy-secret');
  });

  it('reports needsReEncryption for payloads written with a retired key', () => {
    // Encrypt with the retired key as active, then check against a service
    // whose active key has rotated.
    const oldService = makeService({ activeKey: PREVIOUS_KEY });
    const payload = oldService.encrypt('legacy-secret');
    const rotated = makeService({
      activeKey: ACTIVE_KEY,
      previousKey: PREVIOUS_KEY,
    });

    expect(rotated.needsReEncryption(payload!)).toBe(true);
    // The previous key still decrypts it.
    expect(rotated.decrypt(payload!)).toBe('legacy-secret');
  });

  it('reports no re-encryption needed for active-key payloads', () => {
    const payload = service.encrypt('fresh-secret');

    expect(service.needsReEncryption(payload!)).toBe(false);
  });

  it('reports no re-encryption needed when the cipher is disabled', () => {
    expect(
      makeService({ activeKey: undefined }).needsReEncryption('v1.abc.def'),
    ).toBe(false);
  });

  it('exposes the active key fingerprint', () => {
    expect(service.activeFingerprint()).toMatch(/^[0-9a-f]+$/);
  });

  it('returns null for the active fingerprint when disabled', () => {
    expect(
      makeService({ activeKey: undefined }).activeFingerprint(),
    ).toBeNull();
  });

  it('warns when no active key is configured', () => {
    const warnSpy = vi
      .spyOn(Logger.prototype, 'warn')
      .mockImplementation(() => undefined);

    makeService({ activeKey: undefined });

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('TRIPLEF_SECRETS_KEY is not set'),
    );
    warnSpy.mockRestore();
  });
});
