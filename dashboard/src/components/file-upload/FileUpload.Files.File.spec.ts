import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import FileUploadFilesFile from './FileUpload.Files.File.vue';

describe('FileUploadFilesFile', () => {
  it('renders file name', () => {
    const file = new File(['content'], 'test.png', { type: 'image/png' });
    const wrapper = mount(FileUploadFilesFile, {
      props: { file },
    });
    expect(wrapper.text()).toContain('test.png');
  });

  it('emits remove on button click', async () => {
    const file = new File(['content'], 'test.png', { type: 'image/png' });
    const wrapper = mount(FileUploadFilesFile, {
      props: { file },
    });
    await wrapper.find('button').trigger('click');
    expect(wrapper.emitted('remove')).toHaveLength(1);
  });
});
