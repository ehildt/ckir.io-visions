import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import FileUpload from './FileUpload.vue';

describe('FileUpload', () => {
  it('renders without errors', () => {
    const wrapper = mount(FileUpload, { props: { disabled: false } });
    expect(wrapper.find('[class]').exists()).toBe(true);
  });
});
