import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import DebugPanelDetails from './DebugPanel.Details.vue';

describe('DebugPanelDetails', () => {
  it('renders empty state when no result', () => {
    const wrapper = mount(DebugPanelDetails, {
      props: { result: null },
    });
    expect(wrapper.text()).toContain(
      'Select a request from the list to view details',
    );
  });

  it('renders result details when provided', () => {
    const wrapper = mount(DebugPanelDetails, {
      props: {
        result: {
          id: '1',
          endpoint: '/api/v1/vision',
          method: 'POST',
          status: 'success',
          responseTime: 42,
          type: 'http',
          direction: 'request',
          requestHeaders: { 'x-vision-llm': 'llama' },
          requestBody: '{"task":"describe"}',
          responseBody: '{"ok":true}',
        },
      },
    });
    expect(wrapper.text()).toContain('/api/v1/vision');
    expect(wrapper.text()).toContain('POST');
    expect(wrapper.text()).toContain('Request');
  });
});
