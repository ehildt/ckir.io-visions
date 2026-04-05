import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export type ThemeName =
  | 'souls'
  | 'diablo'
  | 'gothic'
  | 'cyberpunk'
  | 'stellar'
  | 'ghostwire'
  | 'deathspace'
  | 'nioh'
  | 'pragmata';

export interface ThemeColors {
  name: string;
  primary: string;
}

export const useThemeStore = defineStore('theme', () => {
  const currentTheme = ref<ThemeName>('souls');

  const themeColors: Record<ThemeName, ThemeColors> = {
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

  const darkThemes: ThemeName[] = [
    'souls',
    'diablo',
    'gothic',
    'cyberpunk',
    'stellar',
    'pragmata',
  ];
  const darkThemes2: ThemeName[] = ['ghostwire', 'deathspace', 'nioh'];

  function applyTheme(theme: ThemeName) {
    document.documentElement.setAttribute('data-theme', theme);
  }

  function initTheme() {
    const saved = localStorage.getItem('theme') as ThemeName | null;
    const validThemes: ThemeName[] = [
      'souls',
      'diablo',
      'gothic',
      'cyberpunk',
      'stellar',
      'ghostwire',
      'deathspace',
      'nioh',
      'pragmata',
    ];

    if (saved && validThemes.includes(saved)) {
      currentTheme.value = saved;
    }
    applyTheme(currentTheme.value);
  }

  watch(currentTheme, (newTheme) => {
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  });

  return {
    currentTheme,
    themeColors,
    darkThemes,
    darkThemes2,
    applyTheme,
    initTheme,
  };
});
