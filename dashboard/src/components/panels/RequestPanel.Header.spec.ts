import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import RequestPanelHeader from './RequestPanel.Header.vue';

describe('RequestPanelHeader', () => {
  it('renders endpoint', () => {
    const wrapper = mount(RequestPanelHeader, {
      props: { endpoint: '/api/v1/vision' },
    });
    expect(wrapper.text()).toContain('/api/v1/vision');
  });

  it('defaults method to POST', () => {
    const wrapper = mount(RequestPanelHeader, {
      props: { endpoint: '/' },
    });
    expect(wrapper.text()).toContain('POST');
  });

  it('shows custom method', () => {
    const wrapper = mount(RequestPanelHeader, {
      props: { endpoint: '/', method: 'GET' },
    });
    expect(wrapper.text()).toContain('GET');
  });
});
