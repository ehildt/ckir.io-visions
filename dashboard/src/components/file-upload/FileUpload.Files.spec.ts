import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import FileUploadFiles from './FileUpload.Files.vue';

describe('FileUploadFiles', () => {
  it('renders file list', () => {
    const files = [
      new File([''], 'image1.png', { type: 'image/png' }),
      new File([''], 'image2.jpg', { type: 'image/jpeg' }),
    ];
    const wrapper = mount(FileUploadFiles, { props: { files } });
    // The child FileUploadFilesFile component renders the file name
    expect(wrapper.text()).toContain('image1.png');
    expect(wrapper.text()).toContain('image2.jpg');
  });

  it('emits remove with index', async () => {
    const files = [new File([''], 'a.png', { type: 'image/png' })];
    const wrapper = mount(FileUploadFiles, { props: { files } });
    // Find the remove button rendered by the child and trigger it
    await wrapper.find('button').trigger('click');
    expect(wrapper.emitted('remove')).toBeTruthy();
    expect(wrapper.emitted('remove')![0]).toEqual([0]);
  });
});
