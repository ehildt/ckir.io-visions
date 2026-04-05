import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import InputGroup from './InputGroup.vue';

describe('InputGroup', () => {
  it('renders slot content inside flex div', () => {
    const wrapper = mount(InputGroup, {
      slots: { default: '<span data-testid="child">X</span>' },
    });
    expect(wrapper.find('[data-testid="child"]').exists()).toBe(true);
    expect(wrapper.find('div').classes().join(' ')).toContain('flex');
  });
});
