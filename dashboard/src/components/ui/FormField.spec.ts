import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import FormField from './FormField.vue';

describe('FormField', () => {
  it('renders label when provided', () => {
    const wrapper = mount(FormField, {
      props: { label: 'Username' },
    });
    expect(wrapper.text()).toContain('Username');
    expect(wrapper.find('label').exists()).toBe(true);
  });

  it('does not render label when not provided', () => {
    const wrapper = mount(FormField, {
      slots: { default: '<input type="text" />' },
    });
    expect(wrapper.find('label').exists()).toBe(false);
  });

  it('renders default slot inside content area', () => {
    const wrapper = mount(FormField, {
      props: { label: 'Field' },
      slots: { default: '<input data-testid="input" />' },
    });
    expect(wrapper.find('[data-testid="input"]').exists()).toBe(true);
  });

  it('renders action slot', () => {
    const wrapper = mount(FormField, {
      props: { label: 'Field' },
      slots: {
        default: '<input />',
        action: '<button>Action</button>',
      },
    });
    expect(wrapper.find('button').exists()).toBe(true);
    expect(wrapper.text()).toContain('Action');
  });

  it('renders custom label slot over prop', () => {
    const wrapper = mount(FormField, {
      props: { label: 'Prop Label' },
      slots: { label: '<span data-testid="custom">Custom Label</span>' },
    });
    expect(wrapper.find('[data-testid="custom"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('Custom Label');
  });
});
