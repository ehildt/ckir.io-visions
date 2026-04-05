import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import DebugPanelResults from './DebugPanel.Results.vue';

describe('DebugPanelResults', () => {
  it('renders results list', () => {
    const wrapper = mount(DebugPanelResults, {
      props: {
        results: [
          {
            id: '1',
            endpoint: '/api',
            method: 'GET',
            status: 'success',
            responseTime: 100,
            type: 'http',
            direction: 'request',
          },
        ],
        selectedResultId: '',
      },
    });
    expect(wrapper.text()).toContain('/api');
    expect(wrapper.text()).toContain('GET');
  });

  it('emits select with result id', async () => {
    const wrapper = mount(DebugPanelResults, {
      props: {
        results: [
          {
            id: '1',
            endpoint: '/api',
            method: 'GET',
            status: 'success',
            responseTime: 100,
            type: 'http',
            direction: 'request',
          },
        ],
        selectedResultId: '',
      },
    });
    await wrapper.find('div').trigger('click');
    expect(wrapper.emitted('select')).toBeTruthy();
  });
});
