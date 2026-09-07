import { describe, expect, it } from 'vitest';

import type { HarnessContext } from '../../services/harness-context.type.js';

import { buildFinalMessagesForSanitize } from './build-final-messages.helper.js';

/**
 * Pins the cognition system blocks: content and order matter — the model
 * reads these verbatim. Empty tool results short-circuit to the context
 * system messages + conversation, isolating the cognition rendering.
 */
function buildWithCognition(cognition: {
  profile?: string;
  persona?: string;
  corrections?: string;
  insights?: string[];
  convictions?: string[];
  episodes?: string[];
  clusters?: string[];
}) {
  const ctx = { request: { messages: [] } } as HarnessContext;
  return buildFinalMessagesForSanitize(
    ctx,
    [],
    [],
    [],
    [],
    [],
    [],
    undefined,
    [],
    [],
    [],
    [],
    [],
    [],
    cognition.profile,
    cognition.persona,
    cognition.corrections,
    cognition.insights,
    cognition.convictions,
    cognition.episodes,
    cognition.clusters,
  );
}

/** The bracketed tag of each rendered system message. */
function tags(messages: Array<{ content: unknown }>): string[] {
  return messages.map((m) => String(m.content).match(/^\[[^\]]+\]/)?.[0]);
}

describe('buildFinalMessagesForSanitize cognition context', () => {
  it('renders no cognition blocks when the cognition space is empty', () => {
    expect(buildWithCognition({})).toHaveLength(0);
  });

  it('renders every populated cognition lane in order', () => {
    const messages = buildWithCognition({
      persona: 'You are F.',
      corrections: 'Never use emojis.',
      profile: '{"likes":["cars"]}',
      insights: ['likes vintage cars'],
      convictions: ['the user collects cars'],
      episodes: ['discussed engine swaps'],
      clusters: ['cars cluster overview'],
    });

    expect(tags(messages)).toEqual([
      '[YOUR IDENTITY — WHO YOU ARE TO THIS USER]',
      '[YOUR LEARNED RULES — CORRECTIONS THE USER TAUGHT YOU]',
      '[YOUR PROFILE OF THIS USER — YOUR DERIVED UNDERSTANDING; INFORMS, NEVER QUOTES]',
      '[RELEVANT PRIVATE COGNITION — DERIVED, NEVER VERBATIM]',
      '[YOUR CONVICTIONS — SYNTHESIZED, HOLD LOOSELY]',
      '[RECENT CONVERSATIONS — YOUR SHORT-TERM MEMORY OF PAST TURNS]',
      "[TOPIC CONTEXT — CLUSTERS OF THIS USER'S MEMORY]",
    ]);
    // Every message is a system block.
    expect(messages.every((m) => m.role === 'system')).toBe(true);
  });

  it('renders the profile content without quoting it verbatim', () => {
    const messages = buildWithCognition({ profile: '{"likes":["cars"]}' });

    expect(messages).toHaveLength(1);
    expect(String(messages[0].content)).toContain('{"likes":["cars"]}');
    // The framing guards verbatim quoting: "INFORMS, NEVER QUOTES".
    expect(String(messages[0].content)).toContain('NEVER QUOTES');
  });

  it('renders only the populated lanes (persona only)', () => {
    const messages = buildWithCognition({ persona: 'You are F.' });

    expect(tags(messages)).toEqual([
      '[YOUR IDENTITY — WHO YOU ARE TO THIS USER]',
    ]);
    expect(String(messages[0].content)).toContain('You are F.');
  });

  it('skips blank-string lanes (whitespace-only persona is dropped)', () => {
    const messages = buildWithCognition({ persona: '   ', insights: ['x'] });

    expect(tags(messages)).toEqual([
      '[RELEVANT PRIVATE COGNITION — DERIVED, NEVER VERBATIM]',
    ]);
  });
});

