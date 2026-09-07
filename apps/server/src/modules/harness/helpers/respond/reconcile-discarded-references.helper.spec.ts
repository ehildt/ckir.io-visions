import { describe, expect, it } from 'vitest';

import { reconcileDiscardedReferences } from './reconcile-discarded-references.helper.js';

const cloud = [
  { imageUrl: 'https://img.com/a.jpg', title: 'A' },
  { imageUrl: 'https://img.com/b.jpg' },
];

describe('reconcileDiscardedReferences', () => {
  it('returns the data untouched when there is nothing to reconcile', () => {
    const data = { galleryItems: [{ imageUrl: 'https://img.com/a.jpg' }] };
    const result = reconcileDiscardedReferences(data, cloud);

    expect(result).toEqual({
      data,
      removedGalleryCount: 0,
      removedSourceCount: 0,
      droppedDiscardCount: 0,
      complementedCount: 0,
    });
  });

  it('returns the base result for undefined data', () => {
    const result = reconcileDiscardedReferences(undefined, cloud);

    expect(result.data).toBeUndefined();
    expect(result.removedGalleryCount).toBe(0);
  });

  it('keeps valid image discards and removes them from galleryItems', () => {
    const data = {
      galleryItems: [
        { imageUrl: 'https://img.com/a.jpg' },
        { imageUrl: 'https://img.com/b.jpg' },
      ],
      discardedReferences: [
        { type: 'image', imageUrl: 'https://img.com/a.jpg', reason: 'blurry' },
      ],
    };
    const result = reconcileDiscardedReferences(data, cloud);

    expect(result.data?.galleryItems).toEqual([
      { imageUrl: 'https://img.com/b.jpg' },
    ]);
    expect(result.data?.discardedReferences).toEqual([
      { type: 'image', imageUrl: 'https://img.com/a.jpg', reason: 'blurry' },
    ]);
    expect(result.removedGalleryCount).toBe(1);
  });

  it('drops fabricated image discards that are not cloud candidates', () => {
    const data = {
      galleryItems: [{ imageUrl: 'https://img.com/a.jpg' }],
      discardedReferences: [
        { type: 'image', imageUrl: 'https://evil.com/x.jpg', reason: 'nope' },
      ],
    };
    const result = reconcileDiscardedReferences(data, cloud);

    expect(result.data?.galleryItems).toEqual([
      { imageUrl: 'https://img.com/a.jpg' },
    ]);
    expect(result.data?.discardedReferences).toBeUndefined();
    expect(result.droppedDiscardCount).toBe(1);
  });

  it('keeps valid link discards and removes them from sources', () => {
    const data = {
      sources: [
        { url: 'https://example.com/1', title: 'One' },
        { url: 'https://example.com/2', title: 'Two' },
      ],
      discardedReferences: [
        { type: 'link', url: 'https://example.com/1', reason: 'off-topic' },
      ],
    };
    const result = reconcileDiscardedReferences(data, cloud);

    expect(result.data?.sources).toEqual([
      { url: 'https://example.com/2', title: 'Two' },
    ]);
    expect(result.removedSourceCount).toBe(1);
  });

  it('drops link discards that are not absolute URLs', () => {
    const data = {
      sources: [{ url: 'https://example.com/1', title: 'One' }],
      discardedReferences: [
        { type: 'link', url: 'relative/path', reason: 'nope' },
      ],
    };
    const result = reconcileDiscardedReferences(data, cloud);

    expect(result.data?.sources).toEqual([
      { url: 'https://example.com/1', title: 'One' },
    ]);
    expect(result.droppedDiscardCount).toBe(1);
  });

  it('drops entries with unknown types', () => {
    const data = {
      discardedReferences: [
        { type: 'video', url: 'https://example.com/v.mp4', reason: 'nope' },
      ],
    };
    const result = reconcileDiscardedReferences(data, cloud);

    expect(result.data?.discardedReferences).toBeUndefined();
    expect(result.droppedDiscardCount).toBe(1);
  });

  it('complements unaccounted cloud candidates when enforceFullCoverage is set', () => {
    const data = {
      galleryItems: [{ imageUrl: 'https://img.com/a.jpg' }],
    };
    const result = reconcileDiscardedReferences(data, cloud, true);

    expect(result.data?.discardedReferences).toEqual([
      {
        type: 'image',
        imageUrl: 'https://img.com/b.jpg',
        title: 'https://img.com/b.jpg',
      },
    ]);
    expect(result.complementedCount).toBe(1);
  });

  it('uses the candidate title for complement entries when present', () => {
    const data = { galleryItems: [] };
    const result = reconcileDiscardedReferences(data, cloud, true);

    expect(result.data?.discardedReferences).toEqual([
      { type: 'image', imageUrl: 'https://img.com/a.jpg', title: 'A' },
      {
        type: 'image',
        imageUrl: 'https://img.com/b.jpg',
        title: 'https://img.com/b.jpg',
      },
    ]);
    expect(result.complementedCount).toBe(2);
  });

  it('does not complement when enforceFullCoverage is off', () => {
    const data = { galleryItems: [] };
    const result = reconcileDiscardedReferences(data, cloud);

    expect(result.complementedCount).toBe(0);
    expect(result.data?.discardedReferences).toBeUndefined();
  });

  it('does not complement candidates already used in the gallery', () => {
    const data = {
      galleryItems: [
        { imageUrl: 'https://img.com/a.jpg' },
        { imageUrl: 'https://img.com/b.jpg' },
      ],
    };
    const result = reconcileDiscardedReferences(data, cloud, true);

    expect(result.complementedCount).toBe(0);
    expect(result.data?.discardedReferences).toBeUndefined();
  });

  it('handles non-array discardedReferences gracefully', () => {
    const data = { discardedReferences: 'not-an-array' };
    const result = reconcileDiscardedReferences(data, cloud);

    expect(result.droppedDiscardCount).toBe(0);
    expect(result.data?.discardedReferences).toBe('not-an-array');
  });
});
