import { describe, expect, it, vi } from 'vitest';

import { OllamaOverridesService } from './ollama-overrides.service.js';

function makeService() {
  const ollamaCfg = {
    config: { host: 'http://127.0.0.1:11434/api', apiKey: 'env-key' },
  };
  const repository = {
    findAll: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockResolvedValue(undefined),
    deleteByProvider: vi.fn().mockResolvedValue(undefined),
  };
  const cipher = {
    decrypt: vi.fn().mockImplementation((v: string) => v),
    encrypt: vi.fn().mockImplementation((v: string) => `enc:${v}`),
    needsReEncryption: vi.fn().mockReturnValue(false),
  };
  const service = new OllamaOverridesService(
    ollamaCfg as never,
    repository as never,
    cipher as never,
  );
  return { service, ollamaCfg, repository, cipher };
}

describe('OllamaOverridesService', () => {
  it('falls back to the env config when nothing is persisted', async () => {
    const { service } = makeService();
    await service.onApplicationBootstrap();

    expect(service.getConfig()).toEqual({
      host: 'http://127.0.0.1:11434/api',
      apiKey: 'env-key',
    });
  });

  it('restores persisted overrides and decrypts the api key', async () => {
    const { service, repository, cipher } = makeService();
    repository.findAll.mockResolvedValue([
      {
        provider: 'ollama',
        values: { host: 'http://ollama:11434', apiKey: 'encrypted-key' },
      },
    ]);

    await service.onApplicationBootstrap();

    expect(cipher.decrypt).toHaveBeenCalledWith('encrypted-key');
    expect(service.getConfig()).toEqual({
      host: 'http://ollama:11434',
      apiKey: 'encrypted-key',
    });
  });

  it('re-encrypts the api key when it was written with a retired key', async () => {
    const { service, repository, cipher } = makeService();
    repository.findAll.mockResolvedValue([
      {
        provider: 'ollama',
        values: { apiKey: 'old-encrypted' },
      },
    ]);
    cipher.needsReEncryption.mockReturnValue(true);

    await service.onApplicationBootstrap();

    expect(repository.upsert).toHaveBeenCalledWith(
      'ollama',
      expect.objectContaining({ apiKey: 'enc:old-encrypted' }),
    );
  });

  it('warns and stays in-memory when the boot restore fails', async () => {
    const { service, repository } = makeService();
    repository.findAll.mockRejectedValue(new Error('db down'));

    await service.onApplicationBootstrap();

    expect(service.getConfig().host).toBe('http://127.0.0.1:11434/api');
  }, 30_000);

  it('applies a live config update and persists it', async () => {
    const { service, repository, cipher } = makeService();

    service.updateConfig({
      host: 'http://ollama:11434/',
      apiKey: 'new-key',
    });

    expect(service.getConfig()).toEqual({
      host: 'http://ollama:11434',
      apiKey: 'new-key',
    });
    expect(repository.upsert).toHaveBeenCalledWith(
      'ollama',
      expect.objectContaining({
        host: 'http://ollama:11434',
        apiKey: 'enc:new-key',
      }),
    );
    expect(cipher.encrypt).toHaveBeenCalledWith('new-key');
  });

  it('ignores masked api keys in updates', async () => {
    const { service, repository } = makeService();

    service.updateConfig({ apiKey: '****************' });

    expect(service.getConfig().apiKey).toBe('env-key');
    expect(repository.upsert).not.toHaveBeenCalledWith(
      'ollama',
      expect.objectContaining({ apiKey: expect.any(String) }),
    );
  });

  it('clears the api key override on an empty value', async () => {
    const { service } = makeService();
    service.updateConfig({ apiKey: 'secret' });
    service.updateConfig({ apiKey: '' });

    expect(service.getConfig().apiKey).toBe('env-key');
  });

  it('resets all overrides back to the env defaults', async () => {
    const { service, repository } = makeService();
    service.updateConfig({ host: 'http://ollama:11434', apiKey: 'secret' });

    const config = service.resetConfig();

    expect(config.host).toBe('http://127.0.0.1:11434/api');
    expect(repository.deleteByProvider).toHaveBeenCalledWith('ollama');
  });

  it('masks the api key in the masked config', async () => {
    const { service } = makeService();
    service.updateConfig({ apiKey: 'super-secret-key' });

    const masked = service.getMaskedConfig();

    expect(masked.apiKey).not.toBe('super-secret-key');
    expect(masked.apiKey).toContain('*');
  });

  it('deletes the persisted row when overrides become empty', async () => {
    const { service, repository } = makeService();
    service.updateConfig({ apiKey: 'secret' });
    service.updateConfig({ apiKey: '' });

    expect(repository.deleteByProvider).toHaveBeenCalledWith('ollama');
  });
});
