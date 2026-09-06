import { describe, expect, it } from 'vitest';

import { mimeTypeLabel } from './mime-type-label.helper';

describe('mimeTypeLabel', () => {
  it('strips the top-level type', () => {
    expect(mimeTypeLabel('application/pdf')).toBe('pdf');
    expect(mimeTypeLabel('text/markdown')).toBe('markdown');
    expect(mimeTypeLabel('image/png')).toBe('png');
  });

  it('returns a subtype-only value unchanged', () => {
    expect(mimeTypeLabel('pdf')).toBe('pdf');
  });
});
