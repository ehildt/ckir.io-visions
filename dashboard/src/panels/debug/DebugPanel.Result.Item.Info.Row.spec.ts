import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import DebugPanelResultItemInfoRow from './DebugPanel.Result.Item.Info.Row.vue';

describe('DebugPanelResultItemInfoRow', () => {
  it('renders method badge and endpoint for http', () => {
    const wrapper = mount(DebugPanelResultItemInfoRow, {
      props: { method: 'POST', type: 'http', endpoint: '/api/v1/vision' },
    });
    expect(wrapper.text()).toContain('POST');
    expect(wrapper.text()).toContain('/api/v1/vision');
  });

  it('renders event for socket', () => {
    const wrapper = mount(DebugPanelResultItemInfoRow, {
      props: {
        method: 'GET',
        type: 'socket',
        event: 'vision',
        roomId: 'room-1',
      },
    });
    expect(wrapper.text()).toContain('GET');
    expect(wrapper.text()).toContain('vision');
    expect(wrapper.text()).toContain('room-1');
  });
});
