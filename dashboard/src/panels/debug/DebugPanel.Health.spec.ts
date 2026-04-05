import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../../api/queries/use-health-ready.query', () => ({
  default: vi.fn().mockReturnValue({
    data: { value: { info: { db: { status: 'up' } }, details: {} } },
    isLoading: false,
    isError: false,
  }),
}));

vi.mock('../../api/queries/use-health-live.query', () => ({
  default: vi.fn().mockReturnValue({
    data: { value: { status: 'ok' } },
    isLoading: false,
    isError: false,
  }),
}));

import DebugPanelHealth from './DebugPanel.Health.vue';

describe('DebugPanelHealth', () => {
  it('renders health section titles', () => {
    const wrapper = mount(DebugPanelHealth);
    expect(wrapper.text()).toContain('System Health');
    expect(wrapper.text()).toContain('Ready');
    expect(wrapper.text()).toContain('Live');
  });
});
