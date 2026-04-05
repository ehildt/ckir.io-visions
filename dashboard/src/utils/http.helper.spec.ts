import { describe, expect, it } from 'vitest';

import {
  buildFormData,
  buildHeaders,
  buildQueryParams,
  extractPrompt,
  fileToBase64,
} from './http.helper';

describe('buildHeaders', () => {
  it('builds headers with model and accept', () => {
    expect(buildHeaders('llama')).toEqual({
      'x-vision-llm': 'llama',
      accept: 'application/json',
    });
  });
});

describe('buildQueryParams', () => {
  it('builds params from refs', () => {
    const options = {
      requestId: { value: 'req-1' } as any,
      roomId: { value: 'room-a' } as any,
      stream: { value: true } as any,
      event: { value: 'vision' } as any,
      numCtx: { value: '4096' } as any,
    };
    const params = buildQueryParams(options);
    expect(params.get('requestId')).toBe('req-1');
    expect(params.get('roomId')).toBe('room-a');
    expect(params.get('stream')).toBe('true');
    expect(params.get('event')).toBe('vision');
    expect(params.get('numCtx')).toBe('4096');
  });

  it('omits roomId and numCtx when empty', () => {
    const options = {
      requestId: { value: 'req-2' } as any,
      roomId: { value: '' } as any,
      stream: { value: false } as any,
      event: { value: '' } as any,
      numCtx: { value: '' } as any,
    };
    const params = buildQueryParams(options);
    expect(params.has('roomId')).toBe(false);
    expect(params.get('stream')).toBe('false');
    expect(params.get('event')).toBe('vision');
    expect(params.has('numCtx')).toBe(false);
  });
});

describe('buildFormData', () => {
  it('appends files and extras', () => {
    const file = new File(['x'], 'test.png', { type: 'image/png' });
    const form = buildFormData([file], { task: 'ocr', prompt: 'read this' });
    expect(form.get('task')).toBe('ocr');
    expect(form.get('prompt')).toBe('read this');
    expect(form.get('images')).toBeInstanceOf(File);
  });

  it('works without extras', () => {
    const file = new File(['x'], 'a.jpg', { type: 'image/jpeg' });
    const form = buildFormData([file]);
    expect(form.get('task')).toBeNull();
    expect(form.get('images')).toBeInstanceOf(File);
  });
});

describe('fileToBase64', () => {
  it('converts a File to base64 with mimeType and name', async () => {
    const file = new File(['png bytes'], 'cat.png', { type: 'image/png' });
    const result = await fileToBase64(file);
    expect(result.name).toBe('cat.png');
    expect(result.mimeType).toBe('image/png');
    expect(result.data).toBe('cG5nIGJ5dGVz');
  });

  it('handles empty files', async () => {
    const file = new File([], 'empty.jpg', { type: 'image/jpeg' });
    const result = await fileToBase64(file);
    expect(result.name).toBe('empty.jpg');
    expect(result.mimeType).toBe('image/jpeg');
    expect(result.data).toBe('');
  });
});

describe('extractPrompt', () => {
  it('returns undefined for undefined formData', () => {
    expect(extractPrompt(undefined)).toBeUndefined();
  });

  it('extracts prompt field', () => {
    const fd = new FormData();
    fd.append('prompt', 'hello');
    expect(extractPrompt(fd)).toBe('hello');
  });

  it('extracts prompt from payload JSON', () => {
    const fd = new FormData();
    fd.append(
      'payload',
      JSON.stringify({ params: { arguments: { prompt: 'world' } } }),
    );
    expect(extractPrompt(fd)).toBe('"world"');
  });

  it('returns undefined when no prompt found', () => {
    const fd = new FormData();
    fd.append('other', 'val');
    expect(extractPrompt(fd)).toBeUndefined();
  });
});
