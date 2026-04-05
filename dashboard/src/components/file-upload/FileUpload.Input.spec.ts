import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import FileUploadInput from './FileUpload.Input.vue';

describe('FileUploadInput', () => {
  it('renders hidden file input', () => {
    const wrapper = mount(FileUploadInput);
    const input = wrapper.find('input[type="file"]');
    expect(input.exists()).toBe(true);
    expect(input.classes()).toContain('hidden');
  });

  it('exposes fileInputRef', () => {
    const wrapper = mount(FileUploadInput);
    // @ts-expect-error - accessing internal ref for test
    expect(wrapper.vm.fileInputRef).toBeDefined();
  });

  it('emits change on file selection', () => {
    const wrapper = mount(FileUploadInput);
    const file = new File(['content'], 'test.png', { type: 'image/png' });
    const input = wrapper.find('input[type="file"]');
    // Set files directly on element before triggering change
    Object.defineProperty(input.element, 'files', {
      value: [file],
      writable: false,
    });
    input.trigger('change');
    expect(wrapper.emitted('change')).toBeTruthy();
    expect(wrapper.emitted('change')![0]).toEqual([[file]]);
  });
});
