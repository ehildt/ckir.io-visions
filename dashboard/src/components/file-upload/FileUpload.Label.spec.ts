import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';

import FileUploadLabel from './FileUpload.Label.vue';

vi.mock('../ui/FormLabel.vue', () => ({
  default: { template: '<label><slot /></label>' },
}));

describe('FileUploadLabel', () => {
  it('renders text prop', () => {
    const wrapper = mount(FileUploadLabel, {
      props: { text: 'Upload Files' },
    });
    expect(wrapper.text()).toContain('Upload Files');
  });

  it('renders empty when no text', () => {
    const wrapper = mount(FileUploadLabel);
    expect(wrapper.find('label').exists()).toBe(true);
  });
});
