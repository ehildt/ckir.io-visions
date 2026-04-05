import { describe, expect, it } from 'vitest';

import { formatBody, formatJson } from './formatting.helper';

describe('formatBody', () => {
  it('returns empty string for falsy input', () => {
    expect(formatBody(undefined)).toBe('');
    expect(formatBody('')).toBe('');
  });

  it('formats an object as pretty JSON', () => {
    expect(formatBody({ a: 1 })).toBe(JSON.stringify({ a: 1 }, null, 2));
  });

  it('parses and pretty-prints a JSON string', () => {
    expect(formatBody('{"b":2}')).toBe(JSON.stringify({ b: 2 }, null, 2));
  });

  it('returns raw string when not valid JSON', () => {
    expect(formatBody('hello')).toBe('hello');
  });
});

describe('formatJson', () => {
  it('returns pretty JSON for null', () => {
    expect(formatJson(null)).toBe('null');
  });

  it('returns pretty JSON for primitives', () => {
    expect(formatJson(42)).toBe('42');
    expect(formatJson('hello')).toBe('"hello"');
  });

  it('extracts .message.content when present', () => {
    expect(formatJson({ message: { content: 'abc' } })).toBe('abc');
  });

  it('filters out pending key', () => {
    expect(formatJson({ a: 1, pending: true })).toBe(
      JSON.stringify({ a: 1 }, null, 2),
    );
  });

  it('preserves keys when pending is absent', () => {
    expect(formatJson({ x: 'y' })).toBe(JSON.stringify({ x: 'y' }, null, 2));
  });
});
