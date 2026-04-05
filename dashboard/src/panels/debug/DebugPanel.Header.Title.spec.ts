import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import DebugPanelHeaderTitle from './DebugPanel.Header.Title.vue';

describe('DebugPanelHeaderTitle', () => {
  it('renders label', () => {
    const wrapper = mount(DebugPanelHeaderTitle, {
      props: { label: 'Results' },
    });
    expect(wrapper.text()).toContain('Results');
  });

  // Note: this component doesn't have a default slot - label is passed as prop
  // The component renders a ChevronRight icon and label text
});
