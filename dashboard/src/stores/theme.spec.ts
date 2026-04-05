import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';

import { useThemeStore } from './theme';

describe('useThemeStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('has default theme souls', () => {
    const store = useThemeStore();
    expect(store.currentTheme).toBe('souls');
  });

  it('applyTheme sets data-theme attribute', () => {
    const store = useThemeStore();
    store.applyTheme('cyberpunk');
    expect(document.documentElement.getAttribute('data-theme')).toBe(
      'cyberpunk',
    );
  });

  it('initTheme loads valid saved theme', () => {
    localStorage.setItem('theme', 'diablo');
    const store = useThemeStore();
    store.initTheme();
    expect(store.currentTheme).toBe('diablo');
  });

  it('initTheme ignores invalid saved theme', () => {
    localStorage.setItem('theme', 'invalid');
    const store = useThemeStore();
    store.initTheme();
    expect(store.currentTheme).toBe('souls');
  });

  it('watch persists theme to localStorage and applies it', async () => {
    const store = useThemeStore();
    store.currentTheme = 'nioh';
    // wait for watch handler
    await new Promise((r) => setTimeout(r, 10));
    expect(localStorage.getItem('theme')).toBe('nioh');
    expect(document.documentElement.getAttribute('data-theme')).toBe('nioh');
  });

  it('theme colors have entries for all themes', () => {
    const store = useThemeStore();
    const names = [
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
    for (const name of names) {
      expect(store.themeColors[name as any]).toBeDefined();
    }
  });

  it('darkThemes contains expected themes', () => {
    const store = useThemeStore();
    expect(store.darkThemes).toContain('souls');
    expect(store.darkThemes).toContain('cyberpunk');
    expect(store.darkThemes).not.toContain('ghostwire');
  });
});
