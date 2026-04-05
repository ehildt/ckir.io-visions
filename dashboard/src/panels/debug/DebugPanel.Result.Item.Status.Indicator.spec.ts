import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import DebugPanelResultItemStatusIndicator from './DebugPanel.Result.Item.Status.Indicator.vue';

describe('DebugPanelResultItemStatusIndicator', () => {
  it('renders success indicator', () => {
    const wrapper = mount(DebugPanelResultItemStatusIndicator, {
      props: { status: 'success' },
    });
    expect(wrapper.find('svg').exists()).toBe(true);
  });

  it('renders error indicator', () => {
    const wrapper = mount(DebugPanelResultItemStatusIndicator, {
      props: { status: 'error' },
    });
    expect(wrapper.find('svg').exists()).toBe(true);
  });
});
