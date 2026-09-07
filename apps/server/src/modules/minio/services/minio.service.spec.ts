import { Test, TestingModule } from '@nestjs/testing';
import { describe, expect, it, vi } from 'vitest';

import { MINIO_CONFIG } from '../constants/minio.constants.js';

import { MinioService } from './minio.service.js';

const mockConfig = {
  endpoint: 'localhost',
  port: 9000,
  useSsl: false,
  accessKey: 'access',
  secretKey: 'secret',
  bucket: 'test-bucket',
  ttlDays: 7,
};

describe('MinioService', () => {
  let service: MinioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MinioService,
        {
          provide: MINIO_CONFIG,
          useValue: mockConfig,
        },
      ],
    }).compile();

    service = module.get<MinioService>(MinioService);
    // Avoid real network calls by mocking after construction but before init.
    (service as any)._client = {
      bucketExists: vi.fn().mockResolvedValue(true),
      setBucketLifecycle: vi.fn().mockResolvedValue(undefined),
      putObject: vi.fn().mockResolvedValue(undefined),
      statObject: vi.fn().mockRejectedValue(new Error('not found')),
      getObject: vi.fn().mockRejectedValue(new Error('not found')),
      listObjectsV2: vi.fn().mockReturnValue([]),
      removeObjects: vi.fn().mockResolvedValue(undefined),
      removeObject: vi.fn().mockResolvedValue(undefined),
    };
    await service.onModuleInit();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('applies bucket lifecycle on init', () => {
    expect(service.client.setBucketLifecycle).toHaveBeenCalledWith(
      'test-bucket',
      expect.objectContaining({
        Rule: expect.arrayContaining([
          expect.objectContaining({
            ID: 'expire-job-buffers-7d',
            Status: 'Enabled',
            Filter: { Prefix: 'images/' },
            Expiration: { Days: 7 },
          }),
        ]),
      }),
    );
  });

  it('uploads buffers with content-type metadata', async () => {
    await service.uploadBuffers(
      'sess-1',
      'conv-1',
      'req-1',
      [Buffer.from('img')],
      [{ name: 'a.png', type: 'image/png', hash: 'h' }],
    );

    expect(service.client.putObject).toHaveBeenCalledWith(
      'test-bucket',
      'images/sess-1/conv-1/h.bin',
      Buffer.from('img'),
      3,
      expect.objectContaining({ 'Content-Type': 'image/png' }),
    );
  });

  it('skips upload when object already exists for session, conversation and hash', async () => {
    service.client.statObject = vi.fn().mockResolvedValue({});

    await service.uploadBuffers(
      'sess-1',
      'conv-1',
      'req-1',
      [Buffer.from('img')],
      [{ name: 'a.png', type: 'image/png', hash: 'h' }],
    );

    expect(service.client.putObject).not.toHaveBeenCalled();
  });

  it('builds storage URLs', async () => {
    service.client.statObject = vi.fn().mockResolvedValue({});

    const url = await service.getObjectUrl('sess-1', 'conv-1', 'h');

    expect(url).toBe('/api/v1/storage/sess-1/conv-1/h');
  });

  it('returns null when object does not exist', async () => {
    service.client.statObject = vi
      .fn()
      .mockRejectedValue(new Error('not found'));

    const url = await service.getObjectUrl('sess-1', 'conv-1', 'h');

    expect(url).toBeNull();
  });

  it('checks object existence', async () => {
    service.client.statObject = vi.fn().mockResolvedValue({});

    const exists = await service.objectExists('sess-1', 'conv-1', 'h');

    expect(exists).toBe(true);
  });

  it('reports object does not exist', async () => {
    service.client.statObject = vi
      .fn()
      .mockRejectedValue(new Error('not found'));

    const exists = await service.objectExists('sess-1', 'conv-1', 'h');

    expect(exists).toBe(false);
  });

  it('deletes a single object', async () => {
    await service.deleteObject('sess-1', 'conv-1', 'h');

    expect(service.client.removeObject).toHaveBeenCalledWith(
      'test-bucket',
      'images/sess-1/conv-1/h.bin',
    );
  });

  it('creates the bucket when it does not exist on init', async () => {
    service.client.bucketExists = vi.fn().mockResolvedValue(false);
    service.client.makeBucket = vi.fn().mockResolvedValue(undefined);

    await service.onModuleInit();

    expect(service.client.makeBucket).toHaveBeenCalledWith('test-bucket');
  });

  it('does not create the bucket when it already exists on init', async () => {
    service.client.bucketExists = vi.fn().mockResolvedValue(true);
    service.client.makeBucket = vi.fn().mockResolvedValue(undefined);

    await service.onModuleInit();

    expect(service.client.makeBucket).not.toHaveBeenCalled();
  });

  it('clears the client on destroy', () => {
    service.onModuleDestroy();
    expect((service as any)._client).toBeNull();
  });

  it('downloads a buffer by hash', async () => {
    const { Readable } = await import('node:stream');
    service.client.getObject = vi
      .fn()
      .mockResolvedValue(Readable.from([Buffer.from('data')]));

    const buffer = await service.downloadBuffer('sess-1', 'conv-1', 'h');

    expect(buffer?.toString()).toBe('data');
  });

  it('returns null when the object is missing (NoSuchKey)', async () => {
    service.client.getObject = vi
      .fn()
      .mockRejectedValue(
        Object.assign(new Error('missing'), { code: 'NoSuchKey' }),
      );

    const buffer = await service.downloadBuffer('sess-1', 'conv-1', 'h');

    expect(buffer).toBeNull();
  });

  it('rethrows non-missing errors from downloadBuffer', async () => {
    service.client.getObject = vi.fn().mockRejectedValue(new Error('boom'));

    await expect(
      service.downloadBuffer('sess-1', 'conv-1', 'h'),
    ).rejects.toThrow('boom');
  });

  it('downloads multiple buffers and keeps only the found ones', async () => {
    const { Readable } = await import('node:stream');
    service.client.getObject = vi
      .fn()
      .mockResolvedValueOnce(Readable.from([Buffer.from('a')]))
      .mockRejectedValueOnce(
        Object.assign(new Error('missing'), { code: 'NoSuchKey' }),
      );

    const result = await service.downloadBuffers('sess-1', 'conv-1', [
      { hash: 'h1', name: 'a.png', type: 'image/png' },
      { hash: 'h2', name: 'b.png', type: 'image/png' },
    ] as never);

    expect(result.buffers).toHaveLength(1);
    expect(result.buffers[0].toString()).toBe('a');
    expect(result.keptMeta).toHaveLength(1);
  });

  it('builds a file url without an existence check', () => {
    const url = service.buildFileUrl('sess-1', 'conv-1', 'h');
    expect(url).toBe('/api/v1/storage/sess-1/conv-1/h');
  });

  it('builds a file url with fallbacks for missing ids', () => {
    const url = service.buildFileUrl(undefined, undefined, 'h');
    expect(url).toBe('/api/v1/storage/unknown-session/unknown-conversation/h');
  });

  it('returns the object stream and metadata', async () => {
    const { Readable } = await import('node:stream');
    const stream = Readable.from([Buffer.from('x')]);
    service.client.statObject = vi.fn().mockResolvedValue({
      metaData: { 'Content-Type': 'image/png' },
    });
    service.client.getObject = vi.fn().mockResolvedValue(stream);

    const result = await service.getObjectStreamAndMeta(
      'sess-1',
      'conv-1',
      'h',
    );

    expect(result.stream).toBe(stream);
    expect(result.meta).toEqual({ 'Content-Type': 'image/png' });
  });

  it('deletes all objects matching a request id', async () => {
    const { Readable } = await import('node:stream');
    service.client.listObjectsV2 = vi
      .fn()
      .mockReturnValue(
        Readable.from([
          { name: 'images/sess-1/conv-1/h1.bin' },
          { name: 'images/sess-1/conv-1/h2.bin' },
        ]),
      );
    service.client.statObject = vi
      .fn()
      .mockImplementation((_bucket: string, name: string) =>
        Promise.resolve({
          metaData: {
            'X-Amz-Meta-Requestid': name.includes('h1') ? 'req-1' : 'req-2',
          },
        }),
      );

    await service.deleteBuffers('req-1');

    expect(service.client.removeObjects).toHaveBeenCalledWith('test-bucket', [
      'images/sess-1/conv-1/h1.bin',
    ]);
  });

  it('does not call removeObjects when nothing matches the request id', async () => {
    const { Readable } = await import('node:stream');
    service.client.listObjectsV2 = vi
      .fn()
      .mockReturnValue(
        Readable.from([{ name: 'images/sess-1/conv-1/h1.bin' }]),
      );
    service.client.statObject = vi.fn().mockResolvedValue({
      metaData: { 'X-Amz-Meta-Requestid': 'other' },
    });

    await service.deleteBuffers('req-1');

    expect(service.client.removeObjects).not.toHaveBeenCalled();
  });

  it('pings the bucket', async () => {
    await service.ping();
    expect(service.client.bucketExists).toHaveBeenCalledWith('test-bucket');
  });

  it('uploads with a fallback filename and content type when meta is missing', async () => {
    await service.uploadBuffers('sess-1', 'conv-1', 'req-1', [
      Buffer.from('img'),
    ]);

    expect(service.client.putObject).toHaveBeenCalledWith(
      'test-bucket',
      expect.stringContaining('.bin'),
      Buffer.from('img'),
      3,
      expect.objectContaining({
        'Content-Type': 'application/octet-stream',
        'X-Amz-Meta-Filename': 'image-1',
      }),
    );
  });

  it('sanitizes unicode and whitespace in the stored filename', async () => {
    await service.uploadBuffers(
      'sess-1',
      'conv-1',
      'req-1',
      [Buffer.from('img')],
      [{ name: 'my image ü.png', type: 'image/png', hash: 'h' }],
    );

    expect(service.client.putObject).toHaveBeenCalledWith(
      'test-bucket',
      'images/sess-1/conv-1/h.bin',
      Buffer.from('img'),
      3,
      expect.objectContaining({ 'X-Amz-Meta-Filename': 'my-image--.png' }),
    );
  });
});
