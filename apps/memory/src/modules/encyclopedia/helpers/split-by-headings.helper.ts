/**
 * Split Markdown content into section spans at ATX headings (`#` …
 * `#maxHeadingDepth`). Each section spans its heading line through the line
 * before the next heading (or EOF); text before the first heading is its own
 * section.
 *
 * Setext (`===`) headings are not recognized — the extraction pipeline emits
 * ATX via turndown. Lines inside fenced code blocks (```) are never treated
 * as headings, and a blank/whitespace-only span is dropped. Heading-free
 * content yields a single span.
 *
 * Example:
 * ```md
 * # Title
 * intro text
 * ## Section A
 * body
 * ```
 * → ['# Title\nintro text', '## Section A\nbody']
 */
export function splitByHeadings(
  content: string,
  maxHeadingDepth: number,
): string[] {
  // CommonMark: up to 3 leading spaces, then 1..depth `#`, then whitespace.
  const heading = new RegExp(
    `^\\s{0,3}#{1,${Math.max(1, maxHeadingDepth)}}\\s`,
  );
  const sections: string[] = [];
  let current: string[] = [];
  let inFence = false;

  for (const line of content.split('\n')) {
    if (line.trimStart().startsWith('```')) {
      inFence = !inFence;
      current.push(line);
      continue;
    }
    if (!inFence && heading.test(line) && current.some((l) => l.trim())) {
      sections.push(current.join('\n').trim());
      current = [];
    }
    current.push(line);
  }
  if (current.some((line) => line.trim())) {
    sections.push(current.join('\n').trim());
  }
  return sections;
}
