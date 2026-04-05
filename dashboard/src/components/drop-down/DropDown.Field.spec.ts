import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import DropDownField from './DropDown.Field.vue';

describe('DropDownField', () => {
  it('renders label', () => {
    const wrapper = mount(DropDownField, {
      props: { label: 'Protocol' },
    });
    expect(wrapper.text()).toContain('Protocol');
    expect(wrapper.find('label').exists()).toBe(true);
  });

  it('renders default slot', () => {
    const wrapper = mount(DropDownField, {
      props: { label: 'Protocol' },
      slots: { default: '<select data-testid="select"></select>' },
    });
    expect(wrapper.find('[data-testid="select"]').exists()).toBe(true);
  });

  it('renders action slot', () => {
    const wrapper = mount(DropDownField, {
      props: { label: 'Protocol' },
      slots: {
        default: '<select></select>',
        action: '<button>Add</button>',
      },
    });
    expect(wrapper.find('button').exists()).toBe(true);
    expect(wrapper.text()).toContain('Add');
  });
});
