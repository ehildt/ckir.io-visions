import { limitText } from '@triplef/helpers/limit-text';
import { TextToLines } from '@triplef/helpers/text-to-lines';

import { splitByHeadings } from './split-by-headings.helper.js';

/**
 * Split free text into sentence-packed chunks of at most `chunkChars` chars,
 * each starting with the last `overlapSentences` sentences of the previous
 * chunk. A single oversize sentence becomes its own chunk via `limitText`
 * (marked) — never split mid-sentence.
 */
export function chunkTextBySentences(
  content: string,
  chunkChars: number,
  overlapSentences: number,
): string[] {
  const sentences = new TextToLines(content).build();
  const chunks: string[] = [];
  let current: string[] = [];

  for (const sentence of sentences) {
    const capped = limitText(sentence, chunkChars);
    const joined = current.join(' ');
    const wouldExceed =
      current.length > 0 && joined.length + capped.length + 1 > chunkChars;
    if (wouldExceed) {
      chunks.push(joined);
      current = overlapSentences > 0 ? current.slice(-overlapSentences) : [];
    }
    current.push(capped);
  }
  if (current.length > 0) chunks.push(current.join(' '));
  return chunks;
}

/**
 * Markdown-aware variant: split the document into heading sections first
 * (`splitByHeadings`), then sentence-pack each section independently — the
 * sentence overlap never crosses a section boundary and no chunk spans two
 * topics. Heading-free content degenerates to plain `chunkTextBySentences`.
 */
export function chunkTextBySections(
  content: string,
  chunkChars: number,
  overlapSentences: number,
  maxHeadingDepth: number,
): string[] {
  const chunks: string[] = [];
  for (const section of splitByHeadings(content, maxHeadingDepth)) {
    chunks.push(...chunkTextBySentences(section, chunkChars, overlapSentences));
  }
  return chunks;
}
