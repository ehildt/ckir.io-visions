import { describe, expect, it } from 'vitest';

import { normalizeJsonResponse } from './normalize-json-response.helper.js';

describe('normalizeJsonResponse', () => {
  it('coerces keyFindings strings into objects with text', () => {
    const result = normalizeJsonResponse(
      {
        keyFindings: [
          'first observation',
          { text: 'already valid' },
          '',
          null,
          'second observation',
        ],
      },
      'describe',
    );

    expect(result.keyFindings).toEqual([
      { text: 'first observation' },
      { text: 'already valid' },
      { text: 'second observation' },
    ]);
  });

  it('coerces keyFindings strings into objects with text for news', () => {
    const result = normalizeJsonResponse(
      {
        keyFindings: ['point one', 'point two'],
      },
      'news',
    );

    expect(result.keyFindings).toEqual([
      { text: 'point one' },
      { text: 'point two' },
    ]);
  });

  it('coerces sources strings into objects with url', () => {
    const result = normalizeJsonResponse(
      {
        sources: [
          'https://example.com/article',
          { url: 'https://already.com', title: 'Already' },
          'not-a-url',
          '',
        ],
      },
      'describe',
    );

    expect(result.sources).toEqual([
      { url: 'https://example.com/article' },
      { url: 'https://already.com', title: 'Already' },
    ]);
  });

  it('adds an empty title to coerced news sources', () => {
    const result = normalizeJsonResponse(
      {
        sources: ['https://example.com/article'],
      },
      'news',
    );

    expect(result.sources).toEqual([
      { url: 'https://example.com/article', title: '' },
    ]);
  });

  it('coerces galleryItems strings into objects with imageUrl', () => {
    const result = normalizeJsonResponse(
      {
        galleryItems: [
          'https://example.com/img.jpg',
          { imageUrl: 'https://example.com/valid.jpg' },
          'not-a-url',
        ],
      },
      'article',
    );

    expect(result.galleryItems).toEqual([
      { imageUrl: 'https://example.com/img.jpg' },
      { imageUrl: 'https://example.com/valid.jpg' },
    ]);
  });

  it('coerces videoGalleryItems strings into objects with videoUrl', () => {
    const result = normalizeJsonResponse(
      {
        videoGalleryItems: [
          'https://youtube.com/watch?v=abc',
          { videoUrl: 'https://vimeo.com/123' },
        ],
      },
      'article',
    );

    expect(result.videoGalleryItems).toEqual([
      { videoUrl: 'https://youtube.com/watch?v=abc' },
      { videoUrl: 'https://vimeo.com/123' },
    ]);
  });

  it('coerces relatedStories strings into objects for news', () => {
    const result = normalizeJsonResponse(
      {
        relatedStories: ['https://example.com/story'],
      },
      'news',
    );

    expect(result.relatedStories).toEqual([
      { url: 'https://example.com/story', title: '' },
    ]);
  });

  it('coerces cards strings into objects with url for article', () => {
    const result = normalizeJsonResponse(
      {
        cards: ['https://example.com/card'],
      },
      'article',
    );

    expect(result.cards).toEqual([{ url: 'https://example.com/card' }]);
  });

  it('leaves non-array fields untouched', () => {
    const result = normalizeJsonResponse(
      {
        category: 'Art',
        title: 'Title',
        keyFindings: 'not an array',
      },
      'describe',
    );

    expect(result.category).toBe('Art');
    expect(result.title).toBe('Title');
    expect(result.keyFindings).toBe('not an array');
  });

  it('removes empty arrays and undefined values safely', () => {
    const result = normalizeJsonResponse(
      {
        keyFindings: [],
        sources: [],
      },
      'describe',
    );

    expect(result.keyFindings).toEqual([]);
    expect(result.sources).toEqual([]);
  });

  it('deduplicates gallery items by imageUrl keeping the first occurrence', () => {
    const result = normalizeJsonResponse(
      {
        galleryItems: [
          { imageUrl: 'https://img.com/a.jpg' },
          { imageUrl: 'https://img.com/a.jpg' },
          { imageUrl: 'https://img.com/b.jpg' },
        ],
      },
      'article',
    );

    expect(result.galleryItems).toEqual([
      { imageUrl: 'https://img.com/a.jpg' },
      { imageUrl: 'https://img.com/b.jpg' },
    ]);
  });

  it('keeps gallery entries without a string key during dedupe', () => {
    const result = normalizeJsonResponse(
      {
        galleryItems: [
          { imageUrl: 'https://img.com/a.jpg' },
          { imageUrl: 42 },
          { imageUrl: 'https://img.com/a.jpg' },
        ],
      },
      'article',
    );

    expect(result.galleryItems).toEqual([
      { imageUrl: 'https://img.com/a.jpg' },
      { imageUrl: 42 },
    ]);
  });

  it('deduplicates video gallery items by videoUrl', () => {
    const result = normalizeJsonResponse(
      {
        videoGalleryItems: [
          { videoUrl: 'https://vimeo.com/1' },
          { videoUrl: 'https://vimeo.com/1' },
        ],
      },
      'article',
    );

    expect(result.videoGalleryItems).toEqual([
      { videoUrl: 'https://vimeo.com/1' },
    ]);
  });

  it('drops non-URL strings from gallery items', () => {
    const result = normalizeJsonResponse(
      {
        galleryItems: ['not-a-url', 'ftp://example.com/x.jpg'],
      },
      'article',
    );

    expect(result.galleryItems).toEqual([]);
  });

  it('coerces subject strings into name objects', () => {
    const result = normalizeJsonResponse(
      {
        subjects: ['Alice', { name: 'Bob' }, null, 42],
      },
      'evaluation',
    );

    expect(result.subjects).toEqual([{ name: 'Alice' }, { name: 'Bob' }]);
  });

  it('normalizes nested strengths/weaknesses and scores inside subjects', () => {
    const result = normalizeJsonResponse(
      {
        subjects: [
          {
            name: 'Alice',
            strengths: ['fast', { text: 'clear' }],
            weaknesses: ['slow'],
            score: '7.5',
          },
          {
            name: 'Bob',
            score: 'not-a-number',
          },
        ],
      },
      'evaluation',
    );

    expect(result.subjects).toEqual([
      {
        name: 'Alice',
        strengths: [{ text: 'fast' }, { text: 'clear' }],
        weaknesses: [{ text: 'slow' }],
        score: 7.5,
      },
      { name: 'Bob' },
    ]);
  });

  it('coerces a bare-string comparison into a summary object', () => {
    const result = normalizeJsonResponse(
      {
        comparison: 'Alice wins on clarity',
      },
      'evaluation',
    );

    expect(result.comparison).toEqual({ summary: 'Alice wins on clarity' });
  });

  it('normalizes comparison criteria and their scores', () => {
    const result = normalizeJsonResponse(
      {
        comparison: {
          summary: 'Overall',
          criteria: [
            'Clarity',
            {
              name: 'Speed',
              scores: [
                { subject: 'Alice', score: '9' },
                { subject: 'Bob', score: 7 },
                { subject: 'Carol', score: 'n/a' },
              ],
            },
          ],
        },
      },
      'evaluation',
    );

    expect(result.comparison).toEqual({
      summary: 'Overall',
      criteria: [
        { name: 'Clarity' },
        {
          name: 'Speed',
          scores: [
            { subject: 'Alice', score: 9 },
            { subject: 'Bob', score: 7 },
          ],
        },
      ],
    });
  });

  it('deletes an invalid comparison block', () => {
    const result = normalizeJsonResponse(
      {
        comparison: 42,
      },
      'evaluation',
    );

    expect(result.comparison).toBeUndefined();
  });

  it('adds a title to object sources missing one for news', () => {
    const result = normalizeJsonResponse(
      {
        sources: [{ url: 'https://example.com/story' }],
      },
      'news',
    );

    expect(result.sources).toEqual([
      { url: 'https://example.com/story', title: '' },
    ]);
  });

  it('keeps object sources as-is for non-news templates', () => {
    const result = normalizeJsonResponse(
      {
        sources: [{ url: 'https://example.com/story', title: 'Story' }],
      },
      'article',
    );

    expect(result.sources).toEqual([
      { url: 'https://example.com/story', title: 'Story' },
    ]);
  });

  it('drops non-URL strings from sources', () => {
    const result = normalizeJsonResponse(
      {
        sources: ['plain text', 'mailto:user@example.com'],
      },
      'article',
    );

    expect(result.sources).toEqual([]);
  });

  it('coerces pros/cons/recommendations/strengths/weaknesses text entries', () => {
    const result = normalizeJsonResponse(
      {
        pros: ['cheap', { text: 'fast' }],
        cons: ['heavy'],
        recommendations: ['try it'],
        strengths: ['solid'],
        weaknesses: ['noisy'],
        keyPoints: ['point'],
      },
      'product',
    );

    expect(result.pros).toEqual([{ text: 'cheap' }, { text: 'fast' }]);
    expect(result.cons).toEqual([{ text: 'heavy' }]);
    expect(result.recommendations).toEqual([{ text: 'try it' }]);
    expect(result.strengths).toEqual([{ text: 'solid' }]);
    expect(result.weaknesses).toEqual([{ text: 'noisy' }]);
    expect(result.keyPoints).toEqual([{ text: 'point' }]);
  });

  it('leaves non-array fields untouched and drops invalid entries', () => {
    const result = normalizeJsonResponse(
      {
        keyFindings: [42, null, undefined, { text: 'ok' }],
        pros: 'not an array',
      },
      'describe',
    );

    expect(result.keyFindings).toEqual([{ text: 'ok' }]);
    expect(result.pros).toBe('not an array');
  });

  it('does not mutate the input object', () => {
    const input = {
      keyFindings: ['finding'],
      galleryItems: ['https://img.com/a.jpg'],
    };
    const result = normalizeJsonResponse(input, 'article');

    expect(input.keyFindings).toEqual(['finding']);
    expect(input.galleryItems).toEqual(['https://img.com/a.jpg']);
    expect(result).not.toBe(input);
  });
});
