import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import BaseButton from './BaseButton.vue';

describe('BaseButton', () => {
  it('renders label', () => {
    const wrapper = mount(BaseButton, {
      props: { label: 'Click me', variant: 'primary' },
    });
    expect(wrapper.text()).toContain('Click me');
  });

  it('emits click event', async () => {
    const wrapper = mount(BaseButton, {
      props: { label: 'Click', variant: 'primary' },
    });
    await wrapper.find('button').trigger('click');
    expect(wrapper.emitted('click')).toHaveLength(1);
  });

  it('shows count in label', () => {
    const wrapper = mount(BaseButton, {
      props: { label: 'Items', variant: 'primary', count: 5 },
    });
    expect(wrapper.text()).toContain('Items[5]');
  });

  it.each([
    ['primary', true],
    ['secondary', true],
    ['filter', true],
    ['icon', true],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ] as const)('renders variant %s', (variant, _expected) => {
    const wrapper = mount(BaseButton, {
      props: { label: variant, variant },
    });
    expect(wrapper.find('button').exists()).toBe(true);
  });

  it('applies disabled attribute', () => {
    const wrapper = mount(BaseButton, {
      props: { label: 'D', variant: 'primary', disabled: true },
    });
    expect(wrapper.find('button').attributes('disabled')).toBeDefined();
  });

  it('renders slot content when no label', () => {
    const wrapper = mount(BaseButton, {
      props: { variant: 'primary' },
      slots: { default: '<span data-testid="slot">Slot</span>' },
    });
    expect(wrapper.find('[data-testid="slot"]').exists()).toBe(true);
  });
});
