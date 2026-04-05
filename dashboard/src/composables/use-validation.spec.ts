import { describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';

import {
  requireFiles,
  requireModel,
  validateConnection,
} from './use-validation';

const mockToast = {
  error: vi.fn(),
  warning: vi.fn(),
};

describe('requireModel', () => {
  it('returns true when model is non-empty', () => {
    const model = ref('llama3.2-vision');
    expect(requireModel(model, mockToast)).toBe(true);
    expect(mockToast.error).not.toHaveBeenCalled();
  });

  it('returns false and shows error when model is empty', () => {
    const model = ref('  ');
    expect(requireModel(model, mockToast)).toBe(false);
    expect(mockToast.error).toHaveBeenCalledWith(
      'Model is required (e.g., llama3.2-vision, ministral-3:14b)',
    );
  });
});

describe('requireFiles', () => {
  it('returns true when files are present', () => {
    const files = ref([new File([''], 'x')]);
    expect(requireFiles(files, mockToast)).toBe(true);
  });

  it('returns false and shows error when files are empty', () => {
    const files = ref([]);
    expect(requireFiles(files, mockToast)).toBe(false);
    expect(mockToast.error).toHaveBeenCalledWith(
      'At least one image is required',
    );
  });

  it('uses custom error message', () => {
    const files = ref([]);
    requireFiles(files, mockToast, 'custom');
    expect(mockToast.error).toHaveBeenCalledWith('custom');
  });
});

describe('validateConnection', () => {
  it('returns true when event and room are connected', () => {
    const result = validateConnection(
      'vision',
      'room1',
      () => true,
      () => true,
      () => {},
      mockToast,
    );
    expect(result).toBe(true);
  });

  it('returns true when event is connected and room is empty', () => {
    const result = validateConnection(
      'vision',
      '',
      () => true,
      () => false,
      () => {},
      mockToast,
    );
    expect(result).toBe(true);
  });

  it('returns false and warns when event not connected', () => {
    const blink = vi.fn();
    const result = validateConnection(
      'vision',
      '',
      () => false,
      () => false,
      blink,
      mockToast,
    );
    expect(result).toBe(false);
    expect(blink).toHaveBeenCalled();
    expect(mockToast.warning).toHaveBeenCalledWith('Not subscribed to vision');
  });

  it('returns false and warns when room not connected', () => {
    const blink = vi.fn();
    const result = validateConnection(
      'vision',
      'room1',
      () => true,
      () => false,
      blink,
      mockToast,
    );
    expect(result).toBe(false);
    expect(blink).toHaveBeenCalled();
    expect(mockToast.warning).toHaveBeenCalledWith('Not subscribed to vision');
  });
});
