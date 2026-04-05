import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import AppThemeSwitcher from './AppThemeSwitcher.vue';

const themeColors = {
  souls: { name: 'Dark Souls', primary: '#cd853f' },
  diablo: { name: 'Diablo', primary: '#c0392b' },
  gothic: { name: 'Gothic', primary: '#4a6741' },
  cyberpunk: { name: 'Cyberpunk 2077', primary: '#1abc9c' },
  stellar: { name: 'Stellar Blade', primary: '#e84393' },
  ghostwire: { name: 'Ghostwire Tokyo', primary: '#1dd1a1' },
  deathspace: { name: 'Dead Space', primary: '#8e44ad' },
  nioh: { name: 'Nioh', primary: '#e74c3c' },
  pragmata: { name: 'Pragmata', primary: '#4a6de5' },
};

describe('AppThemeSwitcher', () => {
  it('renders all theme buttons', () => {
    const wrapper = mount(AppThemeSwitcher, {
      props: {
        currentTheme: 'souls',
        themeColors,
        darkThemes: [
          'souls',
          'diablo',
          'gothic',
          'cyberpunk',
          'stellar',
          'pragmata',
        ],
        darkThemes2: ['ghostwire', 'deathspace', 'nioh'],
      },
    });
    expect(wrapper.findAll('button').length).toBe(9);
    expect(wrapper.text()).toContain('Dark Souls');
    expect(wrapper.text()).toContain('Diablo');
  });

  it('emits change with theme name on click', async () => {
    const wrapper = mount(AppThemeSwitcher, {
      props: {
        currentTheme: 'souls',
        themeColors,
        darkThemes: ['souls'],
        darkThemes2: [],
      },
    });
    await wrapper.find('button').trigger('click');
    expect(wrapper.emitted('change')).toBeTruthy();
    expect(wrapper.emitted('change')![0]).toEqual(['souls']);
  });
});
