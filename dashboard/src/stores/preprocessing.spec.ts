import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';

import {
  DEFAULT_PREPROCESSING_SETTINGS,
  getDefaultParameterValue,
  PARAMETER_VARIANTS,
  PREPROCESSING_SIZES,
  usePreprocessingStore,
  VARIANT_DESCRIPTIONS,
  VARIANT_PARAMETERS,
} from './preprocessing';

describe('constants', () => {
  it('PREPROCESSING_SIZES has expected values', () => {
    expect(PREPROCESSING_SIZES).toEqual([256, 384, 512, 640, 768, 1024]);
  });

  it('getDefaultParameterValue returns default number', () => {
    expect(getDefaultParameterValue('blurSigma')).toBe(0.5);
    expect(getDefaultParameterValue('claheWidth')).toBe(8);
  });

  it('VARIANT_DESCRIPTIONS has descriptions for all variants', () => {
    expect(Object.keys(VARIANT_DESCRIPTIONS)).toEqual([
      'original',
      'grayscale',
      'denoised',
      'sharpened',
      'clahe',
    ]);
  });

  it('VARIANT_PARAMETERS maps correct parameters', () => {
    expect(VARIANT_PARAMETERS.denoised).toEqual(['blurSigma']);
    expect(VARIANT_PARAMETERS.sharpened).toEqual([
      'sharpenSigma',
      'sharpenM1',
      'sharpenM2',
    ]);
    expect(VARIANT_PARAMETERS.clahe.length).toBe(6);
  });

  it('PARAMETER_VARIANTS is inverse of VARIANT_PARAMETERS', () => {
    expect(PARAMETER_VARIANTS.blurSigma).toEqual(['denoised']);
    expect(PARAMETER_VARIANTS.sharpenSigma).toEqual(['sharpened']);
  });
});

describe('usePreprocessingStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  it('initializes with default settings', () => {
    const store = usePreprocessingStore();
    expect(store.enabled).toBe(true);
    expect(store.settings).toMatchObject(DEFAULT_PREPROCESSING_SETTINGS);
  });

  it('toggles enabled', () => {
    const store = usePreprocessingStore();
    store.setEnabled(false);
    expect(store.enabled).toBe(false);
    store.setEnabled(true);
    expect(store.enabled).toBe(true);
  });

  it('updates maxWidth', () => {
    const store = usePreprocessingStore();
    store.setMaxWidth(512);
    expect(store.resize.maxWidth).toBe(512);
  });

  it('updates maxHeight', () => {
    const store = usePreprocessingStore();
    store.setMaxHeight(1024);
    expect(store.resize.maxHeight).toBe(1024);
    store.setMaxHeight(null);
    expect(store.resize.maxHeight).toBeNull();
  });

  it('updates withoutEnlargement', () => {
    const store = usePreprocessingStore();
    store.setWithoutEnlargement(false);
    expect(store.resize.withoutEnlargement).toBe(false);
  });

  it('sets variant', () => {
    const store = usePreprocessingStore();
    store.setVariant('grayscale', true);
    expect(store.variants.grayscale).toBe(true);
  });

  it('sets parameter', () => {
    const store = usePreprocessingStore();
    store.setParameter('blurSigma', 2);
    expect(store.parameters.blurSigma).toBe(2);
  });

  it('isEffectivelyEnabled is false when enabled is false', () => {
    const store = usePreprocessingStore();
    store.setEnabled(false);
    expect(store.isEffectivelyEnabled).toBe(false);
  });

  it('isEffectivelyEnabled is false when no variants selected', () => {
    const store = usePreprocessingStore();
    store.setVariant('original', false);
    expect(store.isEffectivelyEnabled).toBe(false);
  });

  it('isParameterHighlighted reflects hovered variant', () => {
    const store = usePreprocessingStore();
    store.setHoveredVariant('denoised');
    expect(store.isParameterHighlighted('blurSigma')).toBe(true);
    expect(store.isParameterHighlighted('claheWidth')).toBe(false);
  });

  it('isVariantHighlighted reflects hovered parameter', () => {
    const store = usePreprocessingStore();
    store.setHoveredParameter('blurSigma');
    expect(store.isVariantHighlighted('denoised')).toBe(true);
    expect(store.isVariantHighlighted('sharpened')).toBe(false);
  });

  it('resetToDefaults restores all defaults', () => {
    const store = usePreprocessingStore();
    store.setVariant('grayscale', true);
    store.setParameter('blurSigma', 99);
    store.resetToDefaults();
    expect(store.variants.grayscale).toBe(false);
    expect(store.parameters.blurSigma).toBe(0.5);
  });

  it('resetParametersToDefaults restores only parameters', () => {
    const store = usePreprocessingStore();
    store.setVariant('grayscale', true);
    store.setParameter('blurSigma', 99);
    store.resetParametersToDefaults();
    expect(store.variants.grayscale).toBe(true);
    expect(store.parameters.blurSigma).toBe(0.5);
  });

  describe('buildQueryParams', () => {
    it('returns empty object when disabled', () => {
      const store = usePreprocessingStore();
      store.setEnabled(false);
      expect(store.buildQueryParams()).toEqual({});
    });

    it('returns all params when enabled', () => {
      const store = usePreprocessingStore();
      const params = store.buildQueryParams();
      expect(params.pproc_enabled).toBe('true');
      expect(params.pproc_original).toBe('true');
      expect(params.pproc_resize_maxWidth).toBe('768');
    });

    it('omits undefined maxHeight', () => {
      const store = usePreprocessingStore();
      store.setMaxHeight(null);
      const params = store.buildQueryParams();
      expect(params.pproc_resize_maxHeight).toBeUndefined();
    });
  });

  describe('buildMcpPreprocessing', () => {
    it('returns undefined when disabled', () => {
      const store = usePreprocessingStore();
      store.setEnabled(false);
      expect(store.buildMcpPreprocessing()).toBeUndefined();
    });

    it('returns full config when enabled', () => {
      const store = usePreprocessingStore();
      const config = store.buildMcpPreprocessing();
      expect(config).toBeDefined();
      expect(config!.enabled).toBe(true);
      expect(config!.resize.maxWidth).toBe(768);
    });
  });

  describe('getSummary', () => {
    it('returns Disabled when off', () => {
      const store = usePreprocessingStore();
      store.setEnabled(false);
      expect(store.getSummary()).toBe('Disabled');
    });

    it('lists active variants and size', () => {
      const store = usePreprocessingStore();
      store.setVariant('grayscale', true);
      expect(store.getSummary()).toContain('768');
      expect(store.getSummary()).toContain('grayscale');
    });
  });

  describe('resetParameter / isParameterModified / hasAnyParameterModified', () => {
    it('detects modified parameters', () => {
      const store = usePreprocessingStore();
      expect(store.isParameterModified('blurSigma')).toBe(false);
      store.setParameter('blurSigma', 5);
      expect(store.isParameterModified('blurSigma')).toBe(true);
      store.resetParameter('blurSigma');
      expect(store.isParameterModified('blurSigma')).toBe(false);
    });

    it('tracks hasAnyParameterModified', () => {
      const store = usePreprocessingStore();
      expect(store.hasAnyParameterModified).toBe(false);
      store.setParameter('blurSigma', 5);
      expect(store.hasAnyParameterModified).toBe(true);
    });
  });
});
