import { HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  MediaUrlValidatorService,
  type MediaValidationResult,
} from './media-url-validator.service.js';

describe('MediaUrlValidatorService', () => {
  let service: MediaUrlValidatorService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediaUrlValidatorService,
        {
          provide: HttpService,
          useValue: {
            head: vi.fn(),
            get: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MediaUrlValidatorService>(MediaUrlValidatorService);
    httpService = module.get<HttpService>(HttpService);
  });

  function headResponse(status: number, contentType?: string) {
    return of({
      status,
      statusText: 'OK',
      headers: contentType ? { 'content-type': contentType } : {},
      data: undefined,
      config: {},
    }) as never;
  }

  it('marks a working image URL as image', async () => {
    vi.mocked(httpService.head).mockReturnValue(
      headResponse(200, 'image/jpeg'),
    );

    const results = await service.validateUrls([
      'https://example.com/image.jpg',
    ]);

    expect(results[0]).toEqual<MediaValidationResult>({
      url: 'https://example.com/image.jpg',
      kind: 'image',
      status: 200,
      contentType: 'image/jpeg',
    });
  });

  it('marks a 404 as broken', async () => {
    vi.mocked(httpService.head).mockReturnValue(headResponse(404));

    const results = await service.validateUrls([
      'https://example.com/missing.jpg',
    ]);

    expect(results[0].kind).toBe('broken');
    expect(results[0].status).toBe(404);
  });

  function rangeResponse(
    status: number,
    headers: Record<string, string>,
    data?: Buffer,
  ) {
    return of({
      status,
      statusText: 'OK',
      headers,
      data,
      config: {},
    }) as never;
  }

  it('falls back to range GET when HEAD returns HTML', async () => {
    vi.mocked(httpService.head).mockReturnValue(
      headResponse(200, 'text/html; charset=utf-8'),
    );
    vi.mocked(httpService.get).mockReturnValue(
      rangeResponse(
        200,
        { 'content-type': 'image/png' },
        Buffer.from([0x89, 0x50, 0x4e, 0x47]),
      ),
    );

    const results = await service.validateUrls([
      'https://example.com/image.png',
    ]);

    expect(results[0]).toEqual<MediaValidationResult>({
      url: 'https://example.com/image.png',
      kind: 'image',
      status: 200,
      contentType: 'image/png',
    });
  });

  it('detects video by magic bytes when Content-Type is missing', async () => {
    vi.mocked(httpService.head).mockReturnValue(
      headResponse(405, 'text/html') as never,
    );
    vi.mocked(httpService.get).mockReturnValue(
      rangeResponse(
        206,
        {},
        Buffer.from([0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70]),
      ),
    );

    const results = await service.validateUrls([
      'https://example.com/video.mp4',
    ]);

    expect(results[0].kind).toBe('video');
  });

  it('detects WebP images by magic bytes', async () => {
    // RIFF....WEBP header
    const webp = Buffer.from([
      0x52, 0x49, 0x46, 0x46, 0x26, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
      0x56, 0x50, 0x38, 0x20,
    ]);
    vi.mocked(httpService.head).mockReturnValue(
      headResponse(405, 'text/html') as never,
    );
    vi.mocked(httpService.get).mockReturnValue(rangeResponse(206, {}, webp));

    const results = await service.validateUrls([
      'https://example.com/image.webp',
    ]);

    expect(results[0].kind).toBe('image');
  });

  it('does not classify generic RIFF containers as WebP', async () => {
    const riff = Buffer.from([
      0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00, 0x41, 0x56, 0x49, 0x20,
    ]);
    vi.mocked(httpService.head).mockImplementation(() => {
      throw new Error('timeout');
    });
    vi.mocked(httpService.get).mockReturnValue(rangeResponse(206, {}, riff));

    const results = await service.validateUrls([
      'https://example.com/video.avi',
    ]);

    expect(results[0].kind).toBe('unknown');
  });

  it('classifies HLS playlists as video', async () => {
    vi.mocked(httpService.head).mockReturnValue(
      headResponse(200, 'application/vnd.apple.mpegurl'),
    );

    const results = await service.validateUrls([
      'https://example.com/playlist.m3u8',
    ]);

    expect(results[0]).toEqual<MediaValidationResult>({
      url: 'https://example.com/playlist.m3u8',
      kind: 'video',
      status: 200,
      contentType: 'application/vnd.apple.mpegurl',
    });
  });

  it('treats embeddable video platform HTML as video', async () => {
    vi.mocked(httpService.head).mockReturnValue(headResponse(200, 'text/html'));
    vi.mocked(httpService.get).mockReturnValue(
      of({
        status: 200,
        statusText: 'OK',
        headers: {},
        data: { type: 'video', title: 'Example' },
        config: {},
      }) as never,
    );

    const results = await service.validateUrls([
      'https://www.youtube.com/watch?v=abc123',
    ]);

    expect(results[0].kind).toBe('video');
  });

  it('keeps an embeddable provider video when the page probe times out (oEmbed reachable)', async () => {
    // Page probes fail (timeout), but the provider oEmbed endpoint confirms
    // the video exists — it must not be dropped for an unreachable watch page.
    vi.mocked(httpService.head).mockImplementation(() => {
      throw new Error('timeout');
    });
    vi.mocked(httpService.get).mockReturnValue(
      of({
        status: 200,
        statusText: 'OK',
        headers: {},
        data: { type: 'video', title: 'Example' },
        config: {},
      }) as never,
    );

    const results = await service.validateUrls([
      'https://www.youtube.com/watch?v=abc123',
    ]);

    expect(results[0].kind).toBe('video');
  });

  it('keeps an embeddable provider video when oEmbed is unreachable too (network failure)', async () => {
    vi.mocked(httpService.head).mockImplementation(() => {
      throw new Error('timeout');
    });
    vi.mocked(httpService.get).mockImplementation(() => {
      throw new Error('timeout');
    });

    const results = await service.validateUrls([
      'https://www.youtube.com/watch?v=abc123',
    ]);

    // A vetted embeddable URL must not be dropped on a network failure.
    expect(results[0].kind).toBe('video');
  });

  it('still routes direct video files through the page probe', async () => {
    // Direct files have no oEmbed provider, so the content-type/status from
    // the probe is honored rather than a blanket keep.
    vi.mocked(httpService.head).mockReturnValue(headResponse(200, 'video/mp4'));

    const results = await service.validateUrls([
      'https://example.com/video.mp4',
    ]);

    expect(results[0]).toMatchObject({ kind: 'video', status: 200 });
  });

  it('marks broken YouTube oEmbed responses as broken', async () => {
    vi.mocked(httpService.head).mockReturnValue(headResponse(200, 'text/html'));
    vi.mocked(httpService.get).mockReturnValue(
      of({
        status: 404,
        statusText: 'Not Found',
        headers: {},
        data: 'Not Found',
        config: {},
      }) as never,
    );

    const results = await service.validateUrls([
      'https://www.youtube.com/watch?v=nonexistent12345',
    ]);

    expect(results[0].kind).toBe('broken');
    expect(results[0].status).toBe(404);
  });

  it('marks unauthorized YouTube oEmbed responses as broken', async () => {
    vi.mocked(httpService.head).mockReturnValue(headResponse(200, 'text/html'));
    vi.mocked(httpService.get).mockReturnValue(
      of({
        status: 401,
        statusText: 'Unauthorized',
        headers: {},
        data: 'Unauthorized',
        config: {},
      }) as never,
    );

    const results = await service.validateUrls([
      'https://www.youtube.com/watch?v=private12345',
    ]);

    expect(results[0].kind).toBe('broken');
    expect(results[0].status).toBe(401);
  });

  it('returns unknown when disabled', async () => {
    const results = await service.validateUrls(
      ['https://example.com/image.jpg'],
      { enabled: false },
    );

    expect(results[0]).toEqual<MediaValidationResult>({
      url: 'https://example.com/image.jpg',
      kind: 'unknown',
    });
    expect(httpService.head).not.toHaveBeenCalled();
  });

  it('returns unknown when all checks fail', async () => {
    vi.mocked(httpService.head).mockImplementation(() => {
      throw new Error('timeout');
    });
    vi.mocked(httpService.get).mockImplementation(() => {
      throw new Error('timeout');
    });

    const results = await service.validateUrls([
      'https://example.com/slow.jpg',
    ]);

    expect(results[0].kind).toBe('unknown');
    expect(results[0].error).toBe('timeout');
  });

  it('retries once when the first probe returns unknown with an error', async () => {
    vi.mocked(httpService.head)
      .mockImplementationOnce(() => {
        throw new Error('transient');
      })
      .mockImplementationOnce(() => headResponse(200, 'image/jpeg'));

    const results = await service.validateUrls([
      'https://example.com/flaky.jpg',
    ]);

    expect(results[0].kind).toBe('image');
    expect(httpService.head).toHaveBeenCalledTimes(2);
  });

  it('retries with a browser user agent after a 403', async () => {
    vi.mocked(httpService.head)
      .mockImplementationOnce(() => headResponse(403, 'text/html'))
      .mockImplementationOnce(() => headResponse(200, 'image/png'));

    const results = await service.validateUrls([
      'https://example.com/blocked.jpg',
    ]);

    expect(results[0].kind).toBe('image');
    expect(httpService.head).toHaveBeenCalledTimes(2);
  });

  it('marks a redirect to a private host as broken', async () => {
    vi.mocked(httpService.head).mockReturnValue(
      of({
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'image/jpeg' },
        data: undefined,
        config: {},
        request: { res: { responseUrl: 'http://192.168.1.1/steal.jpg' } },
      }) as never,
    );

    const results = await service.validateUrls([
      'https://example.com/redirect.jpg',
    ]);

    expect(results[0].kind).toBe('broken');
    expect(results[0].error).toBe('redirected to untrusted host');
  });

  it('marks a redirect to a non-http protocol as broken', async () => {
    vi.mocked(httpService.head).mockReturnValue(
      of({
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'image/jpeg' },
        data: undefined,
        config: {},
        request: { res: { responseUrl: 'file:///etc/passwd' } },
      }) as never,
    );

    const results = await service.validateUrls([
      'https://example.com/redirect2.jpg',
    ]);

    expect(results[0].kind).toBe('broken');
  });

  it('marks an empty response body as broken', async () => {
    vi.mocked(httpService.head).mockReturnValue(
      of({
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'image/jpeg', 'content-length': '0' },
        data: undefined,
        config: {},
      }) as never,
    );

    const results = await service.validateUrls([
      'https://example.com/empty.jpg',
    ]);

    expect(results[0].kind).toBe('broken');
    expect(results[0].error).toBe('empty response body');
  });

  it('validates URLs concurrently and returns results in order', async () => {
    vi.mocked(httpService.head).mockReturnValue(
      headResponse(200, 'image/jpeg'),
    );

    const urls = Array.from(
      { length: 7 },
      (_, i) => `https://example.com/img-${i}.jpg`,
    );
    const results = await service.validateUrls(urls, { concurrency: 3 });

    expect(results).toHaveLength(7);
    results.forEach((r, i) => {
      expect(r.url).toBe(urls[i]);
      expect(r.kind).toBe('image');
    });
  });

  it('serves repeated URLs from the cache', async () => {
    vi.mocked(httpService.head).mockReturnValue(
      headResponse(200, 'image/jpeg'),
    );

    const urls = ['https://example.com/cached.jpg'];
    const first = await service.validateUrls(urls);
    const second = await service.validateUrls(urls);

    expect(first[0].kind).toBe('image');
    expect(second[0].kind).toBe('image');
    expect(httpService.head).toHaveBeenCalledTimes(1);
  });

  it('returns unknown for an empty url list', async () => {
    const results = await service.validateUrls([]);
    expect(results).toEqual([]);
  });

  it('checks image dimensions when requested and rejects undersized images', async () => {
    // A tiny 1x1 PNG stream.
    const png = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      'base64',
    );
    const { EventEmitter } = await import('node:events');
    const stream = new EventEmitter() as unknown as {
      destroy: () => void;
      emit: (event: string, ...args: unknown[]) => boolean;
      on: (event: string, listener: (...args: unknown[]) => void) => unknown;
    };
    stream.destroy = vi.fn();
    process.nextTick(() => {
      stream.emit('data', png);
      stream.emit('end');
    });

    vi.mocked(httpService.head).mockReturnValue(headResponse(200, 'image/png'));
    vi.mocked(httpService.get).mockReturnValue(
      of({
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'image/png' },
        data: stream,
        config: {},
      }) as never,
    );

    const results = await service.validateUrls(
      ['https://example.com/tiny.png'],
      {
        checkImageDimensions: true,
        minWidth: 100,
        minHeight: 100,
      },
    );

    expect(results[0].kind).toBe('broken');
    expect(results[0].error).toContain('below 100x100');
  });

  it('accepts images that meet the dimension requirements', async () => {
    // A 1x1 PNG is below the floor, so use a generous floor to exercise the
    // accept path with the same fixture.
    const png = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      'base64',
    );
    const { EventEmitter } = await import('node:events');
    const stream = new EventEmitter() as unknown as {
      destroy: () => void;
      emit: (event: string, ...args: unknown[]) => boolean;
      on: (event: string, listener: (...args: unknown[]) => void) => unknown;
    };
    stream.destroy = vi.fn();
    process.nextTick(() => {
      stream.emit('data', png);
      stream.emit('end');
    });

    vi.mocked(httpService.head).mockReturnValue(headResponse(200, 'image/png'));
    vi.mocked(httpService.get).mockReturnValue(
      of({
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'image/png' },
        data: stream,
        config: {},
      }) as never,
    );

    const results = await service.validateUrls(
      ['https://example.com/tiny.png'],
      {
        checkImageDimensions: true,
        minWidth: 1,
        minHeight: 1,
      },
    );

    expect(results[0].kind).toBe('image');
  });

  it('rejects the image when dimensions cannot be determined', async () => {
    const { EventEmitter } = await import('node:events');
    const stream = new EventEmitter() as unknown as {
      destroy: () => void;
      emit: (event: string, ...args: unknown[]) => boolean;
      on: (event: string, listener: (...args: unknown[]) => void) => unknown;
    };
    stream.destroy = vi.fn();
    process.nextTick(() => {
      stream.emit('data', Buffer.from('not an image'));
      stream.emit('end');
    });

    vi.mocked(httpService.head).mockReturnValue(headResponse(200, 'image/png'));
    vi.mocked(httpService.get).mockReturnValue(
      of({
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'image/png' },
        data: stream,
        config: {},
      }) as never,
    );

    const results = await service.validateUrls(
      ['https://example.com/broken.png'],
      { checkImageDimensions: true, minWidth: 1, minHeight: 1 },
    );

    expect(results[0].kind).toBe('broken');
    expect(results[0].error).toBe('could not determine image dimensions');
  });

  it('rejects the image when the dimension stream errors', async () => {
    const { EventEmitter } = await import('node:events');
    const stream = new EventEmitter() as unknown as {
      destroy: () => void;
      emit: (event: string, ...args: unknown[]) => boolean;
      on: (event: string, listener: (...args: unknown[]) => void) => unknown;
    };
    stream.destroy = vi.fn();
    process.nextTick(() => {
      stream.emit('error', new Error('stream failed'));
    });

    vi.mocked(httpService.head).mockReturnValue(headResponse(200, 'image/png'));
    vi.mocked(httpService.get).mockReturnValue(
      of({
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'image/png' },
        data: stream,
        config: {},
      }) as never,
    );

    const results = await service.validateUrls(
      ['https://example.com/err.png'],
      { checkImageDimensions: true, minWidth: 1, minHeight: 1 },
    );

    expect(results[0].kind).toBe('broken');
    expect(results[0].error).toBe('could not determine image dimensions');
  });

  it('treats a 4xx dimension-check response as broken', async () => {
    const { EventEmitter } = await import('node:events');
    const stream = new EventEmitter() as unknown as {
      destroy: () => void;
      emit: (event: string, ...args: unknown[]) => boolean;
      on: (event: string, listener: (...args: unknown[]) => void) => unknown;
    };
    stream.destroy = vi.fn();

    vi.mocked(httpService.head).mockReturnValue(headResponse(200, 'image/png'));
    vi.mocked(httpService.get).mockReturnValue(
      of({
        status: 404,
        statusText: 'Not Found',
        headers: {},
        data: stream,
        config: {},
      }) as never,
    );

    const results = await service.validateUrls(
      ['https://example.com/gone.png'],
      { checkImageDimensions: true, minWidth: 1, minHeight: 1 },
    );

    expect(results[0].kind).toBe('broken');
    expect(results[0].status).toBe(404);
  });

  it('validates a vimeo oEmbed URL through the provider endpoint', async () => {
    vi.mocked(httpService.head).mockReturnValue(headResponse(200, 'text/html'));
    vi.mocked(httpService.get).mockReturnValue(
      of({
        status: 200,
        statusText: 'OK',
        headers: {},
        data: { type: 'video', title: 'Vimeo' },
        config: {},
      }) as never,
    );

    const results = await service.validateUrls(['https://vimeo.com/123456789']);

    expect(results[0].kind).toBe('video');
  });
});
