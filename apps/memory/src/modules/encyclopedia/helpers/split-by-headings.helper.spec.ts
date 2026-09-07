import { describe, expect, it } from 'vitest';

import { splitByHeadings } from './split-by-headings.helper.js';

describe('splitByHeadings', () => {
  it('splits content at ATX headings', () => {
    const sections = splitByHeadings(
      '# Title\nintro text\n## Section A\nbody',
      2,
    );

    expect(sections).toEqual(['# Title\nintro text', '## Section A\nbody']);
  });

  it('returns a single span for heading-free content', () => {
    const sections = splitByHeadings('just some text\nmore text', 3);

    expect(sections).toEqual(['just some text\nmore text']);
  });

  it('treats text before the first heading as its own section', () => {
    const sections = splitByHeadings('preamble\n# Heading\nbody', 1);

    expect(sections).toEqual(['preamble', '# Heading\nbody']);
  });

  it('ignores headings deeper than the max depth', () => {
    const sections = splitByHeadings('# One\n### Three\nbody', 1);

    expect(sections).toEqual(['# One\n### Three\nbody']);
  });

  it('does not treat headings inside fenced code blocks as headings', () => {
    const sections = splitByHeadings(
      '# Top\n```\n# not a heading\ncode\n```\n## Real\nbody',
      2,
    );

    expect(sections).toEqual([
      '# Top\n```\n# not a heading\ncode\n```',
      '## Real\nbody',
    ]);
  });

  it('drops a trailing blank or whitespace-only span', () => {
    const sections = splitByHeadings('# One\n\n', 2);

    expect(sections).toEqual(['# One']);
  });

  it('merges a heading preceded only by blank lines into the next section', () => {
    const sections = splitByHeadings('# One\n\n## Two\nbody', 2);

    expect(sections).toEqual(['# One', '## Two\nbody']);
  });

  it('handles empty content', () => {
    expect(splitByHeadings('', 2)).toEqual([]);
  });

  it('handles a max depth of zero by treating only single-hash headings as splits', () => {
    const sections = splitByHeadings('# One\n## Two\nbody', 0);

    expect(sections).toEqual(['# One\n## Two\nbody']);
  });
});
