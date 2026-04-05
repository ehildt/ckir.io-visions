import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import AppFooter from './AppFooter.vue';

describe('AppFooter', () => {
  it('renders version and endpoints', () => {
    const wrapper = mount(AppFooter, {
      props: { connectionState: 'disconnected' },
    });
    expect(wrapper.text()).toContain('v1.2.0');
    expect(wrapper.text()).toContain('/api/v1/vision');
    expect(wrapper.text()).toContain('/api/v1/mcp');
  });

  it.each([
    ['connected', 'CONNECTED'],
    ['disconnected', 'DISCONNECTED'],
    ['error', 'ERROR'],
  ] as const)('shows %s state', (state, expectedText) => {
    const wrapper = mount(AppFooter, {
      props: { connectionState: state },
    });
    expect(wrapper.text()).toContain(expectedText);
  });

  it('shows socketId when provided', () => {
    const wrapper = mount(AppFooter, {
      props: { connectionState: 'connected', socketId: 'abc-123' },
    });
    expect(wrapper.text()).toContain('abc-123');
  });

  it('does not show socketId text when not provided', () => {
    const wrapper = mount(AppFooter, {
      props: { connectionState: 'connected' },
    });
    expect(wrapper.text()).not.toContain(':: CONNECTED ::');
    // socketId spans are v-if gated, so no socketId-specific content
    expect(wrapper.find('span.text-fg-secondary').exists()).toBe(false);
  });
});
