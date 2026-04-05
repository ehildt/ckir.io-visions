import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import ActionTagButton from './ActionTagButton.vue';

describe('ActionTagButton', () => {
  it('renders label', () => {
    const wrapper = mount(ActionTagButton, {
      props: { label: 'REST', variant: 'primary' },
    });
    expect(wrapper.text()).toContain('REST');
  });

  it('emits click on button click', async () => {
    const wrapper = mount(ActionTagButton, {
      props: { label: 'MCP', variant: 'mcp' },
    });
    await wrapper.find('button').trigger('click');
    expect(wrapper.emitted('click')).toHaveLength(1);
  });

  it('applies disabled styling without hover classes', () => {
    const wrapper = mount(ActionTagButton, {
      props: { label: 'Debug', variant: 'debug', disabled: true },
    });
    expect(wrapper.find('button').attributes('disabled')).toBeDefined();
    expect(wrapper.find('button').classes().join(' ')).toContain('opacity-40');
  });
});
