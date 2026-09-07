import { describe, expect, it } from 'vitest';

import type { ExtractedImageItem } from '../media/extract-media-from-tools.types.js';

import { enforceAvailableMediaUrls } from './enforce-available-media-urls.helper.js';

const img = (imageUrl: string): ExtractedImageItem => ({ imageUrl });

describe('enforceAvailableMediaUrls', () => {
  it('returns the data unchanged when all media is allowed', () => {
    const data = {
      heroImageUrl: 'https://img.com/a.jpg',
      galleryItems: [{ imageUrl: 'https://img.com/b.jpg' }],
    };
    const result = enforceAvailableMediaUrls(
      data,
      [img('https://img.com/a.jpg'), img('https://img.com/b.jpg')],
      [],
    );
    expect(result).toBe(data);
  });

  it('returns undefined for undefined data', () => {
    expect(enforceAvailableMediaUrls(undefined, [], [])).toBe(undefined);
  });

  it('blanks a disallowed hero image url', () => {
    const result = enforceAvailableMediaUrls(
      { heroImageUrl: 'https://evil.com/x.jpg' },
      [],
      [],
    );
    expect(result?.heroImageUrl).toBe('');
  });

  it('filters gallery items not in the allowed set', () => {
    const result = enforceAvailableMediaUrls(
      {
        galleryItems: [
          { imageUrl: 'https://img.com/a.jpg' },
          { imageUrl: 'https://evil.com/x.jpg' },
        ],
      },
      [img('https://img.com/a.jpg')],
      [],
    );
    expect(result?.galleryItems).toEqual([
      { imageUrl: 'https://img.com/a.jpg' },
    ]);
  });

  it('does not repeat a hero image in the gallery', () => {
    const result = enforceAvailableMediaUrls(
      {
        heroImageUrl: 'https://img.com/a.jpg',
        galleryItems: [
          { imageUrl: 'https://img.com/a.jpg' },
          { imageUrl: 'https://img.com/b.jpg' },
        ],
      },
      [img('https://img.com/a.jpg'), img('https://img.com/b.jpg')],
      [],
    );
    expect(result?.galleryItems).toEqual([
      { imageUrl: 'https://img.com/b.jpg' },
    ]);
  });

  it('blanks a disallowed hero video url', () => {
    const result = enforceAvailableMediaUrls(
      { heroVideoUrl: 'https://evil.com/v.mp4' },
      [],
      [],
    );
    expect(result?.heroVideoUrl).toBe('');
  });

  it('keeps a hero video whose canonical key is allowed', () => {
    const result = enforceAvailableMediaUrls(
      { heroVideoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
      [],
      [{ videoUrl: 'https://youtu.be/dQw4w9WgXcQ' }],
    );
    expect(result?.heroVideoUrl).toBe(
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    );
  });

  it('filters video gallery items not in the allowed set', () => {
    const result = enforceAvailableMediaUrls(
      {
        videoGalleryItems: [
          { videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
          { videoUrl: 'https://evil.com/v.mp4' },
        ],
      },
      [],
      [{ videoUrl: 'https://youtu.be/dQw4w9WgXcQ' }],
    );
    expect(result?.videoGalleryItems).toEqual([
      { videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
    ]);
  });

  it('does not repeat a hero video in the video gallery', () => {
    const result = enforceAvailableMediaUrls(
      {
        heroVideoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        videoGalleryItems: [
          { videoUrl: 'https://youtu.be/dQw4w9WgXcQ' },
          { videoUrl: 'https://vimeo.com/999' },
        ],
      },
      [],
      [
        { videoUrl: 'https://youtu.be/dQw4w9WgXcQ' },
        { videoUrl: 'https://vimeo.com/999' },
      ],
    );
    expect(result?.videoGalleryItems).toEqual([
      { videoUrl: 'https://vimeo.com/999' },
    ]);
  });

  it('does not repeat gallery videos against each other', () => {
    const result = enforceAvailableMediaUrls(
      {
        videoGalleryItems: [
          { videoUrl: 'https://youtu.be/dQw4w9WgXcQ' },
          { videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
        ],
      },
      [],
      [{ videoUrl: 'https://youtu.be/dQw4w9WgXcQ' }],
    );
    expect(result?.videoGalleryItems).toEqual([
      { videoUrl: 'https://youtu.be/dQw4w9WgXcQ' },
    ]);
  });

  it('keeps the hero image in the gallery when a hero video is present', () => {
    const result = enforceAvailableMediaUrls(
      {
        heroVideoUrl: 'https://youtu.be/dQw4w9WgXcQ',
        heroImageUrl: 'https://img.com/a.jpg',
        galleryItems: [
          { imageUrl: 'https://img.com/a.jpg' },
          { imageUrl: 'https://img.com/b.jpg' },
        ],
      },
      [img('https://img.com/a.jpg'), img('https://img.com/b.jpg')],
      [{ videoUrl: 'https://youtu.be/dQw4w9WgXcQ' }],
    );
    expect(result?.galleryItems).toEqual([
      { imageUrl: 'https://img.com/a.jpg' },
      { imageUrl: 'https://img.com/b.jpg' },
    ]);
  });

  it('blanks related-story thumbnails that reuse hero or gallery imagery', () => {
    const result = enforceAvailableMediaUrls(
      {
        heroImageUrl: 'https://img.com/a.jpg',
        galleryItems: [{ imageUrl: 'https://img.com/b.jpg' }],
        relatedStories: [
          { title: 'Story 1', imageUrl: 'https://img.com/a.jpg' },
          { title: 'Story 2', imageUrl: 'https://img.com/b.jpg' },
          { title: 'Story 3', imageUrl: 'https://img.com/c.jpg' },
        ],
      },
      [
        img('https://img.com/a.jpg'),
        img('https://img.com/b.jpg'),
        img('https://img.com/c.jpg'),
      ],
      [],
    );
    expect(result?.relatedStories).toEqual([
      { title: 'Story 1', imageUrl: '' },
      { title: 'Story 2', imageUrl: '' },
      { title: 'Story 3', imageUrl: 'https://img.com/c.jpg' },
    ]);
  });

  it('blanks related-story thumbnails not in the allowed set', () => {
    const result = enforceAvailableMediaUrls(
      {
        relatedStories: [
          { title: 'Story 1', imageUrl: 'https://evil.com/x.jpg' },
        ],
      },
      [],
      [],
    );
    expect(result?.relatedStories).toEqual([
      { title: 'Story 1', imageUrl: '' },
    ]);
  });

  it('marks a kept story thumbnail as spent for later stories', () => {
    const result = enforceAvailableMediaUrls(
      {
        relatedStories: [
          { title: 'Story 1', imageUrl: 'https://img.com/a.jpg' },
          { title: 'Story 2', imageUrl: 'https://img.com/a.jpg' },
        ],
      },
      [img('https://img.com/a.jpg')],
      [],
    );
    expect(result?.relatedStories).toEqual([
      { title: 'Story 1', imageUrl: 'https://img.com/a.jpg' },
      { title: 'Story 2', imageUrl: '' },
    ]);
  });

  it('accepts extra image urls beyond the verified set', () => {
    const result = enforceAvailableMediaUrls(
      { heroImageUrl: 'https://uploaded.com/u.jpg' },
      [],
      [],
      ['https://uploaded.com/u.jpg'],
    );
    expect(result?.heroImageUrl).toBe('https://uploaded.com/u.jpg');
  });

  it('returns the original data reference when nothing changed', () => {
    const data = {
      heroImageUrl: 'https://img.com/a.jpg',
      galleryItems: [{ imageUrl: 'https://img.com/b.jpg' }],
    };
    const result = enforceAvailableMediaUrls(
      data,
      [img('https://img.com/a.jpg'), img('https://img.com/b.jpg')],
      [],
    );
    expect(result).toBe(data);
  });
});
