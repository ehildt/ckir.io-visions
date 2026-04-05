import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import DebugPanelLayout from './DebugPanel.Layout.vue';

describe('DebugPanelLayout', () => {
  it('renders slot content inside elevated div', () => {
    const wrapper = mount(DebugPanelLayout, {
      slots: { default: '<span data-testid="slot">Content</span>' },
    });
    expect(wrapper.find('[data-testid="slot"]').exists()).toBe(true);
    expect(wrapper.find('div').classes().join(' ')).toContain('bg-elevated');
    expect(wrapper.find('div').classes().join(' ')).toContain('panel-glow');
  });
});
