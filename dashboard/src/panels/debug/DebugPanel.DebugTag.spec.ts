import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../../utils/colors/tag-colors.helper', () => ({
  getTagColorClasses: () => ({
    border: 'border-red-500',
    text: 'text-red-500',
    bg: 'bg-red-500/20',
  }),
}));

import DebugPanelDebugTag from './DebugPanel.DebugTag.vue';

describe('DebugPanelDebugTag', () => {
  it('renders value text', () => {
    const wrapper = mount(DebugPanelDebugTag, {
      props: {
        category: 'type',
        value: 'REST',
      },
    });
    expect(wrapper.text()).toBe('REST');
  });

  it('applies correct classes from helper', () => {
    const wrapper = mount(DebugPanelDebugTag, {
      props: {
        category: 'direction',
        value: 'in',
      },
    });
    const span = wrapper.find('span');
    expect(span.classes().join(' ')).toContain('border-red-500');
    expect(span.classes().join(' ')).toContain('text-red-500');
  });
});
