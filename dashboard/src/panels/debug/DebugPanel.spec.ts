import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';

import DebugPanel from './DebugPanel.vue';

vi.mock('./DebugPanel.Layout.vue', () => ({
  default: { template: '<div class="layout"><slot /></div>' },
}));
vi.mock('./DebugPanel.Header.vue', () => ({
  default: { template: '<div class="header"><slot /></div>' },
}));
vi.mock('./DebugPanel.Header.Title.vue', () => ({
  default: { template: '<span>{{ label }}</span>', props: ['label'] },
}));
vi.mock('./DebugPanel.Header.Menu.vue', () => ({
  default: {
    props: ['filter', 'allCount', 'httpCount', 'socketCount'],
    template: '<div class="menu"></div>',
  },
}));
vi.mock('./DebugPanel.Results.vue', () => ({
  default: {
    props: ['results', 'selectedResultId'],
    template: '<div class="results"></div>',
  },
}));
vi.mock('./DebugPanel.EmptyState.vue', () => ({
  default: { template: '<div class="empty">No requests</div>' },
}));

describe('DebugPanel', () => {
  const results = [
    { id: '1', type: 'http' },
    { id: '2', type: 'socket' },
    { id: '3', type: 'http' },
  ] as any[];

  it('renders results list when results exist', () => {
    const wrapper = mount(DebugPanel, {
      props: { results, selectedResult: null },
    });
    expect(wrapper.find('.results').exists()).toBe(true);
    expect(wrapper.find('.empty').exists()).toBe(false);
  });

  it('renders empty state when no results', () => {
    const wrapper = mount(DebugPanel, {
      props: { results: [], selectedResult: null },
    });
    expect(wrapper.find('.empty').exists()).toBe(true);
    expect(wrapper.find('.results').exists()).toBe(false);
  });

  it('emits select with result', async () => {
    const wrapper = mount(DebugPanel, {
      props: { results, selectedResult: null },
    });
    const vm = wrapper.vm as any;
    vm.select(results[0]);
    expect(wrapper.emitted('select')).toBeTruthy();
    expect(wrapper.emitted('select')![0]).toEqual([results[0]]);
  });

  it('toggles selection off when same result clicked', async () => {
    const wrapper = mount(DebugPanel, {
      props: { results, selectedResult: results[0] },
    });
    const vm = wrapper.vm as any;
    vm.select(results[0]);
    expect(wrapper.emitted('select')).toBeTruthy();
    expect(wrapper.emitted('select')![0]).toEqual([null]);
  });

  it('filters http only', async () => {
    const wrapper = mount(DebugPanel, {
      props: { results, selectedResult: null },
    });
    const vm = wrapper.vm as any;
    vm.filter = 'http';
    await wrapper.vm.$nextTick();
    expect(vm.filteredResults.length).toBe(2);
  });

  it('filters socket only', async () => {
    const wrapper = mount(DebugPanel, {
      props: { results, selectedResult: null },
    });
    const vm = wrapper.vm as any;
    vm.filter = 'socket';
    await wrapper.vm.$nextTick();
    expect(vm.filteredResults.length).toBe(1);
  });
});
