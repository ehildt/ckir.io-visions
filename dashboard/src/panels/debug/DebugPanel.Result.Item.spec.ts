import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import DebugPanelResultItem from './DebugPanel.Result.Item.vue';

describe('DebugPanelResultItem', () => {
  it('renders endpoint and method', () => {
    const wrapper = mount(DebugPanelResultItem, {
      props: {
        result: {
          endpoint: '/api/v1/vision',
          method: 'POST',
          status: 'success',
          responseTime: 42,
          type: 'http',
          direction: 'request',
        },
      },
    });
    expect(wrapper.text()).toContain('/api/v1/vision');
    expect(wrapper.text()).toContain('POST');
  });

  it('renders error state differently', () => {
    const wrapper = mount(DebugPanelResultItem, {
      props: {
        result: {
          endpoint: '/api/v1/vision',
          method: 'POST',
          status: 'error',
          responseTime: 10,
          type: 'http',
          errorMessage: 'fail',
        },
      },
    });
    expect(wrapper.text()).toContain('/api/v1/vision');
    expect(wrapper.text()).toContain('POST');
  });
});
