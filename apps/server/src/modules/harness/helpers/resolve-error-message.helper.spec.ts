import { describe, expect, it } from 'vitest';

import { resolveErrorMessage } from './resolve-error-message.helper.js';

describe('resolveErrorMessage', () => {
  it('returns the message of a plain Error', () => {
    expect(resolveErrorMessage(new Error('boom'))).toBe('boom');
  });

  it('stringifies non-error values', () => {
    expect(resolveErrorMessage('oops')).toBe('oops');
    expect(resolveErrorMessage(42)).toBe('42');
    expect(resolveErrorMessage(undefined)).toBe('undefined');
    expect(resolveErrorMessage(null)).toBe('null');
  });

  it('extracts a plain-string JSON response body with status code', () => {
    const error = {
      statusCode: 429,
      responseBody: JSON.stringify('Monthly quota exceeded'),
    };
    expect(resolveErrorMessage(error)).toBe('429 — Monthly quota exceeded');
  });

  it('extracts a nested error.message from a JSON response body', () => {
    const error = {
      statusCode: 500,
      responseBody: JSON.stringify({ error: { message: 'model not found' } }),
    };
    expect(resolveErrorMessage(error)).toBe('500 — model not found');
  });

  it('extracts a top-level error string from a JSON response body', () => {
    const error = {
      statusCode: 400,
      responseBody: JSON.stringify({ error: 'bad request' }),
    };
    expect(resolveErrorMessage(error)).toBe('400 — bad request');
  });

  it('extracts a top-level message from a JSON response body', () => {
    const error = {
      statusCode: 503,
      responseBody: JSON.stringify({ message: 'service unavailable' }),
    };
    expect(resolveErrorMessage(error)).toBe('503 — service unavailable');
  });

  it('extracts a top-level detail from a JSON response body', () => {
    const error = {
      statusCode: 422,
      responseBody: JSON.stringify({ detail: 'invalid payload' }),
    };
    expect(resolveErrorMessage(error)).toBe('422 — invalid payload');
  });

  it('falls back to the raw body when it is not JSON', () => {
    const error = {
      statusCode: 500,
      responseBody: 'plain text body',
    };
    expect(resolveErrorMessage(error)).toBe('500 — plain text body');
  });

  it('falls back to the raw body when the JSON body yields no message', () => {
    const error = {
      statusCode: 500,
      responseBody: JSON.stringify({}),
      message: 'Internal Server Error',
    };
    expect(resolveErrorMessage(error)).toBe('500 — {}');
  });

  it('treats objects without a numeric statusCode as plain errors', () => {
    const error = {
      responseBody: JSON.stringify({ error: 'no status' }),
    };
    expect(resolveErrorMessage(error)).toBe('[object Object]');
  });

  it('treats objects without a string responseBody as plain errors', () => {
    const error = { statusCode: 500, responseBody: 42 };
    expect(resolveErrorMessage(error)).toBe('[object Object]');
  });
});
