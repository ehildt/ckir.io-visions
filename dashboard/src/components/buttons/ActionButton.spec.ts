import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import ActionButton from './ActionButton.vue';

describe('ActionButton', () => {
  it('renders label in brackets', () => {
    const wrapper = mount(ActionButton, {
      props: { label: 'SUBMIT', color: 'accent-primary' },
    });
    expect(wrapper.text()).toBe('[SUBMIT]');
  });

  it('emits click event', async () => {
    const wrapper = mount(ActionButton, {
      props: { label: 'X', color: 'info' },
    });
    await wrapper.find('button').trigger('click');
    expect(wrapper.emitted('click')).toHaveLength(1);
  });

  it.each([
    ['error', 'text-status-error'],
    ['info', 'text-status-info'],
    ['warning', 'text-status-warning'],
    ['success', 'text-status-success'],
    ['accent-primary', 'text-accent-primary'],
  ] as const)('applies %s color class', (color, expectedClass) => {
    const wrapper = mount(ActionButton, {
      props: { label: 'A', color },
    });
    expect(wrapper.find('button').classes().join(' ')).toContain(expectedClass);
  });
});