describe('buildFinalMessagesForSanitize encyclopedia passages', () => {
  it('renders no encyclopedia blocks when there are no passages', () => {
    const ctx = { request: { messages: [] } } as HarnessContext;
    const messages = buildFinalMessagesForSanitize(
      ctx,
      [],
      [],
      [],
      [],
      [],
      [],
      undefined,
      [],
    );
    expect(messages).toHaveLength(0);
  });

  it('renders verbatim content passages and result snippets separately', () => {
    const ctx = { request: { messages: [] } } as HarnessContext;
    const messages = buildFinalMessagesForSanitize(
      ctx,
      [],
      [],
      [],
      [],
      [],
      [],
      undefined,
      [
        {
          url: 'https://example.com/page',
          title: 'Page',
          content: 'Full passage text',
          sourceType: 'content',
        },
        {
          url: 'https://example.com/result',
          title: 'Result',
          content: 'Snippet text',
          sourceType: 'result',
        },
      ],
    );

    expect(messages).toHaveLength(2);
    expect(String(messages[0].content)).toContain(
      '[RELEVANT KNOWLEDGE — PREVIOUSLY FETCHED SOURCES]',
    );
    expect(String(messages[0].content)).toContain('Full passage text');
    expect(String(messages[1].content)).toContain(
      '[RELEVANT KNOWLEDGE — PREVIOUSLY SEEN SOURCES]',
    );
    expect(String(messages[1].content)).toContain('Snippet text');
  });

  it('renders passages without a title or url gracefully', () => {
    const ctx = { request: { messages: [] } } as HarnessContext;
    const messages = buildFinalMessagesForSanitize(
      ctx,
      [],
      [],
      [],
      [],
      [],
      [],
      undefined,
      [{ content: 'Bare passage' }],
    );

    expect(String(messages[0].content)).toContain('Bare passage');
    expect(String(messages[0].content)).toContain('no url');
  });
});

