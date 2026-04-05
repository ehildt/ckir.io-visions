import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import UiTag from './UiTag.vue';

describe('UiTag', () => {
  it('renders label', () => {
    const wrapper = mount(UiTag, {
      props: { label: 'test', color: 'primary' },
    });
    expect(wrapper.text()).toContain('test');
    expect(wrapper.find('span').exists()).toBe(true);
  });

  it.each([
    ['primary', 'border-tab-rest/70'],
    ['secondary', 'border-tab-mcp/70'],
    ['tertiary', 'border-tab-debug/70'],
    ['rest', 'border-tab-rest/70'],
    ['mcp', 'border-tab-mcp/70'],
    ['debug', 'border-tab-debug/70'],
  ] as const)('applies correct class for color %s', (color, expectedClass) => {
    const wrapper = mount(UiTag, { props: { label: 'x', color } });
    expect(wrapper.find('span').classes().join(' ')).toContain(expectedClass);
  });
});
