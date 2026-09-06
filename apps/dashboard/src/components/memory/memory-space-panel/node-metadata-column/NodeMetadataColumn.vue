<script setup lang="ts">
/**
 * The metadata column: the selected dot's label, full text (rendered through
 * markdown-it — encyclopedia chunks arrive as crawled markdown), and
 * deduplicated meta rows as tag chips (max 3 per row). Shows an empty hint
 * until a dot is clicked. Uploaded documents additionally offer a download
 * of the stored original.
 */
import { Download } from '@lucide/vue';
import { computed } from 'vue';

import { renderMarkdown } from '@/utils/render-markdown.helper';
import { repairSpacedLinks } from '@/utils/repair-spaced-links.helper';

import type { NodeMetadataColumnProps } from './NodeMetadataColumn.types';

const props = defineProps<NodeMetadataColumnProps>();

// Crawled markdown arrives with urls split by sentence chunking
// (`https://en. wikipedia. org/…`) — repair destinations before rendering.
const textHtml = computed(() =>
  props.node?.text ? renderMarkdown(repairSpacedLinks(props.node.text)) : '',
);
</script>

<template>
  <aside class="node-metadata-column">
    <template v-if="node">
      <h3 class="node-metadata-column__label">{{ node.label }}</h3>
      <!-- eslint-disable vue/no-v-html -- markdown-it render, DOMPurify-sanitized -->
      <div class="node-metadata-column__text" v-html="textHtml" />
      <!-- eslint-enable vue/no-v-html -->
      <a
        v-if="node.downloadUrl"
        class="node-metadata-column__download"
        :href="node.downloadUrl"
        download
      >
        <Download />
        {{ $t('common.memoryDownloadDocument') }}
      </a>
      <div v-if="frictions?.length" class="node-metadata-column__frictions">
        <span class="node-metadata-column__frictions-tag">{{
          $t('common.memoryFrictionTag')
        }}</span>
        <p
          v-for="(friction, index) in frictions"
          :key="`${friction.source}|${friction.target}|${index}`"
          class="node-metadata-column__friction"
        >
          {{ friction.reason }}
        </p>
      </div>
      <div
        v-if="node.evidenceTexts?.length"
        class="node-metadata-column__evidence"
      >
        <span class="node-metadata-column__evidence-tag">{{
          $t('common.memoryEvidenceTag')
        }}</span>
        <p
          v-for="(text, index) in node.evidenceTexts"
          :key="index"
          class="node-metadata-column__evidence-item"
        >
          {{ text }}
        </p>
      </div>
      <div v-if="tags?.length" class="node-metadata-column__tags">
        <span
          v-for="tag in tags"
          :key="`${tag.label}:${tag.value}`"
          class="node-metadata-column__tag"
        >
          <span class="node-metadata-column__tag-key">{{ tag.label }}</span>
          {{ tag.value }}
        </span>
      </div>
    </template>
    <p v-else class="node-metadata-column__empty">
      {{ $t('common.memoryMetadataEmpty') }}
    </p>
  </aside>
</template>

<style scoped>
.node-metadata-column {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  min-width: 0;
  padding: var(--spacing-3);
  overflow-y: auto;
  background-color: var(--color-bg-tertiary);
  border-left: 1px solid var(--color-divider);
}

.node-metadata-column__label {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-fg-secondary);
  overflow-wrap: anywhere;
}

.node-metadata-column__text {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  line-height: 1.5;
  color: var(--color-fg-primary);
  /* Long unbroken tokens (auto-linked urls) wrap instead of overflowing. */
  overflow-wrap: anywhere;
  /* Long documents stay readable: the text scrolls inside its own bounded
     box instead of pushing the actions/meta rows out of view. */
  max-height: 20rem;
  overflow-y: auto;
  padding-right: var(--spacing-1);
}

.node-metadata-column__text :deep(> *) {
  margin-top: 0;
  margin-bottom: 0;
}

.node-metadata-column__text :deep(> * + *) {
  margin-top: var(--spacing-2);
}

.node-metadata-column__text :deep(a) {
  color: var(--color-accent-primary);
  transition: color 0.2s ease;
}

.node-metadata-column__download {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-1);
  align-self: flex-start;
  padding: var(--spacing-1) var(--spacing-2);
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--color-accent-primary);
  text-decoration: none;
  border: 1px solid var(--color-divider);
  background-color: var(--color-bg-secondary);
}

.node-metadata-column__download:hover {
  border-color: var(--color-accent-primary);
}

.node-metadata-column__download svg {
  width: 0.875rem;
  height: 0.875rem;
}

.node-metadata-column__tags {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--spacing-1);
  padding-top: var(--spacing-2);
  border-top: 1px solid var(--color-divider);
}

.node-metadata-column__tag {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-0-5);
  min-width: 0;
  padding: var(--spacing-1) var(--spacing-1-5);
  overflow-wrap: anywhere;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--color-fg-primary);
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-divider);
}

.node-metadata-column__tag-key {
  font-size: 0.625rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-fg-muted);
}

.node-metadata-column__empty {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  font-style: italic;
  color: var(--color-fg-muted);
}

/* Contested section: an open friction the selected dot is party to. */
.node-metadata-column__frictions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  padding: var(--spacing-2);
  background-color: color-mix(
    in srgb,
    var(--color-status-warning) 12%,
    transparent
  );
  border: 1px solid
    color-mix(in srgb, var(--color-status-warning) 45%, transparent);
}

.node-metadata-column__frictions-tag {
  font-family: var(--font-mono);
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-status-warning);
}

.node-metadata-column__friction {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  line-height: 1.4;
  color: var(--color-fg-primary);
  overflow-wrap: anywhere;
}

/* Evidence section: the supporting facts a bridge/conviction cites. */
.node-metadata-column__evidence {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  padding: var(--spacing-2);
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-divider);
}

.node-metadata-column__evidence-tag {
  font-family: var(--font-mono);
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-fg-muted);
}

.node-metadata-column__evidence-item {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  line-height: 1.4;
  color: var(--color-fg-primary);
  overflow-wrap: anywhere;
}
</style>
