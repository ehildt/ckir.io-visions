import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import FileUploadInputButton from './FileUpload.Input.Button.vue';

describe('FileUploadInputButton', () => {
  it("renders 'Browse' when disabled", () => {
    const wrapper = mount(FileUploadInputButton, {
      props: { disabled: true },
    });
    expect(wrapper.text()).toContain('Browse');
  });

  it("renders 'Select files...' when not disabled", () => {
    const wrapper = mount(FileUploadInputButton, {
      props: { disabled: false },
    });
    expect(wrapper.text()).toContain('Select files...');
  });

  it('applies blinking class', () => {
    const wrapper = mount(FileUploadInputButton, {
      props: { blinking: true },
    });
    expect(wrapper.find('span').classes().join(' ')).toContain('animate-pulse');
  });
});
