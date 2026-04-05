import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import FileUploadField from './FileUpload.Field.vue';

describe('FileUploadField', () => {
  it('renders label when provided', () => {
    const wrapper = mount(FileUploadField, {
      props: { label: 'Upload' },
    });
    expect(wrapper.text()).toContain('Upload');
    expect(wrapper.find('label').exists()).toBe(true);
  });

  it('does not render label when not provided', () => {
    const wrapper = mount(FileUploadField, {
      slots: { default: '<input data-testid="input" />' },
    });
    expect(wrapper.find('label').exists()).toBe(false);
  });

  it('renders slot content', () => {
    const wrapper = mount(FileUploadField, {
      props: { label: 'Upload' },
      slots: { default: '<span data-testid="slot">Slot Content</span>' },
    });
    expect(wrapper.find('[data-testid="slot"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('Slot Content');
  });
});
