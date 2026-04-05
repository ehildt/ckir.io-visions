import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import ToastCloseButton from './Toast.CloseButton.vue';

describe('ToastCloseButton', () => {
  it('renders [CLS] by default', () => {
    const wrapper = mount(ToastCloseButton, {
      props: {
        theme: 'dark',
        type: 'default',
      },
    });
    expect(wrapper.text()).toBe('[CLS]');
  });

  it('renders custom path text', () => {
    const wrapper = mount(ToastCloseButton, {
      props: {
        theme: 'dark',
        type: 'default',
        path: 'CLOSE',
      },
    });
    expect(wrapper.text()).toBe('CLOSE');
  });
});