describe('buildFinalMessagesForSanitize message assembly', () => {
  function ctxWithMessages(overrides: Record<string, unknown> = {}) {
    return {
      request: {
        messages: [
          { role: 'system', content: 'base system' },
          { role: 'user', content: 'hello' },
        ],
      },
      outputs: { intent: { template: 'article' } },
      ...overrides,
    } as unknown as HarnessContext;
  }

  it('attaches buffers to the last user message', () => {
    const ctx = ctxWithMessages();
    const messages = buildFinalMessagesForSanitize(
      ctx,
      [Buffer.from('img')],
      [],
      [],
      [],
      [],
      [],
    );

    const user = messages.find((m) => m.role === 'user');
    expect(user?.images).toEqual([Buffer.from('img')]);
    expect(user?.content).toBe('hello');
  });

  it('appends a user message with images when no user message exists', () => {
    const ctx = {
      request: { messages: [{ role: 'system', content: 'base' }] },
      outputs: { intent: { template: 'article' } },
    } as unknown as HarnessContext;
    const messages = buildFinalMessagesForSanitize(
      ctx,
      [Buffer.from('img')],
      [],
      [],
      [],
      [],
      [],
    );

    const user = messages.find((m) => m.role === 'user');
    expect(user?.images).toEqual([Buffer.from('img')]);
    expect(user?.content).toBe('');
  });

  it('returns context system messages plus conversation when there are no tool results', () => {
    const ctx = ctxWithMessages();
    const messages = buildFinalMessagesForSanitize(ctx, [], [], [], [], [], []);

    expect(messages).toHaveLength(2);
    expect(messages[0].content).toBe('base system');
    expect(messages[1].content).toBe('hello');
  });

  it('builds a tool context message with media instructions and deduped images', () => {
    const ctx = ctxWithMessages();
    const messages = buildFinalMessagesForSanitize(
      ctx,
      [],
      [{ toolName: 'webSearch', result: {} }],
      [
        { imageUrl: 'https://img.com/a.jpg' },
        { imageUrl: 'https://img.com/a.jpg' },
        { imageUrl: 'https://img.com/b.jpg' },
      ],
      [{ videoUrl: 'https://youtu.be/dQw4w9WgXcQ' }],
      [{ title: 'Article', url: 'https://example.com', snippet: 's' }],
      [],
    );

    const toolContext = messages.find((m) =>
      String(m.content).includes('[TOOL CONTEXT — DO NOT OUTPUT]'),
    );
    expect(toolContext).toBeDefined();
    const parsed = JSON.parse(
      String(toolContext?.content).replace(
        '[TOOL CONTEXT — DO NOT OUTPUT]\n',
        '',
      ),
    );
    expect(parsed.availableImages).toHaveLength(2);
    expect(parsed.availableVideos).toHaveLength(1);
    expect(parsed.imageTargetCount).toBe(6);
    expect(parsed.videoTargetCount).toBe(6);
    expect(parsed.mediaInstructions.length).toBeGreaterThan(0);
  });

  it('honors explicit image/video counts from the intent', () => {
    const ctx = ctxWithMessages({
      outputs: {
        intent: { template: 'article', imageCount: 3, videoCount: 2 },
      },
    });
    const messages = buildFinalMessagesForSanitize(
      ctx,
      [],
      [{ toolName: 'webSearch', result: {} }],
      [{ imageUrl: 'https://img.com/a.jpg' }],
      [{ videoUrl: 'https://youtu.be/dQw4w9WgXcQ' }],
      [],
      [],
    );

    const toolContext = messages.find((m) =>
      String(m.content).includes('[TOOL CONTEXT — DO NOT OUTPUT]'),
    );
    const parsed = JSON.parse(
      String(toolContext?.content).replace(
        '[TOOL CONTEXT — DO NOT OUTPUT]\n',
        '',
      ),
    );
    expect(parsed.imageTargetCount).toBe(3);
    expect(parsed.videoTargetCount).toBe(2);
  });

  it('adds the references selection line when references exist', () => {
    const ctx = ctxWithMessages();
    const messages = buildFinalMessagesForSanitize(
      ctx,
      [],
      [{ toolName: 'fetch', result: {} }],
      [],
      [],
      [],
      [{ url: 'https://example.com', content: 'ref text' }],
      { considered: 10, selected: 3 },
    );

    const toolContext = messages.find((m) =>
      String(m.content).includes('[TOOL CONTEXT — DO NOT OUTPUT]'),
    );
    const parsed = JSON.parse(
      String(toolContext?.content).replace(
        '[TOOL CONTEXT — DO NOT OUTPUT]\n',
        '',
      ),
    );
    expect(parsed.references).toHaveLength(1);
    expect(parsed.mediaInstructions.join(' ')).toContain(
      'selected from 10 fetched passages',
    );
  });

  it('uses the raw-references line when no selection is provided', () => {
    const ctx = ctxWithMessages();
    const messages = buildFinalMessagesForSanitize(
      ctx,
      [],
      [{ toolName: 'fetch', result: {} }],
      [],
      [],
      [],
      [{ url: 'https://example.com', content: 'ref text' }],
    );

    const toolContext = messages.find((m) =>
      String(m.content).includes('[TOOL CONTEXT — DO NOT OUTPUT]'),
    );
    const parsed = JSON.parse(
      String(toolContext?.content).replace(
        '[TOOL CONTEXT — DO NOT OUTPUT]\n',
        '',
      ),
    );
    expect(parsed.mediaInstructions.join(' ')).toContain(
      'raw non-search tool results',
    );
  });

  it('renders imagelist-specific media instructions', () => {
    const ctx = ctxWithMessages({
      outputs: { intent: { template: 'imagelist' } },
    });
    const messages = buildFinalMessagesForSanitize(
      ctx,
      [],
      [{ toolName: 'imageSearch', result: {} }],
      [{ imageUrl: 'https://img.com/a.jpg' }],
      [],
      [],
      [],
    );

    const toolContext = messages.find((m) =>
      String(m.content).includes('[TOOL CONTEXT — DO NOT OUTPUT]'),
    );
    const parsed = JSON.parse(
      String(toolContext?.content).replace(
        '[TOOL CONTEXT — DO NOT OUTPUT]\n',
        '',
      ),
    );
    expect(parsed.mediaInstructions.join(' ')).toContain('NO hero image');
  });

  it('renders shoplist-specific media instructions', () => {
    const ctx = ctxWithMessages({
      outputs: { intent: { template: 'shoplist' } },
    });
    const messages = buildFinalMessagesForSanitize(
      ctx,
      [],
      [{ toolName: 'shopSearch', result: {} }],
      [{ imageUrl: 'https://img.com/a.jpg' }],
      [],
      [],
      [],
    );

    const toolContext = messages.find((m) =>
      String(m.content).includes('[TOOL CONTEXT — DO NOT OUTPUT]'),
    );
    const parsed = JSON.parse(
      String(toolContext?.content).replace(
        '[TOOL CONTEXT — DO NOT OUTPUT]\n',
        '',
      ),
    );
    expect(parsed.mediaInstructions.join(' ')).toContain('shopOffers');
  });

  it('renders product-specific hero instructions', () => {
    const ctx = ctxWithMessages({
      outputs: { intent: { template: 'product' } },
    });
    const messages = buildFinalMessagesForSanitize(
      ctx,
      [],
      [{ toolName: 'shopSearch', result: {} }],
      [{ imageUrl: 'https://img.com/a.jpg' }],
      [],
      [],
      [],
    );

    const toolContext = messages.find((m) =>
      String(m.content).includes('[TOOL CONTEXT — DO NOT OUTPUT]'),
    );
    const parsed = JSON.parse(
      String(toolContext?.content).replace(
        '[TOOL CONTEXT — DO NOT OUTPUT]\n',
        '',
      ),
    );
    expect(parsed.mediaInstructions.join(' ')).toContain('NO hero video');
  });
});
