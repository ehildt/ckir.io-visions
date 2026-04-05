import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import DebugPanelEmptyState from './DebugPanel.EmptyState.vue';

describe('DebugPanelEmptyState', () => {
  it('renders default message', () => {
    const wrapper = mount(DebugPanelEmptyState);
    expect(wrapper.text()).toContain('No requests yet');
    expect(wrapper.text()).toContain('Send a request to see results');
  });

  it('renders custom message', () => {
    const wrapper = mount(DebugPanelEmptyState, {
      props: { message: 'Waiting...' },
    });
    expect(wrapper.text()).toContain('Waiting...');
    expect(wrapper.text()).toContain('Send a request to see results');
  });

  it('renders custom submessage', () => {
    const wrapper = mount(DebugPanelEmptyState, {
      props: { submessage: 'Please wait' },
    });
    expect(wrapper.text()).toContain('Please wait');
  });
});
