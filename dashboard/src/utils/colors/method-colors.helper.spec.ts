import {
  getMethodColor,
  getMethodTabBorderColor,
  getMethodTabColor,
} from './method-colors.helper';

describe('getMethodColor', () => {
  it.each([
    ['GET', 'text-method-get'],
    ['POST', 'text-method-post'],
    ['PUT', 'text-method-put'],
    ['DELETE', 'text-method-delete'],
    ['PATCH', 'text-method-patch'],
    ['CONNECT', 'text-method-system'],
    ['DISCONNECT', 'text-method-system'],
    ['CONNECT_ERROR', 'text-method-system'],
    ['CUSTOM', 'text-method-default'],
  ])('maps %s to %s', (method, expected) => {
    expect(getMethodColor(method)).toBe(expected);
  });
});

describe('getMethodTabColor', () => {
  it.each([
    ['GET', 'text-tab-rest'],
    ['POST', 'text-tab-mcp'],
    ['PUT', 'text-tab-debug'],
    ['DELETE', 'text-tab-rest'],
    ['PATCH', 'text-tab-mcp'],
    ['UNKNOWN', 'text-tab-debug'],
  ])('maps %s to %s', (method, expected) => {
    expect(getMethodTabColor(method)).toBe(expected);
  });
});

describe('getMethodTabBorderColor', () => {
  it.each([
    ['GET', 'border-tab-rest/50'],
    ['POST', 'border-tab-mcp/50'],
    ['PUT', 'border-tab-debug/50'],
    ['DELETE', 'border-tab-rest/50'],
    ['PATCH', 'border-tab-mcp/50'],
    ['UNKNOWN', 'border-tab-debug/50'],
  ])('maps %s to %s', (method, expected) => {
    expect(getMethodTabBorderColor(method)).toBe(expected);
  });
});
