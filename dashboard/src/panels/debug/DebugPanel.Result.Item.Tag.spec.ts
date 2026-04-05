import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import DebugPanelResultItemTag from './DebugPanel.Result.Item.Tag.vue';

describe('DebugPanelResultItemTag', () => {
  it('renders value text', () => {
    const wrapper = mount(DebugPanelResultItemTag, {
      props: { variant: 'type', value: 'socket' },
    });
    expect(wrapper.text()).toContain('socket');
  });

  it.each([
    ['type', 'socket'],
    ['direction', 'response'],
    ['status', 'success'],
  ] as const)('renders %s variant with value %s', (variant, value) => {
    const wrapper = mount(DebugPanelResultItemTag, {
      props: { variant, value },
    });
    expect(wrapper.text()).toContain(value);
  });
});
